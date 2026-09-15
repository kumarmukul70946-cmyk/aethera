import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import * as THREE from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Node.js polyfill for browser FileReader used by GLTFExporter
if (typeof globalThis.FileReader === "undefined") {
  class NodeFileReader {
    readAsArrayBuffer(blob) {
      blob.arrayBuffer().then((buffer) => {
        this.result = buffer;
        if (this.onloadend) this.onloadend();
      });
    }
  }
  globalThis.FileReader = NodeFileReader;
}

const OUTPUT_DIR = path.resolve(__dirname, "../public/models/products");

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const exporter = new GLTFExporter();

function exportToGLB(scene, filename) {
  return new Promise((resolve, reject) => {
    exporter.parse(
      scene,
      (gltf) => {
        const filePath = path.join(OUTPUT_DIR, filename);
        fs.writeFileSync(filePath, Buffer.from(gltf));
        const stats = fs.statSync(filePath);
        console.log(`✓ Exported ${filename} (${(stats.size / 1024).toFixed(1)} KB)`);
        resolve(filePath);
      },
      (error) => {
        console.error(`Error exporting ${filename}:`, error);
        reject(error);
      },
      { binary: true }
    );
  });
}

// 1. Headphones Model (Headband, Ear Cups, Cushions, Metal Accents)
function createHeadphonesScene() {
  const scene = new THREE.Scene();
  scene.name = "AetherSonarHeadphones";

  // Headband Arch
  const headbandGeom = new THREE.TorusGeometry(1.2, 0.08, 16, 48, Math.PI);
  const headbandMat = new THREE.MeshStandardMaterial({
    color: "#0f172a",
    roughness: 0.35,
    metalness: 0.2
  });
  const headband = new THREE.Mesh(headbandGeom, headbandMat);
  headband.name = "Headband";
  headband.rotation.z = Math.PI;
  headband.position.y = 1.0;
  scene.add(headband);

  // Left & Right Ear Cups
  const cupGeom = new THREE.CylinderGeometry(0.55, 0.55, 0.3, 32);
  const cupMat = new THREE.MeshStandardMaterial({
    color: "#1e293b",
    roughness: 0.2,
    metalness: 0.85
  });

  const cushionGeom = new THREE.TorusGeometry(0.48, 0.12, 16, 32);
  const cushionMat = new THREE.MeshStandardMaterial({
    color: "#334155",
    roughness: 0.8,
    metalness: 0.05
  });

  // Left Cup Assembly
  const leftCup = new THREE.Mesh(cupGeom, cupMat);
  leftCup.name = "LeftCup";
  leftCup.rotation.z = Math.PI / 2;
  leftCup.position.set(-1.25, 0.9, 0);

  const leftCushion = new THREE.Mesh(cushionGeom, cushionMat);
  leftCushion.name = "LeftCushion";
  leftCushion.rotation.y = Math.PI / 2;
  leftCushion.position.set(-1.12, 0.9, 0);

  // Right Cup Assembly
  const rightCup = new THREE.Mesh(cupGeom, cupMat);
  rightCup.name = "RightCup";
  rightCup.rotation.z = Math.PI / 2;
  rightCup.position.set(1.25, 0.9, 0);

  const rightCushion = new THREE.Mesh(cushionGeom, cushionMat);
  rightCushion.name = "RightCushion";
  rightCushion.rotation.y = Math.PI / 2;
  rightCushion.position.set(1.12, 0.9, 0);

  // Trim Ring Accents (Cyan Neon Ring)
  const trimGeom = new THREE.RingGeometry(0.35, 0.42, 32);
  const trimMat = new THREE.MeshStandardMaterial({
    color: "#6366f1",
    roughness: 0.1,
    metalness: 0.9
  });

  const leftTrim = new THREE.Mesh(trimGeom, trimMat);
  leftTrim.name = "LeftTrim";
  leftTrim.rotation.y = Math.PI / 2;
  leftTrim.position.set(-1.41, 0.9, 0);

  const rightTrim = new THREE.Mesh(trimGeom, trimMat);
  rightTrim.name = "RightTrim";
  rightTrim.rotation.y = -Math.PI / 2;
  rightTrim.position.set(1.41, 0.9, 0);

  scene.add(leftCup, leftCushion, rightCup, rightCushion, leftTrim, rightTrim);
  return scene;
}

