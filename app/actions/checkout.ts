"use server"

/**
 * Server-side pricing: single source of truth to prevent client tampering.
 * In production, replace with DB lookup.
 */
const PRICING_DB: Record<string, number> = {
  custom_batch: 45.0,
  default: 12.0,
}

/**
 * Server-side validation and total calculation.
 * Accepts cart item IDs and returns the authoritative total (no client-supplied price).
 * In production would create a Stripe PaymentIntent and return clientSecret.
 */
export async function generatePaymentIntent(
  cartItems: string[]
): Promise<{ ok: boolean; total: number; clientSecret?: string }> {
  let total = 0
  for (const id of cartItems) {
    total += PRICING_DB[id] ?? PRICING_DB.default
  }
  // Custom batch: if they have any ingredients, treat as one custom batch for demo
  if (cartItems.length > 0) {
    total = PRICING_DB.custom_batch
  }
  if (typeof process !== "undefined" && process.env?.NODE_ENV !== "test") {
    // eslint-disable-next-line no-console
    console.log("Server cart validation:", { cartItems, total })
  }
  return {
    ok: true,
    total,
    clientSecret: undefined, // In production: Stripe PaymentIntent client_secret
  }
}
