/**
 * Asks the site to refresh its cached public pages after an admin save. Best-effort: never throws.
 * Pass the admin's Supabase access token; the API route re-verifies it server-side.
 */
export async function requestRevalidate(paths: string[], accessToken: string): Promise<boolean> {
  try {
    if (!paths.length || !accessToken) return false;
    const response = await fetch('/api/revalidate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({ paths }),
    });
    return response.ok;
  } catch {
    return false;
  }
}
