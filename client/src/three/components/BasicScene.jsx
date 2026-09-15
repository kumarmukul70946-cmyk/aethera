import React, { Suspense, forwardRef } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import LightingSetup from "./LightingSetup.jsx";
import Platform from "./Platform.jsx";
import RotatingCube from "./RotatingCube.jsx";
import ProductModel from "./ProductModel.jsx";
import Controls from "./Controls.jsx";
import CanvasErrorBoundary from "../utils/CanvasErrorBoundary.jsx";

/**
 * BasicScene — The root 3D Canvas environment for Aethera Commerce.
 */
export const BasicScene = forwardRef(function BasicScene(
  {
    // Cube material & geometry props
    cubeColor = "#171717",
    roughness = 0.25,
    metalness = 0.75,
    wireframe = false,
    isRotating = true,
    rotationSpeed = 0.8,
    // Scene lighting preset
    lightingPreset = "studio",
    // Platform props
    platformColor = "#EAE6E1",
    accentColor = "#D5CFCA",
    // Controls props
    autoOrbit = false,
    controlsRef = null,
    // Optional GLB model URL
    modelUrl = null
  },
  ref
) {
  return (
    <CanvasErrorBoundary>
      <div className="w-full h-full min-h-[420px] relative select-none">
        <Canvas
          shadows
          dpr={[1, 2]} // Optimizes performance across mobile and 4K displays
          camera={{
            fov: 45, // Field of view in degrees (human-eye product photography focal length)
            near: 0.1, // Clipping distance for nearest visible geometry
            far: 1000, // Clipping distance for furthest visible geometry
            position: [3.4, 2.6, 4.4] // Initial 3D camera coordinates (X, Y, Z)
          }}
          gl={{
            antialias: true, // Smooths jagged polygon edges
            powerPreference: "high-performance",
            alpha: true
          }}
          className="w-full h-full"
        >
          <Suspense fallback={null}>
            {/* 1. Studio Lighting System */}
            <LightingSetup preset={lightingPreset} />

            {/* 2. Self-contained Procedural Environment Reflections */}
            {/* Using internal light nodes allows PBR materials to reflect studio lights without external HDR downloads */}
            <Environment resolution={256}>
              <group rotation={[-Math.PI / 4, -0.6, 0]}>
                <Lightformer
                  form="rect"
                  intensity={2.5}
                  position={[0, 5, -8]}
                  scale={[10, 5, 1]}
                  target={[0, 0, 0]}
                />
                <Lightformer
                  form="circle"
                  intensity={2.0}
                  position={[10, 2, 0]}
                  scale={4}
                  target={[0, 0, 0]}
                />
                <Lightformer
                  form="ring"
                  color="#818cf8"
                  intensity={1.5}
                  position={[-8, 3, 2]}
                  scale={6}
                  target={[0, 0, 0]}
                />
              </group>
            </Environment>

            {/* 3. Pedestal Platform (Shadow Receiver) */}
            <Platform color={platformColor} accentColor={accentColor} />

            {/* 4. Interactive Demonstration Mesh or GLB Model */}
            {modelUrl ? (
              <ProductModel modelUrl={modelUrl} targetSize={2.5} />
            ) : (
              <RotatingCube
                ref={ref}
                color={cubeColor}
                roughness={roughness}
                metalness={metalness}
                wireframe={wireframe}
                isRotating={isRotating}
                rotationSpeed={rotationSpeed}
              />
            )}

            {/* 5. User Navigation Orbit Controls */}
            <Controls
              ref={controlsRef}
              autoRotate={autoOrbit}
              autoRotateSpeed={0.8}
            />
          </Suspense>
        </Canvas>
      </div>
    </CanvasErrorBoundary>
  );
});

export default BasicScene;
