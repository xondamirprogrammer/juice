"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useStore } from "@/store/use-store"

export function AISommelier() {
  const activeView = useStore((s) => s.activeView)
  const setActiveView = useStore((s) => s.setActiveView)
  const aiMessage = useStore((s) => s.aiMessage)
  const addedIngredients = useStore((s) => s.addedIngredients)
  const visible = activeView === "lab"

  if (!visible) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.3 }}
        className="fixed left-1/2 top-8 z-[100] w-full max-w-md -translate-x-1/2 px-4"
      >
        <div
          className={[
            "rounded-2xl border border-white/20 bg-white/10 px-5 py-4 backdrop-blur-md",
            "shadow-[0_10px_40px_rgba(0,0,0,0.3)]",
          ].join(" ")}
        >
          <p className="text-center text-sm font-medium leading-relaxed text-white/95">
            <motion.span
              key={aiMessage}
              initial={{ opacity: 0, filter: "blur(4px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              transition={{ duration: 0.25 }}
            >
              {aiMessage}
            </motion.span>
          </p>
          <AnimatePresence>
            {addedIngredients.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="mt-4 flex justify-center"
              >
                <button
                  type="button"
                  onClick={() => setActiveView("checkout")}
                  className={[
                    "rounded-full px-6 py-2.5 text-sm font-semibold",
                    "bg-white/20 text-white backdrop-blur-sm",
                    "border border-white/30 shadow-[0_0_20px_rgba(255,255,255,0.15)]",
                    "hover:bg-white/30 hover:shadow-[0_0_28px_rgba(255,255,255,0.2)]",
                    "transition-all duration-200",
                  ].join(" ")}
                >
                  PRESS BATCH
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
