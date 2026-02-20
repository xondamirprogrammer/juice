"use client"

import { useRef, useEffect, useState } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import type { Group } from "three"

const ROTATION_SMOOTH = 0.08
const MAX_TILT = 0.35

export function GyroRig({ children }: { children: React.ReactNode }) {
  const groupRef = useRef<Group>(null!)
  const { pointer, size } = useThree()
  const [hasOrientation, setHasOrientation] = useState(false)
  const orientationRef = useRef({ beta: 0, gamma: 0 })
  const targetRotationRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    if (typeof window === "undefined") return
    const handle = (e: DeviceOrientationEvent) => {
      if (e.beta != null && e.gamma != null) {
        setHasOrientation(true)
        orientationRef.current = {
          beta: e.beta,
          gamma: e.gamma,
        }
      }
    }
    window.addEventListener("deviceorientation", handle as EventListener, true)
    return () =>
      window.removeEventListener("deviceorientation", handle as EventListener, true)
  }, [])

  useFrame(() => {
    const group = groupRef.current
    if (!group) return

    let targetX: number
    let targetY: number

    if (hasOrientation && orientationRef.current.beta != null) {
      const { beta, gamma } = orientationRef.current
      // beta: front-to-back tilt [-180, 180], ~90 when flat
      // gamma: left-to-right tilt [-90, 90]
      const rad = Math.PI / 180
      targetX = (beta - 90) * rad * 0.5
      targetY = gamma * rad * 0.5
    } else {
      // Desktop: parallax from pointer
      targetX = pointer.y * MAX_TILT
      targetY = pointer.x * MAX_TILT
    }

    targetRotationRef.current.x = Math.max(-MAX_TILT, Math.min(MAX_TILT, targetX))
    targetRotationRef.current.y = Math.max(-MAX_TILT, Math.min(MAX_TILT, targetY))

    const tx = targetRotationRef.current.x
    const ty = targetRotationRef.current.y
    group.rotation.x += (tx - group.rotation.x) * ROTATION_SMOOTH
    group.rotation.y += (ty - group.rotation.y) * ROTATION_SMOOTH
  })

  return <group ref={groupRef}>{children}</group>
}
