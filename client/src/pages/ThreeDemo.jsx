import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import BasicScene from "../three/components/BasicScene.jsx";

// Predefined luxury e-commerce material palettes
const COLOR_PRESETS = [
  { name: "Aethera Indigo", hex: "#6366f1" },
  { name: "Cyber Cyan", hex: "#06b6d4" },
  { name: "Emerald Titanium", hex: "#10b981" },
  { name: "Solar Amber", hex: "#f59e0b" },
  { name: "Crimson Carbon", hex: "#f43f5e" },
  { name: "Obsidian Slate", hex: "#1e293b" }
];

const LIGHTING_PRESETS = [
  { id: "studio", name: "Studio Daylight", icon: "☀️", desc: "Crisp neutral 3-point daylight" },
  { id: "cyberpunk", name: "Cyberpunk Neon", icon: "🔮", desc: "Vibrant cyan, magenta & purple rim" },
  { id: "sunset", name: "Warm Sunset", icon: "🌅", desc: "Golden hour amber with burnt orange" }
];

const CONCEPTS = [
  {
    id: "webgl_three_r3f",
    title: "WebGL vs Three.js vs R3F",
    tag: "Core Engine",
    summary:
      "WebGL communicates with the GPU at a low OpenGL ES level. Three.js wraps raw shaders and buffers into intuitive objects (Scene, Camera, Mesh). React Three Fiber (R3F) renders Three.js declaratively as React components without overhead.",
    points: [
      "WebGL: Low-level browser GPU interface (matrix math & vertex/fragment shaders).",
      "Three.js: High-level JavaScript 3D abstraction library.",
      "React Three Fiber (R3F): A reconciler for Three.js that translates JSX into Three.js instances."
    ]
  },
  {
    id: "scene_camera_renderer",
    title: "Scene, Camera & Renderer",
    tag: "Viewport",
    summary:
      "Every 3D experience requires a Scene (the container universe), a Camera (the observer's viewpoint), and a Renderer (which paints the 3D world onto a 2D canvas element).",
    points: [
      "Scene: Container holding meshes, lights, and environmental reflection probes.",
      "Perspective Camera: Emulates human vision with Field of View (FOV), aspect ratio, near, and far clipping planes.",
      "Renderer (Canvas): Calculates lighting equations and rasterizes polygons into screen pixels."
    ]
  },
  {
    id: "mesh_geometry_material",
    title: "Mesh = Geometry + Material",
    tag: "3D Object",
    summary:
      "A 3D object is fundamentally a Mesh: the union of a Geometry (the mathematical vertex positions and faces) and a Material (how photons scatter or reflect off its surface).",
    points: [
      "BoxGeometry: Mathematical points in 3D space [width, height, depth].",
      "MeshStandardMaterial: Physically Based Rendering (PBR) standard surface.",
      "Roughness: Controls micro-facet scattering (0 = mirror gloss, 1 = chalk matte).",
      "Metalness: Controls electrical conduction (0 = plastic/wood, 1 = chrome/metal)."
    ]
  },
  {
    id: "use_frame",
    title: "useFrame vs React State",
    tag: "Performance",
    summary:
      "High-frequency 60 FPS animations must bypass React state. useFrame runs directly inside the RAF loop, mutating Three.js object properties via useRef without triggering expensive React component re-renders.",
    points: [
      "Direct Mutation: meshRef.current.rotation.y += delta * speed.",
      "Delta Time: Multiplies by elapsed seconds so animations run identically on 60Hz or 144Hz screens.",
      "Zero Re-renders: React reconciliation stays completely idle while the GPU renders smoothly."
    ]
  },
  {
    id: "coordinates",
    title: "3D Coordinate System",
    tag: "Spatial Math",
    summary:
      "Three.js utilizes a right-handed Cartesian coordinate system: X is horizontal, Y is vertical (up/down), and Z is depth (towards/away from the camera).",
    points: [
      "X-axis: Left (-) to Right (+).",
      "Y-axis: Down (-) to Up (+).",
      "Z-axis: Far (-) to Near / Screen (+).",
      "Rotation: Specified in radians (Math.PI = 180 degrees)."
    ]
  }
];

