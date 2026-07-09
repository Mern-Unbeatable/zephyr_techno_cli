/**
 * Extract a user-facing message from a failed API response body.
 */
export async function readApiErrorMessage(response, fallback = 'Something went wrong.') {
  try {
    const text = await response.text();
    if (!text?.trim()) return fallback;

    try {
      const data = JSON.parse(text);
      if (typeof data?.message === 'string' && data.message.trim()) {
        return data.message.trim();
      }
      if (typeof data?.error === 'string' && data.error.trim()) {
        return data.error.trim();
      }
    } catch {
      return text.trim();
    }

    return fallback;
  } catch {
    return fallback;
  }
}
