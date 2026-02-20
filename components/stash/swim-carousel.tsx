"use client"

import { useRef } from "react"
import { useFrame, type ThreeEvent } from "@react-three/fiber"
import { Plane } from "@react-three/drei"
import type { Group } from "three"
import { GlassBottle } from "./glass-bottle"
import { useStore } from "@/store/use-store"

const RADIUS = 4
const BOTTLE_COUNT = 8
export const SWIM_CAROUSEL_RADIUS = RADIUS
export const SWIM_CAROUSEL_BOTTLE_COUNT = BOTTLE_COUNT

const FRICTION_LOW = 0.88
const FRICTION_HIGH = 0.96

interface SwimCarouselProps {
  carouselRef?: React.RefObject<Group | null>
}

export function SwimCarousel({ carouselRef: externalRef }: SwimCarouselProps = {}) {
  const internalRef = useRef<Group>(null!)
  const carouselRef = externalRef ?? internalRef
  const velocityRef = useRef(0)
  const isDraggingRef = useRef(false)
  const prevXRef = useRef(0)
  useFrame((_state, delta) => {
    const group = carouselRef.current
    if (!group) return
    const v = useStore.getState().vibe
    const friction = FRICTION_LOW + (FRICTION_HIGH - FRICTION_LOW) * v
    group.rotation.y += velocityRef.current
    velocityRef.current *= friction
  })

  const onPointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    const target = e.target as unknown as { setPointerCapture?: (id: number) => void }
    if (target.setPointerCapture) target.setPointerCapture(e.pointerId)
    isDraggingRef.current = true
    prevXRef.current = e.pointer.x
  }

  const onPointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (!isDraggingRef.current) return
    const dx = e.pointer.x - prevXRef.current
    prevXRef.current = e.pointer.x
    velocityRef.current += dx * 0.015
  }

  const onPointerUp = (e: ThreeEvent<PointerEvent>) => {
    const target = e.target as unknown as { releasePointerCapture?: (id: number) => void }
    if (target.releasePointerCapture) target.releasePointerCapture(e.pointerId)
    isDraggingRef.current = false
  }

  return (
    <group ref={carouselRef}>
      {Array.from({ length: BOTTLE_COUNT }, (_, i) => {
        const angle = (i / BOTTLE_COUNT) * Math.PI * 2
        const x = Math.sin(angle) * RADIUS
        const z = Math.cos(angle) * RADIUS
        const faceCenter = angle + Math.PI
        return (
          <group key={i} position={[x, 0, z]} rotation={[0, faceCenter, 0]}>
            <GlassBottle index={i} />
          </group>
        )
      })}
      <Plane
        args={[20, 20]}
        position={[0, 0, -2]}
        visible={false}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      />
    </group>
  )
}
