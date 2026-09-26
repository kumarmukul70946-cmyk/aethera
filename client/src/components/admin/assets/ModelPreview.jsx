import React, { Suspense, useRef, useState, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Center } from "@react-three/drei";
import * as THREE from "three";

/**
 * Internal 3D Model Renderer using Three.js / Drei useGLTF.
 */
function ModelInner({ url }) {
  const { scene } = useGLTF(url);

  // Deep clone scene graph to prevent mutation across instances
  const clonedScene = useMemo(() => {
    const cloned = scene.clone(true);
    cloned.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.material) {
          child.material.depthWrite = true;
        }
      }
    });
    return cloned;
  }, [scene]);

  return (
    <Center>
      <primitive object={clonedScene} />
    </Center>
  );
}

/**
 * Loading fallback inside Three.js canvas.
 */
function CanvasLoader() {
  return null;
}

/**
 * ModelPreview Component: Interactive Three.js canvas for previewing GLB 3D models.
 * Includes OrbitControls, studio lighting, camera reset, and wireframe/rotation toggles.
 */
export default function ModelPreview({ url, className = "h-80" }) {
  const controlsRef = useRef(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleResetCamera = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  if (!url) {
    return (
      <div className={`flex items-center justify-center bg-neutral-900/80 rounded-2xl border border-white/5 text-neutral-500 text-xs ${className}`}>
        No model URL provided
      </div>
    );
  }

  if (hasError) {
    return (
      <div className={`flex flex-col items-center justify-center bg-neutral-900/80 rounded-2xl border border-rose-500/20 p-6 text-center ${className}`}>
        <span className="text-2xl mb-2">⚠️</span>
        <p className="text-sm font-semibold text-rose-400">Failed to render 3D model</p>
        <p className="text-xs text-neutral-400 mt-1 max-w-xs">
          The file may be corrupted or using an incompatible glTF extension.
        </p>
      </div>
    );
  }

  return (
    <div className={`relative rounded-2xl bg-neutral-950 border border-white/10 overflow-hidden shadow-2xl group ${className}`}>
      {/* 3D Canvas */}
      <Canvas
        shadows
        camera={{ position: [0, 1.5, 3.5], fov: 45 }}
        onError={() => setHasError(true)}
      >
        <ambientLight intensity={0.8} />
        <directionalLight
          position={[5, 8, 5]}
          intensity={1.2}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <directionalLight position={[-5, -2, -5]} intensity={0.4} />

        <Suspense fallback={<CanvasLoader />}>
          <ModelInner url={url} />
        </Suspense>

        <OrbitControls
          ref={controlsRef}
          autoRotate={autoRotate}
          autoRotateSpeed={2}
          enablePan={true}
          enableZoom={true}
          minDistance={1}
          maxDistance={10}
        />
      </Canvas>

      {/* Control Overlay Bar */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-neutral-900/80 backdrop-blur-md border border-white/10 pointer-events-auto shadow-lg">
          <button
            type="button"
            onClick={() => setAutoRotate(!autoRotate)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
              autoRotate
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-neutral-400 hover:text-white"
            }`}
            title="Toggle Auto-Rotation"
          >
            {autoRotate ? "Pause Spin" : "Auto Spin"}
          </button>

          <button
            type="button"
            onClick={handleResetCamera}
            className="px-2.5 py-1 rounded-lg text-xs font-medium text-neutral-300 hover:text-white hover:bg-neutral-800 transition"
            title="Reset Camera Angle"
          >
            Reset View
          </button>
        </div>

        <span className="text-[10px] font-mono text-neutral-400 bg-neutral-900/80 backdrop-blur-md px-2 py-1 rounded-md border border-white/10 pointer-events-auto">
          Drag to Orbit • Scroll to Zoom
        </span>
      </div>
    </div>
  );
}
