"use client"

import { useEffect, useState, useRef } from "react"
import { useStore } from "@/store/use-store"

type VibeZone = "depleted" | "neutral" | "hyper"

/**
 * DOM overlay for mood-reactive typography.
 * pointer-events-none so it never interferes with 3D interaction.
 *
 * Three states:
 * - Neutral (0.3-0.7): "How is your energy?" -- Geist, fading opacity
 * - Depleted (< 0.3): "RESTORE" -- characters reveal one-by-one, blur
 * - Hyper (> 0.7): "IGNITE" -- bold, stretched, jittery
 */
export function VibeTypography() {
  const phase = useStore((s) => s.phase)
  const [zone, setZone] = useState<VibeZone>("neutral")
  const [vibeVal, setVibeVal] = useState(0.5)
  const [dragging, setDragging] = useState(false)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const update = () => {
      const { vibe, isDragging: d } = useStore.getState()
      setVibeVal(vibe)
      setDragging(d)

      if (vibe < 0.3) setZone("depleted")
      else if (vibe > 0.7) setZone("hyper")
      else setZone("neutral")

      rafRef.current = requestAnimationFrame(update)
    }
    rafRef.current = requestAnimationFrame(update)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  // Extremity for opacity and effects
  const extremity = Math.abs(vibeVal - 0.5) * 2
  const opacity = dragging ? 0.3 + extremity * 0.7 : 0.15

  // When exiting, fade to 0 with a smooth 500ms CSS transition
  const isExiting = phase === "exiting"

  return (
    <div
      className="pointer-events-none fixed inset-0 flex flex-col items-center justify-center transition-opacity duration-500"
      style={{
        zIndex: 10,
        opacity: isExiting ? 0 : 1,
      }}
    >
      {/* Main mood text */}
      <div
        className="transition-all duration-700 ease-out"
        style={{ opacity }}
      >
        {zone === "neutral" && (
          <NeutralText opacity={1 - extremity} />
        )}
        {zone === "depleted" && (
          <DepletedText intensity={1 - vibeVal / 0.3} />
        )}
        {zone === "hyper" && (
          <HyperText intensity={(vibeVal - 0.7) / 0.3} />
        )}
      </div>

      {/* Subtle vibe indicator line */}
      {dragging && (
        <div className="mt-12 flex items-center gap-3">
          <div
            className="h-px transition-all duration-200"
            style={{
              width: `${60 + extremity * 100}px`,
              background: vibeVal < 0.5
                ? `rgba(26, 11, 46, ${0.3 + extremity * 0.7})`
                : `rgba(204, 255, 0, ${0.3 + extremity * 0.7})`,
            }}
          />
        </div>
      )}
    </div>
  )
}

function NeutralText({ opacity }: { opacity: number }) {
  return (
    <p
      className="font-sans text-lg tracking-[0.3em] uppercase transition-opacity duration-1000"
      style={{
        color: `rgba(192, 192, 192, ${opacity * 0.5})`,
        letterSpacing: "0.3em",
      }}
    >
      {"How is your energy?".split("").map((char, i) => (
        <span
          key={i}
          className="inline-block"
          style={{
            animationDelay: `${i * 80}ms`,
          }}
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </p>
  )
}

function DepletedText({ intensity }: { intensity: number }) {
  const text = "RESTORE"
  return (
    <div className="flex gap-1">
      {text.split("").map((char, i) => (
        <span
          key={i}
          className="font-sans text-5xl font-light tracking-[0.2em] transition-all duration-500"
          style={{
            color: `rgba(26, 11, 46, ${0.3 + intensity * 0.7})`,
            filter: `blur(${(1 - intensity) * 4}px)`,
            opacity: intensity > i / text.length ? 1 : 0,
            transform: `translateY(${(1 - intensity) * 10}px)`,
            transitionDelay: `${i * 100}ms`,
          }}
        >
          {char}
        </span>
      ))}
    </div>
  )
}

function HyperText({ intensity }: { intensity: number }) {
  const text = "IGNITE"
  return (
    <div className="flex gap-0.5">
      {text.split("").map((char, i) => (
        <span
          key={i}
          className="font-sans text-5xl font-black tracking-tight transition-all duration-150"
          style={{
            color: `rgba(204, 255, 0, ${0.5 + intensity * 0.5})`,
            transform: `scaleX(${1 + intensity * 0.4}) translateY(${
              Math.sin(Date.now() * 0.01 + i) * intensity * 3
            }px)`,
            textShadow: `0 0 ${intensity * 20}px rgba(204, 255, 0, ${intensity * 0.6})`,
          }}
        >
          {char}
        </span>
      ))}
    </div>
  )
}
