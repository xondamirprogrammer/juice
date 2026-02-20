"use client"

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import { Octahedron, Sphere } from "@react-three/drei"
import * as THREE from "three"
import { useStore } from "@/store/use-store"

const SOUR_COLOR = "#ccff00"
const SWEET_COLOR = "#ff00aa"
const SPICY_COLOR = "#cc4400"

function SourShards() {
  const refs = useRef<THREE.Mesh[]>([])
  useFrame((state) => {
    const t = state.clock.elapsedTime
    refs.current.forEach((mesh, i) => {
      if (!mesh) return
      mesh.rotation.x = t * (1.2 + i * 0.3)
      mesh.rotation.y = t * (0.8 + i * 0.2)
      mesh.rotation.z = t * 0.5
    })
  })
  return (
    <group position={[0, 0, -4]}>
      {Array.from({ length: 12 }, (_, i) => {
        const angle = (i / 12) * Math.PI * 2
        const r = 2 + (i % 3) * 0.5
        return (
          <Octahedron
            key={i}
            ref={(el) => { if (el) refs.current[i] = el }}
            args={[0.15 + (i % 2) * 0.08, 0]}
            position={[Math.cos(angle) * r, Math.sin(angle * 2) * 0.8, -i * 0.2]}
            scale={[1, 1.2, 0.8]}
          >
            <meshBasicMaterial color={SOUR_COLOR} />
          </Octahedron>
        )
      })}
    </group>
  )
}

function SweetSpheres() {
  const refs = useRef<THREE.Mesh[]>([])
  useFrame((state) => {
    const t = state.clock.elapsedTime * 0.3
    refs.current.forEach((mesh, i) => {
      if (!mesh) return
      mesh.position.y = Math.sin(t + i * 0.7) * 0.2
      mesh.position.x = Math.cos(t * 0.5 + i * 0.4) * 0.3
      mesh.scale.setScalar(0.9 + Math.sin(t + i) * 0.1)
    })
  })
  return (
    <group position={[0, 0, -4]}>
      {Array.from({ length: 8 }, (_, i) => (
        <Sphere
          key={i}
          ref={(el) => { if (el) refs.current[i] = el }}
          args={[0.4 + (i % 3) * 0.15, 32, 32]}
          position={[Math.sin(i) * 1.5, Math.cos(i * 1.3) * 1, -i * 0.3]}
        >
          <meshBasicMaterial color={SWEET_COLOR} transparent opacity={0.7} />
        </Sphere>
      ))}
    </group>
  )
}

function SpicyEmbers() {
  const pointsRef = useRef<THREE.Points>(null!)
  const count = 60
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 4
      arr[i * 3 + 1] = (Math.random() - 0.5) * 2
      arr[i * 3 + 2] = (Math.random() - 0.5) * 2 - 3
    }
    return arr
  }, [])
  useFrame((state) => {
    const t = state.clock.elapsedTime
    for (let i = 0; i < count; i++) {
      positions[i * 3 + 1] += 0.008 + (i % 5) * 0.002
      if (positions[i * 3 + 1] > 1.5) positions[i * 3 + 1] = -1.5
      const wobble = Math.sin(t * 2 + i * 0.5) * 0.05
      positions[i * 3] += wobble
      positions[i * 3 + 2] += Math.cos(t + i * 0.3) * 0.02
    }
    const geom = pointsRef.current?.geometry
    if (geom?.attributes?.position) (geom.attributes.position as THREE.BufferAttribute).needsUpdate = true
  })
  return (
    <points ref={pointsRef} position={[0, 0, -4]}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.06} color={SPICY_COLOR} sizeAttenuation />
    </points>
  )
}

export function SynesthesiaBg() {
  const zoomLevel = useStore((s) => s.zoomLevel)
  const focusedBottleIndex = useStore((s) => s.focusedBottleIndex)

  if (zoomLevel <= 1 || focusedBottleIndex === null) return null

  const profile = focusedBottleIndex % 3

  return (
    <group>
      {profile === 0 && <SourShards />}
      {profile === 1 && <SweetSpheres />}
      {profile === 2 && <SpicyEmbers />}
    </group>
  )
}