export default function ThreeDemo() {
  // Material state
  const [cubeColor, setCubeColor] = useState("#6366f1");
  const [roughness, setRoughness] = useState(0.25);
  const [metalness, setMetalness] = useState(0.75);
  const [wireframe, setWireframe] = useState(false);

  // Animation & Camera state
  const [isRotating, setIsRotating] = useState(true);
  const [rotationSpeed, setRotationSpeed] = useState(0.8);
  const [autoOrbit, setAutoOrbit] = useState(false);
  const [lightingPreset, setLightingPreset] = useState("studio");

  // UI tabs
  const [activeConcept, setActiveConcept] = useState(CONCEPTS[0].id);
  const controlsRef = useRef(null);

  useEffect(() => {
    document.title = "3D Lab — Aethera Commerce";
  }, []);

  const handleResetCamera = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      {/* Top Banner / Header */}
      <section className="border-b border-slate-800/80 bg-slate-900/40 backdrop-blur-md sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-400 p-0.5 shadow-md shadow-indigo-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <span className="text-sm font-black text-indigo-400">3D</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-white">Aethera 3D Lab</h1>
                <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Part 8 Foundation
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Interactive Three.js & React Three Fiber architecture testing suite
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <Link
              to="/products"
              className="px-3.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-medium transition border border-slate-700/60"
            >
              Browse Catalog
            </Link>
            <button
              type="button"
              onClick={handleResetCamera}
              className="px-3.5 py-1.5 rounded-lg bg-indigo-600/90 hover:bg-indigo-500 text-white font-medium transition shadow-sm shadow-indigo-600/20 flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Reset Camera
            </button>
          </div>
        </div>
      </section>

      {/* Main 3D Viewport & Control Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left / Center 3D Stage (8 Cols) */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            {/* 3D Canvas Box */}
            <div className="relative w-full h-[480px] sm:h-[540px] md:h-[600px] rounded-3xl bg-gradient-to-b from-slate-900/90 via-slate-950 to-slate-950 border border-slate-800/80 shadow-2xl overflow-hidden group">
              {/* The R3F 3D Viewport */}
              <BasicScene
                cubeColor={cubeColor}
                roughness={roughness}
                metalness={metalness}
                wireframe={wireframe}
                isRotating={isRotating}
                rotationSpeed={rotationSpeed}
                lightingPreset={lightingPreset}
                autoOrbit={autoOrbit}
                controlsRef={controlsRef}
              />

              {/* Viewport Floating Watermark */}
              <div className="absolute top-4 left-4 pointer-events-none flex flex-col gap-1">
                <span className="text-[11px] font-mono tracking-wider uppercase text-slate-400 bg-slate-950/80 px-2.5 py-1 rounded-md border border-slate-800/80 backdrop-blur-md">
                  R3F Canvas • 60 FPS • WebGL 2.0
                </span>
              </div>

              {/* Gesture Controls Overlay Pill */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none">
                <div className="px-4 py-2 rounded-full bg-slate-950/85 border border-slate-800/90 shadow-xl backdrop-blur-md flex items-center gap-4 text-[11px] text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                    <strong>Left Drag</strong> Rotate
                  </span>
                  <span className="text-slate-600">•</span>
                  <span className="flex items-center gap-1.5">
                    <strong>Scroll</strong> Zoom
                  </span>
                  <span className="text-slate-600">•</span>
                  <span className="flex items-center gap-1.5">
                    <strong>Right Drag</strong> Pan
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Scene Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-col">
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                  Geometry
                </span>
                <span className="text-sm font-bold text-white mt-1">BoxGeometry</span>
                <span className="text-[10px] text-slate-500">6 faces • 24 vertices</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-col">
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                  Material
                </span>
                <span className="text-sm font-bold text-white mt-1">Standard PBR</span>
                <span className="text-[10px] text-slate-500">
                  {wireframe ? "Wireframe mode" : "Textured solid"}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-col">
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                  Lighting
                </span>
                <span className="text-sm font-bold text-white mt-1 capitalize">{lightingPreset}</span>
                <span className="text-[10px] text-slate-500">Key + Fill + Ambient</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-col">
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                  Shadows
                </span>
                <span className="text-sm font-bold text-emerald-400 mt-1">PCF Soft</span>
                <span className="text-[10px] text-slate-500">1024x1024 depth map</span>
              </div>
            </div>
          </div>

          {/* Right Control Panel (4 Cols) */}
          <div className="lg:col-span-4 flex flex-col gap-5">
            {/* Material & Surface Inspector */}
            <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800/90 shadow-xl backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-500" />
                  Material Inspector (PBR)
                </h2>
                <span className="text-[10px] text-indigo-400 font-mono">MeshStandardMaterial</span>
              </div>

              {/* Color Swatches */}
              <div className="mb-4">
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Surface Color
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {COLOR_PRESETS.map((c) => (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => setCubeColor(c.hex)}
                      title={c.name}
                      style={{ backgroundColor: c.hex }}
                      className={`h-8 rounded-xl transition transform hover:scale-110 relative ${
                        cubeColor === c.hex ? "ring-2 ring-white ring-offset-2 ring-offset-slate-950 scale-105" : ""
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Roughness Slider */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                  <span className="text-slate-300">Roughness</span>
                  <span className="font-mono text-indigo-400">{roughness.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={roughness}
                  onChange={(e) => setRoughness(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                  <span>0.0 (High Gloss)</span>
                  <span>1.0 (Matte Chalk)</span>
                </div>
              </div>

              {/* Metalness Slider */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                  <span className="text-slate-300">Metalness</span>
                  <span className="font-mono text-cyan-400">{metalness.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={metalness}
                  onChange={(e) => setMetalness(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                  <span>0.0 (Plastic / Dielectric)</span>
                  <span>1.0 (Metallic Chrome)</span>
                </div>
              </div>

              {/* Wireframe Toggle */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-200 block">Wireframe Mode</span>
                  <span className="text-[10px] text-slate-400">View polygon mesh triangles</span>
                </div>
                <button
                  type="button"
                  onClick={() => setWireframe(!wireframe)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                    wireframe ? "bg-indigo-600" : "bg-slate-800"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      wireframe ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Animation & Dynamics Panel */}
            <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800/90 shadow-xl backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Animation Engine (useFrame)
                </h2>
                <span className="text-[10px] text-emerald-400 font-mono">60 FPS Loop</span>
              </div>

              {/* Auto-Rotation Toggle */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-xs font-semibold text-slate-200 block">Object Rotation</span>
                  <span className="text-[10px] text-slate-400">Rotates cube along Y/X axes</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsRotating(!isRotating)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                    isRotating
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "bg-slate-800 text-slate-400 border border-slate-700"
                  }`}
                >
                  {isRotating ? "Active" : "Paused"}
                </button>
              </div>

              {/* Rotation Speed Slider */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                  <span className="text-slate-300">Rotation Speed</span>
                  <span className="font-mono text-emerald-400">{rotationSpeed.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="2.5"
                  step="0.1"
                  value={rotationSpeed}
                  disabled={!isRotating}
                  onChange={(e) => setRotationSpeed(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 disabled:opacity-40"
                />
              </div>

              {/* Camera Turntable (OrbitControls autoRotate) */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-200 block">Camera Turntable</span>
                  <span className="text-[10px] text-slate-400">OrbitControls auto-orbit</span>
                </div>
                <button
                  type="button"
                  onClick={() => setAutoOrbit(!autoOrbit)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                    autoOrbit ? "bg-indigo-600" : "bg-slate-800"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      autoOrbit ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Studio Lighting Presets */}
            <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800/90 shadow-xl backdrop-blur-sm">
              <h2 className="text-sm font-bold tracking-tight text-white flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Lighting Studio Presets
              </h2>
              <div className="grid grid-cols-1 gap-2">
                {LIGHTING_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setLightingPreset(preset.id)}
                    className={`p-3 rounded-xl border text-left transition flex items-center gap-3 ${
                      lightingPreset === preset.id
                        ? "bg-indigo-600/15 border-indigo-500/40 text-white"
                        : "bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300"
                    }`}
                  >
                    <span className="text-xl">{preset.icon}</span>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-semibold block">{preset.name}</span>
                      <span className="text-[10px] text-slate-400 truncate block">{preset.desc}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 3D Mental Model Concept Academy (Curated Educational Reference) */}
        <section className="mt-14 pt-10 border-t border-slate-800">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase tracking-wider">
              Educational Breakdown
            </span>
            <h2 className="text-2xl font-extrabold text-white mt-3">The 3D Mental Model</h2>
            <p className="text-sm text-slate-400 mt-2">
              Everything you need to master Three.js, WebGL, and React Three Fiber architecture for
              your technical interviews.
            </p>
          </div>

          {/* Interactive Concept Tabs */}
          <div className="flex flex-wrap gap-2 justify-center mb-6">
            {CONCEPTS.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setActiveConcept(c.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition border ${
                  activeConcept === c.id
                    ? "bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/25"
                    : "bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700"
                }`}
              >
                {c.title}
              </button>
            ))}
          </div>

          {/* Active Concept Explanation Card */}
          {CONCEPTS.filter((c) => c.id === activeConcept).map((c) => (
            <div
              key={c.id}
              className="max-w-4xl mx-auto p-6 sm:p-8 rounded-3xl bg-slate-900/70 border border-slate-800 shadow-2xl backdrop-blur-md"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-mono uppercase tracking-widest text-indigo-400 font-semibold">
                  {c.tag}
                </span>
                <span className="text-xs text-slate-500">Part 8 Core Knowledge</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{c.title}</h3>
              <p className="text-sm text-slate-300 leading-relaxed mb-5">{c.summary}</p>

              <div className="space-y-2.5 pt-4 border-t border-slate-800/80">
                {c.points.map((pt, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                    <span>{pt}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
