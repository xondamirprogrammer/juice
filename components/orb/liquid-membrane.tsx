"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { Sphere, MeshTransmissionMaterial } from "@react-three/drei"
import type { Mesh } from "three"
import { useStore } from "@/store/use-store"

const SPHERE_RADIUS = 1.4

export function LiquidMembrane() {
  const meshRef = useRef<Mesh>(null!)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const matRef = useRef<any>(null!)
  useFrame((state) => {
    if (!meshRef.current) return
    const v = useStore.getState().vibe
    // Rhythm: vibe < 0.5 (Depleted) -> slow 8s cycle; vibe > 0.5 (Hyper) -> fast 0.5s cycle
    const cycleSeconds = v < 0.5 ? 8 : 0.5
    const t = (state.clock.getElapsedTime() * Math.PI * 2) / cycleSeconds
    const breath = Math.sin(t) * 0.5 + 0.5 // 0..1
    const scale = 1.0 + breath * 0.05 // 1.0 to 1.05
    meshRef.current.scale.setScalar(scale)
  })

  return (
    <Sphere ref={meshRef} args={[SPHERE_RADIUS, 128, 128]}>
      <MeshTransmissionMaterial
        ref={matRef}
        backside={false}
        samples={3}
        resolution={256}
        transmission={1}
        thickness={3}
        roughness={0.02}
        ior={1.33}
        chromaticAberration={0.04}
        envMapIntensity={1}
        color="#88ccaa"
        background="#000000"
      />
    </Sphere>
  )
}
