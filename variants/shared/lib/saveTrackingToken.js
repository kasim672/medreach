export function saveTrackingToken(kind, reference, token) {
  if (!reference || !token) return;
  try {
    window.sessionStorage.setItem(`medreach:${kind}-token:${reference}`, token);
  } catch {
    // The confirmation retains the token in its private tracking link.
  }
}
