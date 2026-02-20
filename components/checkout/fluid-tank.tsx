"use client"

import { useRef, useEffect } from "react"
import { useFrame } from "@react-three/fiber"
import { MeshTransmissionMaterial } from "@react-three/drei"
import * as THREE from "three"
import { useStore } from "@/store/use-store"

const FILL_TARGET = 0
const DRAIN_TARGET = -20
const START_Y = -15
const FILL_SPEED = 4
const DRAIN_SPEED = 12
const FILL_TRIGGER_Y = -0.5
const DRAIN_TRIGGER_Y = -15

export function FluidTank() {
  const meshRef = useRef<THREE.Mesh>(null!)
  const checkoutState = useStore((s) => s.checkoutState)
  const setCheckoutState = useStore((s) => s.setCheckoutState)
  const fillingTriggeredRef = useRef(false)
  const drainingTriggeredRef = useRef(false)

  useEffect(() => {
    if (checkoutState === "idle" || checkoutState === "scanning") {
      fillingTriggeredRef.current = false
      drainingTriggeredRef.current = false
    }
  }, [checkoutState])

  useFrame((_state, delta) => {
    const mesh = meshRef.current
    if (!mesh) return

    if (checkoutState === "filling") {
      mesh.position.y = THREE.MathUtils.lerp(mesh.position.y, FILL_TARGET, Math.min(1, delta * FILL_SPEED))
      if (!fillingTriggeredRef.current && mesh.position.y > FILL_TRIGGER_Y) {
        fillingTriggeredRef.current = true
        setCheckoutState("draining")
      }
      return
    }

    if (checkoutState === "draining") {
      mesh.position.y = THREE.MathUtils.lerp(mesh.position.y, DRAIN_TARGET, Math.min(1, delta * DRAIN_SPEED))
      if (!drainingTriggeredRef.current && mesh.position.y < DRAIN_TRIGGER_Y) {
        drainingTriggeredRef.current = true
        setCheckoutState("complete")
      }
    }
  })

  if (checkoutState === "idle" || checkoutState === "scanning") {
    return null
  }

  return (
    <mesh ref={meshRef} position={[0, START_Y, 0]}>
      <boxGeometry args={[20, 20, 5]} />
      <MeshTransmissionMaterial
        samples={3}
        resolution={256}
        thickness={5}
        roughness={0}
        transmission={1}
        ior={1.33}
        color="#CCFF00"
        background="#000000"
        backside={false}
      />
    </mesh>
  )
}
