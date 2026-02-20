"use client"

import { useEffect, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as Tone from "tone"
import { useStore } from "@/store/use-store"

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

/**
 * AudioEngine lives INSIDE the Canvas so it can use useFrame
 * for zero-latency parameter updates. No useEffect for frequency/filter/gain.
 *
 * Signal chain: Synth -> Filter (LowPass) -> BitCrusher -> Gain -> Destination
 * Gain starts at 0 -- completely silent until interaction.
 */
export function AudioEngine() {
  const synthRef = useRef<Tone.Synth | null>(null)
  const filterRef = useRef<Tone.Filter | null>(null)
  const crusherRef = useRef<Tone.BitCrusher | null>(null)
  const gainRef = useRef<Tone.Gain | null>(null)
  const initializedRef = useRef(false)
  const hasInteractedRef = useRef(false)

  useEffect(() => {
    if (initializedRef.current) return
    initializedRef.current = true

    const gain = new Tone.Gain(0).toDestination() // Starts at 0 -- silent
    const crusher = new Tone.BitCrusher(16).connect(gain)
    const filter = new Tone.Filter({
      type: "lowpass",
      frequency: 2000,
      rolloff: -24,
    }).connect(crusher)
    const synth = new Tone.Synth({
      oscillator: { type: "sine" },
      envelope: {
        attack: 0.5,
        decay: 0.2,
        sustain: 1,
        release: 2,
      },
    }).connect(filter)

    synthRef.current = synth
    filterRef.current = filter
    crusherRef.current = crusher
    gainRef.current = gain

    // MUST return cleanup to prevent feedback loops on HMR
    return () => {
      synth.dispose()
      filter.dispose()
      crusher.dispose()
      gain.dispose()
      initializedRef.current = false
    }
  }, [])

  // --- ALL parameter updates happen in useFrame (60fps) -- NEVER useEffect ---
  useFrame(() => {
    const synth = synthRef.current
    const filter = filterRef.current
    const crusher = crusherRef.current
    const gain = gainRef.current
    if (!synth || !filter || !crusher || !gain) return

    // Gate ALL audio operations behind the AudioContext being "running".
    // Tone.start() is called from the mercury slider's onPointerDown.
    // Until that happens, do nothing -- no warnings, no suspended-context ops.
    if (Tone.getContext().state !== "running") return

    const { vibe, isDragging } = useStore.getState()
    const v = vibe
    const dragging = isDragging

    // Track interaction state for triggering note
    if (dragging && !hasInteractedRef.current) {
      hasInteractedRef.current = true
      if (synth.state !== "started") {
        synth.triggerAttack("C2")
      }
    }

    if (!dragging && hasInteractedRef.current) {
      hasInteractedRef.current = false
      synth.triggerRelease()
    }

    // Frequency: 80Hz (depleted) -> 200Hz (neutral) -> 800Hz (hyper)
    synth.frequency.rampTo(lerp(80, 800, v), 0.016)

    // Filter: 200Hz (muffled/depleted) -> 15000Hz (bright/hyper)
    filter.frequency.rampTo(lerp(200, 15000, v), 0.016)

    // BitCrusher: 16 bits (clean/depleted) -> 4 bits (fizzy/hyper)
    crusher.bits.rampTo(lerp(16, 4, v), 0.016)

    // Gain: 0 when not dragging, ramps to extremity * 0.3 when dragging
    const extremity = Math.abs(v - 0.5) * 2
    const targetGain = dragging ? 0.05 + extremity * 0.25 : 0
    gain.gain.rampTo(targetGain, dragging ? 0.05 : 0.3)
  })

  // This component renders nothing -- it's a pure audio engine
  return null
}
