import { redirect } from "next/navigation";
import { isAdmin } from "../../lib/admin";
export default async function AdminPage(){
 if(!(await isAdmin())) redirect("/");
 return <main style={{padding:"32px",maxWidth:1200,margin:"0 auto"}}><p>HEY SUCHI / COMMAND CENTER</p><h1>Command Center</h1><p>System visibility, missions, agents, users and security will live here.</p><section style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16,marginTop:32}}>{["Missions","AI providers","Users","System health"].map(x=><div key={x} style={{padding:20,border:"1px solid #ddd",borderRadius:16}}><strong>{x}</strong><p>Ready for live data.</p></div>)}</section></main>}
