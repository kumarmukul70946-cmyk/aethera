import React from "react";

/**
 * Platform — Studio pedestal and ground plane.
 *
 * Concepts illustrated:
 * - receiveShadow: Crucial setting allowing the surface to display contact shadows cast by other meshes.
 * - Circular Pedestal: Clean, modern display stage simulating a luxury product podium.
 * - Neutral PBR Material: Matte finish that doesn't distract from the primary subject while capturing soft directional shadows.
 */
export default function Platform({
  radius = 3.2,
  height = 0.25,
  position = [0, -0.125, 0],
  color = "#1e293b",
  roughness = 0.5,
  metalness = 0.2
}) {
  return (
    <group position={position} name="StudioPlatform">
      {/* 1. Main Cylindrical Showcase Pedestal */}
      <mesh receiveShadow position={[0, 0, 0]}>
        <cylinderGeometry args={[radius, radius + 0.2, height, 48]} />
        <meshStandardMaterial
          color={color}
          roughness={roughness}
          metalness={metalness}
        />
      </mesh>

      {/* 2. Accent Ring / Bevel Trim around the pedestal rim */}
      <mesh position={[0, height / 2 + 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[radius - 0.08, radius, 48]} />
        <meshBasicMaterial color="#6366f1" transparent opacity={0.35} />
      </mesh>

      {/* 3. Infinite Ground Plane for Ambient Drop Shadows */}
      <mesh
        receiveShadow
        position={[0, -height / 2 - 0.01, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[60, 60]} />
        <shadowMaterial opacity={0.25} />
      </mesh>
    </group>
  );
}
