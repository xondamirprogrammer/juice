"use client"

import { VibeScene } from "@/components/vibe-slider/vibe-scene"
import { HapticEngine } from "@/components/vibe-slider/haptic-engine"
import { VibeTypography } from "@/components/vibe-slider/vibe-typography"
import { HUD } from "@/components/hud/hud"
import { StashBackButton } from "@/components/stash/stash-back-button"
import { AISommelier } from "@/components/lab/ai-sommelier"
import { BiometricPad } from "@/components/checkout/biometric-pad"
import { ScreenReaderAnnouncer } from "@/components/vibe-slider/screen-reader-announcer"
import { KeyboardNav } from "@/components/vibe-slider/keyboard-nav"

export function VibeApp() {
  return (
    <div
      className="h-dvh w-screen overflow-hidden"
      style={{ touchAction: "none", background: "#000000" }}
    >
      <ScreenReaderAnnouncer />
      <KeyboardNav />
      <VibeScene />
      <VibeTypography />
      <HapticEngine />
      <HUD />
      <StashBackButton />
      <AISommelier />
      <BiometricPad />
    </div>
  )
}
