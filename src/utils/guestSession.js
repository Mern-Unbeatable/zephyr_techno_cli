function getCookieSessionId() {
  const match = document.cookie.match(/(?:^|;\s*)guestSessionId=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

function setCookieSessionId(id) {
  const maxAge = 60 * 60 * 24 * 30; // 30 days
  document.cookie = `guestSessionId=${encodeURIComponent(id)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

function removeCookieSessionId() {
  document.cookie = 'guestSessionId=; path=/; max-age=0; SameSite=Lax';
}

// Read from localStorage OR cookie (no create)
export function getGuestSessionId() {
  return localStorage.getItem('guestSessionId') || getCookieSessionId() || null;
}

// Read from localStorage OR cookie, create if neither exists
export function getOrCreateGuestSessionId() {
  let sessionId = localStorage.getItem('guestSessionId') || getCookieSessionId();
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem('guestSessionId', sessionId);
    setCookieSessionId(sessionId);
  }
  return sessionId;
}

export function clearGuestSessionId() {
  localStorage.removeItem('guestSessionId');
  removeCookieSessionId();
}
