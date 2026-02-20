"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Dna, FlaskConical, Grid2X2, Box } from "lucide-react"
import { DockIcon } from "./dock-icon"
import { useStore } from "@/store/use-store"

const NAV_ITEMS = [
  { id: "about", icon: Dna, label: "About" },
  { id: "lab", icon: FlaskConical, label: "Lab" },
  { id: "stash", icon: Grid2X2, label: "Stash" },
  { id: "cart", icon: Box, label: "Cart" },
] as const

type NavId = (typeof NAV_ITEMS)[number]["id"]

interface HUDProps {
  cartCount?: number
}

const NAV_ID_TO_VIEW = {
  about: "orb" as const,
  lab: "lab" as const,
  stash: "stash" as const,
  cart: "checkout" as const,
}

export function HUD({ cartCount = 0 }: HUDProps) {
  const phase = useStore((s) => s.phase)
  const activeView = useStore((s) => s.activeView)
  const setActiveView = useStore((s) => s.setActiveView)
  const [activeId, setActiveId] = useState<NavId | null>(null)
  const visible = phase !== "input" && activeView !== "checkout"

  const handleDockClick = (itemId: NavId) => {
    const nextId = activeId === itemId ? null : itemId
    setActiveId(nextId)
    if (nextId) setActiveView(NAV_ID_TO_VIEW[nextId])
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.nav
          initial={{ y: 48, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 48, opacity: 0 }}
          transition={{
            delay: 0.8,
            duration: 0.6,
            ease: [0.22, 1, 0.36, 1],
          }}
          className={[
            "fixed bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-[100]",
            "flex items-center gap-1 sm:gap-2",
            "px-4 sm:px-5 py-2.5 sm:py-3",
            "rounded-full",
            "bg-white/10",
            "backdrop-blur-xl",
            "border border-white/20",
            "shadow-[0_10px_40px_rgba(0,0,0,0.2)]",
          ].join(" ")}
          aria-label="Navigation dock"
        >
          {NAV_ITEMS.map((item) => (
            <DockIcon
              key={item.id}
              icon={item.icon}
              label={item.label}
              isActive={activeId === item.id}
              notificationCount={item.id === "cart" ? cartCount : undefined}
              onClick={() => handleDockClick(item.id)}
            />
          ))}
        </motion.nav>
      )}
    </AnimatePresence>
  )
}
