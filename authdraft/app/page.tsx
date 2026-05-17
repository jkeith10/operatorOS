import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-gray-900 text-white px-6 py-4 flex items-center justify-between">
        <span className="text-xl font-bold tracking-tight">AuthDraft</span>
        <nav className="flex gap-4 items-center">
          <Link href="/sign-in" className="text-sm text-gray-300 hover:text-white transition-colors">
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="text-sm bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Get started
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-sm font-medium px-3 py-1 rounded-full mb-6">
          <span className="w-2 h-2 rounded-full bg-blue-500 inline-block"></span>
          AI-powered prior authorization
        </div>
        <h1 className="text-5xl font-extrabold text-gray-900 leading-tight mb-6">
          Write prior auth letters<br />in 30 seconds
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
          Stop wasting 3 hours per denial. AuthDraft generates medically precise prior authorization
          and appeal letters instantly — so you can focus on patient care.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/sign-up"
            className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-3 rounded-xl text-lg transition-colors shadow-sm"
          >
            Start free trial
          </Link>
          <Link
            href="/sign-in"
            className="border border-gray-300 hover:border-gray-400 text-gray-700 font-semibold px-8 py-3 rounded-xl text-lg transition-colors"
          >
            Sign in
          </Link>
        </div>
        <p className="text-sm text-gray-400 mt-4">No credit card required to try</p>
      </section>

      {/* Stats strip */}
      <section className="bg-gray-50 border-y border-gray-200 py-8">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-gray-900">30 sec</div>
            <div className="text-sm text-gray-500 mt-1">Average generation time</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-900">4 types</div>
            <div className="text-sm text-gray-500 mt-1">Auth, appeal, peer-to-peer</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-900">9 insurers</div>
            <div className="text-sm text-gray-500 mt-1">Including Medicare &amp; Medicaid</div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-4xl mx-auto px-6 py-24" id="pricing">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">Simple, transparent pricing</h2>
        <p className="text-center text-gray-500 mb-14">Choose the plan that fits your practice size</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Starter */}
          <div className="border border-gray-200 rounded-2xl p-8 flex flex-col">
            <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Starter</div>
            <div className="flex items-end gap-1 mb-1">
              <span className="text-4xl font-extrabold text-gray-900">$299</span>
              <span className="text-gray-500 mb-1">/month</span>
            </div>
            <p className="text-sm text-gray-500 mb-8">Up to 50 letters per month</p>
            <ul className="space-y-3 text-sm text-gray-700 mb-10 flex-1">
              {[
                "50 letters per month",
                "All letter types (PA, appeals, P2P)",
                "9 major insurers supported",
                "PDF download",
                "Letter history & outcome tracking",
                "Email support",
              ].map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/sign-up"
              className="w-full text-center bg-gray-900 hover:bg-gray-700 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              Get started
            </Link>
          </div>

          {/* Pro */}
          <div className="border-2 border-blue-600 rounded-2xl p-8 flex flex-col relative shadow-lg">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
              Most popular
            </div>
            <div className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-2">Pro</div>
            <div className="flex items-end gap-1 mb-1">
              <span className="text-4xl font-extrabold text-gray-900">$599</span>
              <span className="text-gray-500 mb-1">/month</span>
            </div>
            <p className="text-sm text-gray-500 mb-8">Unlimited letters per month</p>
            <ul className="space-y-3 text-sm text-gray-700 mb-10 flex-1">
              {[
                "Unlimited letters",
                "All letter types (PA, appeals, P2P)",
                "9 major insurers supported",
                "PDF download",
                "Letter history & outcome tracking",
                "Priority support",
                "Early access to new features",
              ].map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/sign-up"
              className="w-full text-center bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              Get started
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center text-sm text-gray-400">
        <p>© {new Date().getFullYear()} AuthDraft. All rights reserved.</p>
      </footer>
    </div>
  );
}
