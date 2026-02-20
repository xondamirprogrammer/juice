"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { MeshTransmissionMaterial } from "@react-three/drei"
import * as THREE from "three"
import { useStore } from "@/store/use-store"

export function MixingVessel() {
  const fluidColor = useStore((s) => s.fluidColor)
  const fluidMatRef = useRef<THREE.MeshPhysicalMaterial>(null!)
  const currentColorRef = useRef(new THREE.Color("#ffffff"))
  const targetColorRef = useRef(new THREE.Color("#ffffff"))

  useFrame((_state, delta) => {
    if (!fluidMatRef.current) return
    targetColorRef.current.set(fluidColor)
    currentColorRef.current.lerp(targetColorRef.current, Math.min(1, delta * 2))
    fluidMatRef.current.color.copy(currentColorRef.current)
  })

  return (
    <group position={[0, -0.5, 0]}>
      <mesh scale={[1, 1.15, 1]}>
        <sphereGeometry args={[1, 64, 64]} />
        <MeshTransmissionMaterial
          samples={3}
          resolution={256}
          thickness={2}
          roughness={0.02}
          transmission={1}
          ior={1.45}
          color="#ffffff"
          background="#050505"
          backside={false}
        />
      </mesh>
      <mesh scale={[0.92, 1.05, 0.92]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshPhysicalMaterial
          ref={fluidMatRef}
          color="#ffffff"
          roughness={0.2}
          metalness={0}
          transparent
          opacity={0.95}
        />
      </mesh>
    </group>
  )
}
