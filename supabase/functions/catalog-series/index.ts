import { createClient } from "npm:@supabase/supabase-js@2.80.0";
import { JOB_KEY_SHA256 } from "./job-config.ts";
const client=createClient(Deno.env.get("SUPABASE_URL")!,Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,{auth:{persistSession:false}});
Deno.serve(async(req:Request)=>{
 if(req.method!=="POST")return new Response("Method not allowed",{status:405});
 const hash=Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(req.headers.get("x-sakuga-job-key")||"")))).map(b=>b.toString(16).padStart(2,"0")).join("");
 if(hash!==JOB_KEY_SHA256)return new Response("Unauthorized",{status:401});
 const input=await req.json().catch(()=>({}));const start=Number(input.after||0);
 if(!Number.isInteger(start)||start<0||!Number.isSafeInteger(start))return new Response("Invalid cursor",{status:400});
 try{
  const {data:batch,error:readError}=await client.from('anime').select('id').gt('id',start).order('id').limit(500);
  if(readError)throw readError;
  if(!batch?.length){const {error}=await client.rpc('rebuild_anime_series');if(error)throw error;return Response.json({after:start,scanned:0,relations:0,done:true});}
  const pages=Math.ceil(batch.length/50);
  const selection=Array.from({length:pages},(_,i)=>`p${i}:Page(page:${i+1},perPage:50){pageInfo{hasNextPage} media(type:ANIME,sort:ID,id_in:$ids){id relations{edges{relationType node{id type}}}}}`).join(" ");
  const r=await fetch("https://graphql.anilist.co",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({query:`query($ids:[Int]){${selection}}`,variables:{ids:batch.map(a=>a.id)}}),signal:AbortSignal.timeout(40000)});
  if(!r.ok)return Response.json({error:`AniList HTTP ${r.status}`,page:start,retryAfter:r.headers.get('retry-after')},{status:502});
  const body=await r.json();if(body.errors||!body.data)throw Error("AniList relations response unavailable");
  const records=Object.values(body.data) as {pageInfo:{hasNextPage:boolean};media:{id:number;relations:{edges:{relationType:string;node:{id:number;type:string}}[]}}[]}[];
  const ids=records.flatMap(p=>p.media.map(m=>m.id));
  const known=new Set(batch.map(a=>a.id));const rows=records.flatMap(p=>p.media.flatMap(a=>known.has(a.id)?a.relations.edges.filter(e=>e.node.type==='ANIME'&&['PREQUEL','SEQUEL'].includes(e.relationType)&&e.node.id!==a.id).map(e=>({anime_id:a.id,related_id:e.node.id,relation_type:e.relationType})):[]));
  if(rows.length){const {error}=await client.from('anime_relations').upsert(rows,{onConflict:'anime_id,related_id,relation_type'});if(error)throw error;}
  const done=batch.length<500;
  if(done||input.rebuild===true){const {error}=await client.rpc('rebuild_anime_series');if(error)throw error;}
  return Response.json({after:start,nextAfter:batch[batch.length-1].id,scanned:ids.length,relations:rows.length,done});
 }catch{return Response.json({error:"Series refresh failed",page:start},{status:502});}
});
