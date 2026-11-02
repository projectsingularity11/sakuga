// Operator-only hosted smoke check. Creates two isolated, immediately banned test accounts.
import {createClient} from 'npm:@supabase/supabase-js@2.80.0';
import {JOB_KEY_SHA256} from './job-config.ts';
Deno.serve(async(req:Request)=>{
 const digest=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(req.headers.get('x-sakuga-job-key')||'')))).map(b=>b.toString(16).padStart(2,'0')).join('');
 if(req.method!=='POST'||digest!==JOB_KEY_SHA256)return new Response('Unauthorized',{status:401});
 const url=Deno.env.get('SUPABASE_URL')!,anon=Deno.env.get('SUPABASE_ANON_KEY')!;
 const root=createClient(url,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,{auth:{persistSession:false}});
 const ids:string[]=[];const clients:ReturnType<typeof createClient>[]=[];const checks:string[]=[];
 const assert=(condition:unknown,label:string)=>{if(!condition)throw new Error(label);checks.push(label);};
 try{
 for(const name of ['alice','bob']){const email=`sakuga-smoke-${name}-${crypto.randomUUID()}@example.com`,password=crypto.randomUUID()+'Aa!';const made=await root.auth.admin.createUser({email,password,email_confirm:true,app_metadata:{sakuga_smoke_test:true}});assert(!made.error&&made.data.user,`${name}: account creation`);ids.push(made.data.user!.id);const c=createClient(url,anon,{auth:{persistSession:false}});const login=await c.auth.signInWithPassword({email,password});assert(!login.error,`${name}: password login`);clients.push(c);}
 const [a,b]=clients;const {data:title}=await root.from('anime').select('id,episodes').eq('moderation','published').gte('episodes',2).order('id').limit(1).single();assert(title,'Published catalog available');
 assert(!(await a.from('profiles').select('id').eq('id',ids[0]).single()).error,'Signup profile trigger');
 assert(!(await a.from('library').insert({user_id:ids[0],anime_id:title!.id,status:'watching',progress:1,notes:'Smoke test private note'})).error,'Library create');
 assert(!!(await a.from('library').insert({user_id:ids[0],anime_id:title!.id})).error,'Library uniqueness');
 assert(!(await a.from('library').update({progress:2}).eq('anime_id',title!.id)).error,'Progress update');
 assert((await a.from('library').select('progress').eq('anime_id',title!.id).single()).data?.progress===2,'Progress persistence');
 assert((await b.from('library').select('*').eq('user_id',ids[0])).data?.length===0,'Cross-user read denied');
 assert(!!(await b.from('library').insert({user_id:ids[0],anime_id:title!.id})).error,'Cross-user write denied');
 assert(!!(await b.from('entitlements').insert({user_id:ids[1],ad_free:true})).error,'Client entitlement escalation denied');
 assert(!(await a.from('profiles').update({preferences:{theme:{preset:'Ocean',mode:'dark',accent:'#316579',intensity:8}}}).eq('id',ids[0])).error,'Theme save');
 assert((await a.from('profiles').select('preferences').eq('id',ids[0]).single()).data?.preferences?.theme?.preset==='Ocean','Theme persistence');
 const collection=await a.from('collections').insert({user_id:ids[0],name:'Hosted smoke collection'}).select().single();assert(!collection.error,'Collection create');
 assert(!(await a.from('collection_members').insert({collection_id:collection.data.id,user_id:ids[0],anime_id:title!.id})).error,'Collection membership');
 assert(!!(await b.from('collection_members').insert({collection_id:collection.data.id,user_id:ids[1],anime_id:title!.id})).error,'Collection owner boundary');
 const stats=await a.rpc('personal_statistics');assert(!stats.error&&stats.data.total===1,'Private statistics');
 const publicClient=createClient(url,anon,{auth:{persistSession:false}});assert((await publicClient.from('anime').select('id').neq('moderation','published')).data?.length===0,'Restricted catalog hidden');
 const search=await publicClient.from('anime').select('id').ilike('search_text','%cowboy bebop%');assert(!search.error&&!!search.data?.length,'Real title search');
 const session=(await a.auth.getSession()).data.session!;const reloaded=createClient(url,anon,{auth:{persistSession:false}});assert(!(await reloaded.auth.setSession({access_token:session.access_token,refresh_token:session.refresh_token})).error,'Session restore');
 assert(!(await a.auth.signOut()).error,'Logout');
 return Response.json({passed:checks.length,checks});
 }catch(e){return Response.json({passed:checks.length,checks,error:e instanceof Error?e.message:'Unknown failure'},{status:500});}
 finally{for(const c of clients)await c.auth.signOut();for(const id of ids)await root.auth.admin.updateUserById(id,{ban_duration:'876000h'});}
});