// 2. Wireless SoundSphere Speaker
function createSpeakerScene() {
  const scene = new THREE.Scene();
  scene.name = "ZenithSoundSphere";

  // Main Sphere Body
  const bodyGeom = new THREE.SphereGeometry(1.2, 36, 36);
  const bodyMat = new THREE.MeshStandardMaterial({
    color: "#0f172a",
    roughness: 0.45,
    metalness: 0.3
  });
  const body = new THREE.Mesh(bodyGeom, bodyMat);
  body.name = "SpeakerBody";
  body.position.y = 1.2;

  // Aluminum Stand / Base
  const baseGeom = new THREE.CylinderGeometry(0.7, 0.9, 0.25, 32);
  const baseMat = new THREE.MeshStandardMaterial({
    color: "#475569",
    roughness: 0.2,
    metalness: 0.9
  });
  const base = new THREE.Mesh(baseGeom, baseMat);
  base.name = "BaseStand";
  base.position.y = 0.125;

  // Glowing Acoustic Halo Ring
  const haloGeom = new THREE.TorusGeometry(1.22, 0.05, 16, 48);
  const haloMat = new THREE.MeshStandardMaterial({
    color: "#06b6d4",
    roughness: 0.1,
    metalness: 0.8
  });
  const halo = new THREE.Mesh(haloGeom, haloMat);
  halo.name = "AcousticHalo";
  halo.rotation.x = Math.PI / 2;
  halo.position.y = 1.2;

  // Top Touch Dial
  const dialGeom = new THREE.CylinderGeometry(0.35, 0.35, 0.06, 32);
  const dialMat = new THREE.MeshStandardMaterial({
    color: "#e2e8f0",
    roughness: 0.15,
    metalness: 0.95
  });
  const dial = new THREE.Mesh(dialGeom, dialMat);
  dial.name = "TouchDial";
  dial.position.y = 2.41;

  scene.add(body, base, halo, dial);
  return scene;
}

// 3. Ambience Smart Lamp
function createLampScene() {
  const scene = new THREE.Scene();
  scene.name = "AetherAuraLamp";

  // Heavy Marble/Slate Base
  const baseGeom = new THREE.CylinderGeometry(0.9, 1.0, 0.2, 32);
  const baseMat = new THREE.MeshStandardMaterial({
    color: "#1e293b",
    roughness: 0.3,
    metalness: 0.4
  });
  const base = new THREE.Mesh(baseGeom, baseMat);
  base.name = "LampBase";
  base.position.y = 0.1;

  // Slender Metallic Stem
  const stemGeom = new THREE.CylinderGeometry(0.06, 0.06, 1.8, 24);
  const stemMat = new THREE.MeshStandardMaterial({
    color: "#f59e0b", // Brass/gold
    roughness: 0.15,
    metalness: 0.95
  });
  const stem = new THREE.Mesh(stemGeom, stemMat);
  stem.name = "BrassStem";
  stem.position.y = 1.1;

  // Diffused Frosted Orb Shade
  const shadeGeom = new THREE.SphereGeometry(0.65, 32, 32);
  const shadeMat = new THREE.MeshStandardMaterial({
    color: "#fef08a",
    roughness: 0.1,
    metalness: 0.1
  });
  const shade = new THREE.Mesh(shadeGeom, shadeMat);
  shade.name = "DiffuserShade";
  shade.position.y = 2.4;

  scene.add(base, stem, shade);
  return scene;
}

// 4. Generic Example Model Fallback
function createExampleScene() {
  const scene = new THREE.Scene();
  scene.name = "ExampleProduct";

  const boxGeom = new THREE.BoxGeometry(1.5, 1.5, 1.5);
  const boxMat = new THREE.MeshStandardMaterial({
    color: "#6366f1",
    roughness: 0.25,
    metalness: 0.8
  });
  const box = new THREE.Mesh(boxGeom, boxMat);
  box.name = "MainBody";
  box.position.y = 0.75;

  const accentGeom = new THREE.CylinderGeometry(0.8, 0.8, 0.1, 32);
  const accentMat = new THREE.MeshStandardMaterial({
    color: "#06b6d4",
    roughness: 0.1,
    metalness: 0.9
  });
  const accent = new THREE.Mesh(accentGeom, accentMat);
  accent.name = "AccentPlate";
  accent.position.y = 1.55;

  scene.add(box, accent);
  return scene;
}

async function main() {
  console.log("Generating valid sample GLB product models...");
  await exportToGLB(createHeadphonesScene(), "aether-sonar-headphones.glb");
  await exportToGLB(createSpeakerScene(), "zenith-soundsphere.glb");
  await exportToGLB(createLampScene(), "aether-aura-lamp.glb");
  await exportToGLB(createExampleScene(), "example.glb");
  console.log("All sample GLB product models successfully generated!");
}

main().catch(console.error);
