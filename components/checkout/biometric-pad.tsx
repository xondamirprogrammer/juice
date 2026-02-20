"use client"

import { useRef } from "react"
import { motion } from "framer-motion"
import { Fingerprint } from "lucide-react"
import { useStore } from "@/store/use-store"
import { playHydraulicFlood } from "@/hooks/use-sfx"
import { generatePaymentIntent } from "@/app/actions/checkout"

const HOLD_MS = 1500

export function BiometricPad() {
  const activeView = useStore((s) => s.activeView)
  const checkoutState = useStore((s) => s.checkoutState)
  const setCheckoutState = useStore((s) => s.setCheckoutState)
  const addedIngredients = useStore((s) => s.addedIngredients)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hapticRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const visible =
    activeView === "checkout" &&
    (checkoutState === "idle" || checkoutState === "scanning")
  if (!visible) return null

  const onPointerDown = () => {
    setCheckoutState("scanning")
    timeoutRef.current = setTimeout(async () => {
      timeoutRef.current = null
      setCheckoutState("filling")
      playHydraulicFlood()
      if (typeof window !== "undefined" && window.PaymentRequest) {
        const { ok, total } = await generatePaymentIntent(addedIngredients)
        if (!ok) return
        const valueStr = total.toFixed(2)
        const supportedInstruments: PaymentMethodData[] = [
          { supportedMethods: "https://apple.com/apple-pay" },
          { supportedMethods: "basic-card" },
        ]
        const details: PaymentDetailsInit = {
          total: {
            label: "Synesthetic Juice Batch",
            amount: { currency: "USD", value: valueStr },
          },
        }
        try {
          const request = new PaymentRequest(supportedInstruments, details)
          request
            .show()
            .then((response) => {
              response.complete("success")
            })
            .catch((e) => {
              if (typeof console !== "undefined") console.log("Payment dismissed", e)
            })
        } catch (e) {
          if (typeof console !== "undefined") console.log("Payment API error", e)
        }
      }
      if (hapticRef.current) {
        clearInterval(hapticRef.current)
        hapticRef.current = null
      }
    }, HOLD_MS)
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      hapticRef.current = setInterval(() => navigator.vibrate(50), 100)
    }
  }

  const onPointerUp = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    if (hapticRef.current) {
      clearInterval(hapticRef.current)
      hapticRef.current = null
    }
    if (checkoutState === "scanning") setCheckoutState("idle")
  }

  const isScanning = checkoutState === "scanning"

  return (
    <div
      className="fixed inset-0 z-[110] flex flex-col items-center justify-center bg-black"
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
      style={{ touchAction: "none" }}
    >
      <p className="absolute left-6 top-12 text-xs font-mono tracking-widest text-white/60">
        DESTINATION: LOCAL WALLET
      </p>
      <p className="absolute bottom-24 left-1/2 -translate-x-1/2 text-sm font-mono tracking-wider text-white/70">
        TOTAL ENERGY: ${addedIngredients.length > 0 ? "45.00" : "0.00"}
      </p>

      <div className="relative flex items-center justify-center">
        <motion.svg
          viewBox="0 0 100 100"
          className="h-24 w-24 text-white/90"
          initial={false}
          animate={{ rotate: isScanning ? 0 : 0 }}
        >
          <motion.circle
            cx="50"
            cy="50"
            r="48"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray={2 * Math.PI * 48}
            strokeDashoffset={2 * Math.PI * 48 * (1 - (isScanning ? 1 : 0))}
            strokeLinecap="round"
            className="text-[#CCFF00] opacity-80"
            initial={false}
            animate={{
              strokeDashoffset: isScanning
                ? 0
                : 2 * Math.PI * 48,
            }}
            transition={
              isScanning
                ? { duration: 1.5, ease: "linear" }
                : { duration: 0.25, ease: "easeOut" }
            }
          />
        </motion.svg>
        <div className="absolute flex items-center justify-center">
          <Fingerprint className="h-16 w-16 text-white/80" strokeWidth={1.2} />
        </div>
      </div>
      <p className="mt-6 text-xs font-mono text-white/50">Hold to charge</p>
    </div>
  )
}
