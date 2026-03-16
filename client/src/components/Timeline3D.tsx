import React, { useRef, useState, useMemo, useEffect } from "react";
import {
  Canvas,
  useFrame,
  useThree,
  ThreeEvent,
} from "@react-three/fiber";
import {
  Text,
  useTexture,
  Float,
  Html,
  OrbitControls,
} from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";
import { artifacts, sortedArtifacts, ERAS, Artifact } from "@/lib/artifacts";

interface Timeline3DProps {
  onSelectArtifact: (artifact: Artifact | null) => void;
  selectedId: string | null;
  filterCategory: string | null;
  filterEra: string | null;
  searchQuery: string;
}

const YEAR_SCALE = 0.003;
const YEAR_MIN = -6000;
const YEAR_MAX = 0;

function yearToX(year: number) {
  return (year - YEAR_MIN) * YEAR_SCALE * 10;
}

const GlowRing = ({
  color,
  radius,
  pulse,
}: {
  color: string;
  radius: number;
  pulse: boolean;
}) => {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current && pulse) {
      const s = 1 + Math.sin(clock.getElapsedTime() * 3) * 0.08;
      ref.current.scale.setScalar(s);
    }
  });
  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[radius - 0.02, radius + 0.02, 32]} />
      <meshBasicMaterial color={color} transparent opacity={0.7} />
    </mesh>
  );
};

