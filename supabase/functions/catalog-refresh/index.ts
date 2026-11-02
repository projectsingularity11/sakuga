import { createClient } from "npm:@supabase/supabase-js@2.80.0";
import { JOB_KEY_SHA256 } from "./job-config.ts";
const client = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
const check = (result: { error: unknown }) => { if (result.error) throw new Error("Database write failed"); };
async function provider(url: string, init: RequestInit = {}) {
 const r=await fetch(url,{...init,signal:AbortSignal.timeout(18000)});
 if(!r.ok)throw new Error(`Provider HTTP ${r.status}`);
 return r.json();
}
Deno.serve(async(req:Request)=>{
 if(req.method!=="POST")return new Response("Method not allowed",{status:405});
 const key=req.headers.get("x-sakuga-job-key")||"";
 const hash=Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(key)))).map(b=>b.toString(16).padStart(2,"0")).join("");
 if(hash!==JOB_KEY_SHA256)return new Response("Unauthorized",{status:401});
 const {data:locked,error:lockError}=await client.rpc("claim_catalog_refresh");
 if(lockError||!locked)return Response.json({status:"busy"},{status:202});
 const body=await req.json().catch(()=>({}));
 const priority=Array.isArray(body.priority_ids)&&body.priority_ids.length>0&&body.priority_ids.length<=40&&body.priority_ids.every((id:unknown)=>typeof id==="number"&&Number.isSafeInteger(id)&&id>0)?body.priority_ids as number[]:null;
 let cursor=0;
 try{
 const {data:job,error}=await client.from("ingestion_jobs").select("page").eq("provider","catalog-enrichment").single();if(error)throw error;cursor=job.page;
 const selection=client.from("anime").select("id,moderation");
 const {data:batch,error:readError}=await (priority?selection.in("id",priority):selection.gt("id",cursor)).order("id").limit(40);if(readError)throw readError;
 if(!batch?.length){if(priority)return Response.json({processed:0,cursor});check(await client.from("ingestion_jobs").update({page:0,status:"complete",last_error:null,updated_at:new Date().toISOString()}).eq("provider","catalog-enrichment"));return Response.json({status:"complete"});}
 const query=`query($ids:[Int]){Page(perPage:50){media(id_in:$ids,type:ANIME){id idMal title{english romaji native} description(asHtml:false) bannerImage coverImage{large} averageScore popularity isAdult genres episodes duration season seasonYear status studios(isMain:true){nodes{name}}}}}`;
 const body=await provider("https://graphql.anilist.co",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({query,variables:{ids:batch.map(a=>a.id)}})});
 if(body.errors||!Array.isArray(body.data?.Page?.media))throw new Error("AniList response unavailable");
 let kitsuUpdated=0;const failures:string[]=[];
 const {data:mappings,error:mappingError}=await client.from("source_mappings").select("anime_id,external_id").eq("provider","kitsu").in("anime_id",batch.map(a=>a.id));if(mappingError)throw mappingError;
 const kitsu=new Map((mappings||[]).map(m=>[m.anime_id,m.external_id]));
 const now=new Date().toISOString();
 for(const a of body.data.Page.media){
  const excluded=a.genres.some((g:string)=>["hentai","pornography"].includes(g.toLowerCase()));
  const previous=batch.find(b=>b.id===a.id);
  const moderation=excluded?'excluded':a.isAdult?'quarantine':previous?.moderation==='excluded'?'excluded':'published';
  const clean=(s:string|null)=>s?.replace(/<[^>]*>/g,' ').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').trim()||null;
  const validImage=(s:string|null)=>s&&/^https:\/\/s4\.anilist\.co\//.test(s)?s:null;
  check(await client.from("anime").update({title:a.title.english||a.title.romaji,title_romaji:a.title.romaji,title_native:a.title.native,synopsis:clean(a.description),banner_url:moderation==='published'?validImage(a.bannerImage):null,cover_url:moderation==='published'?validImage(a.coverImage.large):null,popularity:a.popularity,episodes:a.episodes||null,duration:a.duration||null,year:a.seasonYear,season:a.season,airing_status:a.status,genres:a.genres,studios:a.studios.nodes.map((s:{name:string})=>s.name),mature:a.isAdult||a.genres.includes('Ecchi'),moderation,moderation_reason:'AniList official content classification; manual overrides take precedence',updated_at:now}).eq("id",a.id));
  check(await client.from("ratings").upsert({anime_id:a.id,provider:"anilist",score:a.averageScore,scale:100,votes:null,refreshed_at:now},{onConflict:"anime_id,provider"}));
 }
 const items=body.data.Page.media;
 for(let offset=0;offset<items.length;offset+=4){await Promise.all(items.slice(offset,offset+4).map(async(a:{id:number})=>{
  const kid=kitsu.get(a.id);if(!kid)return;
  try{const result=await provider(`https://kitsu.io/api/edge/anime/${encodeURIComponent(kid)}`);const v=result.data?.attributes;if(!v)throw Error('Kitsu response unavailable');const score=v.averageRating==null?null:Number(v.averageRating);if(score!==null&&(!Number.isFinite(score)||score<0||score>100))throw Error('Invalid Kitsu score');check(await client.from("ratings").upsert({anime_id:a.id,provider:"kitsu",score,scale:100,votes:null,refreshed_at:now},{onConflict:"anime_id,provider"}));kitsuUpdated++;}catch{failures.push(String(a.id));}
 }));}
 if(!priority)cursor=batch[batch.length-1].id;
 check(await client.from("ingestion_jobs").update({page:cursor,status:"running",last_error:failures.length?`Kitsu refresh failed for ${failures.length} titles; retried next cycle`:null,updated_at:now}).eq("provider","catalog-enrichment"));
 return Response.json({processed:items.length,kitsuUpdated,cursor,partialFailures:failures.length});
 }catch(e){const message=e instanceof Error?e.message:'Refresh failed';await client.from("ingestion_jobs").update({status:"failed",last_error:message.slice(0,200),updated_at:new Date().toISOString()}).eq("provider","catalog-enrichment");return Response.json({error:message},{status:502});}
 finally{await client.rpc("release_catalog_refresh");}
});
