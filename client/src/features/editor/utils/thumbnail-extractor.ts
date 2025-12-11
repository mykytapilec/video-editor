// client/src/features/editor/utils/thumbnail-extractor.ts
type CaptureOptions = {
  width?: number;
  height?: number;
  timeoutMs?: number;
  crossOrigin?: string;
};

const DEFAULT_OPTIONS: CaptureOptions = {
  width: 160,
  height: 90,
  timeoutMs: 1400,
  crossOrigin: "anonymous",
};

let sharedVideo: HTMLVideoElement | null = null;
let sharedCanvas: HTMLCanvasElement | null = null;
let sharedCtx: CanvasRenderingContext2D | null = null;

function ensureElements() {
  if (!sharedVideo) {
    sharedVideo = document.createElement("video");
    sharedVideo.muted = true;
    sharedVideo.playsInline = true;
    sharedVideo.style.position = "fixed";
    sharedVideo.style.left = "-9999px";
    sharedVideo.style.width = "1px";
    sharedVideo.style.height = "1px";
    sharedVideo.style.opacity = "0";
    sharedVideo.setAttribute("preload", "metadata");
    document.body.appendChild(sharedVideo);
  }
  if (!sharedCanvas) {
    sharedCanvas = document.createElement("canvas");
    sharedCanvas.width = DEFAULT_OPTIONS.width!;
    sharedCanvas.height = DEFAULT_OPTIONS.height!;
    // canvas doesn't need to be attached to DOM
    sharedCtx = sharedCanvas.getContext("2d");
  }
}

/**
 * Capture a single frame from a video URL at the specified time (seconds).
 * Returns a base64 dataURL (jpeg).
 */
export async function captureFrame(
  src: string,
  timeSec: number,
  opts?: CaptureOptions
): Promise<string> {
  if (typeof window === "undefined") throw new Error("captureFrame must run in browser");

  const options = { ...DEFAULT_OPTIONS, ...(opts || {}) };

  ensureElements();

  const video = sharedVideo!;
  const canvas = sharedCanvas!;
  const ctx = sharedCtx!;
  if (!ctx) throw new Error("Canvas 2D context not available");

  // Avoid resetting src if same (helps in some cases)
  if (video.src !== src) {
    try {
      // attach crossOrigin only if provided (for remote urls)
      if (options.crossOrigin) video.crossOrigin = options.crossOrigin;
    } catch { /* ignore */ }
    // set src
    video.src = src;
  }

  // load metadata if needed
  await new Promise<void>((res) => {
    if (video.readyState >= 1) return res();
    const onLoaded = () => {
      cleanup();
      res();
    };
    const onError = () => {
      cleanup();
      res();
    };
    function cleanup() {
      video.removeEventListener("loadedmetadata", onLoaded);
      video.removeEventListener("error", onError);
    }
    video.addEventListener("loadedmetadata", onLoaded);
    video.addEventListener("error", onError);
    // small fallback in case events don't fire
    setTimeout(() => {
      cleanup();
      res();
    }, 1500);
  });

  // clamp time inside duration if available
  if (!isNaN(video.duration) && isFinite(video.duration)) {
    timeSec = Math.max(0, Math.min(timeSec, Math.max(0, video.duration - 0.001)));
  } else {
    timeSec = Math.max(0, timeSec);
  }

  // set size
  canvas.width = options.width!;
  canvas.height = options.height!;

  // seek and capture
  const result = await new Promise<string>((res) => {
    let handled = false;
    const onSeek = () => {
      try {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const data = canvas.toDataURL("image/jpeg", 0.7);
        handled = true;
        cleanup();
        res(data);
      } catch (err) {
        handled = true;
        cleanup();
        res("");
      }
    };
    const onError = () => {
      if (handled) return;
      handled = true;
      cleanup();
      res("");
    };
    function cleanup() {
      video.removeEventListener("seeked", onSeek);
      video.removeEventListener("error", onError);
    }
    video.addEventListener("seeked", onSeek);
    video.addEventListener("error", onError);

    // seek — try/catch because some browsers throw if seeking too early
    try {
      // If video.readyState < 2, seeking may not trigger immediately; we rely on timeout fallback.
      video.currentTime = timeSec;
    } catch {
      // try to set via setTimeout
      setTimeout(() => {
        try {
          video.currentTime = timeSec;
        } catch {}
      }, 50);
    }

    // fallback timeout
    const to = setTimeout(() => {
      if (handled) return;
      handled = true;
      cleanup();
      // try capture anyway if possible
      try {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        res(canvas.toDataURL("image/jpeg", 0.7));
      } catch {
        res("");
      }
    }, options.timeoutMs || 1400);
  });

  return result;
}
