"use client"

import { useRef } from "react"
import { useFrame, type ThreeEvent } from "@react-three/fiber"
import { MeshTransmissionMaterial } from "@react-three/drei"
import type { Group } from "three"
import type { MeshPhysicalMaterial } from "three"
import { useStore } from "@/store/use-store"

const JUICE_COLORS = ["#2d5016", "#e8762b", "#4a1942"] as const
const ROTATE_SPEED = 0.15
const EMISSIVE_PULSE_SPEED = 2.5
const EMISSIVE_MIN = 0.05
const EMISSIVE_MAX = 0.35

interface GlassBottleProps {
  index?: number
}

export function GlassBottle({ index = 0 }: GlassBottleProps) {
  const color = JUICE_COLORS[index % JUICE_COLORS.length]
  const groupRef = useRef<Group>(null!)
  const innerMatRef = useRef<MeshPhysicalMaterial>(null!)
  const glassMatRef = useRef<{ transmission: number } | null>(null)
  const focusedBottleIndex = useStore((s) => s.focusedBottleIndex)
  const setFocusedBottleIndex = useStore((s) => s.setFocusedBottleIndex)
  const setZoomLevel = useStore((s) => s.setZoomLevel)
  const setDofFocusDistance = useStore((s) => s.setDofFocusDistance)
  const isFocused = focusedBottleIndex === index

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += (isFocused ? ROTATE_SPEED : 0) * delta
    }
    if (innerMatRef.current && isFocused) {
      const t = Math.sin(state.clock.elapsedTime * EMISSIVE_PULSE_SPEED) * 0.5 + 0.5
      const emissive = EMISSIVE_MIN + t * (EMISSIVE_MAX - EMISSIVE_MIN)
      innerMatRef.current.emissiveIntensity = emissive
    }
    if (glassMatRef.current) {
      const pulse = 0.96 + Math.sin(state.clock.elapsedTime * 1.2) * 0.04
      glassMatRef.current.transmission = pulse
    }
  })

  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    setFocusedBottleIndex(index)
    setZoomLevel(2)
    setDofFocusDistance(0.4)
  }

  return (
    <group ref={groupRef} onClick={onClick}>
      <mesh>
        <capsuleGeometry args={[0.5, 1.5, 4, 32]} />
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
          ior={1.5}
          color="#ffffff"
          background="#000000"
          backside={false}
        />
      </mesh>
      <mesh>
        <capsuleGeometry args={[0.45, 1.4, 4, 16]} />
        <meshPhysicalMaterial
          ref={innerMatRef}
          color={color}
          roughness={0.2}
          metalness={0}
          emissive={color}
          emissiveIntensity={EMISSIVE_MIN}
        />
      </mesh>
    </group>
  )
}
