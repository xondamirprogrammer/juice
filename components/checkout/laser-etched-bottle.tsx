"use client"

import { useRef, useEffect } from "react"
import { useFrame } from "@react-three/fiber"
import { MeshTransmissionMaterial, Text } from "@react-three/drei"
import type { Group } from "three"
import { useStore } from "@/store/use-store"
import { playLaserEtch } from "@/hooks/use-sfx"

const ROTATE_SPEED = 0.12

export function LaserEtchedBottle() {
  const groupRef = useRef<Group>(null!)
  const glassMatRef = useRef<{ transmission: number } | null>(null)
  const fluidColor = useStore((s) => s.fluidColor)

  useEffect(() => {
    playLaserEtch()
  }, [])

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += ROTATE_SPEED * delta
    }
    if (glassMatRef.current) {
      const pulse = 0.96 + Math.sin(state.clock.elapsedTime * 1.2) * 0.04
      glassMatRef.current.transmission = pulse
    }
  })

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      <mesh scale={[1, 1.15, 1]}>
        <sphereGeometry args={[1, 64, 64]} />
        <MeshTransmissionMaterial
          ref={glassMatRef}
          samples={3}
          resolution={256}
          thickness={1.5}
          anisotropy={1}
          chromaticAberration={0.02}
          roughness={0.15}
          clearcoat={1}
          transmission={1}
          ior={1.45}
          color="#ffffff"
          background="#000000"
          backside={false}
        />
      </mesh>
      <mesh scale={[0.92, 1.05, 0.92]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshPhysicalMaterial
          color={fluidColor}
          roughness={0.2}
          metalness={0}
        />
      </mesh>
      <Text
        position={[0, 0, 0.51]}
        fontSize={0.15}
        anchorX="center"
        anchorY="middle"
        textAlign="center"
        maxWidth={1.2}
      >
        ORDER #8821{"\n"}ETA: TUESDAY
        <meshStandardMaterial
          emissive="#ffffff"
          emissiveIntensity={4}
          toneMapped={false}
        />
      </Text>
    </group>
  )
}
