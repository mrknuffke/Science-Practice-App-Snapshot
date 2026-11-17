import { verifySession } from '../utils/jwt';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  try {
    const { oauthSession } = await req.json();
    const authSecret = process.env.AUTH_SECRET;

    // Always verified; see the note in api/gemini.ts about the removed
    // localhost Host-header skip. Local dev is served by vite.config.ts.
    if (!authSecret || !oauthSession || !(await verifySession(oauthSession, authSecret))) {
      return new Response(JSON.stringify({ error: 'Unauthorized: Invalid or expired session' }), { status: 401 });
    }

    return new Response(JSON.stringify({ status: 'ok' }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Bad Request' }), { status: 400 });
  }
}
