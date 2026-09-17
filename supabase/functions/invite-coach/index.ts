// Supabase Edge Function: invite-coach
//
// Invites a coach by email, using the admin API so the invite link's
// redirectTo can be pinned to the app's actual URL — the Supabase
// dashboard's own "Send invitation" button can't do this, and its
// Site URL setting doesn't reliably carry a subpath (like /MatPlan/),
// which is why invite links sent from the dashboard 404 on GitHub Pages.
//
// Requires the caller to be signed in (Supabase verifies the JWT on
// every request by default), so only an already-invited coach can invite
// another one. Adds the email to allowed_coach_emails first so the
// database trigger that enforces invite-only sign-up doesn't reject it.
//
// Deploy via the Supabase dashboard: Edge Functions -> New Function ->
// name it "invite-coach" -> paste this file's contents -> Deploy.
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are provided automatically
// to every Edge Function; no extra secrets to configure.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SITE_URL = "https://bport133.github.io/MatPlan/";

function jsonResponse(body, status) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  let email;
  try {
    ({ email } = await req.json());
  } catch {
    return jsonResponse({ error: "Invalid request body" }, 400);
  }
  if (!email || typeof email !== "string" || !email.includes("@")) {
    return jsonResponse({ error: "A valid email is required" }, 400);
  }
  const normalized = email.trim().toLowerCase();

  const admin = createClient(
    Deno.env.get("SUPABASE_URL"),
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
  );

  const { error: allowlistError } = await admin
    .from("allowed_coach_emails")
    .upsert({ email: normalized }, { onConflict: "email" });
  if (allowlistError) {
    return jsonResponse({ error: allowlistError.message }, 500);
  }

  const { data, error } = await admin.auth.admin.inviteUserByEmail(normalized, {
    redirectTo: SITE_URL,
  });
  if (error) {
    return jsonResponse({ error: error.message }, 400);
  }

  return jsonResponse({ user: { id: data.user.id, email: data.user.email } }, 200);
});
