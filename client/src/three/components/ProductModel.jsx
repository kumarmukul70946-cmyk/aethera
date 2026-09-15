import React, { useMemo, useEffect, useRef } from "react";
import * as THREE from "three";
import { useGLTF } from "@react-three/drei";
import {
  inspectSceneGraph,
  captureOriginalMaterials
} from "../customization/customizationUtils.js";
import {
  applyCustomization,
  resetToOriginalMaterials
} from "../customization/customizationEngine.js";

/**
 * ProductModel — Reusable GLTF/GLB product renderer with runtime customization.
 *
 * Concepts illustrated:
 * - useGLTF: Drei's asset caching loader that streams GLB models asynchronously.
 * - Scene Cloning: Clones the cached scene tree to avoid cross-component mutation bugs.
 * - Bounding Box Normalization: Computes Box3 dimensions to center and auto-scale products of any real-world size.
 * - Customization Engine Hook: Applies live material and color changes without asset reloads.
 */
export default function ProductModel({
  modelUrl,
  targetSize = 2.4,
  onLoaded = null,
  customizationState = null,
  customizationConfig = null
}) {
  // 1. Load model via Drei's cached GLTF loader
  const { scene } = useGLTF(modelUrl);
  const originalMaterialsRef = useRef(null);

  // 2. Clone scene graph deeply so this instance doesn't mutate other viewers or cache
  const clonedScene = useMemo(() => {
    const cloned = scene.clone(true);
    // Dev inspection
    inspectSceneGraph(cloned);
    // Capture snapshot of original materials for clean reset
    originalMaterialsRef.current = captureOriginalMaterials(cloned, customizationConfig);
    return cloned;
  }, [scene, customizationConfig]);

  // 3. Measure bounding box, center offset, and normalization scale factor
  const { normalizedScale, centerOffset, dimensions } = useMemo(() => {
    // Traverse meshes to enable shadow casting and shadow reception
    clonedScene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        // Ensure materials have correct depth write
        if (child.material) {
          child.material.depthWrite = true;
        }
      }
    });

    // Compute bounding volume
    const box = new THREE.Box3().setFromObject(clonedScene);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    const maxDimension = Math.max(size.x, size.y, size.z);
    const scale = maxDimension > 0 ? targetSize / maxDimension : 1.0;

    return {
      normalizedScale: scale,
      centerOffset: [
        -center.x * scale,
        -center.y * scale,
        -center.z * scale
      ],
      dimensions: {
        width: size.x,
        height: size.y,
        depth: size.z,
        maxDimension
      }
    };
  }, [clonedScene, targetSize]);

  // 4. Apply live customization choices to the cloned scene graph
  useEffect(() => {
    if (!clonedScene) return;

    if (customizationState && customizationConfig) {
      applyCustomization(clonedScene, customizationState, customizationConfig);
    } else if (originalMaterialsRef.current) {
      resetToOriginalMaterials(clonedScene, originalMaterialsRef.current);
    }
  }, [clonedScene, customizationState, customizationConfig]);

  useEffect(() => {
    if (onLoaded && dimensions) {
      onLoaded({ dimensions, scale: normalizedScale });
    }
  }, [dimensions, normalizedScale, onLoaded]);

  return (
    <group name="ProductModelWrapper">
      {/* Position offset centers the model perfectly at (0, 0, 0) */}
      <group position={centerOffset} scale={normalizedScale}>
        <primitive object={clonedScene} />
      </group>
    </group>
  );
}

// Preload helper to prime cache for snappy transitions
ProductModel.preload = (url) => {
  if (url) useGLTF.preload(url);
};
