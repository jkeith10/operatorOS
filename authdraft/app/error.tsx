"use client";

import { useEffect } from "react";

export default function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <h2 className="text-xl font-semibold text-gray-800">Something went wrong</h2>
      <p className="text-gray-500 text-sm">{error.message}</p>
      <button
        onClick={reset}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-500 transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
