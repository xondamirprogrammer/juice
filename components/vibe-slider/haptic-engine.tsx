"use client"

import { useEffect, useRef } from "react"
import { useStore } from "@/store/use-store"

/**
 * HapticEngine: DOM component that drives navigator.vibrate() from store state.
 */
export function HapticEngine() {
  const lastPatternRef = useRef<string>("neutral")
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const canVibrate =
    typeof navigator !== "undefined" &&
    typeof navigator.vibrate === "function"

  useEffect(() => {
    if (!canVibrate) return

    const unsub = useStore.subscribe((state) => {
      const { isDragging, vibe } = state

      if (!isDragging) {
        navigator.vibrate(0)
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
        }
        lastPatternRef.current = "neutral"
        return
      }

      // Touch start pulse (handled by first transition into dragging)
      if (lastPatternRef.current === "neutral") {
        navigator.vibrate(10)
      }

      let pattern: string
      if (vibe < 0.3) pattern = "depleted"
      else if (vibe > 0.7) pattern = "hyper"
      else pattern = "neutral"

      if (pattern === lastPatternRef.current) return
      lastPatternRef.current = pattern

      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }

      if (pattern === "depleted") {
        navigator.vibrate([200, 50, 100, 500])
        intervalRef.current = setInterval(() => {
          if (useStore.getState().isDragging) {
            navigator.vibrate([200, 50, 100, 500])
          }
        }, 850)
      } else if (pattern === "hyper") {
        navigator.vibrate([10, 10, 10, 10, 10, 10])
        intervalRef.current = setInterval(() => {
          if (useStore.getState().isDragging) {
            navigator.vibrate([10, 10, 10, 10, 10, 10])
          }
        }, 80)
      } else {
        navigator.vibrate(0)
      }
    })

    return () => {
      unsub()
      if (intervalRef.current) clearInterval(intervalRef.current)
      navigator.vibrate(0)
    }
  }, [canVibrate])

  return null
}
