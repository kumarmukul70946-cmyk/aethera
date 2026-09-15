import React, { forwardRef } from "react";
import { OrbitControls } from "@react-three/drei";

/**
 * Controls — Reusable camera navigation wrapper using Drei OrbitControls.
 *
 * Concepts illustrated:
 * - OrbitControls: Mathematically rotates the camera spherically around a central 3D target point.
 * - Damping: Inertia/friction effect smoothing camera drag stops.
 * - Polar Angle Constraints: Restricts vertical rotation so users cannot look from beneath the floor.
 * - Distance Constraints: Keeps the object within a visible, optimal product-photography viewing frustum.
 */
export const Controls = forwardRef(function Controls(
  {
    autoRotate = false,
    autoRotateSpeed = 1.0,
    enableZoom = true,
    enablePan = true,
    minDistance = 2.5,
    maxDistance = 12.0,
    minPolarAngle = Math.PI / 6, // ~30 deg from vertical top
    maxPolarAngle = Math.PI / 2 - 0.02, // Just above the floor plane
    target = [0, 0.8, 0],
    ...rest
  },
  ref
) {
  return (
    <OrbitControls
      ref={ref}
      makeDefault
      enableDamping
      dampingFactor={0.05}
      autoRotate={autoRotate}
      autoRotateSpeed={autoRotateSpeed}
      enableZoom={enableZoom}
      enablePan={enablePan}
      minDistance={minDistance}
      maxDistance={maxDistance}
      minPolarAngle={minPolarAngle}
      maxPolarAngle={maxPolarAngle}
      target={target}
      {...rest}
    />
  );
});

export default Controls;
