import { useEffect, useEffectEvent, useState } from "react";

// Returns a callback ref for a sentinel element; `loadMore` fires whenever the
// sentinel is in view. Re-observing on every `enabled` change re-checks
// visibility, so tall viewports keep loading until the list overflows.
export function useInfiniteScroll(loadMore: () => void, enabled: boolean) {
  const [sentinel, setSentinel] = useState<HTMLElement | null>(null);
  const onIntersect = useEffectEvent(loadMore);

  useEffect(() => {
    if (!sentinel || !enabled) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) onIntersect();
      },
      { rootMargin: "200px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [sentinel, enabled]);

  return setSentinel;
}
