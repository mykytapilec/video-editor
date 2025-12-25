import { useEffect, useState, useRef } from "react";
import { captureFrame } from "../utils/thumbnail-extractor";

interface UseThumbOpts {
  width?: number;
  height?: number;
  crossOrigin?: string;
  maxThumbs?: number;
}

const thumbsCache = new Map<string, string>();

export default function useThumbnails(
  itemId: string | undefined,
  src: string | null,
  times: number[],
  opts: UseThumbOpts = {}
) {
  const [thumbs, setThumbs] = useState<(string | null)[]>([]);
  const [loading, setLoading] = useState(false);
  const { width = 120, height = 60, crossOrigin, maxThumbs = 8 } = opts;

  const timesRef = useRef<number[]>([]);
  timesRef.current = times;

  useEffect(() => {
    if (!src || !times || times.length === 0 || !itemId) {
      setThumbs(times.map(() => null));
      setLoading(false);
      return;
    }

    let cancelled = false;
    const out: (string | null)[] = Array(times.length).fill(null);

    const run = async () => {
      setLoading(true);

      const step = Math.max(1, Math.floor(times.length / maxThumbs));

      for (let i = 0; i < times.length; i += step) {
        const t = times[i];
        const cacheKey = `${itemId}_${t}`;

        if (thumbsCache.has(cacheKey)) {
          out[i] = thumbsCache.get(cacheKey)!;
        } else {
          try {
            const data = await captureFrame(src, t, {
              width,
              height,
              crossOrigin,
            });
            if (data) {
              thumbsCache.set(cacheKey, data);
              out[i] = data;
            } else {
              out[i] = null;
            }
          } catch {
            out[i] = null;
          }
        }

        if (cancelled) return;
      }

      if (!cancelled) {
        setThumbs(out);
        setLoading(false);
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [itemId, src, width, height, crossOrigin, maxThumbs, JSON.stringify(times)]);

  return { thumbs, loading };
}
