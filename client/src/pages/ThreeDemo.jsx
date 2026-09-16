import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import BasicScene from "../three/components/BasicScene.jsx";

// Predefined luxury e-commerce material palettes (Japandi warm-light aesthetic)
const COLOR_PRESETS = [
  { name: "Obsidian Noir", hex: "#171717" },
  { name: "Warm Cashmere", hex: "#E8DFD5" },
  { name: "Terracotta Earth", hex: "#C26D53" },
  { name: "Sage Mist", hex: "#5B7065" },
  { name: "Midnight Navy", hex: "#23334A" },
  { name: "Royal Lavender", hex: "#8A6FE8" }
];

const LIGHTING_PRESETS = [
  { id: "studio", name: "Studio Daylight", icon: "☀️", desc: "Crisp neutral 3-point daylight" },
  { id: "sunset", name: "Warm Golden Hour", icon: "🌅", desc: "Amber glow with soft organic shadows" },
  { id: "cyberpunk", name: "Cyber Accent Rim", icon: "🔮", desc: "Vibrant high-contrast rim lighting" }
];

const MODEL_PRESETS = [
  {
    id: "cube",
    name: "PBR Material Cube",
    icon: "🧊",
    type: "primitive",
    url: null,
    desc: "Test custom roughness, metalness, and wireframe"
  },
  {
    id: "headphones",
    name: "Sonar Headphones",
    icon: "🎧",
    type: "glb",
    url: "/models/products/aether-sonar-headphones.glb",
    desc: "Luxury wireless ANC headphones digital twin"
  },
  {
    id: "lamp",
    name: "Aura Ambient Lamp",
    icon: "💡",
    type: "glb",
    url: "/models/products/aether-aura-lamp.glb",
    desc: "Minimalist Scandinavian desk light"
  },
  {
    id: "soundsphere",
    name: "Zenith SoundSphere",
    icon: "🔊",
    type: "glb",
    url: "/models/products/zenith-soundsphere.glb",
    desc: "360° acoustic audio orb"
  }
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
  // Model selection state
  const [selectedModel, setSelectedModel] = useState(MODEL_PRESETS[0]);

  // Material state
  const [cubeColor, setCubeColor] = useState("#171717");
  const [roughness, setRoughness] = useState(0.25);
  const [metalness, setMetalness] = useState(0.75);
  const [wireframe, setWireframe] = useState(false);

  // Animation & Camera state
  const [isRotating, setIsRotating] = useState(true);
  const [rotationSpeed, setRotationSpeed] = useState(0.8);
  const [autoOrbit, setAutoOrbit] = useState(false);
  const [lightingPreset, setLightingPreset] = useState("studio");

  // Educational UI tab
  const [activeConcept, setActiveConcept] = useState(CONCEPTS[0].id);
  const controlsRef = useRef(null);

  useEffect(() => {
    document.title = "3D Lab — Spatial Commerce Studio | Aethera";
  }, []);

  const handleResetCamera = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  const selectedConceptData = CONCEPTS.find((c) => c.id === activeConcept) || CONCEPTS[0];

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-neutral-900 pb-24">
      {/* 1. Header Bar matching Home Page Style */}
      <section className="border-b border-neutral-200/80 bg-white/95 backdrop-blur-md sticky top-16 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-full border border-neutral-200">
                Spatial Commerce Studio
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-medium text-emerald-700">WebGL 2.0 Ready</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">
              Aethera 3D Interactive Lab
            </h1>
            <p className="text-xs text-neutral-500 font-light hidden sm:block">
              Physically Based Rendering (PBR) studio with real-time lighting, materials, and digital twins
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleResetCamera}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white hover:bg-neutral-100 text-neutral-800 text-xs font-semibold border border-neutral-200 shadow-xs transition"
            >
              <svg className="w-3.5 h-3.5 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Reset Camera</span>
            </button>

            <Link
              to="/products"
              className="inline-flex items-center gap-1 px-4 py-1.5 rounded-full bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold shadow-xs transition"
            >
              <span>Browse Catalog</span>
              <span className="text-sm">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Main 3D Studio & Controls Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Model Selection Switcher Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
              Select 3D Subject
            </span>
            <span className="text-[11px] text-neutral-500">
              Switch between PBR primitive and production product digital twins
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {MODEL_PRESETS.map((m) => {
              const isSelected = selectedModel.id === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSelectedModel(m)}
                  className={`p-3 rounded-2xl border text-left transition flex items-center gap-3 shadow-xs ${
                    isSelected
                      ? "bg-white border-neutral-900 ring-1 ring-neutral-900"
                      : "bg-white/80 hover:bg-white border-neutral-200/80 hover:border-neutral-300"
                  }`}
                >
                  <span className="text-xl p-2 rounded-xl bg-neutral-100">{m.icon}</span>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-neutral-900 block truncate">
                      {m.name}
                    </span>
                    <span className="text-[10px] text-neutral-400 block truncate font-light">
                      {m.type === "glb" ? "GLB Digital Twin" : "Procedural Mesh"}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left / Center 3D Stage (8 Cols) */}
          <div className="lg:col-span-8 flex flex-col gap-5">
            {/* 3D Canvas Box (Light warm studio background) */}
            <div className="relative w-full h-[480px] sm:h-[540px] md:h-[600px] rounded-3xl bg-gradient-to-b from-[#F7F5F0] via-[#F0ECE4] to-[#E7E2D8] border border-neutral-200 shadow-sm overflow-hidden group">
              {/* R3F 3D Viewport */}
              <BasicScene
                modelUrl={selectedModel.url}
                cubeColor={cubeColor}
                roughness={roughness}
                metalness={metalness}
                wireframe={wireframe}
                isRotating={isRotating}
                rotationSpeed={rotationSpeed}
                lightingPreset={lightingPreset}
                autoOrbit={autoOrbit}
                controlsRef={controlsRef}
                platformColor="#EDE8E1"
                accentColor="#D6CEC5"
              />

              {/* Viewport Floating Watermark Top-Left */}
              <div className="absolute top-4 left-4 pointer-events-none flex flex-col gap-1.5 z-10">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold tracking-wide text-neutral-800 bg-white/80 px-3 py-1 rounded-full border border-neutral-200/60 shadow-xs backdrop-blur-xl">
                    R3F Canvas • 60 FPS • WebGL 2.0
                  </span>
                  <span className="text-[11px] font-bold text-neutral-800 bg-white/80 px-3 py-1 rounded-full border border-neutral-200/60 shadow-xs backdrop-blur-xl flex items-center gap-1">
                    <span className="text-xs">🔄</span> 360° View
                  </span>
                </div>
              </div>

              {/* Gesture Controls Pill Bottom-Center with subtle glass styling */}
              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 pointer-events-none z-10">
                <div className="px-5 py-2 rounded-full bg-white/80 border border-white/70 shadow-lg backdrop-blur-xl flex items-center gap-4 text-xs text-neutral-700 transition-all duration-300">
                  <span className="flex items-center gap-1.5 font-medium">
                    <span className="w-2 h-2 rounded-full bg-neutral-900 animate-pulse" />
                    <strong>Left Drag</strong> Rotate
                  </span>
                  <span className="text-neutral-300">•</span>
                  <span className="flex items-center gap-1.5 font-medium">
                    <strong>Scroll</strong> Zoom
                  </span>
                  <span className="text-neutral-300">•</span>
                  <span className="flex items-center gap-1.5 font-medium">
                    <strong>Right Drag</strong> Pan
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Scene Metrics Row (4 Cards) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              <div className="p-4 rounded-2xl bg-white border border-neutral-200/80 shadow-xs flex flex-col">
                <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-bold">
                  Subject
                </span>
                <span className="text-sm font-bold text-neutral-900 mt-1 truncate">
                  {selectedModel.name}
                </span>
                <span className="text-[11px] text-neutral-500 font-light mt-0.5">
                  {selectedModel.type === "glb" ? "GLTF Geometry" : "BoxGeometry (24 vtx)"}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-neutral-200/80 shadow-xs flex flex-col">
                <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-bold">
                  Material
                </span>
                <span className="text-sm font-bold text-neutral-900 mt-1">Standard PBR</span>
                <span className="text-[11px] text-neutral-500 font-light mt-0.5">
                  {wireframe ? "Wireframe mode" : "Photorealistic"}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-neutral-200/80 shadow-xs flex flex-col">
                <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-bold">
                  Lighting Studio
                </span>
                <span className="text-sm font-bold text-neutral-900 mt-1 capitalize">
                  {lightingPreset}
                </span>
                <span className="text-[11px] text-neutral-500 font-light mt-0.5">
                  Key + Fill + Ambient
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-neutral-200/80 shadow-xs flex flex-col">
                <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-bold">
                  Shadows
                </span>
                <span className="text-sm font-bold text-emerald-700 mt-1">PCF Soft</span>
                <span className="text-[11px] text-neutral-500 font-light mt-0.5">
                  1024x1024 Depth Map
                </span>
              </div>
            </div>
          </div>

          {/* Right Control Panels (4 Cols) */}
          <div className="lg:col-span-4 flex flex-col gap-5">
            {/* Card 1: Material & Surface Inspector (When Cube is Selected) */}
            {selectedModel.id === "cube" ? (
              <div className="p-6 rounded-3xl bg-white border border-neutral-200/80 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold tracking-tight text-neutral-900 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-neutral-900" />
                      Material Inspector (PBR)
                    </h3>
                    <p className="text-[11px] text-neutral-500 font-light">
                      Physically Based Rendering Surface
                    </p>
                  </div>
                  <span className="text-[10px] text-neutral-500 font-mono bg-neutral-100 px-2 py-0.5 rounded">
                    Standard
                  </span>
                </div>

                {/* Color Swatches */}
                <div className="mb-5">
                  <label className="block text-xs font-semibold text-neutral-700 mb-2">
                    Surface Color Palette
                  </label>
                  <div className="grid grid-cols-6 gap-2">
                    {COLOR_PRESETS.map((c) => (
                      <button
                        key={c.hex}
                        type="button"
                        onClick={() => setCubeColor(c.hex)}
                        title={c.name}
                        style={{ backgroundColor: c.hex }}
                        className={`h-8 rounded-xl transition transform hover:scale-110 shadow-xs relative ${
                          cubeColor === c.hex ? "ring-2 ring-neutral-900 ring-offset-2 scale-105" : ""
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Roughness Slider */}
                <div className="mb-5">
                  <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                    <span className="text-neutral-700">Roughness (Micro-facet)</span>
                    <span className="font-mono text-neutral-900 bg-neutral-100 px-2 py-0.5 rounded text-[11px]">
                      {roughness.toFixed(2)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={roughness}
                    onChange={(e) => setRoughness(parseFloat(e.target.value))}
                    className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-neutral-900"
                  />
                  <div className="flex justify-between text-[10px] text-neutral-400 mt-1">
                    <span>0.0 (Mirror Gloss)</span>
                    <span>1.0 (Matte Chalk)</span>
                  </div>
                </div>

                {/* Metalness Slider */}
                <div className="mb-5">
                  <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                    <span className="text-neutral-700">Metalness (Conductivity)</span>
                    <span className="font-mono text-neutral-900 bg-neutral-100 px-2 py-0.5 rounded text-[11px]">
                      {metalness.toFixed(2)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={metalness}
                    onChange={(e) => setMetalness(parseFloat(e.target.value))}
                    className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-neutral-900"
                  />
                  <div className="flex justify-between text-[10px] text-neutral-400 mt-1">
                    <span>0.0 (Dielectric)</span>
                    <span>1.0 (Pure Chrome)</span>
                  </div>
                </div>

                {/* Wireframe Toggle */}
                <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-neutral-900 block">Wireframe Topology</span>
                    <span className="text-[11px] text-neutral-400">Display polygon mesh structure</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setWireframe(!wireframe)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                      wireframe ? "bg-neutral-900" : "bg-neutral-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition ${
                        wireframe ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
            ) : (
              /* GLB Model Info Card */
              <div className="p-6 rounded-3xl bg-white border border-neutral-200/80 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <h3 className="text-sm font-bold tracking-tight text-neutral-900">
                    Product Digital Twin
                  </h3>
                </div>
                <p className="text-xs text-neutral-600 font-light mb-4 leading-relaxed">
                  {selectedModel.desc}. Streamed asynchronously via Drei's cached GLTF loader with auto-normalization.
                </p>
                <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-100 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-neutral-400">File Format:</span>
                    <span className="font-semibold text-neutral-800">Binary GLTF (.glb)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">PBR Materials:</span>
                    <span className="font-semibold text-neutral-800">Embedded 2K Textures</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Real-Time Lighting:</span>
                    <span className="font-semibold text-neutral-800">Specular Environment Reflection</span>
                  </div>
                </div>
              </div>
            )}

            {/* Card 2: Animation & Camera Controls */}
            <div className="p-6 rounded-3xl bg-white border border-neutral-200/80 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold tracking-tight text-neutral-900 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Animation & Turntable
                </h3>
                <span className="text-[10px] text-emerald-700 font-mono bg-emerald-50 px-2 py-0.5 rounded">
                  useFrame (60 FPS)
                </span>
              </div>

              {/* Auto-Rotation Toggle */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-xs font-semibold text-neutral-900 block">Object Spin</span>
                  <span className="text-[11px] text-neutral-400 font-light">Rotate mesh along Y-axis</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsRotating(!isRotating)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                    isRotating
                      ? "bg-neutral-900 text-white"
                      : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                  }`}
                >
                  {isRotating ? "Active" : "Paused"}
                </button>
              </div>

              {/* Rotation Speed Slider */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                  <span className="text-neutral-700">Rotation Speed</span>
                  <span className="font-mono text-neutral-900 bg-neutral-100 px-2 py-0.5 rounded text-[11px]">
                    {rotationSpeed.toFixed(1)}x
                  </span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="2.5"
                  step="0.1"
                  value={rotationSpeed}
                  disabled={!isRotating}
                  onChange={(e) => setRotationSpeed(parseFloat(e.target.value))}
                  className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-neutral-900 disabled:opacity-40"
                />
              </div>

              {/* Camera Turntable */}
              <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-neutral-900 block">Camera Orbit</span>
                  <span className="text-[11px] text-neutral-400 font-light">Auto-orbit around subject</span>
                </div>
                <button
                  type="button"
                  onClick={() => setAutoOrbit(!autoOrbit)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                    autoOrbit ? "bg-neutral-900" : "bg-neutral-300"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition ${
                      autoOrbit ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Card 3: Studio Lighting Presets */}
            <div className="p-6 rounded-3xl bg-white border border-neutral-200/80 shadow-sm">
              <h3 className="text-sm font-bold tracking-tight text-neutral-900 flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Lighting Studio Presets
              </h3>
              <div className="grid grid-cols-1 gap-2.5">
                {LIGHTING_PRESETS.map((preset) => {
                  const isCurrent = lightingPreset === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setLightingPreset(preset.id)}
                      className={`p-3 rounded-2xl border text-left transition flex items-center gap-3 shadow-xs ${
                        isCurrent
                          ? "bg-neutral-50 border-neutral-900 ring-1 ring-neutral-900"
                          : "bg-white hover:bg-neutral-50 border-neutral-200/80"
                      }`}
                    >
                      <span className="text-xl p-2 rounded-xl bg-neutral-100">{preset.icon}</span>
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-bold text-neutral-900 block">{preset.name}</span>
                        <span className="text-[10px] text-neutral-500 truncate block font-light">
                          {preset.desc}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* 3. Educational Reference Section ("The 3D Architecture") */}
        <section className="mt-16 pt-12 border-t border-neutral-200">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1 block">
              ENGINEERING FOUNDATIONS
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900">
              The 3D Mental Model
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 font-light mt-1.5">
              Comprehensive architectural reference for Three.js, WebGL shaders, and React Three Fiber pipelines.
            </p>
          </div>

          {/* Concept Tabs */}
          <div className="flex items-center justify-center flex-wrap gap-2 mb-8">
            {CONCEPTS.map((concept) => {
              const isActive = activeConcept === concept.id;
              return (
                <button
                  key={concept.id}
                  type="button"
                  onClick={() => setActiveConcept(concept.id)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold transition shadow-xs ${
                    isActive
                      ? "bg-neutral-900 text-white"
                      : "bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200"
                  }`}
                >
                  {concept.title}
                </button>
              );
            })}
          </div>

          {/* Active Concept Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedConceptData.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="max-w-4xl mx-auto bg-white rounded-3xl p-8 border border-neutral-200/80 shadow-sm"
            >
              <div className="flex items-center justify-between gap-4 mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 bg-neutral-100 px-3 py-1 rounded-full border border-neutral-200">
                  {selectedConceptData.tag}
                </span>
                <span className="text-xs text-neutral-400 font-mono">
                  Concept #{CONCEPTS.findIndex((c) => c.id === selectedConceptData.id) + 1} of 5
                </span>
              </div>

              <h3 className="text-xl font-bold tracking-tight text-neutral-900 mb-3">
                {selectedConceptData.title}
              </h3>
              <p className="text-xs sm:text-sm text-neutral-700 font-light leading-relaxed mb-6">
                {selectedConceptData.summary}
              </p>

              {/* Key Architectural Takeaways */}
              <div className="space-y-3 pt-6 border-t border-neutral-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  Key Technical Principles
                </h4>
                {selectedConceptData.points.map((pt, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-neutral-700">
                    <span className="w-5 h-5 rounded-full bg-neutral-100 text-neutral-900 font-bold flex items-center justify-center shrink-0 text-xs mt-0.5 border border-neutral-200">
                      ✓
                    </span>
                    <span className="font-light leading-relaxed">{pt}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </section>

        {/* 4. Bottom Conversion Banner matching Homepage ThreeDimensionBanner */}
        <section className="mt-16">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#EAE7F6] via-[#EFEBF8] to-[#F6F3FB] border border-[#E4DFFA]/70 p-8 sm:p-12 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
            <div className="max-w-lg text-center sm:text-left">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 mb-2">
                Ready to Experience Real Products?
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 font-light">
                Browse our curated collection of flagship products with interactive 3D digital twins and AR views.
              </p>
            </div>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-neutral-900 text-white text-xs font-semibold hover:bg-neutral-800 transition shadow-sm shrink-0"
            >
              <span>Explore 3D Catalog</span>
              <span className="text-sm">→</span>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
