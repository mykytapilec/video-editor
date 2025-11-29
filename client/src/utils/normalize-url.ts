// /src/utils/normalize-url.ts
export function normalizeVideoUrl(url: string): string {
  try {
    if (url.includes("dropbox.com")) {
      if (url.includes("dl=0") || url.includes("dl=1")) {
        return url.replace(/dl=\d/, "raw=1");
      } else if (!url.includes("raw=1")) {
        return url.includes("?") ? url + "&raw=1" : url + "?raw=1";
      }
    }
    return url;
  } catch {
    return url;
  }
}
