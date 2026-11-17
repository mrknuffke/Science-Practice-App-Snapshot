interface GoogleCredentialResponse {
  credential: string;
}

interface GoogleIdConfiguration {
  client_id: string;
  callback: (response: GoogleCredentialResponse) => void;
}

interface GoogleButtonConfiguration {
  theme?: 'outline' | 'filled_blue' | 'filled_black';
  size?: 'large' | 'medium' | 'small';
  width?: number;
  text?: 'signin_with' | 'signup_with' | 'continue_with';
  shape?: 'rectangular' | 'pill' | 'circle' | 'square';
}

interface GoogleAccountsId {
  initialize: (config: GoogleIdConfiguration) => void;
  renderButton: (parent: HTMLElement, options: GoogleButtonConfiguration) => void;
  disableAutoSelect?: () => void;
}

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: GoogleAccountsId;
      };
    };
  }
}

let initialized = false;
// Google wants initialize() called once per page, but the Gatekeeper mounts again
// after a sign-out. Routing the callback through this variable lets the newest
// Gatekeeper receive the credential instead of the unmounted one.
let currentHandler: ((credential: string) => void) | null = null;

export function isGoogleSignInConfigured(): boolean {
  return Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);
}

export function initGoogleSignIn(onCredential: (credential: string) => void): void {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
  const accountsId = window.google?.accounts?.id;
  currentHandler = onCredential;
  if (!clientId || !accountsId || initialized) return;

  accountsId.initialize({
    client_id: clientId,
    callback: (response) => currentHandler?.(response.credential),
  });
  initialized = true;
}

// Stops Google from silently picking the same account on the next visit, so a
// second student on a shared computer gets the account chooser.
export function disableGoogleAutoSelect(): void {
  window.google?.accounts?.id?.disableAutoSelect?.();
}

export function renderGoogleButton(container: HTMLElement): void {
  const accountsId = window.google?.accounts?.id;
  if (!accountsId) return;

  container.innerHTML = '';
  accountsId.renderButton(container, {
    theme: 'outline',
    size: 'large',
    width: 320,
    text: 'signin_with',
    shape: 'pill',
  });
}
