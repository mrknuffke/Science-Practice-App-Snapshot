import { verifyGoogleCredential, signSession } from '../utils/jwt';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  const clientId = process.env.VITE_GOOGLE_CLIENT_ID;
  const authSecret = process.env.AUTH_SECRET;
  const allowedDomainsEnv = process.env.OAUTH_ALLOWED_DOMAINS;

  if (!clientId || !authSecret || !allowedDomainsEnv || allowedDomainsEnv.trim() === '') {
    return new Response(JSON.stringify({ error: 'Server misconfiguration: Google sign-in is not fully configured.' }), { status: 500 });
  }

  const allowedDomains = allowedDomainsEnv.split(',').map(d => d.trim().toLowerCase()).filter(d => d !== '');
  // Optional: specific individual addresses that bypass the domain check (e.g. personal Gmail).
  // Set OAUTH_ALLOWED_EMAILS=person@gmail.com,other@gmail.com in Vercel env vars.
  // These are checked server-side only — the session token still stores only the domain, never the email.
  const allowedEmails = (process.env.OAUTH_ALLOWED_EMAILS ?? '')
    .split(',').map(e => e.trim().toLowerCase()).filter(e => e !== '');

  try {
    const { credential } = await req.json();
    if (!credential || typeof credential !== 'string') {
      return new Response(JSON.stringify({ error: 'Missing credential' }), { status: 400 });
    }

    const profile = await verifyGoogleCredential(credential, clientId);

    if (!profile.emailVerified) {
      return new Response(JSON.stringify({ error: 'Your Google account email is not verified.' }), { status: 401 });
    }

    const email = profile.email.toLowerCase();
    const domain = email.split('@')[1];
    const domainAllowed = !!domain && allowedDomains.includes(domain);
    const emailAllowed = allowedEmails.includes(email);

    if (!domainAllowed && !emailAllowed) {
      return new Response(JSON.stringify({ error: `Sign-in is restricted to approved school Google accounts. "${domain || 'your account'}" is not on the approved list.` }), { status: 403 });
    }

    // Store only the domain in the session token — never the email address (PII).
    // Individually allowlisted addresses (e.g. gmail.com) sign in under their email domain.
    const session = await signSession(domain, authSecret);
    return new Response(JSON.stringify({ status: 'ok', session }), { status: 200 });
  } catch (e) {
    console.error('Google auth verification failed', e);
    return new Response(JSON.stringify({ error: 'Could not verify Google sign-in. Please try again.' }), { status: 401 });
  }
}
