import React, { forwardRef } from "react";
import { OrbitControls } from "@react-three/drei";

/**
 * ProductControls — Specialized OrbitControls for product examination.
 * Configured with damping, zoom clamping, and vertical angle boundaries.
 */
export const ProductControls = forwardRef(function ProductControls(
  {
    autoRotate = false,
    autoRotateSpeed = 1.0,
    minDistance = 1.8,
    maxDistance = 7.5,
    minPolarAngle = Math.PI / 8, // ~22° from straight above
    maxPolarAngle = Math.PI / 2 + 0.05, // Just below horizon line
    target = [0, 0, 0],
    ...props
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
      minDistance={minDistance}
      maxDistance={maxDistance}
      minPolarAngle={minPolarAngle}
      maxPolarAngle={maxPolarAngle}
      target={target}
      {...props}
    />
  );
});

export default ProductControls;
