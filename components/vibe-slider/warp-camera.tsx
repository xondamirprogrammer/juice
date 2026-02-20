"use client"

import { useRef } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import { useStore } from "@/store/use-store"
import { getDistortion, getChromaticOffset } from "@/store/vibe-derivations"

const WARP_DURATION_MS = 1500

/**
 * Cinematic "Warp Speed" camera rig.
 * When phase === 'exiting': cranks warp overrides to max, flies camera Z 5 -> 0, adds shake.
 */
export function WarpCamera() {
  const phase = useStore((s) => s.phase)
  const setWarpDistortion = useStore((s) => s.setWarpDistortion)
  const setWarpChromaticOffset = useStore((s) => s.setWarpChromaticOffset)
  const { camera } = useThree()

  const hasTriggeredRef = useRef(false)
  const progressRef = useRef(0)
  const warpProgressRef = useRef(0)
  const prevPhaseRef = useRef(phase)

  useFrame((_, delta) => {
    if (phase !== "exiting") {
      if (prevPhaseRef.current === "exiting") {
        setWarpDistortion(null)
        setWarpChromaticOffset(null)
      }
      prevPhaseRef.current = phase
      return
    }
    prevPhaseRef.current = phase

    if (!hasTriggeredRef.current) {
      hasTriggeredRef.current = true
      progressRef.current = 0
      warpProgressRef.current = 0
    }

    const vibe = useStore.getState().vibe
    const startD = getDistortion(vibe)
    const startC = getChromaticOffset(vibe)

    warpProgressRef.current += (delta * 1000) / WARP_DURATION_MS
    const tw = Math.min(warpProgressRef.current, 1)
    const eased = 1 - Math.pow(1 - tw, 3)
    setWarpDistortion(startD + (3.0 - startD) * eased)
    setWarpChromaticOffset(startC + (0.1 - startC) * eased)

    progressRef.current += delta * 0.6
    const t = Math.min(progressRef.current, 1)
    const logT = Math.log(1 + t * 9) / Math.log(10)
    const targetZ = 5 * (1 - logT)
    camera.position.z = targetZ

    if (targetZ < 2) {
      const shakeIntensity = (1 - targetZ / 2) * 0.15
      camera.position.x = (Math.random() - 0.5) * shakeIntensity
      camera.position.y = (Math.random() - 0.5) * shakeIntensity
    } else {
      camera.position.x = 0
      camera.position.y = 0
    }
  })

  return null
}
