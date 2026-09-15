import React, { useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, Html, Float } from "@react-three/drei";
import * as THREE from "three";
import CanvasErrorBoundary from "../../three/utils/CanvasErrorBoundary.jsx";

/**
 * Pre-allocated math instances outside useFrame to prevent per-frame garbage collection.
 */
const _targetRotation = new THREE.Vector2();

/**
 * HeroProductModel
 * Renders the single optimized hero product model (Aether Sonar Headphones, 74 KB).
 * Implements bounding box centering, subtle floating oscillation, continuous rotation,
 * and smooth pointer tracking without triggering React re-renders.
 */
function HeroProductModel({
  modelUrl = "/models/products/aether-sonar-headphones.glb",
  reducedMotion = false
}) {
  const groupRef = useRef(null);
  const { scene } = useGLTF(modelUrl);

  // Clone scene to prevent any shared cache mutations
  const clonedScene = useMemo(() => {
    const cloned = scene.clone(true);
    cloned.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.material) {
          child.material.roughness = Math.max(0.2, child.material.roughness || 0.3);
        }
      }
    });

    // Compute bounding box and normalize scale & center
    const box = new THREE.Box3().setFromObject(cloned);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const targetSize = 2.4;
    const scale = maxDim > 0 ? targetSize / maxDim : 1.0;

    cloned.scale.setScalar(scale);
    cloned.position.set(-center.x * scale, -center.y * scale, -center.z * scale);

    return cloned;
  }, [scene]);

  // High-frequency per-frame animation via refs. NO React setState inside useFrame!
  useFrame((state, delta) => {
    if (!groupRef.current) return;

    if (reducedMotion) {
      // Keep model still or extremely slow when reduced motion is preferred
      groupRef.current.rotation.y = 0.2;
      groupRef.current.position.y = 0;
      return;
    }

    // 1. Slow, elegant turntable rotation
    groupRef.current.rotation.y += delta * 0.25;

    // 2. Damped pointer response (smooth tilt following pointer movement)
    // state.pointer has normalized coordinates [-1, 1]
    _targetRotation.set(state.pointer.x * 0.2, -state.pointer.y * 0.15);

    groupRef.current.rotation.z = THREE.MathUtils.lerp(
      groupRef.current.rotation.z,
      -_targetRotation.x * 0.5,
      0.05
    );
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      _targetRotation.y,
      0.05
    );

    // 3. Gentle vertical floating oscillation
    groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.4) * 0.07;
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      <primitive object={clonedScene} />
    </group>
  );
}

// Preload the hero model asset
useGLTF.preload("/models/products/aether-sonar-headphones.glb");

/**
 * In-canvas loader displayed during initial GLB download and parsing.
 */
function SceneLoader() {
  return (
    <Html center zIndexRange={[10, 0]}>
      <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 shadow-xl backdrop-blur-md min-w-[160px]">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-400 p-0.5 animate-spin mb-2">
          <div className="w-full h-full bg-slate-950 rounded-[10px]" />
        </div>
        <span className="text-[11px] font-semibold text-slate-300">
          Loading 3D Twin...
        </span>
      </div>
    </Html>
  );
}

/**
 * StudioLighting
 * Calibrated 3-point studio lighting with high aesthetic fidelity and low GPU overhead.
 */
function StudioLighting() {
  return (
    <>
      <ambientLight intensity={0.8} />
      {/* Key directional light */}
      <directionalLight
        position={[4, 5, 4]}
        intensity={1.5}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-near={0.5}
        shadow-camera-far={12}
        shadow-camera-left={-3}
        shadow-camera-right={3}
        shadow-camera-top={3}
        shadow-camera-bottom={-3}
        shadow-bias={-0.0001}
      />
      {/* Soft cyan fill light */}
      <directionalLight position={[-4, 2, -2]} intensity={0.7} color="#38bdf8" />
      {/* Subtle violet rim light */}
      <pointLight position={[0, -2, -3]} intensity={1.2} color="#818cf8" />
    </>
  );
}

/**
 * Pedestal / Ground Glow
 * Subtle circular studio platform to ground the floating product.
 */
function StudioPlatform() {
  return (
    <group position={[0, -1.35, 0]}>
      {/* Soft circular platform disc */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[1.8, 48]} />
        <meshStandardMaterial
          color="#0b0f19"
          roughness={0.7}
          metalness={0.2}
          transparent
          opacity={0.85}
        />
      </mesh>
      {/* Glowing accent rim */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.78, 1.84, 48]} />
        <meshBasicMaterial color="#6366f1" transparent opacity={0.35} />
      </mesh>
    </group>
  );
}

/**
 * Hero3DScene
 * Self-contained R3F 3D viewport tailored for the homepage Hero section.
 * @param {Object} props
 * @param {boolean} [props.reducedMotion=false] - When true, halts rotation and pointer tilts.
 */
export default function Hero3DScene({ reducedMotion = false }) {
  return (
    <div className="relative w-full h-[380px] sm:h-[460px] lg:h-[520px] max-w-[560px] mx-auto select-none">
      {/* Ambient background glow behind canvas */}
      <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600/15 via-purple-600/10 to-cyan-500/15 blur-3xl rounded-full pointer-events-none transform -translate-y-2 scale-90" />

      <CanvasErrorBoundary>
        <Canvas
          shadows
          dpr={[1, 1.5]} // Capped DPR for smooth performance on high-DPI screens
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: "high-performance"
          }}
          camera={{ position: [0, 0.2, 4.4], fov: 42 }}
          className="w-full h-full rounded-3xl"
        >
          <StudioLighting />
          <StudioPlatform />
          <Suspense fallback={<SceneLoader />}>
            <HeroProductModel reducedMotion={reducedMotion} />
          </Suspense>
        </Canvas>
      </CanvasErrorBoundary>

      {/* Floating 3D Badge Indicator */}
      <div className="absolute bottom-4 right-4 z-10 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-[11px] font-semibold text-slate-300 backdrop-blur-md flex items-center gap-1.5 shadow-lg pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>Live 3D Viewport</span>
      </div>
    </div>
  );
}
