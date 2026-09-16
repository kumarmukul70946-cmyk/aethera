import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";

/**
 * RotatingCube — Core 3D demonstration mesh.
 * Combines BoxGeometry + MeshStandardMaterial into a single Mesh.
 *
 * Concepts illustrated:
 * - Mesh: Container binding 3D geometric shape with physical surface material.
 * - BoxGeometry: Primitives defined by width, height, depth dimensions.
 * - MeshStandardMaterial: Physically Based Rendering (PBR) material supporting roughness, metalness, and lighting.
 * - useFrame: Direct hook into the Three.js RAF render loop for high-performance 60fps animations.
 */
export default function RotatingCube({
  position = [0, 1.1, 0],
  size = [1.8, 1.8, 1.8],
  color = "#6366f1",
  roughness = 0.25,
  metalness = 0.75,
  wireframe = false,
  isRotating = true,
  rotationSpeed = 0.8
}) {
  // Direct reference to the Three.js THREE.Mesh instance
  const meshRef = useRef();
  const currentSpeedRef = useRef(isRotating ? rotationSpeed : 0);

  /**
   * useFrame executes on every tick of the Three.js rendering engine (~60 times/sec).
   * Notice:
   * 1. We mutate meshRef.current.rotation directly rather than triggering React state updates.
   * 2. We smoothly lerp rotation speed to provide product rotation easing.
   * 3. We multiply by 'delta' (seconds elapsed since last frame) to make the animation frame-rate independent.
   */
  useFrame((state, delta) => {
    if (!meshRef.current) return;

    // Smooth lerp easing towards target rotation speed
    const targetSpeed = isRotating ? rotationSpeed : 0;
    currentSpeedRef.current += (targetSpeed - currentSpeedRef.current) * Math.min(1, delta * 4.5);

    if (Math.abs(currentSpeedRef.current) > 0.0001) {
      // Continuous rotation along Y (vertical axis) and gentle tilt on X (horizontal axis)
      meshRef.current.rotation.y += delta * currentSpeedRef.current;
      meshRef.current.rotation.x += delta * (currentSpeedRef.current * 0.35);
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      castShadow
      receiveShadow
      aria-label="Interactive 3D Demo Cube"
    >
      {/* Geometry: Defines the shape and vertices in 3D coordinate space */}
      <boxGeometry args={Array.isArray(size) ? size : [size, size, size]} />

      {/* Material: Defines surface appearance, color scattering (roughness), and reflection (metalness) */}
      <meshStandardMaterial
        color={color}
        roughness={roughness}
        metalness={metalness}
        wireframe={wireframe}
      />
    </mesh>
  );
}
