"use client"

import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft } from "lucide-react"
import { useStore } from "@/store/use-store"

export function StashBackButton() {
  const activeView = useStore((s) => s.activeView)
  const focusedBottleIndex = useStore((s) => s.focusedBottleIndex)
  const setFocusedBottleIndex = useStore((s) => s.setFocusedBottleIndex)
  const setZoomLevel = useStore((s) => s.setZoomLevel)
  const setDofFocusDistance = useStore((s) => s.setDofFocusDistance)
  const visible = activeView === "stash" && focusedBottleIndex !== null

  const handleBack = () => {
    setFocusedBottleIndex(null)
    setZoomLevel(1)
    setDofFocusDistance(1)
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{ duration: 0.2 }}
          onClick={handleBack}
          className="fixed top-6 left-6 z-[100] flex items-center gap-2 rounded-full bg-white/10 px-4 py-2.5 text-sm font-medium text-white backdrop-blur-xl border border-white/20 hover:bg-white/20"
          aria-label="Back to carousel"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </motion.button>
      )}
    </AnimatePresence>
  )
}
