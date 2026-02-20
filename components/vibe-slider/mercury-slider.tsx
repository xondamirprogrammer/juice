"use client"

import { useRef } from "react"
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber"
import { Sphere, MeshTransmissionMaterial } from "@react-three/drei"
import type { Mesh } from "three"
import { Color } from "three"
import { useStore } from "@/store/use-store"
import {
  getDistortion,
  getDistortionScale,
  getTemporalDistortion,
  getColor,
} from "@/store/vibe-derivations"

export function MercurySlider() {
  const meshRef = useRef<Mesh>(null!)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const matRef = useRef<any>(null!)
  const setVibe = useStore((s) => s.setVibe)
  const setIsDragging = useStore((s) => s.setIsDragging)
  const snapBack = useStore((s) => s.snapBack)
  const { viewport } = useThree()

  const dragStartRef = useRef<{ startY: number; startVibe: number } | null>(
    null
  )
  const colorObj = useRef(new Color("#C0C0C0"))

  useFrame(() => {
    if (!meshRef.current) return
    const { vibe, isDragging, warpDistortion } = useStore.getState()
    const v = vibe

    meshRef.current.position.y = (v - 0.5) * 4

    const extremity = Math.abs(v - 0.5) * 2
    const scale = 1 + (isDragging ? extremity * 0.15 : 0)
    meshRef.current.scale.setScalar(scale)

    if (matRef.current) {
      matRef.current.distortion =
        warpDistortion ?? getDistortion(v)
      matRef.current.distortionScale = getDistortionScale(v)
      matRef.current.temporalDistortion = getTemporalDistortion(v)
      colorObj.current.set(getColor(v))
      matRef.current.color.copy(colorObj.current)
    }
  })

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    // Lazy-unlock AudioContext on first interaction (keeps Tone out of initial bundle)
    import("tone").then((mod) => {
      const Tone = (mod as { default?: typeof import("tone") }).default ?? mod
      Tone.start()
    }).catch(() => {})
    const target = e.target as Element
    if (target.setPointerCapture) {
      target.setPointerCapture(e.pointerId)
    }
    setIsDragging(true)
    dragStartRef.current = {
      startY: e.point.y,
      startVibe: useStore.getState().vibe,
    }
  }

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (!dragStartRef.current) return
    e.stopPropagation()
    const deltaY = e.point.y - dragStartRef.current.startY
    const sensitivity = 1 / (viewport.height * 0.4)
    const newVibe = Math.max(
      0,
      Math.min(1, dragStartRef.current.startVibe + deltaY * sensitivity)
    )
    setVibe(newVibe)
  }

  const handlePointerUp = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    const target = e.target as Element
    if (target.releasePointerCapture) {
      target.releasePointerCapture(e.pointerId)
    }
    setIsDragging(false)
    dragStartRef.current = null
    snapBack()
  }

  return (
    <Sphere
      ref={meshRef}
      args={[1, 128, 128]}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <MeshTransmissionMaterial
        ref={matRef}
        backside
        samples={3}
        resolution={256}
        thickness={0.5}
        anisotropy={0.3}
        transmission={1}
        roughness={0.05}
        ior={1.5}
        envMapIntensity={1.5}
        chromaticAberration={0.05}
        distortion={0.1}
        distortionScale={0.1}
        temporalDistortion={0.0}
        color="#C0C0C0"
      />
    </Sphere>
  )
}
