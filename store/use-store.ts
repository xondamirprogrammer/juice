"use client"

import { create } from "zustand"

// ---- Lab helpers (from use-lab) ----
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

function blendColors(hexA: string, hexB: string, weight = 0.5): string {
  const [r1, g1, b1] = hexToRgb(hexA)
  const [r2, g2, b2] = hexToRgb(hexB)
  const r = r1 * (1 - weight) + r2 * weight
  const g = g1 * (1 - weight) + g2 * weight
  const b = b1 * (1 - weight) + b2 * weight
  return rgbToHex(r, g, b)
}

function getMessageForMix(added: string[], newId: string): string {
  const all = [...added, newId]
  const hasBeet = all.includes("beet")
  const hasKale = all.includes("kale")
  const hasGinger = all.includes("ginger")
  const hasCharcoal = all.includes("charcoal")

  if (hasBeet && hasKale)
    return "Bold choice. Scientifically a powerhouse. Visually? Swamp chic."
  if (hasBeet && hasCharcoal) return "Dark and mysterious. The midnight blend."
  if (hasGinger && hasKale) return "Green fire. Your gut will thank you."
  if (hasCharcoal && hasGinger) return "Smoky gold. Unconventional. We approve."
  if (all.length >= 3) return "Three-way fusion. The lab is impressed."
  if (newId === "charcoal")
    return "Charcoal. Detox vibes. Proceed with confidence."
  if (newId === "beet") return "Beet. Earthy and bold. Blood of the earth."
  if (newId === "kale") return "Kale. Green royalty. You know what you're doing."
  if (newId === "ginger") return "Ginger. Spice and everything nice."
  return "Interesting. Keep going."
}

// ---- Types ----
export type ActiveView = "orb" | "stash" | "lab" | "checkout"
export type ZoomLevel = 1 | 2 | 3
export type CheckoutState =
  | "idle"
  | "scanning"
  | "filling"
  | "draining"
  | "complete"

interface AppState {
  // Vibe & Navigation
  vibe: number
  setVibe: (v: number) => void
  phase: "input" | "exiting"
  setPhase: (p: "input" | "exiting") => void
  activeView: ActiveView
  setActiveView: (v: ActiveView) => void
  isDiving: boolean
  setIsDiving: (d: boolean) => void
  isDragging: boolean
  setIsDragging: (d: boolean) => void
  commitVibe: (target: number) => void
  snapBack: () => void
  /** Override during warp exit for max intensity */
  warpDistortion: number | null
  warpChromaticOffset: number | null
  setWarpDistortion: (v: number | null) => void
  setWarpChromaticOffset: (v: number | null) => void

  // Stash
  focusedBottleIndex: number | null
  setFocusedBottleIndex: (i: number | null) => void
  zoomLevel: ZoomLevel
  setZoomLevel: (z: ZoomLevel) => void
  dofFocusDistance: number
  setDofFocusDistance: (d: number) => void

  // Lab
  addedIngredients: string[]
  fluidColor: string
  aiMessage: string
  mixIngredient: (id: string, color: string) => void

  // Checkout
  checkoutState: CheckoutState
  setCheckoutState: (s: CheckoutState) => void
}

export const useStore = create<AppState>((set, get) => ({
  vibe: 0.5,
  setVibe: (v) => set({ vibe: Math.max(0, Math.min(1, v)) }),
  phase: "input",
  setPhase: (p) => set({ phase: p }),
  activeView: "orb",
  setActiveView: (v) => set({ activeView: v }),
  isDiving: false,
  setIsDiving: (d) => set({ isDiving: d }),
  isDragging: false,
  setIsDragging: (d) => set({ isDragging: d }),

  commitVibe: (target) => {
    const start = get().vibe
    const startTime = { current: performance.now() }
    const animate = () => {
      const elapsed = performance.now() - startTime.current
      const t = Math.min(elapsed / 400, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      const next = start + (target - start) * eased
      set({ vibe: next })
      if (t < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  },

  snapBack: () => {
    const { vibe, setVibe, setPhase } = get()
    if (vibe > 0.8) {
      setVibe(1)
      setPhase("exiting")
    } else if (vibe < 0.2) {
      setVibe(0)
      setPhase("exiting")
    } else {
      setVibe(0.5)
    }
  },
  warpDistortion: null,
  warpChromaticOffset: null,
  setWarpDistortion: (v) => set({ warpDistortion: v }),
  setWarpChromaticOffset: (v) => set({ warpChromaticOffset: v }),

  focusedBottleIndex: null,
  setFocusedBottleIndex: (i) => set({ focusedBottleIndex: i }),
  zoomLevel: 1,
  setZoomLevel: (z) => set({ zoomLevel: z }),
  dofFocusDistance: 1,
  setDofFocusDistance: (d) => set({ dofFocusDistance: d }),

  addedIngredients: [],
  fluidColor: "#ffffff",
  aiMessage:
    "Let's build a masterpiece. Drag an ingredient into the vessel.",
  mixIngredient: (id, color) => {
    const { addedIngredients } = get()
    const nextIngredients = [...addedIngredients, id]
    const nextColor = blendColors(get().fluidColor, color, 0.35)
    const nextMessage = getMessageForMix(addedIngredients, id)
    set({
      addedIngredients: nextIngredients,
      fluidColor: nextColor,
      aiMessage: nextMessage,
    })
  },

  checkoutState: "idle",
  setCheckoutState: (s) => set({ checkoutState: s }),
}))
