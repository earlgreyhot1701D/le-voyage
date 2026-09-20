import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    'Access-Control-Allow-Origin': allowedOrigin || '',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

interface SendInviteBody {
  invitationId: string;
  appOrigin?: string;
}

serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  if (!corsHeaders['Access-Control-Allow-Origin']) {
    console.warn(`[send-invitation] Rejected request from origin: ${origin}`);
    return new Response('Forbidden', { status: 403 });
  }

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', {
      status: 405,
      headers: corsHeaders,
    });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing Authorization' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const fromAddress =
      Deno.env.get('INVITE_FROM_ADDRESS') ?? 'Le Voyage <onboarding@resend.dev>';

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('[send-invitation] Missing Supabase service env vars');
      return new Response(
        JSON.stringify({ error: 'Server misconfigured' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    if (!resendApiKey) {
      console.error('[send-invitation] RESEND_API_KEY not set');
      return new Response(
        JSON.stringify({
          error:
            'Email delivery is not configured. Set the RESEND_API_KEY secret on the send-invitation function.',
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    // Identify the caller using their JWT.
    const callerClient = createClient(supabaseUrl, serviceRoleKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: userData, error: userError } = await callerClient.auth.getUser();
    if (userError || !userData?.user) {
      return new Response(JSON.stringify({ error: 'Not authenticated' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const callerId = userData.user.id;

    const body = (await req.json().catch(() => null)) as SendInviteBody | null;
    if (!body?.invitationId) {
      return new Response(JSON.stringify({ error: 'invitationId required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Trusted, RLS-bypassing client for lookups + ownership check.
    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: invitation, error: inviteErr } = await adminClient
      .from('invitations')
      .select('id, trip_id, email, role, token, accepted_at')
      .eq('id', body.invitationId)
      .maybeSingle();

    if (inviteErr || !invitation) {
      return new Response(JSON.stringify({ error: 'Invitation not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (invitation.accepted_at) {
      return new Response(
        JSON.stringify({ error: 'Invitation has already been accepted' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    const { data: isOwner, error: ownerErr } = await adminClient.rpc(
      'is_trip_owner',
      { _user_id: callerId, _trip_id: invitation.trip_id },
    );

    if (ownerErr || !isOwner) {
      return new Response(
        JSON.stringify({ error: 'Only the trip owner can send invitations' }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    const { data: trip } = await adminClient
      .from('trips')
      .select('title, destination')
      .eq('id', invitation.trip_id)
      .maybeSingle();

    const { data: inviterProfile } = await adminClient
      .from('profiles')
      .select('display_name')
      .eq('id', callerId)
      .maybeSingle();

    const appOrigin = (body.appOrigin || origin || '').replace(/\/$/, '');
    if (!appOrigin) {
      return new Response(
        JSON.stringify({ error: 'Could not resolve app origin for invite link' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    const inviteUrl = `${appOrigin}/invite/${invitation.token}`;
    const tripTitle = trip?.title || 'a trip';
    const tripDest = trip?.destination ? ` (${trip.destination})` : '';
    const inviterLabel =
      inviterProfile?.display_name || userData.user.email || 'A collaborator';

    const subject = `${inviterLabel} invited you to ${tripTitle} on Le Voyage`;

    const html = `
      <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #2b2b2b;">
        <h1 style="font-size: 28px; margin: 0 0 12px;">You're invited!</h1>
        <p style="font-size: 16px; line-height: 1.5;">
          ${escapeHtml(inviterLabel)} has invited you to collaborate on
          <strong>${escapeHtml(tripTitle)}</strong>${escapeHtml(tripDest)}
          as a <strong>${escapeHtml(invitation.role)}</strong>.
        </p>
        <p style="margin: 24px 0;">
          <a href="${inviteUrl}"
             style="background:#1f3d2b; color:#fff; padding:12px 24px; border-radius:8px; text-decoration:none; font-weight:600;">
            Accept invitation
          </a>
        </p>
        <p style="font-size: 13px; color: #666;">
          Or paste this link into your browser:<br />
          <a href="${inviteUrl}">${inviteUrl}</a>
        </p>
        <p style="font-size: 12px; color: #999; margin-top: 32px;">
          You're receiving this because ${escapeHtml(inviterLabel)} entered your email
          address in Le Voyage. If you weren't expecting this, you can safely ignore the message.
        </p>
      </div>
    `;

    const text =
      `${inviterLabel} has invited you to collaborate on ${tripTitle}${tripDest} on Le Voyage.\n\n` +
      `Open this link to accept: ${inviteUrl}\n`;

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromAddress,
        to: invitation.email,
        subject,
        html,
        text,
      }),
    });

    if (!resendRes.ok) {
      const errText = await resendRes.text();
      console.error(
        '[send-invitation] Resend error:',
        resendRes.status,
        errText,
      );
      return new Response(
        JSON.stringify({
          error: 'Email delivery failed',
          detail: errText,
        }),
        {
          status: 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[send-invitation] error:', err);
    return new Response(
      JSON.stringify({ error: (err as Error).message ?? 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});
