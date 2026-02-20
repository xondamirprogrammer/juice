"use client"

import { useStore } from "@/store/use-store"
import { FluidTank } from "./fluid-tank"
import { LaserEtchedBottle } from "./laser-etched-bottle"

export function CheckoutScene() {
  const checkoutState = useStore((s) => s.checkoutState)
  return (
    <group>
      <FluidTank />
      {checkoutState === "complete" && <LaserEtchedBottle />}
    </group>
  )
}
