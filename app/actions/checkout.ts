"use server"

/**
 * Server-side validation before payment.
 * Simulates secure cart total validation; in production would verify against DB and create Stripe PaymentIntent.
 */
export async function generatePaymentIntent(cartData: unknown): Promise<{ ok: boolean }> {
  // Mock secure server-side validation
  if (typeof process !== "undefined" && process.env?.NODE_ENV !== "test") {
    // eslint-disable-next-line no-console
    console.log("Validating cart total on secure server...", cartData)
  }
  return { ok: true }
}
