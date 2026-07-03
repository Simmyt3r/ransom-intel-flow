import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Play,
  Pause,
  SkipForward,
  Mic,
  Radio,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Download,
  Plus,
  Activity,
  Users,
} from "lucide-react";
import {
  LocalStore,
  generateId,
  diarizeTranscript,
  generateVoiceHash,
  runProofOfLifeVerification,
} from "@/utils/mockEngine";
import { MOCK_VICTIMS, ALGORITHM_DEFAULTS } from "@/constants";
import type { CaseRecord, CallRecord, TimelineEvent } from "@/utils/mockEngine";

type WorkspaceTab = "audio" | "verification" | "timeline";

export default function CaseWorkspace() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const caseId = params.get("id");
  const [caseData, setCaseData] = useState<CaseRecord | null>(null);
  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [activeTab, setActiveTab] = useState<WorkspaceTab>("audio");
  const [selectedCall, setSelectedCall] = useState<CallRecord | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [processingResult, setProcessingResult] = useState<string | null>(null);
  const [polResult, setPolResult] = useState<any>(null);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [newEventDesc, setNewEventDesc] = useState("");
  const [newEventType, setNewEventType] = useState<TimelineEvent["type"]>("note");

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    if (!caseId) { navigate("/"); return; }
    const c = LocalStore.getCase(caseId);
    if (!c) { navigate("/"); return; }
    setCaseData(c);
    const caseCalls = LocalStore.getCallsForCase(caseId);
    const allCalls = LocalStore.getCalls();
    const merged = [...caseCalls, ...allCalls.filter((ac) => ac.caseId === caseId && !caseCalls.find((cc) => cc.id === ac.id))];
    setCalls(merged);
    if (merged.length > 0) setSelectedCall(merged[0]);
    setTimelineEvents(LocalStore.getTimeline(caseId));
  }, [caseId, navigate]);

  const drawWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !selectedCall) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    const duration = selectedCall.duration;
    const progress = isPlaying ? currentTime / duration : 0;
    const barWidth = 3;
    const gap = 1;
    const totalBars = Math.floor(w / (barWidth + gap));
    for (let i = 0; i < totalBars; i++) {
      const t = i / totalBars;
      const amp = 0.3 + Math.abs(Math.sin(t * 27 + Math.cos(t * 13) * 3)) * 0.5 + Math.random() * 0.2;
      const barH = amp * h * 0.8;
      const x = i * (barWidth + gap);
      const y = (h - barH) / 2;
      const played = t <= progress;
      ctx.fillStyle = played ? "#10b981" : "#475569";
      ctx.fillRect(x, y, barWidth, barH);
    }
    if (progress > 0) {
      const px = progress * w;
      ctx.strokeStyle = "#ef4444";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(px, 0);
      ctx.lineTo(px, h);
      ctx.stroke();
    }
  }, [selectedCall, isPlaying, currentTime]);

  useEffect(() => { drawWaveform(); }, [drawWaveform]);

  useEffect(() => {
    if (!isPlaying || !selectedCall) return;
    const start = performance.now() - currentTime * 1000;
    const animate = () => {
      const elapsed = (performance.now() - start) / 1000;
      if (elapsed >= selectedCall.duration) {
        setCurrentTime(selectedCall.duration);
        setIsPlaying(false);
        return;
      }
      setCurrentTime(elapsed);
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [isPlaying, selectedCall]);

  const togglePlay = () => {
    if (!selectedCall) return;
    if (isPlaying) {
      setIsPlaying(false);
      cancelAnimationFrame(animRef.current);
    } else {
      if (currentTime >= selectedCall.duration) setCurrentTime(0);
      setIsPlaying(true);
    }
  };

  const processCall = async () => {
    if (!selectedCall) return;
    setProcessing(true);
    setProcessingResult(null);
    await new Promise((r) => setTimeout(r, 1500));
    const rawLines = selectedCall.transcript.map((s) => s.text);
    const speakerIds = Object.keys(selectedCall.speakerLabels);
    const durations = selectedCall.transcript.map((s) => s.end - s.start);
    const diarized = diarizeTranscript(rawLines, speakerIds, durations);
    const hashes: Record<string, string> = {};
    for (const spk of speakerIds) {
      const spkText = selectedCall.transcript.filter((s) => s.speaker === spk).map((s) => s.text).join(" ");
      hashes[spk] = generateVoiceHash(spkText, spk);
    }
    const updated: CallRecord = {
      ...selectedCall,
      transcript: diarized,
      voiceHashes: hashes,
      analyzedAt: new Date().toISOString(),
    };
    setCalls((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    setSelectedCall(updated);
    setProcessingResult("Processing complete. " + speakerIds.length + " speakers diarized. " + diarized.length + " segments. Voice hashes computed.");
    setProcessing(false);
  };

  const runVerification = () => {
    if (!selectedCall || !caseData) return;
    const victim = MOCK_VICTIMS.find((v) => v.id === caseData.victimId);
    if (!victim) return;
    const victimSpeakerKey = Object.entries(selectedCall.speakerLabels).find(
      ([_, label]) => label.toLowerCase().includes("victim")
    )?.[0];
    const hash = victimSpeakerKey
      ? (selectedCall.voiceHashes[victimSpeakerKey] || "unknown")
      : (selectedCall.voiceHashes["C"] || Object.values(selectedCall.voiceHashes)[0] || "unknown");
    const result = runProofOfLifeVerification(hash, victim.enrolledVoiceHash);
    setPolResult(result);
  };

  const addTimelineEvent = () => {
    if (!newEventDesc.trim() || !caseId) return;
    const event: TimelineEvent = {
      id: generateId(),
      caseId,
      timestamp: new Date().toISOString(),
      type: newEventType,
      description: newEventDesc,
      author: caseData?.leadNegotiator ?? "System",
    };
    LocalStore.addTimelineEvent(event);
    setTimelineEvents((prev) => [event, ...prev]);
    setNewEventDesc("");
  };

  const exportTimeline = () => {
    if (!caseData) return;
    const NL = String.fromCharCode(10);
    const headerLines = [
      "RANSOMLINK - NEGOTIATOR TIMELINE",
      "Case: " + caseData.caseNumber,
      "Victim: " + caseData.victimName,
      "Exported: " + new Date().toISOString(),
      "",
      "",
    ];
    const header = headerLines.join(NL);
    const body = timelineEvents.map((e) => {
      const ts = new Date(e.timestamp).toISOString();
      return "[" + ts + "] [" + e.type.toUpperCase() + "] " + e.description + " - " + e.author;
    }).join(NL);
    const blob = new Blob([header + body], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "timeline-" + caseData.caseNumber + ".txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!caseData) return null;

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return m + ":" + sec.toString().padStart(2, "0");
  };

  const tabs: { id: WorkspaceTab; label: string; icon: React.ElementType }[] = [
    { id: "audio", label: "Audio Processing", icon: Mic },
    { id: "verification", label: "Proof of Life", icon: Shield },
    { id: "timeline", label: "Timeline", icon: Clock },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-100 tracking-tight">{caseData.caseNumber}</h1>
            <span className="text-xs px-2 py-0.5 rounded font-mono font-semibold bg-red-600 text-red-100">
              {caseData.status.toUpperCase()}
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            {caseData.victimName} - {caseData.location} - Lead: {caseData.leadNegotiator}
          </p>
        </div>
        <button onClick={() => navigate("/")} className="text-xs font-mono text-slate-500 hover:text-slate-300 transition-colors">
          BACK TO DASHBOARD
        </button>
      </div>

      <div className="flex gap-1 bg-slate-800/60 border border-slate-700/50 rounded-lg p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={"flex items-center gap-1.5 px-4 py-2 rounded text-xs font-mono font-semibold transition-colors flex-1 " +
              (activeTab === tab.id ? "bg-slate-700 text-slate-100" : "text-slate-500 hover:text-slate-300")}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "audio" && (
          <motion.div key="audio" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4">
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-4">
                <select
                  value={selectedCall?.id ?? ""}
                  onChange={(e) => {
                    const call = calls.find((c) => c.id === e.target.value);
                    if (call) { setSelectedCall(call); setCurrentTime(0); setIsPlaying(false); setPolResult(null); setProcessingResult(null); }
                  }}
                  className="bg-slate-900/70 border border-slate-700 rounded px-3 py-2 text-sm text-slate-200 font-mono focus:outline-none focus:border-amber-500/50 flex-1"
                >
                  {calls.length === 0 && <option>No calls recorded</option>}
                  {calls.map((call) => (
                    <option key={call.id} value={call.id}>
                      Call {call.id.slice(-4)} - {formatTime(call.duration)} - {Object.keys(call.speakerLabels).length} speakers
                    </option>
                  ))}
                </select>
                <button onClick={togglePlay} disabled={!selectedCall} className="p-2 rounded bg-slate-700 text-slate-200 hover:bg-slate-600 disabled:opacity-30 transition-colors">
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </button>
                <button onClick={() => { setCurrentTime(0); setIsPlaying(false); }} disabled={!selectedCall} className="p-2 rounded bg-slate-700 text-slate-200 hover:bg-slate-600 disabled:opacity-30 transition-colors">
                  <SkipForward className="w-5 h-5" />
                </button>
              </div>
              <canvas ref={canvasRef} width={800} height={100} className="w-full h-[100px] rounded bg-slate-900/70 border border-slate-700/40" />
              {selectedCall && (
                <div className="flex items-center justify-between mt-2 text-xs font-mono text-slate-400">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(selectedCall.duration)}</span>
                </div>
              )}
            </div>

            {selectedCall && (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                    <Users className="w-4 h-4 text-cyan-400" />
                    Speaker Diarization
                  </h3>
                  <button onClick={processCall} disabled={processing} className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600/20 text-cyan-400 border border-cyan-600/30 rounded text-xs font-mono hover:bg-cyan-600/30 disabled:opacity-50 transition-colors">
                    <Activity className={"w-3 h-3 " + (processing ? "animate-pulse" : "")} />
                    {processing ? "PROCESSING..." : "RUN DIARIZATION"}
                  </button>
                </div>
                {processingResult && (
                  <div className="bg-emerald-950/20 border border-emerald-900/30 rounded p-3">
                    <p className="text-xs text-emerald-300 font-mono">{processingResult}</p>
                  </div>
                )}
                <div className="space-y-2">
                  {Object.entries(selectedCall.speakerLabels).map(([key, label]) => (
                    <div key={key} className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-mono font-semibold text-slate-200">Speaker {key}: {label}</span>
                        {selectedCall.voiceHashes?.[key] && (
                          <span className="text-[10px] font-mono text-slate-500">HASH: {selectedCall.voiceHashes[key]}</span>
                        )}
                      </div>
                      <div className="space-y-1">
                        {selectedCall.transcript.filter((s) => s.speaker === key).map((seg, i) => (
                          <div key={i} className="flex gap-2 text-xs">
                            <span className="text-slate-500 font-mono shrink-0">[{formatTime(seg.start)}]</span>
                            <span className="text-slate-300">{seg.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
            {!selectedCall && calls.length === 0 && (
              <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-8 text-center">
                <Radio className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <p className="text-sm text-slate-500 font-mono">No calls recorded for this case yet.</p>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === "verification" && (
          <motion.div key="verification" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4">
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-6">
              <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2 mb-4">
                <Shield className="w-4 h-4 text-amber-400" />
                Proof-of-Life Voice Verification
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div className="bg-slate-900/50 border border-slate-700/40 rounded p-3">
                  <div className="text-[10px] font-mono text-slate-500 uppercase mb-1">Enrolled Voiceprint</div>
                  <div className="text-sm font-mono text-slate-200">{MOCK_VICTIMS.find((v) => v.id === caseData.victimId)?.name ?? "Unknown"}</div>
                  <div className="text-xs font-mono text-slate-500 mt-1">Hash: {MOCK_VICTIMS.find((v) => v.id === caseData.victimId)?.enrolledVoiceHash ?? "N/A"}</div>
                </div>
                <div className="bg-slate-900/50 border border-slate-700/40 rounded p-3">
                  <div className="text-[10px] font-mono text-slate-500 uppercase mb-1">Sample Source</div>
                  <div className="text-sm font-mono text-slate-200">{selectedCall ? "Call " + selectedCall.id.slice(-4) : "No call selected"}</div>
                  <div className="text-xs font-mono text-slate-500 mt-1">Threshold: {ALGORITHM_DEFAULTS.proofOfLifeMinScore}</div>
                </div>
              </div>
              <button onClick={runVerification} disabled={!selectedCall} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-amber-600/20 text-amber-400 border border-amber-600/30 rounded text-sm font-mono hover:bg-amber-600/30 disabled:opacity-30 transition-colors">
                <Shield className="w-4 h-4" />
                RUN VERIFICATION
              </button>
              {polResult && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={"mt-4 border rounded-lg p-4 " + (polResult.verified ? "bg-emerald-950/20 border-emerald-700/30" : "bg-red-950/20 border-red-700/30")}>
                  <div className="flex items-center gap-3 mb-3">
                    {polResult.verified ? <ShieldCheck className="w-8 h-8 text-emerald-400" /> : <ShieldAlert className="w-8 h-8 text-red-400" />}
                    <div>
                      <div className={"text-lg font-bold font-mono " + (polResult.verified ? "text-emerald-400" : "text-red-400")}>
                        {polResult.verified ? "VERIFIED" : "NOT VERIFIED"}
                      </div>
                      <div className="text-xs text-slate-400 font-mono">Score: {polResult.score} / Threshold: {polResult.threshold}</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-[10px] font-mono text-slate-500 uppercase">Segment Analysis</div>
                    {polResult.segments?.map((seg: any, i: number) => (
                      <div key={i} className="flex items-center gap-3">
                        <span className="text-[10px] font-mono text-slate-500 w-16">{seg.start}s - {seg.end}s</span>
                        <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: (seg.matchScore * 100) + "%" }} className={"h-full rounded-full " + (seg.matchScore >= ALGORITHM_DEFAULTS.proofOfLifeMinScore ? "bg-emerald-500" : "bg-red-500")} transition={{ duration: 0.8, ease: "easeOut" }} />
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 w-10 text-right">{(seg.matchScore * 100).toFixed(0)}%</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-700/40">
                    <div className="text-[10px] font-mono text-slate-500">Certificate issued: {new Date(polResult.issuedAt).toISOString()}</div>
                    <div className="text-[10px] font-mono text-slate-500">Evidence chain intact: ALL HASHES VERIFIED</div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === "timeline" && (
          <motion.div key="timeline" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                Court-Ready Negotiator Timeline
              </h3>
              <button onClick={exportTimeline} disabled={timelineEvents.length === 0} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 text-slate-200 rounded text-xs font-mono hover:bg-slate-600 disabled:opacity-30 transition-colors">
                <Download className="w-3 h-3" />
                EXPORT
              </button>
            </div>
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-4">
              <div className="flex gap-2 mb-3">
                <select value={newEventType} onChange={(e) => setNewEventType(e.target.value as TimelineEvent["type"])} className="bg-slate-900/70 border border-slate-700 rounded px-2 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500/50">
                  <option value="note">Note</option>
                  <option value="call">Call</option>
                  <option value="evidence">Evidence</option>
                  <option value="action">Action</option>
                  <option value="milestone">Milestone</option>
                </select>
                <input type="text" value={newEventDesc} onChange={(e) => setNewEventDesc(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addTimelineEvent()} placeholder="Add timeline entry..." className="flex-1 bg-slate-900/70 border border-slate-700 rounded px-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 font-mono" />
                <button onClick={addTimelineEvent} disabled={!newEventDesc.trim()} className="flex items-center gap-1 px-3 py-1.5 bg-cyan-600/20 text-cyan-400 border border-cyan-600/30 rounded text-xs font-mono hover:bg-cyan-600/30 disabled:opacity-30 transition-colors">
                  <Plus className="w-3 h-3" />
                  ADD
                </button>
              </div>
            </div>
            <div className="space-y-0">
              {timelineEvents.length === 0 && (
                <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-8 text-center">
                  <Clock className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                  <p className="text-sm text-slate-500 font-mono">Timeline is empty.</p>
                  <p className="text-xs text-slate-600 mt-1">Add entries to build the court-ready chronology.</p>
                </div>
              )}
              {timelineEvents.map((event, i) => (
                <motion.div key={event.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="flex gap-3 pl-4 relative">
                  <div className="absolute left-0 top-0 bottom-0 w-px bg-slate-700/50" />
                  <div className={"w-2 h-2 rounded-full mt-1.5 shrink-0 relative z-10 " +
                    (event.type === "call" ? "bg-cyan-400" : event.type === "evidence" ? "bg-amber-400" : event.type === "action" ? "bg-red-400" : event.type === "milestone" ? "bg-emerald-400" : "bg-slate-500")} />
                  <div className="pb-4 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[10px] font-mono text-slate-500 uppercase">{event.type}</span>
                      <span className="text-[10px] font-mono text-slate-600">{new Date(event.timestamp).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                    <p className="text-xs text-slate-300">{event.description}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{event.author}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
