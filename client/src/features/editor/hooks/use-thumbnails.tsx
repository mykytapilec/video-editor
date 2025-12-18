// client/src/features/editor/hooks/use-thumbnails.tsx
import { useEffect, useState } from "react";
import { captureFrame } from "../utils/thumbnail-extractor";

interface UseThumbOpts {
  width?: number;
  height?: number;
  crossOrigin?: string;
}

export default function useThumbnails(
  itemId: string | undefined,
  src: string | null,
  times: number[],
  opts: UseThumbOpts = {}
) {
  const [thumbs, setThumbs] = useState<(string | null)[]>([]);
  const [loading, setLoading] = useState(false);

  const { width = 120, height = 120, crossOrigin } = opts;

  useEffect(() => {
    if (!times || times.length === 0) {
      setThumbs([]);
      setLoading(false);
      return;
    }

    if (!src) {
      setThumbs(times.map(() => null));
      setLoading(false);
      return;
    }

    let cancelled = false;
    const out: (string | null)[] = Array(times.length).fill(null);

    const run = async () => {
      setLoading(true);

      for (let i = 0; i < times.length; i++) {
        try {
          const data = await captureFrame(src, times[i], {
            width,
            height,
            crossOrigin,
          });
          out[i] = data || null;
        } catch {
          out[i] = null;
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
  }, [itemId, src, width, height, crossOrigin, JSON.stringify(times)]);

  return { thumbs, loading };
}
