"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { UserButton } from "@clerk/nextjs";

type Letter = {
  id: string;
  insurer: string;
  request_type: string;
  patient_age: string | null;
  diagnosis: string;
  procedure: string;
  clinical_notes: string | null;
  letter_text: string;
  outcome: "approved" | "denied" | null;
  created_at: string;
};

type User = {
  plan: "starter" | "pro";
  usage_count: number;
  usage_reset_at: string;
  email: string;
  name: string | null;
};

type Props = {
  userId: string;
  user: User;
  letters: Letter[];
  upgraded: boolean;
};

const INSURERS = [
  "Aetna",
  "Anthem",
  "Blue Cross Blue Shield",
  "Cigna",
  "Humana",
  "Medicaid",
  "Medicare",
  "UnitedHealthcare",
  "Other",
];

const REQUEST_TYPES = [
  "Prior Authorization",
  "Appeal — First Level",
  "Appeal — Second Level",
  "Peer-to-Peer Request",
];

function printPDF(letter: string, meta: { insurer: string; requestType: string }) {
  const w = window.open("", "_blank")!;
  w.document.write(`<!DOCTYPE html><html><head><title>Auth Letter</title>
  <style>body{font-family:Georgia,serif;font-size:13px;line-height:1.8;max-width:680px;margin:60px auto;color:#111;padding:0 40px}.header{border-bottom:2px solid #111;padding-bottom:16px;margin-bottom:32px}pre{white-space:pre-wrap;font-family:Georgia,serif}@media print{body{margin:40px}}</style></head><body>
  <div class="header"><div style="font-size:18px;font-weight:700">AuthDraft — Prior Authorization Letter</div>
  <div style="font-size:11px;color:#666;margin-top:8px">${meta.requestType} · ${meta.insurer} · ${new Date().toLocaleDateString()}</div></div>
  <pre>${letter.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre><script>window.onload=()=>window.print()<\/script></body></html>`);
  w.document.close();
}

