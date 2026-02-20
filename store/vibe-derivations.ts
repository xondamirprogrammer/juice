/**
 * Pure derivations from vibe [0, 1]. Used in useFrame without subscribing to store.
 * Replaces Framer Motion useTransform to avoid Context re-renders.
 */

function lerp(v: number, a: number, b: number): number {
  return a + (b - a) * v
}

function lerp3(v: number, v0: number, v05: number, v1: number): number {
  if (v <= 0.5) return lerp(v * 2, v0, v05)
  return lerp((v - 0.5) * 2, v05, v1)
}

export function getViscosity(vibe: number): number {
  return lerp(vibe, 0.9, 0.1)
}

export function getDistortion(vibe: number): number {
  return lerp3(vibe, 0.4, 0.1, 1.2)
}

export function getDistortionScale(vibe: number): number {
  return lerp3(vibe, 0.3, 0.1, 0.8)
}

export function getTemporalDistortion(vibe: number): number {
  return lerp3(vibe, 0.05, 0.0, 0.3)
}

export function getChromaticOffset(vibe: number): number {
  return lerp3(vibe, 0.005, 0, 0.02)
}

const VIBE_COLORS = ["#1A0B2E", "#C0C0C0", "#CCFF00"] as const

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b]
      .map((x) =>
        Math.round(Math.max(0, Math.min(255, x)))
          .toString(16)
          .padStart(2, "0")
      )
      .join("")
  )
}

export function getColor(vibe: number): string {
  const [r0, g0, b0] = hexToRgb(VIBE_COLORS[0])
  const [r1, g1, b1] = hexToRgb(VIBE_COLORS[1])
  const [r2, g2, b2] = hexToRgb(VIBE_COLORS[2])
  if (vibe <= 0.5) {
    const t = vibe * 2
    return rgbToHex(
      r0 + (r1 - r0) * t,
      g0 + (g1 - g0) * t,
      b0 + (b1 - b0) * t
    )
  }
  const t = (vibe - 0.5) * 2
  return rgbToHex(
    r1 + (r2 - r1) * t,
    g1 + (g2 - g1) * t,
    b1 + (b2 - b1) * t
  )
}
