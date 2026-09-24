"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "../../lib/supabase/client";

export default function AuthPage() {
  const [email,setEmail]=useState(""); const [sent,setSent]=useState(false); const [error,setError]=useState("");
  async function submit(e:React.FormEvent){e.preventDefault();setError("");const {error}=await createSupabaseBrowserClient().auth.signInWithOtp({email,options:{emailRedirectTo:`${window.location.origin}/auth/callback`}});if(error)setError(error.message);else setSent(true)}
  return <main className="authPage"><div className="authCard"><div className="brand"><span className="mark">✦</span><span>HeySuchi</span></div><p className="eyebrow">YOUR OPERATING SYSTEM FOR GETTING THINGS DONE</p><h1>Let’s get<br/><em>things done.</em></h1><p className="sub">Sign in once. Your missions, decisions and work stay private and synced.</p><form onSubmit={submit}><input aria-label="Email" type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"/><button type="submit">{sent?"Link sent ✓":"Send sign-in link ↗"}</button></form>{sent?<p className="authNote">Check your email. The link will bring you straight into HeySuchi.</p>:error&&<p className="authError">{error}</p>}</div></main>;
}