export default function DashboardClient({ userId, user, letters: initialLetters, upgraded }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<"generate" | "history">("generate");
  const [letters, setLetters] = useState<Letter[]>(initialLetters);
  const [showUpgradeBanner, setShowUpgradeBanner] = useState(upgraded);

  // Generate form
  const [insurer, setInsurer] = useState("");
  const [requestType, setRequestType] = useState("");
  const [patientAge, setPatientAge] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [procedure, setProcedure] = useState("");
  const [clinicalNotes, setClinicalNotes] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generatedLetter, setGeneratedLetter] = useState("");
  const [generatedMeta, setGeneratedMeta] = useState<{ insurer: string; requestType: string } | null>(null);
  const [formError, setFormError] = useState("");
  const [copied, setCopied] = useState(false);
  const [, startTransition] = useTransition();

  const usageLimit = user.plan === "pro" ? Infinity : 50;
  const usageDisplay = user.plan === "pro" ? `${user.usage_count} / ∞` : `${user.usage_count} / 50`;

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");

    if (!insurer) { setFormError("Please select an insurer."); return; }
    if (!requestType) { setFormError("Please select a request type."); return; }
    if (!diagnosis.trim()) { setFormError("Diagnosis / ICD-10 is required."); return; }
    if (!procedure.trim()) { setFormError("Procedure / CPT is required."); return; }

    setGenerating(true);
    setGeneratedLetter("");
    setGeneratedMeta(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ insurer, requestType, patientAge, diagnosis, procedure, clinicalNotes }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error ?? "Generation failed.");
        return;
      }
      setGeneratedLetter(data.letter);
      setGeneratedMeta({ insurer, requestType });
      startTransition(() => { router.refresh(); });
      // Fetch updated letters
      const lettersRes = await fetch("/api/letters");
      if (lettersRes.ok) {
        const lettersData = await lettersRes.json();
        setLetters(lettersData.letters ?? []);
      }
    } catch {
      setFormError("Network error. Please try again.");
    } finally {
      setGenerating(false);
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(generatedLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleClear() {
    setGeneratedLetter("");
    setGeneratedMeta(null);
    setInsurer("");
    setRequestType("");
    setPatientAge("");
    setDiagnosis("");
    setProcedure("");
    setClinicalNotes("");
  }

  function viewLetter(letter: Letter) {
    setGeneratedLetter(letter.letter_text);
    setGeneratedMeta({ insurer: letter.insurer, requestType: letter.request_type });
    setTab("generate");
  }

  async function setOutcome(letterId: string, outcome: "approved" | "denied" | null) {
    const res = await fetch(`/api/letters/${letterId}/outcome`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ outcome }),
    });
    if (res.ok) {
      setLetters((prev) =>
        prev.map((l) => (l.id === letterId ? { ...l, outcome } : l))
      );
    }
  }

  async function handleBillingPortal() {
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  }

  const approvedCount = letters.filter((l) => l.outcome === "approved").length;
  const deniedCount = letters.filter((l) => l.outcome === "denied").length;
  const totalOutcomes = approvedCount + deniedCount;
  const approvalRate = totalOutcomes > 0 ? Math.round((approvedCount / totalOutcomes) * 100) : null;

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      {/* Upgrade banner */}
      {showUpgradeBanner && (
        <div className="bg-green-600 text-white text-sm text-center py-2 px-4 flex items-center justify-center gap-3">
          <span>🎉 Your plan has been activated! Welcome to AuthDraft.</span>
          <button onClick={() => setShowUpgradeBanner(false)} className="text-green-200 hover:text-white font-semibold">✕</button>
        </div>
      )}

      {/* Top nav */}
      <header className="bg-white border-b border-gray-200 px-4 md:px-8 py-3 flex items-center justify-between">
        <span className="text-lg font-bold text-gray-900">AuthDraft</span>
        <div className="flex items-center gap-3 md:gap-5 flex-wrap justify-end">
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${user.plan === "pro" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"}`}>
            {user.plan === "pro" ? "Pro" : "Starter"}
          </span>
          <span className="text-xs text-gray-500 hidden sm:inline">{usageDisplay} letters</span>
          <button
            onClick={handleBillingPortal}
            className="text-xs text-blue-600 hover:text-blue-500 underline hidden sm:inline"
          >
            Manage billing
          </button>
          <UserButton />
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-4 md:px-8">
        <div className="flex gap-0">
          {(["generate", "history"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors capitalize ${
                tab === t
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {t === "generate" ? "Generate" : `History (${letters.length})`}
            </button>
          ))}
        </div>
      </div>

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 md:px-8 py-8">
        {/* Generate tab */}
        {tab === "generate" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Form */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-base font-semibold text-gray-800 mb-5">New letter</h2>
              <form onSubmit={handleGenerate} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Insurer *</label>
                  <select
                    value={insurer}
                    onChange={(e) => setInsurer(e.target.value)}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="">Select insurer…</option>
                    {INSURERS.map((i) => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Request Type *</label>
                  <select
                    value={requestType}
                    onChange={(e) => setRequestType(e.target.value)}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="">Select type…</option>
                    {REQUEST_TYPES.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Patient Age</label>
                  <input
                    type="text"
                    value={patientAge}
                    onChange={(e) => setPatientAge(e.target.value)}
                    placeholder="e.g. 45"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Diagnosis / ICD-10 *</label>
                  <input
                    type="text"
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    placeholder="e.g. Type 2 diabetes mellitus (E11.9)"
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Procedure / CPT *</label>
                  <input
                    type="text"
                    value={procedure}
                    onChange={(e) => setProcedure(e.target.value)}
                    placeholder="e.g. Continuous glucose monitor (95250)"
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Clinical Notes</label>
                  <textarea
                    value={clinicalNotes}
                    onChange={(e) => setClinicalNotes(e.target.value)}
                    rows={4}
                    placeholder="Relevant clinical history, failed alternatives, medical necessity justification…"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>

                {formError && (
                  <p className="text-red-500 text-xs">{formError}</p>
                )}

                <button
                  type="submit"
                  disabled={generating}
                  className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
                >
                  {generating ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Generating…
                    </>
                  ) : "Generate Letter"}
                </button>
              </form>
            </div>

            {/* Output */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-gray-800">Generated letter</h2>
                {generatedLetter && (
                  <div className="flex gap-2">
                    <button
                      onClick={handleCopy}
                      className="text-xs px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      {copied ? "Copied!" : "Copy"}
                    </button>
                    <button
                      onClick={() => generatedMeta && printPDF(generatedLetter, generatedMeta)}
                      className="text-xs px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      PDF
                    </button>
                    <button
                      onClick={handleClear}
                      className="text-xs px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>
              {generating ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : generatedLetter ? (
                <textarea
                  value={generatedLetter}
                  onChange={(e) => setGeneratedLetter(e.target.value)}
                  className="flex-1 min-h-[400px] border border-gray-200 rounded-lg p-3 text-sm font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
                  Fill out the form and click Generate
                </div>
              )}
            </div>
          </div>
        )}

        {/* History tab */}
        {tab === "history" && (
          <div className="space-y-4">
            {/* Stats */}
            {totalOutcomes > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{approvalRate}%</div>
                  <div className="text-xs text-gray-500 mt-1">Approval rate</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">{approvedCount}</div>
                  <div className="text-xs text-gray-500 mt-1">Approved</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-500">{deniedCount}</div>
                  <div className="text-xs text-gray-500 mt-1">Denied</div>
                </div>
              </div>
            )}

            {letters.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-400 shadow-sm">
                No letters yet. Generate your first one!
              </div>
            ) : (
              letters.map((letter) => (
                <div key={letter.id} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-semibold text-sm text-gray-900">{letter.insurer}</span>
                        <span className="text-gray-400">·</span>
                        <span className="text-xs text-gray-500">{letter.request_type}</span>
                        <span className="text-gray-400">·</span>
                        <span className="text-xs text-gray-400">{new Date(letter.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="text-xs text-gray-500 truncate">
                        {letter.diagnosis} &nbsp;·&nbsp; {letter.procedure}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap flex-shrink-0">
                      {/* Outcome buttons */}
                      <button
                        onClick={() => setOutcome(letter.id, letter.outcome === "approved" ? null : "approved")}
                        className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                          letter.outcome === "approved"
                            ? "bg-green-100 border-green-300 text-green-700 font-semibold"
                            : "border-gray-300 text-gray-500 hover:border-green-400 hover:text-green-600"
                        }`}
                      >
                        ✓ Approved
                      </button>
                      <button
                        onClick={() => setOutcome(letter.id, letter.outcome === "denied" ? null : "denied")}
                        className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                          letter.outcome === "denied"
                            ? "bg-red-100 border-red-300 text-red-700 font-semibold"
                            : "border-gray-300 text-gray-500 hover:border-red-400 hover:text-red-600"
                        }`}
                      >
                        ✗ Denied
                      </button>
                      {letter.outcome === null && (
                        <span className="text-xs text-gray-400 px-2">⏳ Pending</span>
                      )}
                      <button
                        onClick={() => viewLetter(letter)}
                        className="text-xs px-2.5 py-1 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
                      >
                        View
                      </button>
                      <button
                        onClick={() => printPDF(letter.letter_text, { insurer: letter.insurer, requestType: letter.request_type })}
                        className="text-xs px-2.5 py-1 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
                      >
                        PDF
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}
