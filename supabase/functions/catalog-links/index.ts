import {createClient} from 'npm:@supabase/supabase-js@2.80.0';
import {JOB_KEY_SHA256} from './job-config.ts';
Deno.serve(async(req:Request)=>{
 const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(req.headers.get('x-sakuga-job-key')||'')))).map(b=>b.toString(16).padStart(2,'0')).join('');
 if(req.method!=='POST'||hash!==JOB_KEY_SHA256)return new Response('Unauthorized',{status:401});
 try{
 const headers={'User-Agent':'Sakuga/1.0 (https://sakuga-anime.vercel.app; catalog metadata cross-references)','Accept':'application/json'};
 const property=await fetch('https://www.wikidata.org/wiki/Special:EntityData/P4086.json',{headers,signal:AbortSignal.timeout(20000)});if(!property.ok)throw Error('Property documentation unavailable');const doc=await property.json();if(doc.entities?.P4086?.labels?.en?.value!=='MyAnimeList anime ID')throw Error('Unexpected mapping property');
 const extra=await fetch('https://www.wikidata.org/wiki/Special:EntityData/P8729.json',{headers,signal:AbortSignal.timeout(20000)});const extraDoc=extra.ok?await extra.json():null;const anilistAvailable=extraDoc?.entities?.P8729?.labels?.en?.value==='AniList anime ID';
 const query=anilistAvailable?'SELECT ?mal ?anilist ?imdb ?item ?english WHERE { { ?item wdt:P4086 ?mal. } UNION { ?item wdt:P8729 ?anilist. } ?item wdt:P345 ?imdb. OPTIONAL { ?item rdfs:label ?english. FILTER(LANG(?english) = "en") } } LIMIT 50000':'SELECT ?mal ?imdb ?item ?english WHERE { ?item wdt:P4086 ?mal; wdt:P345 ?imdb. OPTIONAL { ?item rdfs:label ?english. FILTER(LANG(?english) = "en") } } LIMIT 50000';
 const response=await fetch('https://query.wikidata.org/sparql?format=json&query='+encodeURIComponent(query),{headers,signal:AbortSignal.timeout(45000)});if(!response.ok)throw Error('Wikidata HTTP '+response.status);const body=await response.json();if(!Array.isArray(body.results?.bindings))throw Error('Invalid mapping response');
 const groups=new Map<string,{ids:Set<string>;entity:string;english:string|null}>();for(const r of body.results.bindings){const external=r.mal?.value||r.anilist?.value,source=r.mal?'mal':'anilist',imdb=r.imdb?.value,entity=r.item?.value,english=r.english?.value||null;if(!/^\d+$/.test(external||'')||!/^tt\d{5,12}$/.test(imdb||'')||!/^https?:\/\/www.wikidata.org\/entity\/Q\d+$/.test(entity||''))continue;const key=source+':'+external;const group=groups.get(key)||{ids:new Set<string>(),entity,english};group.ids.add(imdb);groups.set(key,group);}
 const mappings=[...groups].filter(([,g])=>g.ids.size===1).map(([key,g])=>({provider:key.split(':')[0],external_id:key.split(':')[1],imdb:[...g.ids][0],entity:g.entity.replace('http://','https://'),english:g.english}));
 const client=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,{auth:{persistSession:false}});
 let linked=0;for(let i=0;i<mappings.length;i+=100){const {data,error}=await client.rpc('apply_imdb_crossreferences',{payload:mappings.slice(i,i+100)});if(error)throw Error('Mapping persistence failed ['+error.code+']: '+error.message);linked+=data||0;}return Response.json({provider:'Wikidata CC0',candidateMappings:mappings.length,linked,ambiguousSkipped:[...groups.values()].filter(g=>g.ids.size>1).length});
 }catch(e){return Response.json({error:e instanceof Error?e.message:'Link enrichment unavailable'},{status:502});}
});
