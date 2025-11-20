// client/src/utils/normalizeUrl.ts
export function normalizeExternalUrl(url?: string | null): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    // Dropbox share links — convert dl=0 -> dl=1 or add raw=1
    if (u.hostname.includes("dropbox.com")) {
      if (u.searchParams.get("dl") === "0") {
        u.searchParams.set("dl", "1");
        return u.toString();
      }
      // if no dl param, add raw=1 (safer)
      if (!u.searchParams.has("raw")) {
        u.searchParams.set("raw", "1");
        return u.toString();
      }
    }
    // GitHub raw? convert gist/github pages not handled here, just return
    return url;
  } catch (e) {
    // not a valid URL? return original
    return url;
  }
}
