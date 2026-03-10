import React, { useMemo, useRef } from "react";
import { createRoot } from "react-dom/client";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const mountNode = document.getElementById("hero-gradient-react");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const palette = {
  accent: "#fbfaf6",
  stone: "#f1eee7",
  stoneSoft: "#dfd9cd",
  shadow: "#b6b8c4",
  gold: "#d9b86a",
  goldSoft: "#f2deb0",
  tree: "#ebe7df",
};

function useHeroMaterials() {
  return useMemo(
    () => ({
      accent: new THREE.MeshStandardMaterial({
        color: palette.accent,
        roughness: 0.9,
        metalness: 0,
      }),
      stone: new THREE.MeshStandardMaterial({
        color: palette.stone,
        roughness: 0.95,
        metalness: 0.02,
      }),
      stoneSoft: new THREE.MeshStandardMaterial({
        color: palette.stoneSoft,
        roughness: 0.98,
        metalness: 0,
      }),
      gold: new THREE.MeshStandardMaterial({
        color: palette.gold,
        emissive: palette.goldSoft,
        emissiveIntensity: 0.08,
        roughness: 0.4,
        metalness: 0.48,
      }),
      tree: new THREE.MeshStandardMaterial({
        color: palette.tree,
        roughness: 1,
        metalness: 0,
      }),
      shadow: new THREE.MeshBasicMaterial({
        color: palette.shadow,
        transparent: true,
        opacity: 0.14,
        depthWrite: false,
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

function Bird({ radius, height, speed, phase, center }) {
  const ref = useRef(null);
  const leftWing = useRef(null);
  const rightWing = useRef(null);
  const materials = useHeroMaterials();

  useFrame((state) => {
    if (!ref.current || !leftWing.current || !rightWing.current) return;

    const t = state.clock.elapsedTime * speed + phase;
    const flap = prefersReducedMotion ? 0.28 : Math.sin(state.clock.elapsedTime * 10 + phase) * 0.5;

    ref.current.position.set(
      center[0] + Math.cos(t) * radius,
      center[1] + height + Math.sin(t * 1.6) * 0.18,
      center[2] + Math.sin(t * 0.92) * radius * 0.52,
    );
    ref.current.rotation.y = -t + Math.PI / 2;
    ref.current.rotation.z = Math.sin(t * 0.7) * 0.09;

    leftWing.current.rotation.z = flap;
    rightWing.current.rotation.z = -flap;
  });

  return (
    <group ref={ref} scale={0.18}>
      <mesh material={materials.stoneSoft}>
        <sphereGeometry args={[0.16, 10, 10]} />
      </mesh>
      <mesh ref={leftWing} position={[-0.28, 0, 0]} material={materials.stoneSoft}>
        <boxGeometry args={[0.48, 0.05, 0.12]} />
      </mesh>
      <mesh ref={rightWing} position={[0.28, 0, 0]} material={materials.stoneSoft}>
        <boxGeometry args={[0.48, 0.05, 0.12]} />
      </mesh>
    </group>
  );
}

function Tree({ position, scale = 1 }) {
  const materials = useHeroMaterials();

  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.24, 0]} material={materials.tree}>
        <cylinderGeometry args={[0.06, 0.08, 0.52, 8]} />
      </mesh>
      <mesh position={[0, 0.72, 0]} material={materials.tree}>
        <sphereGeometry args={[0.32, 14, 14]} />
      </mesh>
      <mesh position={[-0.15, 0.66, 0]} material={materials.tree}>
        <sphereGeometry args={[0.22, 12, 12]} />
      </mesh>
      <mesh position={[0.16, 0.63, 0.08]} material={materials.tree}>
        <sphereGeometry args={[0.2, 12, 12]} />
      </mesh>
    </group>
  );
}

function CityBlock({ position, size, rotation = 0, tall = false }) {
  const materials = useHeroMaterials();

  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, size[1] * 0.5, 0]} material={materials.accent}>
        <boxGeometry args={size} />
      </mesh>
      <mesh position={[0, size[1] + 0.14, 0]} material={materials.stone}>
        <boxGeometry args={[size[0] * 0.84, 0.2, size[2] * 0.84]} />
      </mesh>
      {tall ? (
        <mesh position={[0, size[1] + 0.48, 0]} material={materials.stoneSoft}>
          <boxGeometry args={[size[0] * 0.58, 0.5, size[2] * 0.58]} />
        </mesh>
      ) : null}
    </group>
  );
}

