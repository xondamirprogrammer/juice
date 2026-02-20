"use client"

import { useRef } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import { useStore } from "@/store/use-store"

const DIVE_SPEED = 12
const Z_START = 5
const Z_HANDOFF = -2
const Z_EMERGENCE = -8
const FOV_START = 45
const FOV_END = 120

export function DiveCamera() {
  const { camera } = useThree()
  const isDiving = useStore((s) => s.isDiving)
  const setActiveView = useStore((s) => s.setActiveView)
  const setIsDiving = useStore((s) => s.setIsDiving)
  const handoffDoneRef = useRef(false)
  const emergenceDoneRef = useRef(false)
  const diveStartedRef = useRef(false)

  useFrame((_state, delta) => {
    if (!isDiving) {
      handoffDoneRef.current = false
      emergenceDoneRef.current = false
      diveStartedRef.current = false
      return
    }

    if (!diveStartedRef.current) {
      diveStartedRef.current = true
      camera.position.z = Z_START
      camera.fov = FOV_START
      camera.updateProjectionMatrix()
    }

    camera.position.z -= DIVE_SPEED * delta
    const t = Math.max(0, Math.min(1, (Z_START - camera.position.z) / (Z_START - Z_EMERGENCE)))
    camera.fov = FOV_START + (FOV_END - FOV_START) * t
    camera.updateProjectionMatrix()

    if (camera.position.z < Z_HANDOFF && !handoffDoneRef.current) {
      handoffDoneRef.current = true
      setActiveView("stash")
    }

    if (camera.position.z < Z_EMERGENCE && !emergenceDoneRef.current) {
      emergenceDoneRef.current = true
      camera.position.z = Z_START
      camera.fov = FOV_START
      camera.updateProjectionMatrix()
      setIsDiving(false)
    }
  })

  return null
}