const ArtifactNodeInner = ({
  artifact,
  position,
  isSelected,
  isFiltered,
  onClick,
  index,
}: {
  artifact: Artifact;
  position: [number, number, number];
  isSelected: boolean;
  isFiltered: boolean;
  onClick: () => void;
  index: number;
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const texture = useTexture(artifact.image);

  const staggerY = index % 2 === 0 ? 0.8 : 2.2;

  useFrame(() => {
    if (!groupRef.current) return;
    const targetY = isSelected ? staggerY + 0.6 : staggerY;
    const targetScale = isSelected ? 1.4 : hovered ? 1.15 : 1;
    const opacity = isFiltered ? 1 : 0.15;

    groupRef.current.position.y = THREE.MathUtils.lerp(
      groupRef.current.position.y,
      targetY,
      0.08
    );
    groupRef.current.scale.setScalar(
      THREE.MathUtils.lerp(groupRef.current.scale.x, targetScale, 0.1)
    );

    const mat = (groupRef.current.children[0] as THREE.Mesh)
      ?.material as THREE.MeshStandardMaterial;
    if (mat?.opacity !== undefined) {
      mat.opacity = THREE.MathUtils.lerp(mat.opacity, opacity, 0.1);
    }
  });

  const yearLabel =
    artifact.year < 0
      ? `${Math.abs(artifact.year)} BCE`
      : `${artifact.year} CE`;

  return (
    <group position={[position[0], 0, position[2]]}>
      <Float
        speed={1.5}
        rotationIntensity={0.05}
        floatIntensity={isSelected ? 0.3 : 0.15}
      >
        <group
          ref={groupRef}
          onClick={(e: ThreeEvent<MouseEvent>) => {
            e.stopPropagation();
            onClick();
          }}
          onPointerEnter={() => {
            setHovered(true);
            document.body.style.cursor = "pointer";
          }}
          onPointerLeave={() => {
            setHovered(false);
            document.body.style.cursor = "auto";
          }}
        >
          <mesh castShadow>
            <cylinderGeometry args={[0.55, 0.55, 0.08, 32]} />
            <meshStandardMaterial
              color={isSelected ? "#eab308" : hovered ? "#d4a017" : "#1a1a2e"}
              metalness={0.85}
              roughness={0.15}
              transparent
              opacity={1}
              emissive={isSelected ? "#eab308" : "#000000"}
              emissiveIntensity={isSelected ? 0.3 : 0}
            />
          </mesh>

          <mesh
            position={[0, 0.045, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <circleGeometry args={[0.48, 32]} />
            <meshBasicMaterial map={texture} transparent />
          </mesh>

          {isSelected && (
            <GlowRing color="#eab308" radius={0.7} pulse />
          )}
          {hovered && !isSelected && (
            <GlowRing color="#d4a017" radius={0.65} pulse={false} />
          )}
        </group>
      </Float>

      <mesh
        position={[0, 0.05, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <circleGeometry args={[0.03, 8]} />
        <meshBasicMaterial color="#eab308" />
      </mesh>
      <mesh position={[0, staggerY * 0.4, 0]}>
        <cylinderGeometry args={[0.005, 0.005, staggerY * 0.6, 4]} />
        <meshBasicMaterial color="#eab30844" transparent opacity={0.3} />
      </mesh>

      <Text
        position={[0, -0.3, 0]}
        fontSize={0.15}
        color={isSelected ? "#eab308" : "#888"}
        anchorX="center"
        anchorY="middle"
        font="https://fonts.gstatic.com/s/inter/v13/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2"
      >
        {yearLabel}
      </Text>

      {(isSelected || hovered) && (
        <Html
          position={[0, staggerY + 1.2, 0]}
          center
          distanceFactor={8}
          style={{ pointerEvents: "none" }}
        >
          <div className="bg-black/90 backdrop-blur-md border border-white/10 rounded-lg px-4 py-2.5 whitespace-nowrap shadow-xl">
            <p className="text-white text-sm font-medium leading-tight">
              {artifact.name}
            </p>
            <p className="text-white/50 text-[11px] mt-0.5">
              {artifact.location}
            </p>
          </div>
        </Html>
      )}
    </group>
  );
};

const ArtifactNode = (props: {
  artifact: Artifact;
  position: [number, number, number];
  isSelected: boolean;
  isFiltered: boolean;
  onClick: () => void;
  index: number;
}) => {
  return (
    <React.Suspense fallback={null}>
      <ArtifactNodeInner {...props} />
    </React.Suspense>
  );
};

const TimelineAxis = () => {
  const points = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let y = YEAR_MIN; y <= YEAR_MAX; y += 100) {
      pts.push(new THREE.Vector3(yearToX(y), 0, 0));
    }
    return pts;
  }, []);

  const curve = useMemo(() => new THREE.CatmullRomCurve3(points), [points]);

  const tickMarks = useMemo(() => {
    const ticks: { x: number; label: string; major: boolean }[] = [];
    for (let y = -6000; y <= 0; y += 500) {
      ticks.push({
        x: yearToX(y),
        label: y === 0 ? "0" : `${Math.abs(y)}`,
        major: y % 1000 === 0,
      });
    }
    return ticks;
  }, []);

  return (
    <group>
      <mesh>
        <tubeGeometry args={[curve, 128, 0.015, 8, false]} />
        <meshStandardMaterial
          color="#333"
          metalness={0.9}
          roughness={0.5}
        />
      </mesh>

      {tickMarks.map((tick) => (
        <group key={tick.x} position={[tick.x, 0, 0]}>
          <mesh>
            <boxGeometry
              args={[0.005, tick.major ? 0.15 : 0.08, 0.005]}
            />
            <meshBasicMaterial
              color={tick.major ? "#555" : "#333"}
            />
          </mesh>
          {tick.major && (
            <Text
              position={[0, -0.2, 0]}
              fontSize={0.1}
              color="#555"
              anchorX="center"
              font="https://fonts.gstatic.com/s/inter/v13/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2"
            >
              {tick.label}
            </Text>
          )}
        </group>
      ))}
    </group>
  );
};

const EraMarkers = ({ filterEra }: { filterEra: string | null }) => {
  return (
    <group position={[0, -0.02, 0.6]}>
      {ERAS.map((era) => {
        const x1 = yearToX(era.start);
        const x2 = yearToX(era.end);
        const width = x2 - x1;
        const cx = x1 + width / 2;
        const isActive = !filterEra || filterEra === era.id;

        return (
          <group key={era.id}>
            <mesh position={[cx, 0, 0]}>
              <boxGeometry args={[width, 0.02, 0.3]} />
              <meshStandardMaterial
                color={era.color}
                transparent
                opacity={isActive ? 0.35 : 0.08}
                metalness={0.5}
                roughness={0.6}
              />
            </mesh>
            <Text
              position={[cx, 0.02, 0.25]}
              fontSize={0.06}
              color={era.color}
              anchorX="center"
              font="https://fonts.gstatic.com/s/inter/v13/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2"
              maxWidth={width * 0.9}
            >
              {era.name}
            </Text>
          </group>
        );
      })}
    </group>
  );
};

const ParticleField = () => {
  const ref = useRef<THREE.Points>(null);
  const count = 300;
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.3) * 50;
      arr[i * 3 + 1] = Math.random() * 8 - 1;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 15;
    }
    geo.setAttribute("position", new THREE.BufferAttribute(arr, 3));
    return geo;
  }, []);

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.getElapsedTime() * 0.005;
    }
  });

  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial
        color="#eab308"
        size={0.02}
        transparent
        opacity={0.3}
        sizeAttenuation
      />
    </points>
  );
};

