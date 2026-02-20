"use client"

import { useRef, useEffect } from "react"
import { motion, useMotionValue, useSpring } from "framer-motion"
import type { LucideIcon } from "lucide-react"

const MAGNETIC_RADIUS = 80
const MAX_PULL = 14
const PULL_STRENGTH = 0.28

interface DockIconProps {
  icon: LucideIcon
  label: string
  isActive?: boolean
  notificationCount?: number
  onClick?: () => void
}

export function DockIcon({
  icon: Icon,
  label,
  isActive,
  notificationCount,
  onClick,
}: DockIconProps) {
  const ref = useRef<HTMLButtonElement>(null)

  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)

  const x = useSpring(rawX, { stiffness: 350, damping: 22, mass: 0.4 })
  const y = useSpring(rawY, { stiffness: 350, damping: 22, mass: 0.4 })

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const handleMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2

      const dx = e.clientX - centerX
      const dy = e.clientY - centerY
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance < MAGNETIC_RADIUS) {
        const clamp = (v: number) => Math.max(-MAX_PULL, Math.min(MAX_PULL, v))
        rawX.set(clamp(dx * PULL_STRENGTH))
        rawY.set(clamp(dy * PULL_STRENGTH))
      } else {
        rawX.set(0)
        rawY.set(0)
      }
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      rawX.set(0)
      rawY.set(0)
    }
  }, [rawX, rawY])

  const hasNotification = notificationCount != null && notificationCount > 0

  return (
    <motion.button
      ref={ref}
      style={{ x, y }}
      onClick={onClick}
      whileTap={{ scale: 0.88 }}
      className="relative flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 group cursor-pointer"
      aria-label={label}
    >
      <Icon
        size={20}
        strokeWidth={1.5}
        className={[
          "text-white transition-all duration-200",
          isActive
            ? "opacity-100 drop-shadow-[0_0_10px_rgba(255,255,255,0.9)]"
            : "opacity-50 group-hover:opacity-100 group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.7)]",
        ].join(" ")}
      />

      {hasNotification && (
        <span
          className={[
            "absolute -top-0.5 -right-0.5 flex items-center justify-center",
            "min-w-[15px] h-[15px] px-1 rounded-full",
            "bg-[#CCFF00] text-black text-[9px] font-bold leading-none",
            "shadow-[0_0_10px_rgba(204,255,0,0.9),0_0_20px_rgba(204,255,0,0.4)]",
          ].join(" ")}
        >
          {notificationCount! > 9 ? "9+" : notificationCount}
        </span>
      )}
    </motion.button>
  )
}
