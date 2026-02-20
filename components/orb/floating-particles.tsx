"use client"

import { useRef, useMemo, useLayoutEffect } from "react"
import { useFrame } from "@react-three/fiber"
import { useGLTF } from "@react-three/drei"
import * as THREE from "three"

const PARTICLE_COUNT = 28
const MAX_RADIUS = 1.2
const DRIFT = 0.0008
const BOUNCE = 0.92

function seed(i: number) {
  const x = Math.sin(i * 12.9898) * 43758.5453
  return x - Math.floor(x)
}

function getGeometryFromScene(scene: THREE.Group): THREE.BufferGeometry {
  let found: THREE.BufferGeometry | null = null
  scene.traverse((c) => {
    if (found) return
    if (c instanceof THREE.Mesh && c.geometry) found = c.geometry.clone()
  })
  return found ?? new THREE.IcosahedronGeometry(1, 0)
}

const defaultGeometry = new THREE.IcosahedronGeometry(1, 0)

export function FloatingParticles({ modelUrl }: { modelUrl?: string } = {}) {
  if (modelUrl) return <FloatingParticlesWithModel modelUrl={modelUrl} />
  return <FloatingParticlesInner geometryOverride={undefined} />
}

function FloatingParticlesWithModel({ modelUrl }: { modelUrl: string }) {
  const { scene } = useGLTF(modelUrl)
  const geometry = useMemo(() => getGeometryFromScene(scene), [scene])
  return <FloatingParticlesInner geometryOverride={geometry} />
}

function FloatingParticlesInner({
  geometryOverride,
}: {
  geometryOverride?: THREE.BufferGeometry
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null!)
  const positionsRef = useRef<THREE.Vector3[]>(
    Array.from({ length: PARTICLE_COUNT }, (_, i) => {
      const r = 0.3 + seed(i) * 0.7
      const theta = seed(i + 1) * Math.PI * 2
      const phi = Math.acos(2 * seed(i + 2) - 1)
      return new THREE.Vector3(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi)
      )
    })
  )
  const velocitiesRef = useRef<THREE.Vector3[]>(
    Array.from(
      { length: PARTICLE_COUNT },
      (_, i) =>
        new THREE.Vector3(
          (seed(i) - 0.5) * 0.002,
          (seed(i + 3) - 0.5) * 0.002,
          (seed(i + 6) - 0.5) * 0.002
        )
    )
  )
  const dummy = useMemo(() => new THREE.Object3D(), [])

  const [geometry, material, instanceColor] = useMemo(() => {
    const geo = geometryOverride ?? defaultGeometry
    const mat = new THREE.MeshBasicMaterial({
      vertexColors: true,
    })
    const colors = new Float32Array(PARTICLE_COUNT * 3)
    const c1 = new THREE.Color("#CCFF00")
    const c2 = new THREE.Color("#FFFFFF")
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const c = seed(i) > 0.5 ? c1 : c2
      colors[i * 3] = c.r
      colors[i * 3 + 1] = c.g
      colors[i * 3 + 2] = c.b
    }
    const attr = new THREE.InstancedBufferAttribute(colors, 3)
    return [geo, mat, attr]
  }, [geometryOverride])

  useLayoutEffect(() => {
    const mesh = meshRef.current
    if (!mesh) return
    ;(mesh as THREE.InstancedMesh & { instanceColor?: THREE.InstancedBufferAttribute }).instanceColor = instanceColor
  }, [instanceColor])

  useFrame(() => {
    const positions = positionsRef.current
    const velocities = velocitiesRef.current
    const mesh = meshRef.current
    if (!mesh) return

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const p = positions[i]
      const v = velocities[i]
      v.x += (Math.random() - 0.5) * DRIFT
      v.y += (Math.random() - 0.5) * DRIFT
      v.z += (Math.random() - 0.5) * DRIFT
      p.add(v)
      const d = p.length()
      if (d >= MAX_RADIUS) {
        p.normalize().multiplyScalar(MAX_RADIUS)
        const n = p.clone().normalize()
        v.reflect(n).multiplyScalar(BOUNCE)
      }
    }

    positions.forEach((p, i) => {
      dummy.position.copy(p)
      dummy.scale.setScalar(0.06)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    })
    mesh.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, PARTICLE_COUNT]}
      matrixAutoUpdate={false}
    />
  )
}
