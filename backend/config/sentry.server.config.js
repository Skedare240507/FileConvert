import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://c45bd1ac5e73aee8807f52eb7e4a4891@o4512135741767680.ingest.de.sentry.io/4512135754022992",

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
});