"use client"

// Lazy-loaded Tone.js: no static import to keep initial bundle small (TTI).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let metalSynth: any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let noiseSynth: any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let osc: any

/**
 * Short high-pitched metallic ping (glass drop into vessel).
 * Uses MetalSynth; call after user interaction (e.g. MercurySlider or drop).
 */
function getTone() {
  return import("tone").then((mod) => (mod as { default?: unknown }).default ?? mod)
}

export async function playGlassDrop() {
  try {
    const Tone = await getTone()
    await Tone.start()
    if (!metalSynth)
      metalSynth = new Tone
        .MetalSynth({
          frequency: 1200,
          envelope: { attack: 0.001, decay: 0.15, release: 0.1 },
          harmonicity: 8,
          modulationIndex: 32,
          resonance: 4000,
          octaves: 0.5,
        })
        .toDestination()
    metalSynth.triggerAttackRelease("C6", 0.08)
  } catch (e) {
    if (typeof console !== "undefined") console.log("playGlassDrop", e)
  }
}

/**
 * Low-pass filtered noise sweep (liquid rushing / hydraulic flood).
 */
export async function playHydraulicFlood() {
  try {
    const Tone = await getTone()
    await Tone.start()
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
export async function playLaserEtch() {
  try {
    const Tone = await getTone()
    await Tone.start()
    const gain = new Tone.Gain(0.15).toDestination()
    const oscInstance = new Tone.Oscillator(2800, "square").connect(gain)
    oscInstance.start()
    oscInstance.stop("+0.12")
    setTimeout(() => {
      oscInstance.dispose()
      gain.dispose()
    }, 500)
  } catch (e) {
    if (typeof console !== "undefined") console.log("playLaserEtch", e)
  }
}
