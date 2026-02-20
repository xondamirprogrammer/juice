"use client"

import { useStore } from "@/store/use-store"

const VISUALLY_HIDDEN =
  "absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0 clip-[rect(0,0,0,0)]"

/**
 * Invisible aria-live region for screen readers: AI Sommelier message and checkout status.
 */
export function ScreenReaderAnnouncer() {
  const aiMessage = useStore((s) => s.aiMessage)
  const checkoutState = useStore((s) => s.checkoutState)

  const checkoutLabel =
    checkoutState === "idle"
      ? "Checkout ready."
      : checkoutState === "scanning"
        ? "Scanning."
        : checkoutState === "filling"
          ? "Filling."
          : checkoutState === "draining"
            ? "Draining."
            : checkoutState === "complete"
              ? "Checkout complete."
              : ""

  return (
    <div
      className={VISUALLY_HIDDEN}
      aria-live="polite"
      aria-atomic="true"
      role="status"
    >
      {aiMessage}
      {checkoutLabel && ` ${checkoutLabel}`}
    </div>
  )
}
