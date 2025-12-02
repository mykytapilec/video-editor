import React, { useRef, useState, useEffect } from "react";
import { VideoTrackItem, TrackItem } from "@/types";
import useStore from "../store/use-store";

interface Props {
  item: TrackItem;
  pixelsPerSecond: number;
  snapStep: number;
}

const HANDLE_WIDTH = 8;

/**
 * TimelineBlock — отображает один редактируемый блок (trim) с мини-превью (strip).
 * Вариант A: N равномерных кадров, отображаемых в ряд.
 */
export const TimelineBlock: React.FC<Props> = ({ item, pixelsPerSecond, snapStep }) => {
  const { updateTrackItem } = useStore();
  const blockRef = useRef<HTMLDivElement | null>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [isLeftResize, setIsLeftResize] = useState(false);
  const [isRightResize, setIsRightResize] = useState(false);
  const [thumbs, setThumbs] = useState<string[]>([]);
  const [loadingThumbs, setLoadingThumbs] = useState(false);

  const isVideo = (i: TrackItem): i is VideoTrackItem => i.type === "video";
  if (!isVideo(item)) return null;

  // duration (seconds) of the current trim (or fallback to duration field)
  const duration = item.trim ? item.trim.end - item.trim.start : item.duration ?? 0;
  const width = duration * pixelsPerSecond;
  const left = (item.timelineStart ?? 0) * pixelsPerSecond;

  const snap = (value: number) => Math.round(value / snapStep) * snapStep;

  // Generate list of timestamps to capture: N frames across the trim
  const computeTimes = (frameCount: number) => {
    const start = item.trim?.start ?? 0;
    const results: number[] = [];
    if (frameCount <= 1) {
      results.push(start);
      return results;
    }
    for (let i = 0; i < frameCount; i++) {
      const t = start + (i / (frameCount - 1)) * duration;
      results.push(t);
    }
    return results;
  };

  useEffect(() => {
    // Clear thumbs if not enough data
    setThumbs([]);

    if (!item.src || duration <= 0) {
      setLoadingThumbs(false);
      return;
    }

    let cancelled = false;
    setLoadingThumbs(true);

    // Create video element and (optionally) object URL
    const video = document.createElement("video");
    video.crossOrigin = "anonymous";
    // If src appears to be a Blob URL or same-origin, use as-is, otherwise try to set crossOrigin
    video.src = item.src;

    // Choose number of frames based on visual width (at least 3)
    const frameCount = Math.max(3, Math.min(12, Math.floor(Math.max(1, width) / 80)));
    const times = computeTimes(frameCount);

    const canvas = document.createElement("canvas");
    // size of each thumbnail — tune these values as desired
    const thumbW = 160;
    const thumbH = 90;
    canvas.width = thumbW;
    canvas.height = thumbH;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setLoadingThumbs(false);
      return;
    }

    // Helper: seek to time and capture a frame (with timeout fallback)
    const captureAt = (t: number) =>
      new Promise<string>((resolve) => {
        let resolved = false;

        const onSeeked = () => {
          try {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const data = canvas.toDataURL("image/jpeg");
            if (!resolved) {
              resolved = true;
              resolve(data);
            }
          } catch (e) {
            // drawing may fail (CORS), resolve empty string
            if (!resolved) {
              resolved = true;
              resolve("");
            }
          }
        };

        const onError = () => {
          if (!resolved) {
            resolved = true;
            resolve("");
          }
        };

        // Fallback timeout in case seek doesn't fire (some browsers / remote sources)
        const fallback = window.setTimeout(() => {
          if (!resolved) {
            resolved = true;
            resolve("");
          }
        }, 1500);

        video.addEventListener("seeked", onSeeked, { once: true });
        video.addEventListener("error", onError, { once: true });

        try {
          video.currentTime = Math.max(0, Math.min(t, (video.duration || t)));
        } catch {
          // setting currentTime may throw, resolve quickly
          window.clearTimeout(fallback);
          resolve("");
        }

        // when resolved we still need to clear timeout
        const cleanupResolver = (val: string) => {
          window.clearTimeout(fallback);
          return val;
        };

        // Wrap to clear timeout after resolve
        (async () => {
          const res = await new Promise<string>((r) => {
            // We'll rely on onSeeked/onError/fallback to call r
            // Nothing else here
            // Note: the above onSeeked and fallback will call resolve; we can't intercept here easily
          });
          // noop, this structure preserved for clarity
        })();

        // Because we can't intercept promise from events directly into this function's return easily,
        // we instead rely on event handler calling resolve (above). The timeout ensures it won't hang.
      });

    // Because the above captureAt() has a complex structure, we'll implement simpler loop:
    const loadFrames = async () => {
      const results: string[] = [];

      // Make sure metadata is loaded
      if (isFinite(video.duration) && video.duration > 0) {
        // already loaded metadata
      } else {
        await new Promise<void>((res) => {
          const onloaded = () => {
            res();
          };
          video.addEventListener("loadedmetadata", onloaded, { once: true });
          // fallback in case loadedmetadata never fires
          setTimeout(() => res(), 1000);
        });
      }

      for (const t of times) {
        if (cancelled) break;

        // Bound time by video's duration if available
        const bounded = typeof video.duration === "number" && isFinite(video.duration)
          ? Math.min(Math.max(0, t), Math.max(0, video.duration - 0.01))
          : t;

        // try to seek and capture
        const frame = await new Promise<string>((resolve) => {
          let done = false;
          const onSeeked = () => {
            try {
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
              const data = canvas.toDataURL("image/jpeg");
              if (!done) {
                done = true;
                resolve(data);
              }
            } catch {
              if (!done) {
                done = true;
                resolve("");
              }
            } finally {
              cleanup();
            }
          };

          const onError = () => {
            if (!done) {
              done = true;
              resolve("");
            }
            cleanup();
          };

          const fallbackTimeout = window.setTimeout(() => {
            if (!done) {
              done = true;
              resolve("");
            }
            cleanup();
          }, 1200);

          const cleanup = () => {
            window.clearTimeout(fallbackTimeout);
            video.removeEventListener("seeked", onSeeked);
            video.removeEventListener("error", onError);
          };

          video.addEventListener("seeked", onSeeked);
          video.addEventListener("error", onError);

          try {
            video.currentTime = bounded;
          } catch {
            // if setting currentTime throws, resolve empty
            cleanup();
            if (!done) {
              done = true;
              resolve("");
            }
          }
        });

        results.push(frame);
      }

      if (!cancelled) {
        setThumbs(results);
      }
      setLoadingThumbs(false);
    };

    // start loading
    loadFrames().catch(() => {
      if (!cancelled) {
        setThumbs([]);
        setLoadingThumbs(false);
      }
    });

    return () => {
      cancelled = true;
      // try to stop video and release resources
      try {
        video.pause();
        // no object URL to revoke here (we used item.src directly)
      } catch {}
    };
  }, [item.src, duration, item.trim?.start, item.trim?.end, width]);

  // Mouse interactions (drag / resize)
  const handleMouseMove = (e: MouseEvent) => {
    if (!isVideo(item)) return;
    const deltaPx = e.movementX;
    const deltaSec = deltaPx / pixelsPerSecond;

    if (isLeftResize && item.trim) {
      const newStart = snap(Math.max(0, item.trim.start + deltaSec));
      const shift = newStart - item.trim.start;
      updateTrackItem(item.id, {
        trim: { ...item.trim, start: newStart },
        timelineStart: (item.timelineStart ?? 0) + shift,
      });
    }

    if (isRightResize && item.trim) {
      const newEnd = snap(Math.max(item.trim.start + 0.1, item.trim.end + deltaSec));
      updateTrackItem(item.id, { trim: { ...item.trim, end: newEnd } });
    }

    if (isDragging) {
      const newPos = snap(Math.max(0, (item.timelineStart ?? 0) + deltaSec));
      updateTrackItem(item.id, { timelineStart: newPos });
    }
  };

  const stopActions = () => {
    setIsDragging(false);
    setIsLeftResize(false);
    setIsRightResize(false);
  };

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", stopActions);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", stopActions);
    };
  });

  return (
    <div
      ref={blockRef}
      className="absolute bg-gray-800 border border-yellow-400 rounded-sm overflow-hidden select-none"
      style={{
        left,
        width,
        height: 100,
        cursor: isDragging ? "grabbing" : "grab",
      }}
      onMouseDown={(e) => {
        if ((e.target as HTMLElement).dataset.handle) return;
        setIsDragging(true);
      }}
    >
      <div className="flex h-full w-full">
        {thumbs.length > 0 ? (
          thumbs.map((src, i) => (
            <img
              key={i}
              src={src}
              className="object-cover border-r border-gray-700"
              style={{ width: `${100 / thumbs.length}%`, height: "100%" }}
              alt={`thumb-${i}`}
            />
          ))
        ) : loadingThumbs ? (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-[12px]">
            Loading...
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-[12px]">
            No preview
          </div>
        )}
      </div>

      {/* Left handle */}
      <div
        data-handle="left"
        onMouseDown={(e) => {
          e.stopPropagation();
          setIsLeftResize(true);
        }}
        className="absolute left-0 top-0 h-full bg-blue-700 opacity-70"
        style={{ width: HANDLE_WIDTH, cursor: "ew-resize" }}
      />

      {/* Right handle */}
      <div
        data-handle="right"
        onMouseDown={(e) => {
          e.stopPropagation();
          setIsRightResize(true);
        }}
        className="absolute right-0 top-0 h-full bg-blue-700 opacity-70"
        style={{ width: HANDLE_WIDTH, cursor: "ew-resize" }}
      />

      {/* Duration label */}
      <div className="absolute bottom-0 right-0 px-1 text-white text-xs bg-black/40">
        {Math.round(duration * 100) / 100}s
      </div>
    </div>
  );
};

export default TimelineBlock;
