import { redirect } from "next/navigation";
import { getAdminContext } from "../../lib/admin";
import { getSupabaseAdmin } from "../../lib/supabase/admin";

const roles = [
  ["super_admin","Super Admin"],["admin","Admin"],["operator","Operator"],
  ["support","Support"],["ai_manager","AI Manager"],["integration_manager","Integration Manager"]
];

export default async function AdminPage() {
  const context = await getAdminContext();
  if (!context) redirect("/");
  const supabase = getSupabaseAdmin();
  const [{ count: missions }, { count: users }, { count: blocked }, { data: members }] = await Promise.all([
    supabase.from("missions").select("id", { count: "exact", head: true }),
    supabase.from("auth_identities").select("id", { count: "exact", head: true }),
    supabase.from("missions").select("id", { count: "exact", head: true }).eq("status","blocked"),
    supabase.from("platform_admin_members").select("identity_id,created_at,auth_identities(email,display_name),platform_roles(key,name)").order("created_at")
  ]);

  return <main style={{padding:"32px",maxWidth:1200,margin:"0 auto"}}>
    <p>HEY SUCHI / COMMAND CENTER</p>
    <h1>Command Center</h1>
    <p>{context.identity.email} · {context.role}</p>
    <section style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16,marginTop:32}}>
      {[["Users",users??0],["Missions",missions??0],["Blocked",blocked??0],["Permissions",context.permissions.length]].map(([label,value])=><div key={String(label)} style={{padding:20,border:"1px solid #ddd",borderRadius:16}}><strong>{label}</strong><div style={{fontSize:32,marginTop:8}}>{value}</div></div>)}
    </section>
    <section style={{marginTop:40}}>
      <h2>Platform access</h2>
      <p>Roles are HeySuchi permissions, separate from Google OAuth scopes.</p>
      <div style={{display:"grid",gap:10}}>
        {roles.map(([key,name])=><div key={key} style={{padding:14,border:"1px solid #eee",borderRadius:12}}><strong>{name}</strong><span style={{marginLeft:12,opacity:.6}}>{key}</span></div>)}
      </div>
    </section>
    <section style={{marginTop:40}}>
      <h2>Current admins</h2>
      <div style={{display:"grid",gap:10}}>
        {(members??[]).map((m:any)=>{const i=Array.isArray(m.auth_identities)?m.auth_identities[0]:m.auth_identities;const r=Array.isArray(m.platform_roles)?m.platform_roles[0]:m.platform_roles;return <div key={m.identity_id} style={{padding:14,border:"1px solid #eee",borderRadius:12}}>{i?.email} · {r?.name}</div>})}
      </div>
    </section>
  </main>;
}
