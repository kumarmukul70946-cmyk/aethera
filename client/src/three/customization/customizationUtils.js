import * as THREE from "three";

/**
 * Inspects a Three.js scene graph and logs a clean ASCII hierarchy.
 * Development-only utility to help identify meshNames for product configuration.
 *
 * @param {THREE.Object3D} root
 */
export function inspectSceneGraph(root) {
  if (!import.meta.env.DEV || !root) return;

  console.groupCollapsed(`[Aethera 3D] Scene Graph: ${root.name || "Root"}`);
  const lines = [];

  root.traverse((obj) => {
    const isMesh = obj.isMesh;
    const depth = getDepth(obj, root);
    const indent = "  ".repeat(depth);
    const prefix = isMesh ? "📦 [Mesh]" : "📁 [Group]";
    const matInfo = isMesh && obj.material ? `(Material: ${obj.material.name || "Standard"}, Color: #${obj.material.color?.getHexString()})` : "";
    lines.push(`${indent}${prefix} "${obj.name || "unnamed"}" ${matInfo}`);
  });

  console.log(lines.join("\n"));
  console.groupEnd();
}

function getDepth(obj, root) {
  let depth = 0;
  let current = obj;
  while (current.parent && current !== root) {
    depth++;
    current = current.parent;
  }
  return depth;
}

/**
 * Captures initial material states for all configurable meshes in the model.
 * Enables zero-reload Reset Customization.
 *
 * @param {THREE.Object3D} scene - Cloned scene instance
 * @param {Object} configuration - product.customization
 * @returns {Map<string, { color: string, roughness: number, metalness: number }>}
 */
export function captureOriginalMaterials(scene, configuration) {
  const snapshot = new Map();
  if (!scene || !configuration?.areas) return snapshot;

  const targetMeshNames = new Set();
  configuration.areas.forEach((area) => {
    if (Array.isArray(area.meshNames)) {
      area.meshNames.forEach((name) => targetMeshNames.add(name));
    }
  });

  scene.traverse((child) => {
    if (child.isMesh && targetMeshNames.has(child.name) && child.material) {
      snapshot.set(child.name, {
        color: child.material.color ? `#${child.material.color.getHexString()}` : "#ffffff",
        roughness: typeof child.material.roughness === "number" ? child.material.roughness : 0.5,
        metalness: typeof child.material.metalness === "number" ? child.material.metalness : 0.1
      });
    }
  });

  return snapshot;
}

/**
 * Clones a mesh's material if it is shared, isolating it for runtime modifications.
 *
 * @param {THREE.Mesh} mesh
 */
export function isolateMeshMaterial(mesh) {
  if (!mesh || !mesh.material) return;

  // If the material has not been cloned for this mesh instance, clone it
  if (!mesh.userData.__isIsolatedMaterial) {
    mesh.material = mesh.material.clone();
    mesh.userData.__isIsolatedMaterial = true;
  }
}
