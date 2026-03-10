import React, { useMemo, useRef } from "react";
import { createRoot } from "react-dom/client";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const mountNode = document.getElementById("hero-gradient-react");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const palette = {
  accent: "#f3f7ff",
  mist: "#cfd8ef",
  shadow: "#95a4c9",
  stone: "#d9e1f2",
  stoneDark: "#b7c3de",
};

function useHeroMaterials() {
  return useMemo(
    () => ({
      accent: new THREE.MeshStandardMaterial({
        color: palette.accent,
        roughness: 0.92,
        metalness: 0.02,
      }),
      mist: new THREE.MeshStandardMaterial({
        color: palette.mist,
        roughness: 1,
        metalness: 0,
        transparent: true,
        opacity: 0.26,
      }),
      shadow: new THREE.MeshBasicMaterial({
        color: palette.shadow,
        transparent: true,
        opacity: 0.15,
        depthWrite: false,
      }),
      stone: new THREE.MeshStandardMaterial({
        color: palette.stone,
        roughness: 0.94,
        metalness: 0.03,
      }),
      stoneDark: new THREE.MeshStandardMaterial({
        color: palette.stoneDark,
        roughness: 0.96,
        metalness: 0.02,
      }),
    }),
    [],
  );
}

function SoftShadow({ position, scale, rotation = [-Math.PI / 2, 0, 0] }) {
  const materials = useHeroMaterials();

  return (
    <mesh position={position} rotation={rotation} scale={scale} material={materials.shadow}>
      <circleGeometry args={[1, 48]} />
    </mesh>
  );
}

function CloudCluster({ position, scale = 1, phase = 0 }) {
  const ref = useRef(null);
  const materials = useHeroMaterials();

  useFrame((state) => {
    if (!ref.current || prefersReducedMotion) return;
    const t = state.clock.elapsedTime * 0.22 + phase;
    ref.current.position.y = position[1] + Math.sin(t) * 0.18;
    ref.current.position.x = position[0] + Math.cos(t * 0.9) * 0.22;
  });

  return (
    <group ref={ref} position={position} scale={scale}>
      <mesh position={[-1.1, 0, 0]} material={materials.mist}>
        <sphereGeometry args={[0.86, 18, 18]} />
      </mesh>
      <mesh position={[0, 0.16, 0]} material={materials.mist}>
        <sphereGeometry args={[1.08, 18, 18]} />
      </mesh>
      <mesh position={[1.1, 0.02, 0]} material={materials.mist}>
        <sphereGeometry args={[0.78, 18, 18]} />
      </mesh>
      <mesh position={[0, -0.22, 0]} scale={[2.7, 0.48, 1.4]} material={materials.mist}>
        <sphereGeometry args={[0.72, 18, 18]} />
      </mesh>
    </group>
  );
}

function Bird({ radius, height, speed, phase, tilt }) {
  const ref = useRef(null);
  const leftWing = useRef(null);
  const rightWing = useRef(null);
  const materials = useHeroMaterials();

  useFrame((state) => {
    if (!ref.current || !leftWing.current || !rightWing.current) return;

    const t = state.clock.elapsedTime * speed + phase;
    const flap = prefersReducedMotion ? 0.28 : Math.sin(state.clock.elapsedTime * 12 + phase) * 0.52;

    ref.current.position.set(
      Math.cos(t) * radius,
      height + Math.sin(t * 1.9) * 0.24,
      Math.sin(t * 0.94) * radius * 0.6,
    );
    ref.current.rotation.y = -t + tilt;
    ref.current.rotation.z = Math.sin(t * 0.7) * 0.08;

    leftWing.current.rotation.z = flap;
    rightWing.current.rotation.z = -flap;
  });

  return (
    <group ref={ref} scale={0.26}>
      <mesh material={materials.accent}>
        <sphereGeometry args={[0.14, 12, 12]} />
      </mesh>
      <mesh ref={leftWing} position={[-0.26, 0, 0]} material={materials.accent}>
        <boxGeometry args={[0.44, 0.05, 0.14]} />
      </mesh>
      <mesh ref={rightWing} position={[0.26, 0, 0]} material={materials.accent}>
        <boxGeometry args={[0.44, 0.05, 0.14]} />
      </mesh>
    </group>
  );
}

