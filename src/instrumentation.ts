import * as Sentry from "@sentry/nextjs";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("../backend/config/sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("../backend/config/sentry.edge.config");
  }
}

export const onRequestError = Sentry.captureRequestError;
