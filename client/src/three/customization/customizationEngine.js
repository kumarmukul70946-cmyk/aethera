import * as THREE from "three";
import { isolateMeshMaterial } from "./customizationUtils.js";

/**
 * Customization Engine — Deterministic runtime material modifier.
 *
 * Concepts illustrated:
 * - Runtime Material Mutation: Mutates Three.js PBR material color & roughness without touching geometry.
 * - Configuration-Driven: Maps area definitions to mesh names dynamically.
 * - Zero Asset Reloading: Operates directly on the in-memory scene graph for instant live previews.
 * - Material Isolation: Clones shared materials before editing so unrelated meshes are never contaminated.
 */

/**
 * Applies active customization choices to the 3D scene.
 *
 * @param {THREE.Object3D} scene - Three.js scene graph
 * @param {Object} customizationState - Mapping of areaId -> choice { color, roughness, metalness }
 * @param {Object} configuration - product.customization definition
 */
export function applyCustomization(scene, customizationState, configuration) {
  if (!scene || !customizationState || !configuration?.areas) return;

  // 1. Build a lookup mapping: meshName -> choice
  const meshTargetMap = new Map();

  configuration.areas.forEach((area) => {
    const choice = customizationState[area.id];
    if (choice && Array.isArray(area.meshNames)) {
      area.meshNames.forEach((meshName) => {
        meshTargetMap.set(meshName, choice);
      });
    }
  });

  if (meshTargetMap.size === 0) return;

  // 2. Traverse the scene graph and update targeted meshes
  scene.traverse((child) => {
    if (!child.isMesh || !child.material) return;

    const targetChoice = meshTargetMap.get(child.name);
    if (!targetChoice) return;

    // Isolate material so we don't accidentally mutate other parts
    isolateMeshMaterial(child);

    // Apply color change
    if (targetChoice.color && child.material.color) {
      child.material.color.set(targetChoice.color);
    }

    // Apply roughness if defined
    if (typeof targetChoice.roughness === "number" && typeof child.material.roughness === "number") {
      child.material.roughness = targetChoice.roughness;
    }

    // Apply metalness if defined
    if (typeof targetChoice.metalness === "number" && typeof child.material.metalness === "number") {
      child.material.metalness = targetChoice.metalness;
    }

    child.material.needsUpdate = true;
  });
}

/**
 * Resets customized meshes back to their captured original material properties.
 *
 * @param {THREE.Object3D} scene - Three.js scene graph
 * @param {Map<string, { color: string, roughness: number, metalness: number }>} originalSnapshot
 */
export function resetToOriginalMaterials(scene, originalSnapshot) {
  if (!scene || !originalSnapshot || originalSnapshot.size === 0) return;

  scene.traverse((child) => {
    if (!child.isMesh || !child.material) return;

    const original = originalSnapshot.get(child.name);
    if (!original) return;

    if (child.material.color) {
      child.material.color.set(original.color);
    }
    if (typeof child.material.roughness === "number") {
      child.material.roughness = original.roughness;
    }
    if (typeof child.material.metalness === "number") {
      child.material.metalness = original.metalness;
    }

    child.material.needsUpdate = true;
  });
}
