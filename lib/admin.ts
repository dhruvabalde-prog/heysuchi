import { cookies } from "next/headers";
const ADMIN_EMAILS=(process.env.HEY_SUCHI_ADMIN_EMAILS??"").split(",").map(v=>v.trim().toLowerCase()).filter(Boolean);
export async function isAdmin(){
 const store=await cookies();
 const raw=store.get("suchi_google_identity")?.value;
 if(!raw)return false;
 try{const identity=JSON.parse(raw);return typeof identity.email==="string"&&ADMIN_EMAILS.includes(identity.email.toLowerCase());}catch{return false}
}
