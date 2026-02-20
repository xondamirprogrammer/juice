"use client"

import { useRef, useMemo, useEffect } from "react"
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber"
import { useGLTF } from "@react-three/drei"
import * as THREE from "three"
import type { Group } from "three"
import { useStore } from "@/store/use-store"
import { playGlassDrop } from "@/hooks/use-sfx"

const VESSEL_CENTER = new THREE.Vector3(0, -0.5, 0)
const HIT_RADIUS = 1.5
const LERP_SPEED = 12
const ABSORB_SPEED = 8

interface IngredientNodeProps {
  id: string
  color: string
  initialPosition: [number, number, number]
  geometry: "icosahedron" | "sphere" | "dodecahedron" | "tetrahedron"
  modelUrl?: string
}

export function IngredientNode({
  id,
  color,
  initialPosition,
  geometry: geoKey,
  modelUrl,
}: IngredientNodeProps) {
  const containerRef = useRef<THREE.Group>(null!)
  const { camera, size } = useThree()
  const mixIngredient = useStore((s) => s.mixIngredient)
  const currentPosRef = useRef(new THREE.Vector3(...initialPosition))
  const isDraggingRef = useRef(false)
  const targetPosRef = useRef(new THREE.Vector3(...initialPosition))
  const scaleRef = useRef(1)
  const isAbsorbedRef = useRef(false)
  const planeRef = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), -1))
  const raycasterRef = useRef(new THREE.Raycaster())
  const pointerRef = useRef(new THREE.Vector2())
  const intersectRef = useRef(new THREE.Vector3())

  useEffect(() => {
    if (modelUrl && typeof useGLTF.preload === "function") {
      useGLTF.preload(modelUrl)
    }
  }, [modelUrl])

  useFrame((_state, delta) => {
    const container = containerRef.current
    if (!container) return
    container.position.lerp(targetPosRef.current, Math.min(1, delta * LERP_SPEED))
    container.scale.setScalar(scaleRef.current)
    if (isAbsorbedRef.current && scaleRef.current <= 0.01) {
      scaleRef.current = 0
    } else if (isAbsorbedRef.current) {
      scaleRef.current = Math.max(0, scaleRef.current - delta * ABSORB_SPEED)
    }
  })

  const onPointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    const target = e.target as unknown as { setPointerCapture?: (id: number) => void }
    if (target.setPointerCapture) target.setPointerCapture(e.pointerId)
    isDraggingRef.current = true
    targetPosRef.current.copy(e.point)
  }

  const onPointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (!isDraggingRef.current) return
    e.stopPropagation()
    pointerRef.current.set((e.pointer.x * 2) / size.width - 1, -(e.pointer.y * 2) / size.height + 1)
    raycasterRef.current.setFromCamera(pointerRef.current, camera)
    if (raycasterRef.current.ray.intersectPlane(planeRef.current, intersectRef.current)) {
      targetPosRef.current.copy(intersectRef.current)
    }
  }

  const onPointerUp = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    const target = e.target as unknown as { releasePointerCapture?: (id: number) => void }
    if (target.releasePointerCapture) target.releasePointerCapture(e.pointerId)
    if (!isDraggingRef.current) return
    isDraggingRef.current = false
    currentPosRef.current.copy(containerRef.current.position)
    const dist = currentPosRef.current.distanceTo(VESSEL_CENTER)
    if (dist < HIT_RADIUS) {
      playGlassDrop()
      mixIngredient(id, color)
      isAbsorbedRef.current = true
    } else {
      targetPosRef.current.set(...initialPosition)
    }
  }

  if (scaleRef.current <= 0) return null

  return (
    <group
      ref={containerRef}
      position={initialPosition}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
    >
      {modelUrl ? (
        <IngredientNodeModel modelUrl={modelUrl} />
      ) : (
        <mesh>
          {geoKey === "icosahedron" && <icosahedronGeometry args={[0.22, 0]} />}
          {geoKey === "sphere" && <sphereGeometry args={[0.25, 24, 24]} />}
          {geoKey === "dodecahedron" && <dodecahedronGeometry args={[0.22, 0]} />}
          {geoKey === "tetrahedron" && <tetrahedronGeometry args={[0.22, 0]} />}
          <meshStandardMaterial color={color} roughness={0.4} metalness={0.1} />
        </mesh>
      )}
    </group>
  )
}

function IngredientNodeModel({ modelUrl }: { modelUrl: string }) {
  const { scene } = useGLTF(modelUrl)
  const cloned = useMemo(() => scene.clone(), [scene])
  return <primitive object={cloned} scale={[0.25, 0.25, 0.25]} />
}

