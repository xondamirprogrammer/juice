"use client"

import { useRef } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"
import type { Group } from "three"
import { useStore } from "@/store/use-store"
import { SWIM_CAROUSEL_RADIUS, SWIM_CAROUSEL_BOTTLE_COUNT } from "./swim-carousel"

const LERP_SPEED = 2.5
const Z_OFFSET_LEVEL2 = 1.2
const LEVEL3_TRIGGER_DIST = 0.4

export interface MacroCameraProps {
  carouselRef: React.RefObject<Group | null>
}

export function MacroCamera({ carouselRef }: MacroCameraProps) {
  const { camera } = useThree()
  const focusedBottleIndex = useStore((s) => s.focusedBottleIndex)
  const zoomLevel = useStore((s) => s.zoomLevel)
  const setZoomLevel = useStore((s) => s.setZoomLevel)
  const setDofFocusDistance = useStore((s) => s.setDofFocusDistance)
  const activeView = useStore((s) => s.activeView)
  const targetPosRef = useRef(new THREE.Vector3(0, 0, 5))

  useFrame((_state, delta) => {
    if (activeView !== "stash") return
    if (focusedBottleIndex === null) {
      targetPosRef.current.set(0, 0, 5)
      THREE.Vector3.prototype.lerp.call(camera.position, targetPosRef.current, Math.min(1, delta * LERP_SPEED))
      return
    }

    const carousel = carouselRef.current
    if (!carousel) return

    const angle = (focusedBottleIndex / SWIM_CAROUSEL_BOTTLE_COUNT) * Math.PI * 2
    const localX = Math.sin(angle) * SWIM_CAROUSEL_RADIUS
    const localZ = Math.cos(angle) * SWIM_CAROUSEL_RADIUS
    const ry = carousel.rotation.y
    const wx = Math.cos(ry) * localX - Math.sin(ry) * localZ
    const wz = Math.sin(ry) * localX + Math.cos(ry) * localZ

    if (zoomLevel === 1) return

    if (zoomLevel === 2) {
      targetPosRef.current.set(wx, 0, wz + Z_OFFSET_LEVEL2)
      camera.position.lerp(targetPosRef.current, Math.min(1, delta * LERP_SPEED))
      const dist = camera.position.distanceTo(targetPosRef.current)
      if (dist < LEVEL3_TRIGGER_DIST) {
        setZoomLevel(3)
        setDofFocusDistance(0.025)
      }
      return
    }

    if (zoomLevel === 3) {
      targetPosRef.current.set(wx, 0, wz - 0.3)
      camera.position.lerp(targetPosRef.current, Math.min(1, delta * LERP_SPEED * 0.8))
    }
  })

  return null
}
