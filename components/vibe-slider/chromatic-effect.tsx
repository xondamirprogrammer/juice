"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import {
  EffectComposer,
  ChromaticAberration,
  DepthOfField,
} from "@react-three/postprocessing"
import { BlendFunction } from "postprocessing"
import { Vector2 } from "three"
import { useStore } from "@/store/use-store"
import { getChromaticOffset } from "@/store/vibe-derivations"

export function ChromaticEffect() {
  const offsetRef = useRef(new Vector2(0, 0))
  const activeView = useStore((s) => s.activeView)
  const dofFocusDistance = useStore((s) => s.dofFocusDistance)

  useFrame(() => {
    const { vibe, warpChromaticOffset } = useStore.getState()
    const val = warpChromaticOffset ?? getChromaticOffset(vibe)
    offsetRef.current.set(val, 0)
  })

  const showDoF = activeView === "stash" && dofFocusDistance < 0.5

  return (
    <EffectComposer disableNormalPass multisampling={0}>
      <ChromaticAberration
        blendFunction={BlendFunction.NORMAL}
        offset={offsetRef.current}
        radialModulation={false}
        modulationOffset={0}
      />
      {showDoF && (
        <DepthOfField
          focusDistance={dofFocusDistance}
          focalLength={0.02}
          bokehScale={2}
          blendFunction={BlendFunction.NORMAL}
        />
      )}
    </EffectComposer>
  )
}
