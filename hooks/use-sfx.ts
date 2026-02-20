"use client"

import * as Tone from "tone"

let _initialized = false

function ensureAudio() {
  if (_initialized) return
  try {
    Tone.start()
    _initialized = true
  } catch {
    // Context may require user gesture; callers trigger after interaction
  }
}

/**
 * Short high-pitched metallic ping (glass drop into vessel).
 * Uses MetalSynth; call after user interaction (e.g. MercurySlider or drop).
 */
export function playGlassDrop() {
  ensureAudio()
  try {
    const syn = new Tone.MetalSynth({
      frequency: 1200,
      envelope: { attack: 0.001, decay: 0.15, release: 0.1 },
      harmonicity: 8,
      modulationIndex: 32,
      resonance: 4000,
      octaves: 0.5,
    }).toDestination()
    syn.triggerAttackRelease("C6", 0.08)
    setTimeout(() => syn.dispose(), 500)
  } catch (e) {
    if (typeof console !== "undefined") console.log("playGlassDrop", e)
  }
}

/**
 * Low-pass filtered noise sweep (liquid rushing / hydraulic flood).
 */
export function playHydraulicFlood() {
  ensureAudio()
  try {
    const noise = new Tone.NoiseSynth({
      noise: { type: "pink" },
      envelope: { attack: 0.02, decay: 0.4, sustain: 0.3, release: 1.2 },
    })
    const filter = new Tone.Filter(400, "lowpass").toDestination()
    noise.connect(filter)
    noise.triggerAttackRelease(1.8)
    setTimeout(() => {
      noise.dispose()
      filter.dispose()
    }, 2500)
  } catch (e) {
    if (typeof console !== "undefined") console.log("playHydraulicFlood", e)
  }
}

/**
 * Rapid high-frequency square pulse (laser etch).
 */
export function playLaserEtch() {
  ensureAudio()
  try {
    const gain = new Tone.Gain(0.15).toDestination()
    const osc = new Tone.Oscillator(2800, "square").connect(gain)
    osc.start()
    osc.stop("+0.12")
    setTimeout(() => {
      osc.dispose()
      gain.dispose()
    }, 500)
  } catch (e) {
    if (typeof console !== "undefined") console.log("playLaserEtch", e)
  }
}
