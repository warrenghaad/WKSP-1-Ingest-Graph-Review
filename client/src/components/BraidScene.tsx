import React, { useRef, useMemo, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text, Html } from "@react-three/drei";
import * as THREE from "three";
import { CIVILIZATIONS, type Civilization } from "@/lib/braidData";
import { MAGIC_LABELS, type MAGICVector } from "@/lib/magicFramework";

const MAGIC_KEYS: (keyof MAGICVector)[] = ["M", "A", "G", "I", "C"];
const BRAID_HEIGHT = 10;
const SEGMENTS = 300;
const CYCLES = 3;

interface BraidPhase {
  name: "discovery" | "innovation" | "invention";
  startT: number;
  endT: number;
}

function buildCyclePhases(cycleIndex: number, totalCycles: number): BraidPhase[] {
  const cycleLen = 1 / totalCycles;
  const base = cycleIndex * cycleLen;
  return [
    { name: "discovery", startT: base, endT: base + cycleLen * 0.4 },
    { name: "innovation", startT: base + cycleLen * 0.4, endT: base + cycleLen * 0.75 },
    { name: "invention", startT: base + cycleLen * 0.75, endT: base + cycleLen },
  ];
}

function getPhaseAt(t: number): { phase: BraidPhase; blend: number } {
  for (let c = 0; c < CYCLES; c++) {
    const phases = buildCyclePhases(c, CYCLES);
    for (const phase of phases) {
      if (t >= phase.startT && t < phase.endT) {
        const blend = (t - phase.startT) / (phase.endT - phase.startT);
        return { phase, blend };
      }
    }
  }
  const lastPhases = buildCyclePhases(CYCLES - 1, CYCLES);
  return { phase: lastPhases[2], blend: 1 };
}

function generateStrandPoints(
  strandIndex: number,
  magicProfile: MAGICVector,
  segments: number,
  height: number
): THREE.Vector3[] {
  const key = MAGIC_KEYS[strandIndex];
  const weight = magicProfile[key];
  const baseAngle = (strandIndex / 5) * Math.PI * 2;
  const points: THREE.Vector3[] = [];

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const y = (t - 0.5) * height;
    const { phase, blend } = getPhaseAt(t);

    let spreadRadius: number;
    let twistSpeed: number;
    let thickness: number;

    if (phase.name === "discovery") {
      spreadRadius = 0.35 * (1 - blend * 0.15);
      twistSpeed = 1.5;
      thickness = 0.01 + weight * 0.03 * (0.5 + blend * 0.5);
    } else if (phase.name === "innovation") {
      const converge = blend * blend;
      spreadRadius = 0.35 * (1 - converge * 0.6);
      twistSpeed = 3 + converge * 4;
      thickness = 0.01 + weight * 0.035;
    } else {
      const tighten = blend;
      spreadRadius = 0.35 * 0.4 * (1 - tighten * 0.7);
      twistSpeed = 7 + tighten * 5;
      thickness = 0.015 + weight * 0.04;
    }

    const angle = t * Math.PI * 2 * twistSpeed + baseAngle;
    const x = Math.cos(angle) * spreadRadius;
    const z = Math.sin(angle) * spreadRadius;

    points.push(new THREE.Vector3(x, y, z));
  }

  return points;
}

function generateGreenWraps(segments: number, height: number): THREE.Vector3[][] {
  const wraps: THREE.Vector3[][] = [];

  for (let c = 0; c < CYCLES; c++) {
    const phases = buildCyclePhases(c, CYCLES);
    const invPhase = phases[2];
    const wrapStart = invPhase.startT + (invPhase.endT - invPhase.startT) * 0.3;
    const wrapEnd = invPhase.endT;

    const pts: THREE.Vector3[] = [];
    const wrapSegments = 60;

    for (let i = 0; i <= wrapSegments; i++) {
      const localT = i / wrapSegments;
      const globalT = wrapStart + localT * (wrapEnd - wrapStart);
      const y = (globalT - 0.5) * height;

      const wrapAngle = localT * Math.PI * 2 * 4;
      const r = 0.18 - localT * 0.06;
      const x = Math.cos(wrapAngle) * r;
      const z = Math.sin(wrapAngle) * r;

      pts.push(new THREE.Vector3(x, y, z));
    }
    wraps.push(pts);
  }

  return wraps;
}

