import { useEffect, useState, useRef } from "react";

/**
 * useParallax Hook
 * Calculates subtle vertical translation (10-25px) as target element scrolls through viewport.
 * Uses requestAnimationFrame, respects prefers-reduced-motion, and disables on mobile if desired.
 */
export function useParallax(distance = 18) {
  const ref = useRef(null);
  const [offsetY, setOffsetY] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (ref.current) {
            const rect = ref.current.getBoundingClientRect();
            const windowHeight = window.innerHeight;

            // Element progress through viewport (-1 when at top, 1 when at bottom)
            if (rect.top < windowHeight && rect.bottom > 0) {
              const progress = (rect.top + rect.height / 2 - windowHeight / 2) / (windowHeight / 2);
              // Clamp progress between -1 and 1
              const clampedProgress = Math.max(-1, Math.min(1, progress));
              // Offset range [-distance, distance]
              const calculatedOffset = clampedProgress * (distance * 0.7);
              setOffsetY(calculatedOffset);
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [distance]);

  return { ref, offsetY };
}

export default useParallax;