function ColumnRow({ count, start, gap, position, rotation = [0, 0, 0], height = 1.9 }) {
  const materials = useHeroMaterials();

  return (
    <group position={position} rotation={rotation}>
      {Array.from({ length: count }).map((_, index) => (
        <mesh key={index} position={[start + gap * index, 0, 0]} material={materials.accent}>
          <cylinderGeometry args={[0.11, 0.13, height, 14]} />
        </mesh>
      ))}
    </group>
  );
}

function SmallDome({ position }) {
  const materials = useHeroMaterials();

  return (
    <group position={position}>
      <mesh material={materials.stone}>
        <cylinderGeometry args={[0.6, 0.72, 1.02, 18]} />
      </mesh>
      <mesh position={[0, 0.68, 0]} material={materials.gold}>
        <sphereGeometry args={[0.82, 18, 18, 0, Math.PI * 2, 0, Math.PI / 1.95]} />
      </mesh>
      <mesh position={[0, 1.38, 0]} material={materials.gold}>
        <cylinderGeometry args={[0.03, 0.03, 0.24, 6]} />
      </mesh>
      <mesh position={[0, 1.54, 0]} material={materials.gold}>
        <boxGeometry args={[0.16, 0.03, 0.03]} />
      </mesh>
      <mesh position={[0, 1.54, 0]} rotation={[0, Math.PI / 2, 0]} material={materials.gold}>
        <boxGeometry args={[0.16, 0.03, 0.03]} />
      </mesh>
    </group>
  );
}