function generateInventionMarkers(height: number): number[] {
  const markers: number[] = [];
  for (let c = 0; c < CYCLES; c++) {
    const phases = buildCyclePhases(c, CYCLES);
    const invCenter = (phases[2].startT + phases[2].endT) / 2;
    markers.push((invCenter - 0.5) * height);
  }
  return markers;
}

function BraidStrand({
  points,
  color,
  weight,
  onHover,
  onUnhover,
  isHighlighted,
}: {
  points: THREE.Vector3[];
  color: string;
  weight: number;
  onHover: () => void;
  onUnhover: () => void;
  isHighlighted: boolean;
}) {
  const curve = useMemo(() => new THREE.CatmullRomCurve3(points), [points]);
  const tubeRadius = 0.012 + weight * 0.035;

  return (
    <mesh
      onPointerEnter={(e) => {
        e.stopPropagation();
        onHover();
        document.body.style.cursor = "pointer";
      }}
      onPointerLeave={(e) => {
        e.stopPropagation();
        onUnhover();
        document.body.style.cursor = "auto";
      }}
    >
      <tubeGeometry args={[curve, 150, tubeRadius, 8, false]} />
      <meshStandardMaterial
        color={color}
        metalness={0.6}
        roughness={0.3}
        emissive={color}
        emissiveIntensity={isHighlighted ? 0.5 : 0.12}
        transparent
        opacity={isHighlighted ? 1 : 0.75}
      />
    </mesh>
  );
}

function GreenWrap({ points }: { points: THREE.Vector3[] }) {
  const curve = useMemo(() => new THREE.CatmullRomCurve3(points), [points]);

  return (
    <mesh>
      <tubeGeometry args={[curve, 60, 0.025, 8, false]} />
      <meshStandardMaterial
        color="#22c55e"
        metalness={0.7}
        roughness={0.2}
        emissive="#22c55e"
        emissiveIntensity={0.4}
        transparent
        opacity={0.85}
      />
    </mesh>
  );
}

function PhaseLabel({ y, label, color }: { y: number; label: string; color: string }) {
  return (
    <Text
      position={[-0.7, y, 0]}
      fontSize={0.08}
      color={color}
      anchorX="right"
      anchorY="middle"
      font="https://fonts.gstatic.com/s/inter/v13/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2"
    >
      {label}
    </Text>
  );
}

