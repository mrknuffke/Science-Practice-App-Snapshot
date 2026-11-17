import { SignJWT, jwtVerify, createRemoteJWKSet } from 'jose';

const GOOGLE_JWKS = createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs'));
const GOOGLE_ISSUERS = ['https://accounts.google.com', 'accounts.google.com'];

export interface GoogleProfile {
  email: string;
  emailVerified: boolean;
}

/**
 * Verifies a Google Identity Services ID token (the `credential` string handed
 * to the browser by the Sign In With Google button) against Google's public keys.
 * Throws if the signature, issuer, audience, or expiry don't check out.
 */
export async function verifyGoogleCredential(credential: string, clientId: string): Promise<GoogleProfile> {
  const { payload } = await jwtVerify(credential, GOOGLE_JWKS, {
    issuer: GOOGLE_ISSUERS,
    audience: clientId,
  });

  const email = typeof payload.email === 'string' ? payload.email : '';
  const emailVerified = payload.email_verified === true;

  if (!email) {
    throw new Error('Google token did not include an email address');
  }

  return { email, emailVerified };
}

function getSecretKey(authSecret: string): Uint8Array {
  return new TextEncoder().encode(authSecret);
}

/**
 * Mints our own session token after a successful Google verification.
 * Payload intentionally contains ONLY the verified domain — never email or
 * name — since JWTs are signed, not encrypted, and this app runs on shared
 * school devices. Anyone with local device access can base64-decode the
 * payload; it must never be able to identify the specific user.
 */
export async function signSession(domain: string, authSecret: string): Promise<string> {
  return new SignJWT({ dom: domain })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('90d')
    .sign(getSecretKey(authSecret));
}

/** Verifies a session token minted by signSession. Returns false on any failure (expired, tampered, wrong secret). */
export async function verifySession(token: string, authSecret: string): Promise<boolean> {
  try {
    await jwtVerify(token, getSecretKey(authSecret));
    return true;
  } catch {
    return false;
  }
}
