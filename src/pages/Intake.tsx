import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ChevronRight,
  ChevronLeft,
  Check,
  User,
  MapPin,
  FileText,
  Shield,
  Phone,
  TriangleAlert,
} from "lucide-react";
import { LocalStore, generateId, generateCaseNumber } from "@/utils/mockEngine";
import type { CaseRecord } from "@/utils/mockEngine";

const STEPS = [
  { id: 1, label: "Case Metadata", icon: FileText },
  { id: 2, label: "Victim Details", icon: User },
  { id: 3, label: "Evidence Setup", icon: Phone },
  { id: 4, label: "Complete", icon: Shield },
];

export default function Intake() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    location: "",
    jurisdiction: "",
    priority: "high" as CaseRecord["priority"],
    demands: "",
    victimName: "",
    victimAge: "",
    victimGender: "",
    victimLanguage: "en",
    leadNegotiator: "",
    initialNotes: "",
  });

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const canNext = (): boolean => {
    if (step === 1) return form.location.trim() !== "" && form.jurisdiction.trim() !== "";
    if (step === 2) return form.victimName.trim() !== "" && form.victimAge.trim() !== "";
    if (step === 3) return form.leadNegotiator.trim() !== "";
    return true;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const newCase: CaseRecord = {
      id: generateId(),
      caseNumber: generateCaseNumber(),
      status: "active",
      priority: form.priority,
      victimId: `victim-${generateId().slice(0, 8)}`,
      victimName: form.victimName,
      location: form.location,
      jurisdiction: form.jurisdiction,
      reportedAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      callsCount: 0,
      demands: form.demands || "Unknown",
      leadNegotiator: form.leadNegotiator,
      notes: form.initialNotes,
    };
    await new Promise((r) => setTimeout(r, 800));
    LocalStore.addCase(newCase);
    setSubmitting(false);
    setStep(4);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-100 tracking-tight">
          New Case Intake
        </h1>
        <p className="text-xs text-slate-400 font-mono mt-0.5">
          GUIDED INTAKE WIZARD - ALL FIELDS CLASSIFIED
        </p>
      </div>

      <div className="flex items-center gap-2">
        {STEPS.map((s, idx) => (
          <div key={s.id} className="flex items-center gap-2 flex-1">
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono font-semibold transition-colors ${
                step >= s.id
                  ? "bg-emerald-600/20 text-emerald-400 border border-emerald-600/30"
                  : "bg-slate-800/60 text-slate-600 border border-slate-700/40"
              }`}
            >
              <s.icon className="w-3 h-3" />
              <span className="hidden sm:inline">{s.label}</span>
            </div>
            {idx < STEPS.length - 1 && (
              <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />
            )}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-6 space-y-4"
          >
            <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-400" />
              Case Location and Classification
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1.5">LOCATION</label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => update("location", e.target.value)}
                  placeholder="City, State"
                  className="w-full bg-slate-900/70 border border-slate-700 rounded px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-500/50 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1.5">JURISDICTION</label>
                <input
                  type="text"
                  value={form.jurisdiction}
                  onChange={(e) => update("jurisdiction", e.target.value)}
                  placeholder="e.g. TX-SOUTH"
                  className="w-full bg-slate-900/70 border border-slate-700 rounded px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-500/50 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1.5">PRIORITY</label>
                <select
                  value={form.priority}
                  onChange={(e) => update("priority", e.target.value)}
                  className="w-full bg-slate-900/70 border border-slate-700 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500/50 font-mono"
                >
                  <option value="critical">CRITICAL</option>
                  <option value="high">HIGH</option>
                  <option value="medium">MEDIUM</option>
                  <option value="low">LOW</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1.5">RANSOM DEMANDS</label>
                <input
                  type="text"
                  value={form.demands}
                  onChange={(e) => update("demands", e.target.value)}
                  placeholder="e.g. $2,000,000 USD"
                  className="w-full bg-slate-900/70 border border-slate-700 rounded px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-500/50 font-mono"
                />
              </div>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-6 space-y-4"
          >
            <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <User className="w-4 h-4 text-red-400" />
              Victim Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1.5">FULL NAME</label>
                <input
                  type="text"
                  value={form.victimName}
                  onChange={(e) => update("victimName", e.target.value)}
                  placeholder="Victim full legal name"
                  className="w-full bg-slate-900/70 border border-slate-700 rounded px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-red-500/50 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1.5">AGE</label>
                <input
                  type="number"
                  value={form.victimAge}
                  onChange={(e) => update("victimAge", e.target.value)}
                  placeholder="Age at time of incident"
                  className="w-full bg-slate-900/70 border border-slate-700 rounded px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-red-500/50 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1.5">GENDER</label>
                <select
                  value={form.victimGender}
                  onChange={(e) => update("victimGender", e.target.value)}
                  className="w-full bg-slate-900/70 border border-slate-700 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-red-500/50 font-mono"
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1.5">PRIMARY LANGUAGE</label>
                <select
                  value={form.victimLanguage}
                  onChange={(e) => update("victimLanguage", e.target.value)}
                  className="w-full bg-slate-900/70 border border-slate-700 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-red-500/50 font-mono"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="ar">Arabic</option>
                  <option value="zh">Chinese</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-6 space-y-4"
          >
            <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Phone className="w-4 h-4 text-cyan-400" />
              Investigation Setup
            </h2>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1.5">LEAD NEGOTIATOR</label>
                <input
                  type="text"
                  value={form.leadNegotiator}
                  onChange={(e) => update("leadNegotiator", e.target.value)}
                  placeholder="Agent full name"
                  className="w-full bg-slate-900/70 border border-slate-700 rounded px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1.5">INITIAL NOTES</label>
                <textarea
                  value={form.initialNotes}
                  onChange={(e) => update("initialNotes", e.target.value)}
                  placeholder="Circumstances, known contacts, threat assessment..."
                  rows={4}
                  className="w-full bg-slate-900/70 border border-slate-700 rounded px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 font-mono resize-none"
                />
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-amber-950/20 border border-amber-900/30 rounded">
              <TriangleAlert className="w-4 h-4 text-amber-400 shrink-0" />
              <p className="text-xs text-amber-300">
                Phone lines will be monitored upon case creation. Ensure voice recording systems are active.
              </p>
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-800/40 border border-emerald-700/30 rounded-lg p-8 text-center space-y-4"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center mx-auto">
              <Check className="w-8 h-8 text-emerald-400" />
            </div>
            <h2 className="text-lg font-bold text-slate-100">Case Dispatched</h2>
            <p className="text-sm text-slate-400 max-w-md mx-auto">
              The case has been logged in the national database. Voice monitoring and cross-state matching are now active.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => navigate("/")}
                className="px-4 py-2 bg-slate-700 text-slate-200 rounded text-sm font-mono hover:bg-slate-600 transition-colors"
              >
                BACK TO DASHBOARD
              </button>
              <button
                onClick={() => {
                  setStep(1);
                  setForm({
                    location: "",
                    jurisdiction: "",
                    priority: "high",
                    demands: "",
                    victimName: "",
                    victimAge: "",
                    victimGender: "",
                    victimLanguage: "en",
                    leadNegotiator: "",
                    initialNotes: "",
                  });
                }}
                className="px-4 py-2 bg-red-600/20 text-red-400 border border-red-600/30 rounded text-sm font-mono hover:bg-red-600/30 transition-colors"
              >
                LOG ANOTHER CASE
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {step < 4 && (
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            disabled={step === 1}
            className="flex items-center gap-1 px-4 py-2 text-xs font-mono text-slate-400 hover:text-slate-200 disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="w-3 h-3" />
            BACK
          </button>
          {step < 3 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              disabled={!canNext()}
              className="flex items-center gap-1 px-4 py-2 bg-slate-700 text-slate-200 rounded text-xs font-mono hover:bg-slate-600 disabled:opacity-30 transition-colors"
            >
              NEXT
              <ChevronRight className="w-3 h-3" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!canNext() || submitting}
              className="flex items-center gap-2 px-6 py-2 bg-red-600/20 text-red-400 border border-red-600/30 rounded text-xs font-mono hover:bg-red-600/30 disabled:opacity-30 transition-colors"
            >
              {submitting ? (
                <>
                  <span className="animate-pulse">DISPATCHING...</span>
                </>
              ) : (
                <>
                  <Shield className="w-3 h-3" />
                  DISPATCH CASE
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}