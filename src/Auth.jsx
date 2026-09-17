import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase, supabaseEnabled } from "./lib/supabaseClient.js";

const AuthCtx = createContext({ user: null, signOut: () => {} });
export const useAuth = () => useContext(AuthCtx);

const shell = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#101010",
  color: "#e9e9e6",
  fontFamily: '"Segoe UI", system-ui, -apple-system, Arial, sans-serif',
  padding: 16,
};
const card = {
  width: "100%",
  maxWidth: 320,
  padding: 28,
  background: "#1a1a1a",
  border: "1px solid #2c2c2c",
  borderRadius: 4,
  boxSizing: "border-box",
};
const inputStyle = {
  width: "100%",
  background: "#212121",
  border: "1px solid #2c2c2c",
  borderRadius: 3,
  padding: "8px 10px",
  fontSize: 14,
  color: "#e9e9e6",
  marginTop: 4,
  marginBottom: 12,
  outline: "none",
  boxSizing: "border-box",
};
const labelStyle = { fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".04em", color: "#8a8f94" };
const btnStyle = {
  width: "100%",
  padding: "9px 0",
  background: "#d81e2c",
  color: "#fff",
  border: "none",
  borderRadius: 3,
  fontWeight: 700,
  fontSize: 13,
  cursor: "pointer",
};

function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (error) setError(error.message);
  }

  async function forgotPassword() {
    if (!email.trim()) {
      setError("Enter your email above first.");
      return;
    }
    setError(null);
    setBusy(true);
    // Supabase's dashboard-level Site URL setting doesn't reliably honor a
    // path (only the bare origin), which sent reset links to the GitHub
    // Pages user root instead of the project page. Passing redirectTo here
    // pins it to wherever this page is actually being served from.
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: window.location.origin + window.location.pathname,
    });
    setBusy(false);
    if (error) setError(error.message);
    else setResetSent(true);
  }

  return (
    <div style={shell}>
      <form style={card} onSubmit={submit}>
        <div style={{ fontFamily: "Anton, Impact, sans-serif", fontSize: 28, marginBottom: 4, letterSpacing: ".03em" }}>
          MAT<span style={{ color: "#d81e2c" }}>PLAN</span>
        </div>
        <p style={{ fontSize: 12, color: "#8a8f94", marginBottom: 20 }}>Sign in to your coaching staff's workspace.</p>

        <label style={labelStyle}>Email</label>
        <input style={inputStyle} type="email" required autoFocus value={email} onChange={(e) => setEmail(e.target.value)} />

        <label style={labelStyle}>Password</label>
        <input style={inputStyle} type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />

        {error && <p style={{ color: "#ff6b76", fontSize: 12, marginBottom: 12 }}>{error}</p>}
        {resetSent && <p style={{ color: "#4ade80", fontSize: 12, marginBottom: 12 }}>Password reset email sent.</p>}

        <button style={{ ...btnStyle, opacity: busy ? 0.6 : 1 }} disabled={busy} type="submit">
          {busy ? "Signing in…" : "Sign In"}
        </button>
        <button
          type="button"
          onClick={forgotPassword}
          style={{ background: "none", border: "none", color: "#8a8f94", fontSize: 12, marginTop: 12, cursor: "pointer", textDecoration: "underline", padding: 0 }}
        >
          Forgot password?
        </button>
        <p style={{ fontSize: 11, color: "#5b5f63", marginTop: 16 }}>
          Access is invite-only. Ask your admin for an invite if you don't have an account yet.
        </p>
      </form>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div style={shell}>
      <p style={{ color: "#8a8f94", fontSize: 13 }}>Loading…</p>
    </div>
  );
}

/**
 * Supabase redirects invite and password-recovery links back here with
 * `type=invite` or `type=recovery` in the URL fragment. Those sign the
 * visitor in with a short-lived session but never set a password — without
 * this check they'd land straight in the app having never set one, then be
 * unable to sign in again later. Checked once at load, before Supabase's
 * client strips the fragment.
 */
function isRecoveryLink() {
  return /type=invite|type=recovery/.test(window.location.hash || "");
}

function SetPassword({ onDone }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Use at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    // Drop the recovery params so refreshing this page doesn't re-trigger the form.
    window.history.replaceState(null, "", window.location.pathname + window.location.search);
    onDone();
  }

  return (
    <div style={shell}>
      <form style={card} onSubmit={submit}>
        <div style={{ fontFamily: "Anton, Impact, sans-serif", fontSize: 28, marginBottom: 4, letterSpacing: ".03em" }}>
          MAT<span style={{ color: "#d81e2c" }}>PLAN</span>
        </div>
        <p style={{ fontSize: 12, color: "#8a8f94", marginBottom: 20 }}>Set your password to finish signing in.</p>

        <label style={labelStyle}>New Password</label>
        <input style={inputStyle} type="password" required autoFocus minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />

        <label style={labelStyle}>Confirm Password</label>
        <input style={inputStyle} type="password" required minLength={8} value={confirm} onChange={(e) => setConfirm(e.target.value)} />

        {error && <p style={{ color: "#ff6b76", fontSize: 12, marginBottom: 12 }}>{error}</p>}

        <button style={{ ...btnStyle, opacity: busy ? 0.6 : 1 }} disabled={busy} type="submit">
          {busy ? "Saving…" : "Save Password"}
        </button>
      </form>
    </div>
  );
}

/**
 * Gates the whole app behind Supabase auth. When Supabase isn't configured
 * (no VITE_SUPABASE_URL/ANON_KEY at build time), this is a no-op passthrough
 * so local dev and the original single-browser mode keep working unchanged.
 */
export default function AuthGate({ children }) {
  const [session, setSession] = useState(undefined); // undefined = still checking
  const [needsPassword, setNeedsPassword] = useState(false);

  useEffect(() => {
    if (!supabaseEnabled) return;
    let cancelled = false;
    if (isRecoveryLink()) setNeedsPassword(true);

    supabase.auth.getSession().then(({ data }) => {
      if (!cancelled) setSession(data.session);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      if (event === "PASSWORD_RECOVERY") setNeedsPassword(true);
      setSession(s);
    });
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  if (!supabaseEnabled) return children;
  if (session === undefined) return <LoadingScreen />;
  if (!session) return <SignIn />;
  if (needsPassword) return <SetPassword onDone={() => setNeedsPassword(false)} />;

  return (
    <AuthCtx.Provider value={{ user: session.user, signOut: () => supabase.auth.signOut() }}>
      {children}
    </AuthCtx.Provider>
  );
}
