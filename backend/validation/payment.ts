/**
 * validation/payment.ts
 *
 * Zod schemas for payment and webhook request bodies.
 */

import { z } from 'zod';

export const createOrderSchema = z.object({
  plan: z.enum(['pro', 'business']),
});

export const verifyPaymentSchema = z.object({
  orderId: z.string().min(1),
  paymentId: z.string().min(1),
  signature: z.string().min(1),
  plan: z.enum(['pro', 'business']),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>;
