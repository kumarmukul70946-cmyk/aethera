import React from "react";

/**
 * ProductLighting — Studio-grade commercial product illumination.
 * Designed to showcase material roughness, metallic sheens, and clean contact shadows.
 */
export default function ProductLighting() {
  return (
    <group name="ProductStudioLighting">
      {/* 1. Ambient Baseline: Soft white bounce light preventing pitch-black shadows */}
      <ambientLight color="#ffffff" intensity={0.75} />

      {/* 2. Key Light: High-intensity directional source casting crisp shadows */}
      <directionalLight
        position={[5, 7, 5]}
        color="#ffffff"
        intensity={2.0}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={0.5}
        shadow-camera-far={25}
        shadow-camera-left={-3.5}
        shadow-camera-right={3.5}
        shadow-camera-top={3.5}
        shadow-camera-bottom={-3.5}
        shadow-bias={-0.0004}
      />

      {/* 3. Fill Light: Softer opposing light to balance high-contrast shadows */}
      <directionalLight
        position={[-5, 4, -3]}
        color="#e0e7ff"
        intensity={0.85}
      />

      {/* 4. Top/Rim Light: Backlight defining silhouette contours */}
      <pointLight
        position={[0, 5, -5]}
        color="#818cf8"
        intensity={1.0}
        distance={12}
      />
    </group>
  );
}