function CivBraid({
  civ,
  position,
  isSelected,
  onSelect,
}: {
  civ: Civilization;
  position: [number, number, number];
  isSelected: boolean;
  onSelect: () => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const [hoveredStrand, setHoveredStrand] = useState<number | null>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = clock.getElapsedTime() * 0.12;
  });

  const strands = useMemo(
    () =>
      MAGIC_KEYS.map((_, i) =>
        generateStrandPoints(i, civ.magicProfile, SEGMENTS, BRAID_HEIGHT)
      ),
    [civ.magicProfile]
  );

  const greenWraps = useMemo(
    () => generateGreenWraps(SEGMENTS, BRAID_HEIGHT),
    []
  );

  const inventionYs = useMemo(() => generateInventionMarkers(BRAID_HEIGHT), []);

  const phaseLabels = useMemo(() => {
    const labels: { y: number; label: string; color: string }[] = [];
    for (let c = 0; c < CYCLES; c++) {
      const phases = buildCyclePhases(c, CYCLES);
      for (const p of phases) {
        const centerT = (p.startT + p.endT) / 2;
        const y = (centerT - 0.5) * BRAID_HEIGHT;
        const colors = {
          discovery: "#eab30888",
          innovation: "#a855f788",
          invention: "#22c55e88",
        };
        labels.push({
          y,
          label: p.name.charAt(0).toUpperCase() + p.name.slice(1),
          color: colors[p.name],
        });
      }
    }
    return labels;
  }, []);

  return (
    <group
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      <group ref={groupRef}>
        {strands.map((points, i) => {
          const key = MAGIC_KEYS[i];
          return (
            <BraidStrand
              key={key}
              points={points}
              color={MAGIC_LABELS[key].color}
              weight={civ.magicProfile[key]}
              onHover={() => setHoveredStrand(i)}
              onUnhover={() => setHoveredStrand(null)}
              isHighlighted={hoveredStrand === i || isSelected}
            />
          );
        })}

        {greenWraps.map((pts, i) => (
          <GreenWrap key={i} points={pts} />
        ))}

        {inventionYs.map((y, i) => (
          <mesh key={i} position={[0, y, 0]}>
            <torusGeometry args={[0.22, 0.015, 8, 32]} />
            <meshStandardMaterial
              color="#22c55e"
              emissive="#22c55e"
              emissiveIntensity={0.6}
              transparent
              opacity={0.5}
            />
          </mesh>
        ))}
      </group>

      {isSelected &&
        phaseLabels.map((pl, i) => (
          <PhaseLabel key={i} y={pl.y} label={pl.label} color={pl.color} />
        ))}

      <mesh position={[0, -BRAID_HEIGHT / 2 - 0.15, 0]}>
        <cylinderGeometry args={[0.45, 0.45, 0.04, 32]} />
        <meshStandardMaterial
          color={civ.color}
          metalness={0.8}
          roughness={0.2}
          emissive={civ.color}
          emissiveIntensity={isSelected ? 0.3 : 0.05}
        />
      </mesh>

      <Text
        position={[0, -BRAID_HEIGHT / 2 - 0.5, 0]}
        fontSize={0.28}
        color={civ.color}
        anchorX="center"
        anchorY="middle"
        font="https://fonts.gstatic.com/s/inter/v13/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2"
      >
        {civ.shortName}
      </Text>

      {hoveredStrand !== null && (
        <Html position={[0.6, 0, 0]} center style={{ pointerEvents: "none" }}>
          <div className="bg-black/90 backdrop-blur-md border border-white/20 rounded-lg px-3 py-2 whitespace-nowrap shadow-xl">
            <p className="text-white text-xs font-medium">
              {MAGIC_LABELS[MAGIC_KEYS[hoveredStrand]].name}
            </p>
            <p className="text-white/50 text-[10px]">
              Weight: {civ.magicProfile[MAGIC_KEYS[hoveredStrand]].toFixed(2)}
            </p>
          </div>
        </Html>
      )}
    </group>
  );
}

function Scene({
  selectedCiv,
  onSelectCiv,
}: {
  selectedCiv: string | null;
  onSelectCiv: (id: string | null) => void;
}) {
  const spacing = 3.2;
  const totalWidth = (CIVILIZATIONS.length - 1) * spacing;
  const startX = -totalWidth / 2;

  return (
    <>
      <color attach="background" args={["#030308"]} />
      <fog attach="fog" args={["#030308", 20, 50]} />
      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 15, 10]} intensity={1.2} />
      <pointLight position={[-5, 5, 5]} intensity={0.6} color="#eab308" />
      <pointLight position={[5, -5, 5]} intensity={0.4} color="#6366f1" />
      <pointLight position={[0, 0, -5]} intensity={0.3} color="#22c55e" />

      {CIVILIZATIONS.map((civ, i) => (
        <CivBraid
          key={civ.id}
          civ={civ}
          position={[startX + i * spacing, 0, 0]}
          isSelected={selectedCiv === civ.id}
          onSelect={() => onSelectCiv(selectedCiv === civ.id ? null : civ.id)}
        />
      ))}

      <OrbitControls
        enablePan
        enableZoom
        enableRotate
        maxDistance={35}
        minDistance={3}
        maxPolarAngle={Math.PI * 0.85}
        minPolarAngle={0.15}
      />
    </>
  );
}

export default function BraidScene({
  selectedCiv,
  onSelectCiv,
}: {
  selectedCiv: string | null;
  onSelectCiv: (id: string | null) => void;
}) {
  return (
    <div className="w-full h-full absolute inset-0">
      <Canvas
        shadows
        camera={{ position: [0, 2, 18], fov: 50 }}
        onPointerMissed={() => onSelectCiv(null)}
      >
        <Scene selectedCiv={selectedCiv} onSelectCiv={onSelectCiv} />
      </Canvas>
    </div>
  );
}
