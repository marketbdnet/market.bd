/**
 * Checks the admin password on the server (/api/admin-auth).
 * The real password is stored only in the Vercel environment variable
 * ADMIN_PASSWORD, never in the website code.
 */
export async function verifyAdminPassword(password: string): Promise<boolean> {
  try {
    const r = await fetch('/api/admin-auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    const data = await r.json().catch(() => ({}));
    return r.ok && data.ok === true;
  } catch {
    return false;
  }
}