const CameraController = ({
  selectedId,
}: {
  selectedId: string | null;
}) => {
  const controlsRef = useRef<OrbitControlsImpl>(null);

  useFrame(() => {
    if (!controlsRef.current) return;
    const controls = controlsRef.current;

    if (selectedId) {
      const artifact = artifacts.find((a) => a.id === selectedId);
      if (artifact) {
        const targetX = yearToX(artifact.year);

        controls.object.position.x = THREE.MathUtils.lerp(
          controls.object.position.x,
          targetX,
          0.04
        );
        controls.object.position.y = THREE.MathUtils.lerp(
          controls.object.position.y,
          3.5,
          0.04
        );
        controls.object.position.z = THREE.MathUtils.lerp(
          controls.object.position.z,
          5,
          0.04
        );

        controls.target.x = THREE.MathUtils.lerp(
          controls.target.x,
          targetX,
          0.04
        );
        controls.target.y = THREE.MathUtils.lerp(
          controls.target.y,
          1,
          0.04
        );
        controls.target.z = THREE.MathUtils.lerp(
          controls.target.z,
          0,
          0.04
        );

        controls.update();
      }
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan
      enableZoom
      enableRotate
      maxPolarAngle={Math.PI / 2.2}
      minPolarAngle={0.3}
      minDistance={2}
      maxDistance={25}
      panSpeed={1.5}
      zoomSpeed={1.2}
    />
  );
};

const Scene = ({
  onSelectArtifact,
  selectedId,
  filterCategory,
  filterEra,
  searchQuery,
}: Timeline3DProps) => {
  const filteredIds = useMemo(() => {
    const q = searchQuery.toLowerCase();
    const filtered = sortedArtifacts.filter((a) => {
      if (filterCategory && a.category !== filterCategory) return false;
      if (filterEra && a.era !== filterEra) return false;
      if (q) {
        return (
          a.name.toLowerCase().includes(q) ||
          a.location.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          a.id.toLowerCase().includes(q)
        );
      }
      return true;
    });
    return new Set(filtered.map((a) => a.id));
  }, [filterCategory, filterEra, searchQuery]);

  return (
    <>
      <color attach="background" args={["#060611"]} />
      <fog attach="fog" args={["#060611", 15, 40]} />
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1.5}
        castShadow
      />
      <pointLight
        position={[-5, 5, 5]}
        intensity={0.8}
        color="#eab308"
      />
      <pointLight
        position={[15, 3, -3]}
        intensity={0.5}
        color="#6366f1"
      />

      <TimelineAxis />
      <EraMarkers filterEra={filterEra} />
      <ParticleField />

      {sortedArtifacts.map((artifact, index) => (
        <ArtifactNode
          key={artifact.id}
          artifact={artifact}
          position={[yearToX(artifact.year), 0, 0]}
          isSelected={selectedId === artifact.id}
          isFiltered={filteredIds.has(artifact.id)}
          onClick={() =>
            onSelectArtifact(
              selectedId === artifact.id ? null : artifact
            )
          }
          index={index}
        />
      ))}

      <CameraController selectedId={selectedId} />
    </>
  );
};

export default function Timeline3D(props: Timeline3DProps) {
  return (
    <div className="w-full h-full absolute inset-0 z-0">
      <Canvas
        shadows
        camera={{ position: [yearToX(-3500), 5, 10], fov: 45 }}
        onPointerMissed={() => props.onSelectArtifact(null)}
      >
        <Scene {...props} />
      </Canvas>
    </div>
  );
}
