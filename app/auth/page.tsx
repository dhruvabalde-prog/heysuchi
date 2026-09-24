"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "../../lib/supabase/client";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setError("");
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: `${window.location.origin}/auth/callback` } });
    if (error) setError(error.message); else setSent(true);
  }
  return <main style={{minHeight:"100vh",display:"grid",placeItems:"center",padding:24}}><form onSubmit={submit} style={{width:"100%",maxWidth:420,display:"grid",gap:16}}><h1>HeySuchi</h1><p>Sign in to keep your missions private and synced.</p><input aria-label="Email" type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" style={{padding:14}}/><button type="submit" style={{padding:14}}>Send sign-in link</button>{sent&&<p>Check your email for the sign-in link.</p>}{error&&<p>{error}</p>}</form></main>;
}
