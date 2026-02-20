"use client"

import { useStore } from "@/store/use-store"

const VISUALLY_HIDDEN =
  "absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0 clip-[rect(0,0,0,0)] focus:static focus:w-auto focus:h-auto focus:p-2 focus:overflow-visible focus:whitespace-normal focus:clip-auto focus:z-[200] focus:bg-white/90 focus:text-black focus:rounded"

/**
 * Keyboard-only navigation: TAB to focus Orb, Stash, Lab buttons and switch views.
 */
export function KeyboardNav() {
  const phase = useStore((s) => s.phase)
  const activeView = useStore((s) => s.activeView)
  const setActiveView = useStore((s) => s.setActiveView)

  if (phase === "input") return null

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 flex gap-2 z-[90]" role="navigation" aria-label="Main views">
      <button
        type="button"
        className={VISUALLY_HIDDEN}
        onClick={() => setActiveView("orb")}
        aria-current={activeView === "orb" ? "true" : undefined}
      >
        Go to Orb
      </button>
      <button
        type="button"
        className={VISUALLY_HIDDEN}
        onClick={() => setActiveView("stash")}
        aria-current={activeView === "stash" ? "true" : undefined}
      >
        Go to Stash
      </button>
      <button
        type="button"
        className={VISUALLY_HIDDEN}
        onClick={() => setActiveView("lab")}
        aria-current={activeView === "lab" ? "true" : undefined}
      >
        Go to Lab
      </button>
    </div>
  )
}
