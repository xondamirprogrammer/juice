"use client"

import { useRef, useState } from "react"
import { useFrame, type ThreeEvent } from "@react-three/fiber"
import { Sphere, Html } from "@react-three/drei"
import type { Group } from "three"
import { LiquidMembrane } from "./liquid-membrane"
import { FloatingParticles } from "./floating-particles"
import { GyroRig } from "./gyro-rig"
import { useStore } from "@/store/use-store"

const STIFFNESS = 180
const DAMPING = 12
const PULL_THRESHOLD = 1.5
const SQUASH_FACTOR = 0.1

export function OrbScene() {
  const groupRef = useRef<Group>(null!)
  const scaleRef = useRef(0)
  const velocityRef = useRef(0)
  const dragStartYRef = useRef<number>(0)
  const dragCurrentYRef = useRef<number>(0)
  const isDraggingRef = useRef(false)
  const [showPullHint, setShowPullHint] = useState(true)
  const setIsDiving = useStore((s) => s.setIsDiving)

  useFrame((_state, delta) => {
    const group = groupRef.current
    if (!group) return
    const entranceTarget = 1
    let scale = scaleRef.current
    const velocity = velocityRef.current
    if (!isDraggingRef.current) {
      const diff = entranceTarget - scale
      velocityRef.current = velocity + diff * STIFFNESS * delta - velocity * DAMPING * delta
      scaleRef.current = Math.max(0, scale + velocityRef.current * delta)
      scale = scaleRef.current
    }
    const s = scale
    const pull = isDraggingRef.current
      ? Math.max(0, dragStartYRef.current - dragCurrentYRef.current)
      : 0
    const squashY = 1 - pull * SQUASH_FACTOR
    group.scale.set(s, s * squashY, s)
  })

  const onPointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    setShowPullHint(false)
    const target = e.target as unknown as { setPointerCapture?: (id: number) => void }
    if (target.setPointerCapture) target.setPointerCapture(e.pointerId)
    isDraggingRef.current = true
    dragStartYRef.current = e.point.y
    dragCurrentYRef.current = e.point.y
  }

  const onPointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (!isDraggingRef.current) return
    e.stopPropagation()
    dragCurrentYRef.current = e.point.y
  }

  const onPointerUp = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    const target = e.target as unknown as { releasePointerCapture?: (id: number) => void }
    if (target.releasePointerCapture) target.releasePointerCapture(e.pointerId)
    if (!isDraggingRef.current) return
    const pull = Math.max(0, dragStartYRef.current - dragCurrentYRef.current)
    isDraggingRef.current = false
    if (pull >= PULL_THRESHOLD) {
      setIsDiving(true)
    }
  }

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      <Sphere args={[1.5, 32, 32]} visible={false} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerLeave={onPointerUp} />
      <Html position={[0, -1.8, 0]} center style={{ pointerEvents: "none", transition: "opacity 0.3s" }}>
        <p
          className="text-center text-xs tracking-widest text-white/60 whitespace-nowrap"
          style={{ opacity: showPullHint ? 1 : 0 }}
          aria-hidden
        >
          Pull to breach
        </p>
      </Html>
      <GyroRig>
        <LiquidMembrane />
        <FloatingParticles />
      </GyroRig>
    </group>
  )
}
