import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

// Allowed origins for CORS (mirrors other functions in this repo)
const ALLOWED_ORIGIN_PATTERNS = [
  /^https:\/\/.*\.lovable\.app$/,
  /^https:\/\/.*\.lovableproject\.com$/,
  /^https:\/\/.*\.supabase\.co$/,
  /^http:\/\/localhost(:\d+)?$/,
  /^http:\/\/127\.0\.0\.1(:\d+)?$/,
];

function getAllowedOrigin(requestOrigin: string | null): string | null {
  if (!requestOrigin) return null;
  for (const pattern of ALLOWED_ORIGIN_PATTERNS) {
    if (pattern.test(requestOrigin)) return requestOrigin;
  }
  return null;
}

function getCorsHeaders(requestOrigin: string | null): Record<string, string> {
  const allowedOrigin = getAllowedOrigin(requestOrigin);
  return {
    "Access-Control-Allow-Origin": allowedOrigin || "",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}

const RequestSchema = z.object({
  invitationId: z.string().uuid(),
});

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderEmail(opts: {
  inviterName: string;
  tripTitle: string;
  destination: string | null;
  role: string;
  inviteUrl: string;
}): { subject: string; html: string; text: string } {
  const { inviterName, tripTitle, destination, role, inviteUrl } = opts;
  const safeInviter = escapeHtml(inviterName);
  const safeTrip = escapeHtml(tripTitle);
  const safeDest = destination ? escapeHtml(destination) : "";
  const safeRole = escapeHtml(role);
  const safeUrl = escapeHtml(inviteUrl);

  const subject = `${inviterName} invited you to collaborate on "${tripTitle}"`;

  const destLine = safeDest
    ? `<p style="margin:0 0 16px;color:#555;">Destination: <strong>${safeDest}</strong></p>`
    : "";

  const html = `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f8f5ef;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8f5ef;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;padding:32px;max-width:560px;">
            <tr>
              <td>
                <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:28px;margin:0 0 8px;color:#1b4d3e;">Le Voyage</h1>
                <p style="margin:0 0 24px;color:#888;font-size:14px;">A trip is waiting for you.</p>
                <p style="margin:0 0 16px;color:#222;font-size:16px;line-height:1.5;">
                  <strong>${safeInviter}</strong> has invited you to collaborate on
                  <strong>${safeTrip}</strong> as a <strong>${safeRole}</strong>.
                </p>
                ${destLine}
                <p style="margin:24px 0;">
                  <a href="${safeUrl}"
                     style="display:inline-block;background:#1b4d3e;color:#fff;text-decoration:none;
                            padding:12px 24px;border-radius:999px;font-weight:600;">
                    Accept invitation
                  </a>
                </p>
                <p style="margin:16px 0 0;color:#888;font-size:13px;line-height:1.5;">
                  Or copy and paste this link into your browser:<br>
                  <span style="word-break:break-all;color:#1b4d3e;">${safeUrl}</span>
                </p>
                <hr style="border:none;border-top:1px solid #eee;margin:32px 0;">
                <p style="margin:0;color:#aaa;font-size:12px;">
                  If you weren't expecting this invitation, you can safely ignore this email.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const text = `${inviterName} invited you to collaborate on "${tripTitle}" as ${role}.

Accept the invitation: ${inviteUrl}

If you weren't expecting this, you can safely ignore this email.`;

  return { subject, html, text };
}

serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (!corsHeaders["Access-Control-Allow-Origin"]) {
    console.warn(`[send-invitation-email] Rejected origin: ${origin}`);
    return new Response("Forbidden", { status: 403 });
  }

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", {
      status: 405,
      headers: corsHeaders,
    });
  }

  try {
    const authHeader = req.headers.get("Authorization") || "";
    if (!authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Missing authorization" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const fromEmail = Deno.env.get("INVITE_FROM_EMAIL") ?? "onboarding@resend.dev";
    const appUrl = Deno.env.get("APP_URL"); // fallback to Origin if not set

    if (!supabaseUrl || !serviceRoleKey || !anonKey) {
      console.error("[send-invitation-email] Supabase env not configured");
      return new Response(
        JSON.stringify({ error: "Service misconfigured" }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!resendApiKey) {
      console.error("[send-invitation-email] RESEND_API_KEY not configured");
      return new Response(
        JSON.stringify({
          error: "Email service not configured",
          detail:
            "Set RESEND_API_KEY (and optionally INVITE_FROM_EMAIL / APP_URL) in the Supabase project secrets.",
        }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify the caller using the user-scoped client (RLS-aware)
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData?.user) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired session" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const callerId = userData.user.id;

    const body = await req.json().catch(() => null);
    const parsed = RequestSchema.safeParse(body);
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: "Invalid input" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const { invitationId } = parsed.data;

    // Service client for authoritative lookups
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // Fetch invitation
    const { data: invite, error: inviteErr } = await adminClient
      .from("invitations")
      .select("id, trip_id, email, role, token, invited_by, accepted_at")
      .eq("id", invitationId)
      .maybeSingle();

    if (inviteErr) {
      console.error("[send-invitation-email] Failed to fetch invitation:", inviteErr);
      return new Response(
        JSON.stringify({ error: "Failed to load invitation" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (!invite) {
      return new Response(
        JSON.stringify({ error: "Invitation not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (invite.accepted_at) {
      return new Response(
        JSON.stringify({ error: "Invitation has already been accepted" }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Authorization: caller must be the trip owner
    const { data: ownerRow, error: ownerErr } = await adminClient
      .from("trip_collaborators")
      .select("user_id")
      .eq("trip_id", invite.trip_id)
      .eq("user_id", callerId)
      .eq("role", "owner")
      .maybeSingle();

    if (ownerErr || !ownerRow) {
      return new Response(
        JSON.stringify({ error: "Only the trip owner can send invitation emails" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch trip + inviter profile for a nicer email body
    const [{ data: trip }, { data: inviterProfile }] = await Promise.all([
      adminClient
        .from("trips")
        .select("title, destination")
        .eq("id", invite.trip_id)
        .maybeSingle(),
      adminClient
        .from("profiles")
        .select("display_name")
        .eq("id", invite.invited_by)
        .maybeSingle(),
    ]);

    // Resolve the app base URL. Prefer the explicit APP_URL secret; fall back
    // to the request Origin so dev + preview envs still work.
    const baseUrl = (appUrl || origin || "").replace(/\/$/, "");
    if (!baseUrl) {
      return new Response(
        JSON.stringify({ error: "Cannot determine app URL" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const inviteUrl = `${baseUrl}/invite/${invite.token}`;

    const { data: inviterAuth } = await adminClient.auth.admin.getUserById(invite.invited_by);
    const inviterName =
      inviterProfile?.display_name ||
      inviterAuth?.user?.user_metadata?.display_name ||
      inviterAuth?.user?.email ||
      "Someone";

    const { subject, html, text } = renderEmail({
      inviterName,
      tripTitle: trip?.title ?? "a trip",
      destination: trip?.destination ?? null,
      role: invite.role,
      inviteUrl,
    });

    const resendResp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [invite.email],
        subject,
        html,
        text,
      }),
    });

    if (!resendResp.ok) {
      const errText = await resendResp.text();
      console.error("[send-invitation-email] Resend error:", resendResp.status, errText);
      return new Response(
        JSON.stringify({
          error: "Failed to send email",
          detail: `Email provider returned ${resendResp.status}`,
        }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const resendJson = await resendResp.json().catch(() => ({}));
    console.log(
      `[send-invitation-email] Sent invitation ${invitationId} to ${invite.email} (resend id: ${resendJson?.id ?? "?"})`
    );

    return new Response(
      JSON.stringify({ ok: true, providerId: resendJson?.id ?? null }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[send-invitation-email] Unexpected error:", err);
    return new Response(
      JSON.stringify({ error: "Unexpected error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
