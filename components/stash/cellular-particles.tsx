"use client"

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import type { Group } from "three"
import { useStore } from "@/store/use-store"
import { SWIM_CAROUSEL_RADIUS, SWIM_CAROUSEL_BOTTLE_COUNT } from "./swim-carousel"

const COUNT = 50
const BOTTLE_RADIUS = 0.4
const BOTTLE_HALF_HEIGHT = 0.6
const VORTEX_SPEED = 0.4
const DRIFT = 0.002

function seed(i: number) {
  const x = Math.sin(i * 12.9898) * 43758.5453
  return x - Math.floor(x)
}

export interface CellularParticlesProps {
  carouselRef: React.RefObject<Group | null>
}

export function CellularParticles({ carouselRef }: CellularParticlesProps) {
  const groupRef = useRef<Group>(null!)
  const meshRef = useRef<THREE.InstancedMesh>(null!)
  const focusedBottleIndex = useStore((s) => s.focusedBottleIndex)
  const zoomLevel = useStore((s) => s.zoomLevel)
  const activeView = useStore((s) => s.activeView)
  const positionsRef = useRef<THREE.Vector3[]>(
    Array.from({ length: COUNT }, (_, i) => {
      const r = seed(i) * BOTTLE_RADIUS
      const theta = seed(i + 1) * Math.PI * 2
      const z = (seed(i + 2) - 0.5) * 2 * BOTTLE_HALF_HEIGHT
      return new THREE.Vector3(r * Math.cos(theta), r * Math.sin(theta), z)
    })
  )
  const dummy = useMemo(() => new THREE.Object3D(), [])

  const [geometry, material] = useMemo(() => {
    const profile = (focusedBottleIndex ?? 0) % 3
    const geo =
      profile === 0
        ? new THREE.CylinderGeometry(0.012, 0.012, 0.12, 6)
        : new THREE.SphereGeometry(0.04, 8, 8)
    const mat =
      profile === 1
        ? new THREE.MeshPhysicalMaterial({
            color: "#ff00aa",
            transparent: true,
            opacity: 0.8,
            roughness: 0.3,
            metalness: 0,
          })
        : new THREE.MeshBasicMaterial({ color: "#ccff00" })
    return [geo, mat]
  }, [focusedBottleIndex])

  useFrame((state, delta) => {
    if (activeView !== "stash" || focusedBottleIndex === null || zoomLevel !== 3) return
    const carousel = carouselRef.current
    if (!carousel || !groupRef.current || !meshRef.current) return

    const angle = (focusedBottleIndex / SWIM_CAROUSEL_BOTTLE_COUNT) * Math.PI * 2
    const localX = Math.sin(angle) * SWIM_CAROUSEL_RADIUS
    const localZ = Math.cos(angle) * SWIM_CAROUSEL_RADIUS
    const ry = carousel.rotation.y
    const wx = Math.cos(ry) * localX - Math.sin(ry) * localZ
    const wz = Math.sin(ry) * localX + Math.cos(ry) * localZ
    groupRef.current.position.set(wx, 0, wz)

    const t = state.clock.elapsedTime
    const positions = positionsRef.current
    for (let i = 0; i < COUNT; i++) {
      const p = positions[i]
      const theta = Math.atan2(p.y, p.x)
      const r = Math.sqrt(p.x * p.x + p.y * p.y)
      const newTheta = theta + VORTEX_SPEED * delta * (1 + r)
      p.x = r * Math.cos(newTheta)
      p.y = r * Math.sin(newTheta)
      p.z += Math.sin(t + i * 0.3) * DRIFT
      p.z = Math.max(-BOTTLE_HALF_HEIGHT, Math.min(BOTTLE_HALF_HEIGHT, p.z))
      const clampR = Math.min(r, BOTTLE_RADIUS - 0.02)
      p.x = clampR * Math.cos(newTheta)
      p.y = clampR * Math.sin(newTheta)
    }

    positions.forEach((p, i) => {
      dummy.position.copy(p)
      dummy.scale.setScalar(1)
      dummy.rotation.z = t * 0.5 + i * 0.1
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  if (activeView !== "stash" || focusedBottleIndex === null || zoomLevel !== 3) return null

  return (
    <group ref={groupRef}>
      <instancedMesh ref={meshRef} args={[geometry, material, COUNT]} matrixAutoUpdate={false} />
    </group>
  )
}
