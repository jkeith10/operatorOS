"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function OnboardingClient() {
  const router = useRouter();
  const [loading, setLoading] = useState<"starter" | "pro" | null>(null);

  async function selectPlan(plan: "starter" | "pro") {
    const priceId =
      plan === "starter"
        ? process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY // placeholder fallback
        : undefined;

    setLoading(plan);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data.url) {
        router.push(data.url);
      } else {
        alert(data.error ?? "Something went wrong");
        setLoading(null);
      }
    } catch {
      alert("Network error. Please try again.");
      setLoading(null);
    }
  }

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center px-4 py-16">
      <h1 className="text-3xl font-bold text-gray-900 mb-3">Choose your plan</h1>
      <p className="text-gray-500 mb-12 text-center max-w-md">
        Select a plan to start generating prior authorization letters instantly.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
        {/* Starter */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8 flex flex-col shadow-sm">
          <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Starter</div>
          <div className="flex items-end gap-1 mb-1">
            <span className="text-4xl font-extrabold text-gray-900">$299</span>
            <span className="text-gray-500 mb-1">/month</span>
          </div>
          <p className="text-sm text-gray-500 mb-8">50 letters per month</p>
          <ul className="space-y-2 text-sm text-gray-600 mb-8 flex-1">
            {["50 letters / month", "All letter types", "PDF download", "Outcome tracking", "Email support"].map((f) => (
              <li key={f} className="flex items-center gap-2">
                <span className="text-green-500">✓</span> {f}
              </li>
            ))}
          </ul>
          <button
            onClick={() => selectPlan("starter")}
            disabled={loading !== null}
            className="w-full bg-gray-900 hover:bg-gray-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            {loading === "starter" ? "Redirecting…" : "Select Starter"}
          </button>
        </div>

        {/* Pro */}
        <div className="bg-white border-2 border-blue-600 rounded-2xl p-8 flex flex-col shadow-lg relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
            Most popular
          </div>
          <div className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-2">Pro</div>
          <div className="flex items-end gap-1 mb-1">
            <span className="text-4xl font-extrabold text-gray-900">$599</span>
            <span className="text-gray-500 mb-1">/month</span>
          </div>
          <p className="text-sm text-gray-500 mb-8">Unlimited letters</p>
          <ul className="space-y-2 text-sm text-gray-600 mb-8 flex-1">
            {["Unlimited letters", "All letter types", "PDF download", "Outcome tracking", "Priority support", "Early access"].map((f) => (
              <li key={f} className="flex items-center gap-2">
                <span className="text-blue-500">✓</span> {f}
              </li>
            ))}
          </ul>
          <button
            onClick={() => selectPlan("pro")}
            disabled={loading !== null}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            {loading === "pro" ? "Redirecting…" : "Select Pro"}
          </button>
        </div>
      </div>
    </div>
  );
}
