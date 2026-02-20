"use client"

import { MixingVessel } from "./mixing-vessel"
import { NodePantry } from "./node-pantry"

export function LabScene() {
  return (
    <>
      <ambientLight intensity={0.08} />
      <spotLight
        position={[0, 5, 0]}
        angle={0.5}
        penumbra={0.6}
        intensity={2}
        castShadow
      >
        <group position={[0, -1.5, 0]} />
      </spotLight>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial
          color="#050505"
          metalness={0.9}
          roughness={0.05}
          envMapIntensity={0.4}
        />
      </mesh>
      <MixingVessel />
      <NodePantry />
    </>
  )
}
