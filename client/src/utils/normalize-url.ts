// /src/utils/normalize-url.ts
export function normalizeVideoUrl(url: string): string {
  try {
    if (url.includes("dropbox.com")) {
      url = url.replace("www.dropbox.com", "dl.dropboxusercontent.com");

      url = url.replace(/(\?|&)dl=\d/, "");

      if (!url.includes("raw=1")) {
        url += url.includes("?") ? "&raw=1" : "?raw=1";
      }
    }

    return url;
  } catch {
    return url;
  }
}
