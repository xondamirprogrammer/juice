"use client"

import { useEffect, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { useStore } from "@/store/use-store"

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

type ToneModule = typeof import("tone")

/**
 * AudioEngine lives INSIDE the Canvas so it can use useFrame
 * for zero-latency parameter updates. No useEffect for frequency/filter/gain.
 * Tone.js is lazy-loaded to avoid blocking initial bundle parse (TTI).
 *
 * Signal chain: Synth -> Filter (LowPass) -> BitCrusher -> Gain -> Destination
 * Gain starts at 0 -- completely silent until interaction.
 */
export function AudioEngine() {
  const synthRef = useRef<InstanceType<ToneModule["Synth"]> | null>(null)
  const filterRef = useRef<InstanceType<ToneModule["Filter"]> | null>(null)
  const crusherRef = useRef<InstanceType<ToneModule["BitCrusher"]> | null>(null)
  const gainRef = useRef<InstanceType<ToneModule["Gain"]> | null>(null)
  const toneRef = useRef<ToneModule | null>(null)
  const initializedRef = useRef(false)
  const hasInteractedRef = useRef(false)

  useEffect(() => {
    if (initializedRef.current) return
    initializedRef.current = true

    import("tone").then((mod) => {
      const Tone = (mod as { default?: ToneModule }).default ?? mod
      toneRef.current = Tone as ToneModule
      const gain = new Tone.Gain(0).toDestination()
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

      synthRef.current = synth as InstanceType<ToneModule["Synth"]>
      filterRef.current = filter as InstanceType<ToneModule["Filter"]>
      crusherRef.current = crusher as InstanceType<ToneModule["BitCrusher"]>
      gainRef.current = gain as InstanceType<ToneModule["Gain"]>
    }).catch((e) => {
      if (typeof console !== "undefined") console.log("AudioEngine Tone load", e)
      initializedRef.current = false
    })

    return () => {
      const synth = synthRef.current
      const filter = filterRef.current
      const crusher = crusherRef.current
      const gain = gainRef.current
      if (synth) synth.dispose()
      if (filter) filter.dispose()
      if (crusher) crusher.dispose()
      if (gain) gain.dispose()
      synthRef.current = null
      filterRef.current = null
      crusherRef.current = null
      gainRef.current = null
      toneRef.current = null
      initializedRef.current = false
    }
  }, [])

  useFrame(() => {
    const synth = synthRef.current
    const filter = filterRef.current
    const crusher = crusherRef.current
    const gain = gainRef.current
    const Tone = toneRef.current
    if (!synth || !filter || !crusher || !gain || !Tone) return

    if (Tone.getContext().state !== "running") return

    const { vibe, isDragging } = useStore.getState()
    const v = vibe
    const dragging = isDragging

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

    synth.frequency.rampTo(lerp(80, 800, v), 0.016)
    filter.frequency.rampTo(lerp(200, 15000, v), 0.016)
    crusher.bits.rampTo(lerp(16, 4, v), 0.016)
    const extremity = Math.abs(v - 0.5) * 2
    const targetGain = dragging ? 0.05 + extremity * 0.25 : 0
    gain.gain.rampTo(targetGain, dragging ? 0.05 : 0.3)
  })

  return null
}
