import { JOB_KEY_SHA256 } from './job-config.ts';
const covers:Record<string,string>={ '154587':'https://cdn.myanimelist.net/images/anime/1015/138006.jpg','1':'https://cdn.myanimelist.net/images/anime/4/19644.jpg','127230':'https://cdn.myanimelist.net/images/anime/1806/126216.jpg','171018':'https://cdn.myanimelist.net/images/anime/1584/143719.jpg','101922':'https://cdn.myanimelist.net/images/anime/1286/99889.jpg','113415':'https://cdn.myanimelist.net/images/anime/1171/109222.jpg','21827':'https://cdn.myanimelist.net/images/anime/1795/95088.jpg','21519':'https://cdn.myanimelist.net/images/anime/5/87048.jpg','185660':'https://cdn.myanimelist.net/images/anime/1721/149001.jpg','21507':'https://cdn.myanimelist.net/images/anime/8/80356.jpg'};
Deno.serve(async(req:Request)=>{
 const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(req.headers.get('x-sakuga-job-key')||'')))).map(b=>b.toString(16).padStart(2,'0')).join('');
 if(req.method!=='POST'||hash!==JOB_KEY_SHA256)return new Response('Unauthorized',{status:401});
 const body=await req.json();
 if(body.check==='auth-redirects') {
  const base=Deno.env.get('SUPABASE_URL')!+'/auth/v1/verify?token=invalid-sakuga-config-check&type=signup';
  const outcomes=[];
  for(const target of ['', '&redirect_to='+encodeURIComponent('https://sakuga-pink.vercel.app/auth/callback')]) {
   const response=await fetch(base+target,{redirect:'manual',signal:AbortSignal.timeout(10000)});
   outcomes.push({status:response.status,location:response.headers.get('location')});
  }
  return Response.json({outcomes});
 }
 const url=covers[String(body.id)];if(!url)return new Response('Unknown cover',{status:404});
 const r=await fetch(url,{signal:AbortSignal.timeout(15000)});if(!r.ok)return new Response('Source unavailable',{status:502});
 const bytes=new Uint8Array(await r.arrayBuffer());if(bytes.length>2_000_000)return new Response('Image too large',{status:413});
 let binary='';for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.subarray(i,i+8192));
 return Response.json({id:body.id,base64:btoa(binary),source:url});
});
