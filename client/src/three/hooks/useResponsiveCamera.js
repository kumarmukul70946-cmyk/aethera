import { useState, useEffect } from "react";

/**
 * useResponsiveCamera — Dynamic camera framing hook.
 * Computes optimal camera distance and FOV based on viewport aspect ratio.
 * Ensures 3D objects remain centered and unclipped on narrow mobile viewports.
 */
export function useResponsiveCamera(baseDistance = 4.5, minMobileDistance = 6.2) {
  const [cameraConfig, setCameraConfig] = useState(() => getCameraSettings());

  function getCameraSettings() {
    if (typeof window === "undefined") {
      return { distance: baseDistance, fov: 45, isMobile: false };
    }

    const width = window.innerWidth;
    const isMobile = width < 768;
    const isTablet = width >= 768 && width < 1024;

    if (isMobile) {
      return {
        distance: minMobileDistance,
        fov: 52, // Slightly wider FOV on mobile to prevent clipping
        isMobile: true
      };
    }

    if (isTablet) {
      return {
        distance: baseDistance * 1.15,
        fov: 48,
        isMobile: false
      };
    }

    return {
      distance: baseDistance,
      fov: 45,
      isMobile: false
    };
  }

  useEffect(() => {
    const handleResize = () => {
      setCameraConfig(getCameraSettings());
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [baseDistance, minMobileDistance]);

  return cameraConfig;
}

export default useResponsiveCamera;
