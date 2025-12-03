// /src/utils/normalize-url.ts
export function normalizeVideoUrl(url: string): string {
  try {
    if (!url) return url;

    if (url.includes("dropbox.com")) {
      let clean = url
        .replace("www.dropbox.com", "dl.dropboxusercontent.com")
        .replace("dropbox.com", "dl.dropboxusercontent.com");

      clean = clean.replace("?dl=0", "");
      clean = clean.replace("?dl=1", "");
      clean = clean.replace("&dl=0", "");
      clean = clean.replace("&dl=1", "");

      clean = clean.replace("?raw=1", "").replace("&raw=1", "");

      return clean;
    }

    return url;
  } catch {
    return url;
  }
}
