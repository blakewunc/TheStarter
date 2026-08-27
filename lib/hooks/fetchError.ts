/**
 * Pull the server's error message off a failed response.
 *
 * API routes return { error: string }. Discarding that and showing a generic
 * "Failed to fetch X" turns every distinct backend failure — a missing column,
 * a permissions problem, an expired session — into the same opaque banner, which
 * makes them indistinguishable to whoever has to debug it.
 *
 * Falls back to the status code when the body is not JSON, which happens for
 * proxy and gateway errors that return HTML.
 */
export async function fetchErrorMessage(
  response: Response,
  fallback: string
): Promise<string> {
  try {
    const body = await response.json()
    if (body?.error && typeof body.error === 'string') {
      return body.error
    }
  } catch {
    // Non-JSON body — fall through to the status code.
  }
  return `${fallback} (HTTP ${response.status})`
}
