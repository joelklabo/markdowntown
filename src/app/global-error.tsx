'use client';

import * as Sentry from "@sentry/nextjs";

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  Sentry.captureException(error);
  return (
    <html>
      <body className="bg-mdt-bg text-mdt-text">
        <div className="mx-auto max-w-lg space-y-4 px-4 py-10 text-center">
          <h2 className="text-h2">Something went wrong</h2>
          <p className="text-body text-mdt-muted">We’ve logged the error and are looking into it.</p>
          <button
            onClick={() => reset()}
            className="btn btn-primary"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
