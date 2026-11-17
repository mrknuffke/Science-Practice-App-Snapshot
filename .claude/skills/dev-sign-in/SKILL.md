---
name: dev-sign-in
description: Troubleshooting local Google sign-in on the dev server: origin_mismatch, client id checks, localhost vs 127.0.0.1, stale dev servers. Use when sign-in fails locally. Also holds the four-point safety argument for the dev-only bypass.
---

# Local sign-in troubleshooting

- **Sign-in fails with `Error 400: origin_mismatch`.** The browser's origin is
  not an Authorized JavaScript origin on that OAuth client.
  - It fails inside Google's iframe, so **no code in this repo ever sees it**.
    `utils/googleAuth.ts` gets no callback and `Gatekeeper.tsx` shows nothing.
    Do not go looking for a bug in either. The gate prints the current origin in
    dev for exactly this reason.
  - Fix it in Google Cloud Console, Credentials, that client, Authorized
    JavaScript origins. Exact match, no trailing slash, no path. Google's own
    note: 5 minutes to a few hours to propagate.
  - **Check the client id, not just the project number.** Every client in a
    project shares the leading number (`841112907226-…`), so a prefix match
    proves nothing. Compare the whole string against `VITE_GOOGLE_CLIENT_ID`.
  - **`localhost` and `127.0.0.1` are different origins to Google**, and on macOS
    `localhost` resolves to `::1`, so a server bound that way answers `localhost`
    and `[::1]` but refuses `127.0.0.1`. `[::1]` cannot be registered at all.
    Stay on `localhost`.
  - **Restart a long-lived dev server before believing anything it tells you.**
    A server left running overnight predates any config or `.env.local` change
    made since.

# Why the dev-only sign-in bypass is safe

`npm run dev` exposes `/api/auth-dev`, and `Gatekeeper.tsx` renders a "Bypass Sign-In
(Local Dev Only)" button, so David can work on screens behind the gate without Google
OAuth resolving locally. Four independent things confine it to local development. A
change that breaks any one of them is a real problem.

1. **The button is inside `import.meta.env.DEV`.** Vite folds that to `false` in a
   production build, so the branch is tree-shaken out of the bundle.
2. **`/api/auth-dev` is registered in `configureServer`**, which only runs under
   `vite dev`. No matching edge function exists in `api/`, so the route does not
   exist on Vercel.
3. **It answers loopback addresses only**, so `vite --host` does not put it, or the
   Gemini proxy behind it, on the network.
4. **It signs with `AUTH_SECRET` if set, otherwise a per-process random key**, never
   a constant committed to this repo. The production edge functions (`api/gemini.ts`,
   `api/verify.ts`, `api/auth-google.ts`) read `process.env.AUTH_SECRET` with **no
   fallback** and fail closed.

This is David's tool, not a verification path. An agent still never signs, plants, or
forges a session, and never uses it to "check" a screen behind sign-in.
