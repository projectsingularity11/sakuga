import { createClient } from "npm:@supabase/supabase-js@2.80.0";
Deno.serve(async(req:Request)=>{
 if(req.method!=="POST")return new Response("Method not allowed",{status:405});
 const token=req.headers.get("Authorization")?.replace(/^Bearer /,"");
 if(!token)return new Response("Unauthorized",{status:401});
 const client=createClient(Deno.env.get("SUPABASE_URL")!,Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,{auth:{persistSession:false}});
 const {data:{user},error}=await client.auth.getUser(token);
 if(error||!user)return new Response("Unauthorized",{status:401});
 const body=await req.json().catch(()=>null);if(body?.confirm!=="DELETE")return new Response("Confirmation required",{status:400});
 const {error:revokeError}=await client.auth.admin.signOut(token,'global');
 if(revokeError)return Response.json({error:'Could not revoke sessions'},{status:503});
 const {error:deleteError}=await client.auth.admin.deleteUser(user.id);
 if(deleteError)return Response.json({error:'Could not delete account'},{status:503});
 return Response.json({deleted:true});
});