function CathedralModel() {
  const ref = useRef(null);
  const materials = useHeroMaterials();

  useFrame((state) => {
    if (!ref.current || prefersReducedMotion) return;
    ref.current.rotation.y = 0.72 + Math.sin(state.clock.elapsedTime * 0.16) * 0.025;
    ref.current.position.y = -1.02 + Math.sin(state.clock.elapsedTime * 0.36) * 0.04;
  });

  return (
    <group ref={ref} position={[2.2, -1.02, 0.1]} rotation={[0, 0.72, 0]} scale={1.08}>
      <SoftShadow position={[0.4, -1.42, 0.1]} scale={[8.8, 1, 7.2]} />

      <mesh position={[0, -1.08, 0]} material={materials.stoneSoft}>
        <boxGeometry args={[10.8, 0.28, 10.8]} />
      </mesh>
      <mesh position={[0, -0.82, 0]} material={materials.stone}>
        <boxGeometry args={[9.6, 0.24, 9.6]} />
      </mesh>
      <mesh position={[0, -0.58, 0]} material={materials.accent}>
        <boxGeometry args={[8.4, 0.22, 8.4]} />
      </mesh>

      <mesh position={[0, 0.76, 0]} material={materials.stone}>
        <boxGeometry args={[6.8, 2.5, 6.8]} />
      </mesh>
      <mesh position={[0, 2.32, 0]} material={materials.accent}>
        <cylinderGeometry args={[2.58, 2.86, 1.46, 28]} />
      </mesh>
      <mesh position={[0, 3.22, 0]} material={materials.stone}>
        <cylinderGeometry args={[2.18, 2.32, 0.64, 28]} />
      </mesh>
      <ColumnRow count={18} start={-1.84} gap={0.22} position={[0, 2.84, 2.18]} />
      <ColumnRow count={18} start={-1.84} gap={0.22} position={[0, 2.84, -2.18]} />
      <ColumnRow count={18} start={-1.84} gap={0.22} position={[2.18, 2.84, 0]} rotation={[0, Math.PI / 2, 0]} />
      <ColumnRow count={18} start={-1.84} gap={0.22} position={[-2.18, 2.84, 0]} rotation={[0, Math.PI / 2, 0]} />

      <mesh position={[0, 4.46, 0]} material={materials.gold}>
        <sphereGeometry args={[2.5, 34, 24, 0, Math.PI * 2, 0, Math.PI / 1.85]} />
      </mesh>
      <mesh position={[0, 6.02, 0]} material={materials.accent}>
        <cylinderGeometry args={[0.54, 0.68, 0.88, 16]} />
      </mesh>
      <mesh position={[0, 6.68, 0]} material={materials.gold}>
        <cylinderGeometry args={[0.04, 0.04, 0.34, 6]} />
      </mesh>
      <mesh position={[0, 6.9, 0]} material={materials.gold}>
        <boxGeometry args={[0.22, 0.04, 0.04]} />
      </mesh>
      <mesh position={[0, 6.9, 0]} rotation={[0, Math.PI / 2, 0]} material={materials.gold}>
        <boxGeometry args={[0.22, 0.04, 0.04]} />
      </mesh>

      <group position={[0, 0.14, 4.84]}>
        <mesh position={[0, 0.84, 0]} material={materials.stone}>
          <boxGeometry args={[5.2, 1.7, 1.92]} />
        </mesh>
        <mesh position={[0, 1.94, 0.22]} material={materials.accent}>
          <boxGeometry args={[5.74, 0.24, 2.3]} />
        </mesh>
        <ColumnRow count={10} start={-2.05} gap={0.46} position={[0, 0.4, 1.06]} height={1.4} />
        <mesh position={[0, 2.48, 0.86]} rotation={[0, Math.PI / 2, Math.PI / 2]} material={materials.stone}>
          <cylinderGeometry args={[0.96, 0.96, 5.7, 3]} />
        </mesh>
        <mesh position={[0, -0.22, 1.64]} material={materials.accent}>
          <boxGeometry args={[3.8, 0.18, 1.2]} />
        </mesh>
      </group>

      <group position={[0, 0.14, -4.84]} rotation={[0, Math.PI, 0]}>
        <mesh position={[0, 0.84, 0]} material={materials.stone}>
          <boxGeometry args={[5.2, 1.7, 1.92]} />
        </mesh>
        <mesh position={[0, 1.94, 0.22]} material={materials.accent}>
          <boxGeometry args={[5.74, 0.24, 2.3]} />
        </mesh>
        <ColumnRow count={10} start={-2.05} gap={0.46} position={[0, 0.4, 1.06]} height={1.4} />
        <mesh position={[0, 2.48, 0.86]} rotation={[0, Math.PI / 2, Math.PI / 2]} material={materials.stone}>
          <cylinderGeometry args={[0.96, 0.96, 5.7, 3]} />
        </mesh>
      </group>

      <group position={[4.84, 0.14, 0]} rotation={[0, Math.PI / 2, 0]}>
        <mesh position={[0, 0.84, 0]} material={materials.stone}>
          <boxGeometry args={[5.2, 1.7, 1.92]} />
        </mesh>
        <mesh position={[0, 1.94, 0.22]} material={materials.accent}>
          <boxGeometry args={[5.74, 0.24, 2.3]} />
        </mesh>
        <ColumnRow count={10} start={-2.05} gap={0.46} position={[0, 0.4, 1.06]} height={1.4} />
        <mesh position={[0, 2.48, 0.86]} rotation={[0, Math.PI / 2, Math.PI / 2]} material={materials.stone}>
          <cylinderGeometry args={[0.96, 0.96, 5.7, 3]} />
        </mesh>
      </group>

      <group position={[-4.84, 0.14, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <mesh position={[0, 0.84, 0]} material={materials.stone}>
          <boxGeometry args={[5.2, 1.7, 1.92]} />
        </mesh>
        <mesh position={[0, 1.94, 0.22]} material={materials.accent}>
          <boxGeometry args={[5.74, 0.24, 2.3]} />
        </mesh>
        <ColumnRow count={10} start={-2.05} gap={0.46} position={[0, 0.4, 1.06]} height={1.4} />
        <mesh position={[0, 2.48, 0.86]} rotation={[0, Math.PI / 2, Math.PI / 2]} material={materials.stone}>
          <cylinderGeometry args={[0.96, 0.96, 5.7, 3]} />
        </mesh>
      </group>

      <SmallDome position={[-3.16, 2.12, -3.16]} />
      <SmallDome position={[3.16, 2.12, -3.16]} />
      <SmallDome position={[-3.16, 2.12, 3.16]} />
      <SmallDome position={[3.16, 2.12, 3.16]} />
    </group>
  );
}

function HeroScene() {
  return (
    <>
      <ambientLight intensity={1.9} color="#fffdf7" />
      <directionalLight position={[10, 14, 8]} intensity={2.8} color="#fff8e8" />
      <directionalLight position={[-8, 7, -10]} intensity={1.1} color="#dbe5ff" />

      <group position={[0, -2.46, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
          <planeGeometry args={[40, 40]} />
          <meshStandardMaterial color="#f4f0e8" roughness={1} metalness={0} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
          <ringGeometry args={[7.8, 8.2, 48]} />
          <meshBasicMaterial color="#d7d3cb" transparent opacity={0.4} />
        </mesh>
      </group>

      <group position={[0, -2.44, 0]}>
        <CityBlock position={[-10.4, 0, -5.8]} size={[2.8, 1.9, 2.2]} rotation={0.18} tall />
        <CityBlock position={[-8.6, 0, -1.8]} size={[2.2, 1.4, 1.8]} rotation={-0.16} />
        <CityBlock position={[-11.2, 0, 2.2]} size={[2.5, 1.3, 2.1]} rotation={0.12} />
        <CityBlock position={[-7.4, 0, 4.8]} size={[1.9, 1.2, 1.6]} rotation={-0.18} />
        <CityBlock position={[9.8, 0, -6.2]} size={[2.6, 1.6, 2]} rotation={-0.14} />
        <CityBlock position={[11.8, 0, -1.8]} size={[1.8, 1.2, 1.6]} rotation={0.2} />
        <CityBlock position={[10.4, 0, 5.6]} size={[2.4, 1.4, 2]} rotation={-0.12} />
        <CityBlock position={[6.8, 0, 7.8]} size={[1.6, 1.1, 1.5]} rotation={0.2} />

        <Tree position={[-12.1, 0, 5.8]} scale={1.18} />
        <Tree position={[-10.2, 0, 6.4]} scale={0.96} />
        <Tree position={[-8.8, 0, 6.9]} scale={1.02} />
        <Tree position={[-7.4, 0, -6.6]} scale={0.88} />
        <Tree position={[-5.8, 0, -5.9]} scale={1.04} />
        <Tree position={[8.4, 0, -8]} scale={0.92} />
        <Tree position={[10.2, 0, 7.4]} scale={1.08} />
        <Tree position={[12, 0, 6.2]} scale={0.9} />
        <Tree position={[7.8, 0, 8.8]} scale={0.84} />
      </group>

      <group position={[2.8, 0.9, 0.6]}>
        <Bird radius={5.4} height={2.6} speed={0.26} phase={0.2} center={[0, 0, 0]} />
        <Bird radius={4.8} height={3.1} speed={0.31} phase={1.5} center={[0.6, 0.2, 0.3]} />
        <Bird radius={6.2} height={3.5} speed={0.22} phase={3.2} center={[-0.3, 0.3, -0.2]} />
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
      camera={{ position: [18, 13.5, 18], zoom: 38, near: 0.1, far: 100 }}
    >
      <HeroScene />
    </Canvas>,
  );
}