function ColumnRow({ count, start, gap, position, rotation = [0, 0, 0] }) {
  const materials = useHeroMaterials();

  return (
    <group position={position} rotation={rotation}>
      {Array.from({ length: count }).map((_, index) => (
        <mesh key={index} position={[start + gap * index, 0, 0]} material={materials.accent}>
          <cylinderGeometry args={[0.13, 0.15, 1.8, 16]} />
        </mesh>
      ))}
    </group>
  );
}

function CathedralModel() {
  const ref = useRef(null);
  const materials = useHeroMaterials();

  useFrame((state) => {
    if (!ref.current || prefersReducedMotion) return;
    ref.current.rotation.y = Math.PI / 4 + Math.sin(state.clock.elapsedTime * 0.18) * 0.05;
    ref.current.position.y = -1.18 + Math.sin(state.clock.elapsedTime * 0.42) * 0.08;
  });

  const domePositions = [
    [-2.55, 2.95, -2.9],
    [2.55, 2.95, -2.9],
    [-2.55, 2.95, 2.9],
    [2.55, 2.95, 2.9],
  ];

  return (
    <group ref={ref} position={[2.8, -1.18, 0]} rotation={[0, Math.PI / 4, 0]} scale={1.08}>
      <SoftShadow position={[0, -1.63, 0]} scale={[8.3, 1, 6.2]} />

      <mesh position={[0, -1.08, 0]} material={materials.stoneDark}>
        <boxGeometry args={[11.4, 0.34, 13.8]} />
      </mesh>
      <mesh position={[0, -0.7, 0]} material={materials.stone}>
        <boxGeometry args={[10.4, 0.42, 12.6]} />
      </mesh>

      <mesh position={[0, 1.05, 0]} material={materials.stone}>
        <boxGeometry args={[7.8, 3.06, 9.3]} />
      </mesh>

      <mesh position={[0, 2.95, 0]} material={materials.stoneDark}>
        <cylinderGeometry args={[2.26, 2.56, 1.5, 32]} />
      </mesh>
      <mesh position={[0, 4.1, 0]} material={materials.accent}>
        <sphereGeometry args={[2.55, 32, 24, 0, Math.PI * 2, 0, Math.PI / 1.86]} />
      </mesh>
      <mesh position={[0, 5.82, 0]} material={materials.stoneDark}>
        <cylinderGeometry args={[0.5, 0.72, 0.82, 18]} />
      </mesh>
      <mesh position={[0, 6.42, 0]} material={materials.accent}>
        <coneGeometry args={[0.34, 0.66, 12]} />
      </mesh>

      {domePositions.map((position, index) => (
        <group key={index} position={position}>
          <mesh material={materials.stoneDark}>
            <cylinderGeometry args={[0.56, 0.68, 0.82, 16]} />
          </mesh>
          <mesh position={[0, 0.58, 0]} material={materials.accent}>
            <sphereGeometry args={[0.78, 18, 18, 0, Math.PI * 2, 0, Math.PI / 1.9]} />
          </mesh>
          <mesh position={[0, 1.24, 0]} material={materials.accent}>
            <coneGeometry args={[0.11, 0.36, 10]} />
          </mesh>
        </group>
      ))}

      <mesh position={[0, 0.66, 5.72]} material={materials.stoneDark}>
        <boxGeometry args={[6.6, 2.06, 1.82]} />
      </mesh>
      <mesh position={[0, 1.85, 6.16]} material={materials.stone}>
        <boxGeometry args={[7.18, 0.36, 2.54]} />
      </mesh>
      <mesh position={[0, -0.22, 6.9]} material={materials.stone}>
        <boxGeometry args={[4.8, 0.52, 1.12]} />
      </mesh>
      <ColumnRow count={8} start={-2.45} gap={0.7} position={[0, 0.3, 6.56]} />

      <mesh position={[0, 0.66, -5.72]} material={materials.stoneDark}>
        <boxGeometry args={[6.6, 2.06, 1.82]} />
      </mesh>
      <mesh position={[0, 1.85, -6.16]} material={materials.stone}>
        <boxGeometry args={[7.18, 0.36, 2.54]} />
      </mesh>
      <ColumnRow count={8} start={-2.45} gap={0.7} position={[0, 0.3, -6.56]} />

      <mesh position={[4.72, 0.72, 0]} material={materials.stoneDark}>
        <boxGeometry args={[1.78, 2.24, 6.24]} />
      </mesh>
      <mesh position={[5.14, 1.96, 0]} material={materials.stone}>
        <boxGeometry args={[2.56, 0.34, 7.1]} />
      </mesh>
      <ColumnRow count={6} start={-1.76} gap={0.7} position={[5.62, 0.28, 0]} rotation={[0, Math.PI / 2, 0]} />

      <mesh position={[-4.72, 0.72, 0]} material={materials.stoneDark}>
        <boxGeometry args={[1.78, 2.24, 6.24]} />
      </mesh>
      <mesh position={[-5.14, 1.96, 0]} material={materials.stone}>
        <boxGeometry args={[2.56, 0.34, 7.1]} />
      </mesh>
      <ColumnRow count={6} start={-1.76} gap={0.7} position={[-5.62, 0.28, 0]} rotation={[0, Math.PI / 2, 0]} />

      <mesh position={[0, -0.46, 7.76]} material={materials.accent}>
        <boxGeometry args={[3.2, 0.18, 0.76]} />
      </mesh>
      <mesh position={[0, -0.6, -7.76]} material={materials.accent}>
        <boxGeometry args={[3.2, 0.18, 0.76]} />
      </mesh>

      <mesh position={[7.42, -0.88, 3.38]} rotation={[0, 0.22, 0]} material={materials.stoneDark}>
        <boxGeometry args={[1.76, 1.38, 2.6]} />
      </mesh>
      <mesh position={[-7.32, -0.88, -2.86]} rotation={[0, -0.18, 0]} material={materials.stoneDark}>
        <boxGeometry args={[1.46, 1.12, 2.24]} />
      </mesh>
    </group>
  );
}

