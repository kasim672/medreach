export function safeWebUrl(value) {
  if (typeof value !== "string" || !/^https?:\/\//i.test(value.trim())) return null;
  try {
    const url = new URL(value.trim());
    return url.hostname && !url.username && !url.password ? url.href : null;
  } catch {
    return null;
  }
}
