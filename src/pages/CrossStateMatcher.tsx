import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Radio,
  Activity,
  Filter,
  CircleCheck,
} from "lucide-react";
import { LocalStore } from "@/utils/mockEngine";
import { MOCK_MATCHES, ALGORITHM_DEFAULTS } from "@/constants";
import type { CaseRecord } from "@/utils/mockEngine";

export default function CrossStateMatcher() {
  const [cases, setCases] = useState<CaseRecord[]>([]);
  const [selectedSource, setSelectedSource] = useState<string>("");
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [filterThreshold, setFilterThreshold] = useState(ALGORITHM_DEFAULTS.matchConfidenceFloor);

  useEffect(() => { setCases(LocalStore.getCases()); }, []);

  const activeCases = useMemo(() => cases.filter((c) => c.status === "active" || c.status === "pending"), [cases]);

  const runMatch = async () => {
    if (!selectedSource) return;
    setRunning(true);
    await new Promise((r) => setTimeout(r, 1800));
    const filtered = MOCK_MATCHES.filter((m) => m.sourceCase === selectedSource).map((m) => {
      const target = cases.find((c) => c.id === m.targetCase);
      return { ...m, targetCaseNumber: target?.caseNumber ?? m.targetCase, targetLocation: target?.location ?? "Unknown", targetStatus: target?.status ?? "unknown" };
    });
    setResults(filtered.length > 0 ? filtered : MOCK_MATCHES.filter((m) => m.sourceCase === selectedSource || m.sourceCase === MOCK_MATCHES[0].sourceCase));
    setRunning(false);
  };

  const filteredResults = useMemo(() => results.filter((r) => r.score >= filterThreshold), [results, filterThreshold]);
  const sourceCase = cases.find((c) => c.id === selectedSource);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-100 tracking-tight">Cross-State Voiceprint Matching</h1>
        <p className="text-xs text-slate-400 font-mono mt-0.5">NATIONAL SPEAKER VERIFICATION - ECAPA-TDNN 192-DIM EMBEDDINGS</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-slate-800/40 border border-slate-700/50 rounded-lg p-4 space-y-4">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <Filter className="w-4 h-4 text-amber-400" />
            Query Parameters
          </h3>
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1.5">SOURCE CASE</label>
            <select value={selectedSource} onChange={(e) => setSelectedSource(e.target.value)} className="w-full bg-slate-900/70 border border-slate-700 rounded px-3 py-2 text-sm text-slate-200 font-mono focus:outline-none focus:border-amber-500/50">
              <option value="">Select case...</option>
              {activeCases.map((c) => (<option key={c.id} value={c.id}>{c.caseNumber} - {c.victimName}</option>))}
            </select>
          </div>
          {sourceCase && (
            <div className="bg-slate-900/50 border border-slate-700/40 rounded p-3 space-y-1.5">
              <div className="text-[10px] font-mono text-slate-500 uppercase">Source Details</div>
              <div className="text-xs text-slate-300">{sourceCase.victimName}</div>
              <div className="text-xs text-slate-400 font-mono">{sourceCase.location} ({sourceCase.jurisdiction})</div>
              <div className="text-xs text-slate-400 font-mono">{sourceCase.callsCount} calls on record</div>
            </div>
          )}
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1.5">CONFIDENCE FLOOR: {filterThreshold.toFixed(2)}</label>
            <input type="range" min="0" max="1" step="0.01" value={filterThreshold} onChange={(e) => setFilterThreshold(parseFloat(e.target.value))} className="w-full accent-amber-500" />
            <div className="flex justify-between text-[10px] font-mono text-slate-600"><span>0.00</span><span>1.00</span></div>
          </div>
          <button onClick={runMatch} disabled={!selectedSource || running} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-amber-600/20 text-amber-400 border border-amber-600/30 rounded text-sm font-mono hover:bg-amber-600/30 disabled:opacity-30 transition-colors">
            <Search className={`w-4 h-4 ${running ? "animate-pulse" : ""}`} />
            {running ? "RUNNING MATCH..." : "RUN CROSS-STATE MATCH"}
          </button>
        </div>

        <div className="lg:col-span-2 space-y-4">
          {results.length > 0 && (
            <>
              <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
                <span><span className="text-amber-400">{results.length}</span> total matches</span>
                <span><span className="text-emerald-400">{filteredResults.filter((r) => r.matched).length}</span> above threshold</span>
                <span>Threshold: <span className="text-amber-400">{ALGORITHM_DEFAULTS.voiceprintThreshold}</span></span>
              </div>

              <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-700/40 text-xs text-slate-500 font-mono uppercase tracking-wider">
                        <th className="py-3 px-4">Target Case</th>
                        <th className="py-3 px-4">Speaker</th>
                        <th className="py-3 px-4">Score</th>
                        <th className="py-3 px-4">Match</th>
                        <th className="py-3 px-4">Region</th>
                        <th className="py-3 px-4 hidden md:table-cell">Location</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredResults.map((r, i) => (
                        <motion.tr key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.06 }} className={`border-b border-slate-700/30 ${r.matched ? "bg-emerald-950/10" : ""} ${r.score >= 0.8 ? "bg-red-950/10" : ""}`}>
                          <td className="py-3 px-4"><span className="text-sm font-mono text-slate-200">{r.targetCaseNumber}</span></td>
                          <td className="py-3 px-4"><span className="text-xs font-mono text-slate-400">Speaker {r.speaker}</span></td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 max-w-[80px] h-2 bg-slate-800 rounded-full overflow-hidden">
                                <motion.div initial={{ width: 0 }} animate={{ width: `${r.score * 100}%` }} className={`h-full rounded-full ${r.score >= 0.8 ? "bg-red-500" : r.matched ? "bg-emerald-500" : "bg-slate-500"}`} transition={{ duration: 0.6, delay: i * 0.06 }} />
                              </div>
                              <span className="text-xs font-mono font-semibold text-slate-200 w-12">{(r.score * 100).toFixed(1)}%</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            {r.matched ? (
                              <span className="flex items-center gap-1 text-xs text-emerald-400 font-mono"><CircleCheck className="w-3 h-3" />MATCH</span>
                            ) : (
                              <span className="text-xs text-slate-500 font-mono">NONE</span>
                            )}
                          </td>
                          <td className="py-3 px-4"><span className="text-xs font-mono text-slate-400">{r.matchedRegion}</span></td>
                          <td className="py-3 px-4 hidden md:table-cell"><span className="text-xs text-slate-500">{r.targetLocation}</span></td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2 mb-3">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  Spatial Embedding Proximity
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {filteredResults.slice(0, 8).map((r) => (
                    <div key={r.id} className={`rounded p-3 text-center border ${r.matched ? "bg-emerald-950/20 border-emerald-700/30" : "bg-slate-900/50 border-slate-700/30"}`}>
                      <div className="text-[10px] font-mono text-slate-500 uppercase truncate">{r.targetCaseNumber?.replace("AK-", "") ?? "N/A"}</div>
                      <div className={`text-lg font-bold font-mono mt-1 ${r.matched ? "text-emerald-400" : "text-slate-400"}`}>{(r.score * 100).toFixed(0)}%</div>
                      <div className="text-[10px] font-mono text-slate-600 mt-0.5">{r.matchedRegion}</div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {results.length === 0 && !running && (
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-12 text-center">
              <Radio className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-sm text-slate-500 font-mono">Select a source case and run the cross-state match to query the national voiceprint database.</p>
              <p className="text-xs text-slate-600 mt-2 max-w-md mx-auto">The engine compares ECAPA-TDNN embeddings across all jurisdictions. Matches above the threshold are flagged for investigator review.</p>
            </div>
          )}

          {running && (
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-12 text-center">
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} className="w-10 h-10 border-2 border-amber-500/30 border-t-amber-400 rounded-full mx-auto mb-4" />
              <p className="text-sm text-amber-400 font-mono">Querying national database...</p>
              <p className="text-xs text-slate-500 mt-1 font-mono">Scanning 38 jurisdictions across all states</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}