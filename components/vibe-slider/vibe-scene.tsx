"use client"

import { Suspense } from "react"
import { Canvas } from "@react-three/fiber"
import { Environment } from "@react-three/drei"
import { MercurySlider } from "./mercury-slider"
import { BreathingBackground } from "./breathing-background"
import { ChromaticEffect } from "./chromatic-effect"
import { AudioEngine } from "./audio-engine"
import { WarpCamera } from "./warp-camera"
import { OrbScene } from "@/components/orb/orb-scene"
import { StashScene } from "@/components/stash/stash-scene"
import { LabScene } from "@/components/lab/lab-scene"
import { CheckoutScene } from "@/components/checkout/checkout-scene"
import { DiveCamera } from "@/components/transitions/dive-camera"
import { useStore } from "@/store/use-store"

function PhaseContent() {
  const phase = useStore((s) => s.phase)
  const activeView = useStore((s) => s.activeView)
  return (
    <>
      {phase === "input" && <MercurySlider />}
      {phase === "exiting" && activeView === "orb" && <OrbScene />}
      {phase === "exiting" && activeView === "stash" && <StashScene />}
      {phase === "exiting" && activeView === "lab" && <LabScene />}
      {phase === "exiting" && activeView === "checkout" && <CheckoutScene />}
    </>
  )
}

function SceneBackground() {
  const activeView = useStore((s) => s.activeView)
  if (activeView === "checkout") return null
  return <BreathingBackground />
}

export function VibeScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 45 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: false }}
      style={{ background: "#000000" }}
    >
      <Environment preset="studio" background={false} />
      <Suspense fallback={null}>
        <SceneBackground />
        <PhaseContent />
        <DiveCamera />
        <AudioEngine />
        <WarpCamera />
        <ChromaticEffect />
      </Suspense>
    </Canvas>
  )
}
