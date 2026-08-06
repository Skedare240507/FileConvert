/**
 * services/payment/razorpay.ts
 *
 * Razorpay payment service — order creation, signature verification, webhook handling.
 *
 * Install: npm install razorpay
 */

import crypto from 'crypto';
import { env } from '@/backend/config/env';
import { logger } from '@/backend/utils/logger';

// ── Order creation ────────────────────────────────────────────────────────

const PLAN_AMOUNTS: Record<'pro' | 'business', number> = {
  pro: 8900,     // ₹89 in paise
  business: 15000, // ₹150 in paise
};

export async function createRazorpayOrder(plan: 'pro' | 'business'): Promise<{
  orderId: string;
  amount: number;
  currency: string;
}> {
  const amount = PLAN_AMOUNTS[plan];

  const response = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${Buffer.from(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`).toString('base64')}`,
    },
    body: JSON.stringify({
      amount,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Razorpay order creation failed: ${error}`);
  }

  const data = await response.json() as { id: string; amount: number; currency: string };
  logger.info(`[Razorpay] Order created: ${data.id} — ₹${amount / 100}`);
  return { orderId: data.id, amount: data.amount, currency: data.currency };
}

// ── Signature verification ────────────────────────────────────────────────

/**
 * Verifies the HMAC signature returned by Razorpay after a successful payment.
 * MUST be called server-side; never trust the client's assertion.
 */
export function verifyPaymentSignature(params: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  const body = `${params.orderId}|${params.paymentId}`;
  const expectedSignature = crypto
    .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');
  return expectedSignature === params.signature;
}

// ── Webhook signature verification ───────────────────────────────────────

/**
 * Verifies the X-Razorpay-Signature header on incoming webhook events.
 */
export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', env.RAZORPAY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest('hex');
  return expectedSignature === signature;
}

// ── Supported webhook event types ─────────────────────────────────────────

export type RazorpayWebhookEvent =
  | 'subscription.charged'
  | 'subscription.halted'
  | 'subscription.cancelled'
  | 'payment.captured'
  | 'payment.failed';
