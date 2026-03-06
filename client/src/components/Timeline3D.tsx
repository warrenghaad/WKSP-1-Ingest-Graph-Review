import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Text, useTexture, Float, ContactShadows, Html, PresentationControls } from '@react-three/drei';
import * as THREE from 'three';
import { artifacts, Artifact } from '@/lib/artifacts';

interface Timeline3DProps {
  onSelectArtifact: (artifact: Artifact | null) => void;
  selectedId: string | null;
}

const ArtifactNode = ({ 
  artifact, 
  position, 
  isSelected, 
  onClick 
}: { 
  artifact: Artifact; 
  position: [number, number, number]; 
  isSelected: boolean; 
  onClick: () => void 
}) => {
  const meshRef = useRef<THREE.Group>(null);
  const texture = useTexture(artifact.image);
  
  // Animation for selected state
  useFrame((state) => {
    if (meshRef.current) {
      if (isSelected) {
        meshRef.current.rotation.y += 0.01;
        meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, position[1] + 1, 0.1);
        meshRef.current.scale.setScalar(THREE.MathUtils.lerp(meshRef.current.scale.x, 1.5, 0.1));
      } else {
        meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, 0, 0.1);
        meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, position[1], 0.1);
        meshRef.current.scale.setScalar(THREE.MathUtils.lerp(meshRef.current.scale.x, 1, 0.1));
      }
    }
  });

  return (
    <group position={position}>
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
        <group ref={meshRef} onClick={(e) => { e.stopPropagation(); onClick(); }}>
          <mesh castShadow receiveShadow>
            <cylinderGeometry args={[1, 1, 0.1, 32]} />
            <meshStandardMaterial color={isSelected ? "#eab308" : "#2a2a2a"} metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.9, 32]} />
            <meshBasicMaterial map={texture} transparent alphaTest={0.5} />
          </mesh>
        </group>
      </Float>

      <Text
        position={[0, -1.2, 0]}
        fontSize={0.3}
        color={isSelected ? "#eab308" : "#ffffff"}
        anchorX="center"
        anchorY="middle"
        font="https://fonts.gstatic.com/s/playfairdisplay/v30/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKdFvXDXbtM.woff"
      >
        {artifact.year < 0 ? `${Math.abs(artifact.year)} BCE` : `${artifact.year} CE`}
      </Text>
      <Text
        position={[0, -1.6, 0]}
        fontSize={0.2}
        color="#a1a1aa"
        anchorX="center"
        anchorY="middle"
        font="https://fonts.gstatic.com/s/inter/v13/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2"
      >
        {artifact.name}
      </Text>
    </group>
  );
};

const TimelinePath = ({ artifactsList }: { artifactsList: Artifact[] }) => {
  const linePoints = useMemo(() => {
    return artifactsList.map((_, i) => new THREE.Vector3((i - artifactsList.length/2) * 5, 0, 0));
  }, [artifactsList]);

  const curve = useMemo(() => new THREE.CatmullRomCurve3(linePoints), [linePoints]);

  return (
    <group>
      <mesh>
        <tubeGeometry args={[curve, 64, 0.05, 8, false]} />
        <meshStandardMaterial color="#444" metalness={0.9} roughness={0.5} />
      </mesh>
    </group>
  );
};

const Scene = ({ onSelectArtifact, selectedId }: Timeline3DProps) => {
  const { camera } = useThree();
  
  useFrame(() => {
    // Smooth camera movement based on selection
    if (selectedId) {
      const index = artifacts.findIndex(a => a.id === selectedId);
      const targetX = (index - artifacts.length / 2) * 5;
      camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, 0.05);
      camera.position.z = THREE.MathUtils.lerp(camera.position.z, 6, 0.05);
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, 3, 0.05);
      camera.lookAt(targetX, 0, 0);
    } else {
      camera.position.x = THREE.MathUtils.lerp(camera.position.x, 0, 0.02);
      camera.position.z = THREE.MathUtils.lerp(camera.position.z, 15, 0.02);
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, 8, 0.02);
      camera.lookAt(0, 0, 0);
    }
  });

  return (
    <>
      <color attach="background" args={['#09090b']} />
      <fog attach="fog" args={['#09090b', 10, 30]} />
      <ambientLight intensity={0.5} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} castShadow />
      <pointLight position={[-10, -10, -10]} intensity={1} color="#eab308" />

      <TimelinePath artifactsList={artifacts} />

      {artifacts.map((artifact, index) => (
        <ArtifactNode
          key={artifact.id}
          artifact={artifact}
          position={[(index - artifacts.length / 2) * 5, 0, 0]}
          isSelected={selectedId === artifact.id}
          onClick={() => onSelectArtifact(selectedId === artifact.id ? null : artifact)}
        />
      ))}

      <ContactShadows position={[0, -2, 0]} opacity={0.4} scale={50} blur={2} far={10} />
      <Environment preset="city" />
    </>
  );
};

export default function Timeline3D(props: Timeline3DProps) {
  return (
    <div className="w-full h-full absolute inset-0 z-0">
      <Canvas shadows camera={{ position: [0, 8, 15], fov: 45 }}>
        <PresentationControls
          global
          config={{ mass: 2, tension: 500 }}
          snap={{ mass: 4, tension: 1500 }}
          rotation={[0, 0, 0]}
          polar={[-Math.PI / 3, Math.PI / 3]}
          azimuth={[-Math.PI / 1.4, Math.PI / 2]}
        >
          <Scene {...props} />
        </PresentationControls>
      </Canvas>
    </div>
  );
}