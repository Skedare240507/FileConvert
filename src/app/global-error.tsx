"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <head>
        <title>Critical Error | FileConvert</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0" />
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: 'Inter', system-ui, sans-serif;
            background: linear-gradient(135deg, #0d0a1e 0%, #1a0a2e 40%, #150a35 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            position: relative;
            padding: 2rem;
          }
          .blob {
            position: absolute;
            border-radius: 50%;
            pointer-events: none;
          }
          .blob1 {
            top: -15%; right: -10%; width: 550px; height: 550px;
            background: radial-gradient(circle, rgba(180,0,100,0.15) 0%, transparent 70%);
          }
          .blob2 {
            bottom: -15%; left: -10%; width: 650px; height: 650px;
            background: radial-gradient(circle, rgba(80,0,180,0.1) 0%, transparent 70%);
          }
          .content {
            position: relative; z-index: 10; text-align: center;
            max-width: 560px; display: flex; flex-direction: column;
            align-items: center; gap: 1.4rem;
          }
          .logo {
            font-size: 1.1rem; font-weight: 700; color: #6bd8cb;
            letter-spacing: -0.01em; margin-bottom: 0.5rem;
          }
          .code {
            font-size: clamp(5rem,14vw,8rem); font-weight: 900; line-height: 1;
            background: linear-gradient(135deg, #ff6b9d, #c44b8a, #ff9dbf);
            -webkit-background-clip: text; -webkit-text-fill-color: transparent;
            background-clip: text; letter-spacing: -0.04em;
            filter: drop-shadow(0 0 50px rgba(255,107,157,0.3));
          }
          .badge {
            display: inline-flex; align-items: center; gap: 0.4rem;
            background: rgba(255,107,157,0.1); border: 1px solid rgba(255,107,157,0.25);
            color: #ff6b9d; padding: 0.4rem 1rem; border-radius: 9999px;
            font-size: 0.78rem; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase;
          }
          h1 {
            font-size: clamp(1.1rem,3vw,1.5rem); font-weight: 700;
            color: #f0e8f4; line-height: 1.3;
          }
          p {
            font-size: 0.95rem; color: rgba(220,200,230,0.6); line-height: 1.7; max-width: 440px;
          }
          .actions { display: flex; gap: 1rem; flex-wrap: wrap; justify-content: center; margin-top: 0.5rem; }
          .btn-primary {
            display: inline-flex; align-items: center; gap: 0.5rem;
            background: linear-gradient(135deg, #b5366c, #ff6b9d); color: #fff;
            padding: 0.75rem 1.75rem; border-radius: 0.6rem; font-size: 0.95rem;
            font-weight: 600; border: none; cursor: pointer; font-family: inherit;
            box-shadow: 0 4px 20px rgba(255,107,157,0.3); transition: transform 0.2s;
          }
          .btn-primary:hover { transform: translateY(-2px); }
          .btn-outline {
            display: inline-flex; align-items: center; gap: 0.5rem;
            background: rgba(255,107,157,0.08); border: 1.5px solid rgba(255,107,157,0.35);
            color: #ff6b9d; padding: 0.75rem 1.75rem; border-radius: 0.6rem;
            font-size: 0.95rem; font-weight: 600; cursor: pointer; font-family: inherit;
            transition: transform 0.2s, background 0.2s;
          }
          .btn-outline:hover { transform: translateY(-2px); background: rgba(255,107,157,0.15); }
          .digest {
            font-size: 0.76rem; color: rgba(220,200,230,0.35); font-family: monospace;
          }
          .material-symbols-outlined {
            font-family: 'Material Symbols Outlined'; font-size: 1.1rem;
            font-weight: normal; font-style: normal; display: inline-block; line-height: 1;
          }
        `}</style>
      </head>
      <body>
        <div className="blob blob1" />
        <div className="blob blob2" />
        <div className="content">
          <div className="logo">⚡ FileConvert</div>

          <span className="badge">
            <span className="material-symbols-outlined">crisis_alert</span>
            Critical Error
          </span>

          <div className="code">Oops</div>

          <h1>The application crashed unexpectedly</h1>
          <p>
            Something went very wrong at the application level. Our team has automatically
            been notified via Sentry. Please try refreshing — this is usually temporary.
          </p>

          {error?.digest && (
            <p className="digest">Error ID: {error.digest}</p>
          )}

          <div className="actions">
            <button className="btn-primary" onClick={reset}>
              <span className="material-symbols-outlined">refresh</span>
              Reload App
            </button>
            <button className="btn-outline" onClick={() => { window.location.href = '/'; }}>
              <span className="material-symbols-outlined">home</span>
              Go Home
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
