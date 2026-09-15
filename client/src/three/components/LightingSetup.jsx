import React from "react";

/**
 * LightingSetup — Studio-grade 3-point lighting environment.
 *
 * Concepts illustrated:
 * - Ambient/Hemisphere Light: Baseline illumination scattered equally from sky and ground; prevents pitch-black shadows.
 * - Key Light (Directional): Primary directional source mimicking the sun or studio softbox; casts realistic dynamic shadows.
 * - Fill Light: Counter-directional softer illumination to lift shadows and reveal surface details.
 * - Rim/Back Light: Placed behind the subject to create subtle silhouette separation from dark backgrounds.
 */
export default function LightingSetup({ preset = "studio" }) {
  // Preset color profiles
  const profiles = {
    studio: {
      ambient: "#ffffff",
      ambientIntensity: 0.7,
      key: "#ffffff",
      keyIntensity: 1.8,
      fill: "#e2e8f0",
      fillIntensity: 0.6,
      rim: "#818cf8",
      rimIntensity: 0.8
    },
    cyberpunk: {
      ambient: "#4c1d95",
      ambientIntensity: 0.8,
      key: "#06b6d4", // Vibrant cyan
      keyIntensity: 2.2,
      fill: "#ec4899", // Neon magenta
      fillIntensity: 1.5,
      rim: "#8b5cf6", // Electric purple
      rimIntensity: 1.8
    },
    sunset: {
      ambient: "#7c2d12",
      ambientIntensity: 0.6,
      key: "#f59e0b", // Warm amber gold
      keyIntensity: 2.4,
      fill: "#ea580c", // Burnt orange
      fillIntensity: 1.0,
      rim: "#fed7aa", // Gentle peach
      rimIntensity: 1.2
    }
  };

  const current = profiles[preset] || profiles.studio;

  return (
    <group name="LightingSetup">
      {/* 1. Ambient Baseline: Soft global bounce light without specific origin */}
      <ambientLight color={current.ambient} intensity={current.ambientIntensity} />

      {/* 2. Key Light: Main directional source with shadow-mapping enabled */}
      <directionalLight
        position={[6, 8, 5]}
        color={current.key}
        intensity={current.keyIntensity}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={0.5}
        shadow-camera-far={25}
        shadow-camera-left={-4}
        shadow-camera-right={4}
        shadow-camera-top={4}
        shadow-camera-bottom={-4}
        shadow-bias={-0.0005}
      />

      {/* 3. Fill Light: Softer opposing directional light to balance contrast */}
      <directionalLight
        position={[-6, 4, -2]}
        color={current.fill}
        intensity={current.fillIntensity}
      />

      {/* 4. Rim / Accent Point Light: Rear accent highlighting mesh silhouettes */}
      <pointLight
        position={[0, 4, -6]}
        color={current.rim}
        intensity={current.rimIntensity}
        distance={15}
      />
    </group>
  );
}
