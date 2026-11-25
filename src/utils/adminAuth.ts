/**
 * Checks the admin password on the server (/api/admin-auth).
 * The real password is stored only on the server (ADMIN_PASSWORD or scrypt-claimed preview hash),
 * never in the website code, and the signed session token stays strictly in JS memory.
 */
let inMemoryAdminToken: string | null = null;

export function getAdminAuthToken(): string | null {
  return inMemoryAdminToken;
}

export function clearAdminAuthToken(): void {
  inMemoryAdminToken = null;
}

export async function getAdminAuthStatus(): Promise<{
  configured: boolean;
  canClaim: boolean;
  authenticated: boolean;
}> {
  try {
    const r = await fetch('/api/admin-auth', {
      method: 'GET',
      headers: inMemoryAdminToken ? { Authorization: `Bearer ${inMemoryAdminToken}` } : undefined
    });
    const data = await r.json().catch(() => ({}));
    return {
      configured: Boolean(data.configured),
      canClaim: Boolean(data.canClaim),
      authenticated: Boolean(data.authenticated)
    };
  } catch {
    return { configured: true, canClaim: false, authenticated: false };
  }
}

export async function verifyAdminPassword(password: string): Promise<boolean> {
  try {
    const r = await fetch('/api/admin-auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    const data = await r.json().catch(() => ({}));
    if (r.ok && data.ok === true) {
      if (typeof data.token === 'string' && data.token) {
        inMemoryAdminToken = data.token;
      }
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export async function claimAdminPassword(password: string): Promise<{
  ok: boolean;
  error?: string;
}> {
  try {
    const r = await fetch('/api/admin-auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'claim', password })
    });
    const data = await r.json().catch(() => ({}));
    if (r.ok && data.ok === true) {
      if (typeof data.token === 'string' && data.token) {
        inMemoryAdminToken = data.token;
      }
      return { ok: true };
    }
    return { ok: false, error: data.message || 'Unable to set admin passcode.' };
  } catch {
    return { ok: false, error: 'Network error while claiming admin passcode.' };
  }
}