function HeroScene() {
  return (
    <>
      <color attach="background" args={["#060a12"]} />
      <fog attach="fog" args={["#08101b", 14, 34]} />
      <ambientLight intensity={1.5} color="#dbe7ff" />
      <directionalLight position={[10, 14, 8]} intensity={2.8} color="#ffffff" />
      <directionalLight position={[-8, 6, -10]} intensity={1.2} color="#6f8fd8" />

      <group position={[0, -2.5, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
          <planeGeometry args={[42, 42]} />
          <meshStandardMaterial color="#0b1422" roughness={1} metalness={0} />
        </mesh>
        <SoftShadow position={[5.6, 0.02, 1.2]} scale={[13, 1, 9]} />
      </group>

      <CloudCluster position={[10.4, 5.8, -3]} scale={1.16} phase={0.1} />
      <CloudCluster position={[6.8, 8.2, 2.4]} scale={0.78} phase={1.4} />
      <CloudCluster position={[12.8, 3.8, 4.6]} scale={0.64} phase={2.1} />

      <group position={[4.4, 2.8, 0]}>
        <Bird radius={7.8} height={4.6} speed={0.28} phase={0.1} tilt={0.4} />
        <Bird radius={6.9} height={5.4} speed={0.34} phase={1.9} tilt={0.9} />
        <Bird radius={8.7} height={6} speed={0.24} phase={3.6} tilt={1.1} />
        <Bird radius={7.1} height={4.9} speed={0.31} phase={4.5} tilt={-0.2} />
        <Bird radius={8.1} height={5.8} speed={0.27} phase={5.4} tilt={0.6} />
      </group>

      <CathedralModel />
    </>
  );
}

if (mountNode) {
  const root = createRoot(mountNode);

  root.render(
    <Canvas
      className="hero-canvas-isaac"
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
      orthographic
      camera={{ position: [16, 12, 16], zoom: 44, near: 0.1, far: 100 }}
    >
      <HeroScene />
    </Canvas>,
  );
}
