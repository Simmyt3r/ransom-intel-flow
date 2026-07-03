// RansomLink Mock AI Engine
// Simulates local voice processing: hashing, diarization, transcription, voiceprint matching, and script execution.

import { STORAGE_KEYS, MOCK_CASES, MOCK_CALLS, MOCK_MATCHES, ALGORITHM_DEFAULTS } from "@/constants";

export interface CaseRecord {
  id: string;
  caseNumber: string;
  status: "active" | "pending" | "resolved" | "cold" | "monitoring";
  priority: "critical" | "high" | "medium" | "low";
  victimId: string;
  victimName: string;
  location: string;
  jurisdiction: string;
  reportedAt: string;
  lastActivity: string;
  callsCount: number;
  demands: string;
  leadNegotiator: string;
  notes: string;
}

export interface CallRecord {
  id: string;
  caseId: string;
  duration: number;
  transcript: TranscriptionSegment[];
  speakerLabels: Record<string, string>;
  voiceHashes: Record<string, string>;
  analyzedAt?: string;
  matchResults?: VoiceMatchResult[];
}

export interface TranscriptionSegment {
  speaker: string;
  start: number;
  end: number;
  text: string;
}

export interface VoiceMatchResult {
  targetCaseId: string;
  speaker: string;
  score: number;
  matched: boolean;
  region: string;
}

export interface TimelineEvent {
  id: string;
  caseId: string;
  timestamp: string;
  type: "call" | "note" | "evidence" | "action" | "milestone";
  description: string;
  author: string;
  metadata?: Record<string, string>;
}

export interface ProofOfLifeResult {
  verified: boolean;
  score: number;
  threshold: number;
  victimVoiceHash: string;
  sampleVoiceHash: string;
  segments: { start: number; end: number; matchScore: number }[];
  issuedAt: string;
}

export interface CalibrationResult {
  far: number;
  frr: number;
  threshold: number;
  samples: number;
  timestamp: string;
}

function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const chr = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, "0");
  return hex.slice(0, 12);
}

export function generateVoiceHash(text: string, speakerId: string): string {
  const combined = `${speakerId}:${text.toLowerCase().replace(/[^a-z0-9]/g, "")}`;
  return hashString(combined);
}

export function diarizeTranscript(
  rawText: string[],
  speakerIds: string[],
  durations: number[]
): TranscriptionSegment[] {
  let cursor = 0;
  const segments: TranscriptionSegment[] = [];
  for (let i = 0; i < rawText.length; i++) {
    const start = cursor;
    const end = cursor + durations[i];
    segments.push({
      speaker: speakerIds[i % speakerIds.length],
      start: parseFloat(start.toFixed(1)),
      end: parseFloat(end.toFixed(1)),
      text: rawText[i],
    });
    cursor = end + Math.random() * 1.5;
  }
  return segments;
}

export function computeVoiceprintSimilarity(hashA: string, hashB: string): number {
  const len = Math.min(hashA.length, hashB.length);
  let matches = 0;
  for (let i = 0; i < len; i++) {
    if (hashA[i] === hashB[i]) matches++;
  }
  const baseScore = matches / len;
  const jitter = (Math.random() - 0.5) * 0.15;
  return Math.min(1, Math.max(0, baseScore + jitter));
}

export function runCrossStateMatching(
  sourceCaseId: string,
  sourceSpeaker: string,
  sourceHash: string,
  allCases: CaseRecord[],
  allCalls: CallRecord[]
): VoiceMatchResult[] {
  const results: VoiceMatchResult[] = [];
  const targetCalls = allCalls.filter((c) => c.caseId !== sourceCaseId);
  for (const call of targetCalls) {
    for (const [speaker, hash] of Object.entries(call.voiceHashes)) {
      const score = computeVoiceprintSimilarity(sourceHash, hash);
      const targetCase = allCases.find((c) => c.id === call.caseId);
      results.push({
        targetCaseId: call.caseId,
        speaker,
        score: parseFloat(score.toFixed(4)),
        matched: score >= ALGORITHM_DEFAULTS.voiceprintThreshold,
        region: targetCase?.jurisdiction ?? "UNKNOWN",
      });
    }
  }
  return results.sort((a, b) => b.score - a.score);
}

export function runProofOfLifeVerification(
  sampleHash: string,
  victimEnrolledHash: string
): ProofOfLifeResult {
  const score = computeVoiceprintSimilarity(sampleHash, victimEnrolledHash);
  const threshold = ALGORITHM_DEFAULTS.proofOfLifeMinScore;
  const numSegments = 4;
  const segments = [];
  for (let i = 0; i < numSegments; i++) {
    segments.push({
      start: i * 2,
      end: (i + 1) * 2,
      matchScore: parseFloat((score + (Math.random() - 0.5) * 0.2).toFixed(4)),
    });
  }
  return {
    verified: score >= threshold,
    score: parseFloat(score.toFixed(4)),
    threshold,
    victimVoiceHash: victimEnrolledHash,
    sampleVoiceHash: sampleHash,
    segments,
    issuedAt: new Date().toISOString(),
  };
}

export function runCalibration(samples: number = 100): CalibrationResult {
  const baseThreshold = ALGORITHM_DEFAULTS.voiceprintThreshold;
  const far = parseFloat((ALGORITHM_DEFAULTS.farThreshold + (Math.random() - 0.5) * 0.02).toFixed(4));
  const frr = parseFloat((ALGORITHM_DEFAULTS.frrThreshold + (Math.random() - 0.5) * 0.03).toFixed(4));
  return {
    far,
    frr,
    threshold: parseFloat(baseThreshold.toFixed(4)),
    samples,
    timestamp: new Date().toISOString(),
  };
}

export function generateCaseNumber(): string {
  const year = new Date().getFullYear();
  const num = String(Math.floor(Math.random() * 9000) + 1000);
  return `AK-${year}-${num}`;
}

export function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export class LocalStore {
  static getCases(): CaseRecord[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.cases);
      if (!raw) {
        LocalStore.setCases(MOCK_CASES);
        return MOCK_CASES;
      }
      return JSON.parse(raw);
    } catch {
      return MOCK_CASES;
    }
  }

  static setCases(cases: CaseRecord[]): void {
    localStorage.setItem(STORAGE_KEYS.cases, JSON.stringify(cases));
  }

  static addCase(c: CaseRecord): void {
    const cases = LocalStore.getCases();
    cases.unshift(c);
    LocalStore.setCases(cases);
  }

  static getCase(id: string): CaseRecord | undefined {
    return LocalStore.getCases().find((c) => c.id === id);
  }

  static getCalls(): CallRecord[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.calls);
      if (!raw) {
        LocalStore.setCalls(MOCK_CALLS);
        return MOCK_CALLS;
      }
      return JSON.parse(raw);
    } catch {
      return MOCK_CALLS;
    }
  }

  static setCalls(calls: CallRecord[]): void {
    localStorage.setItem(STORAGE_KEYS.calls, JSON.stringify(calls));
  }

  static getCallsForCase(caseId: string): CallRecord[] {
    return LocalStore.getCalls().filter((c) => c.caseId === caseId);
  }

  static addCall(call: CallRecord): void {
    const calls = LocalStore.getCalls();
    calls.push(call);
    LocalStore.setCalls(calls);
    const cases = LocalStore.getCases();
    const idx = cases.findIndex((c) => c.id === call.caseId);
    if (idx !== -1) {
      cases[idx].callsCount = (cases[idx].callsCount || 0) + 1;
      cases[idx].lastActivity = new Date().toISOString();
      LocalStore.setCases(cases);
    }
  }

  static getTimeline(caseId: string): TimelineEvent[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.timeline);
      const all: TimelineEvent[] = raw ? JSON.parse(raw) : [];
      return all.filter((e) => e.caseId === caseId).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } catch {
      return [];
    }
  }

  static addTimelineEvent(event: TimelineEvent): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.timeline);
      const all: TimelineEvent[] = raw ? JSON.parse(raw) : [];
      all.push(event);
      localStorage.setItem(STORAGE_KEYS.timeline, JSON.stringify(all));
    } catch {
      localStorage.setItem(STORAGE_KEYS.timeline, JSON.stringify([event]));
    }
  }

  static getMatches() {
    return MOCK_MATCHES;
  }
}

export function simulateScriptExecution(
  scriptName: string,
  onLine: (line: string) => void,
  onComplete: () => void
): () => void {
  let cancelled = false;
  const scripts: Record<string, { lines: string[]; delays: number[] }> = {
    "run_tests.bat": {
      lines: [
        "[SYSTEM] RansomLink Voice Engine v3.2.1",
        "[SYSTEM] Initializing diagnostic suite...",
        "",
        "[TEST 1/6] Audio codec integrity check...",
        "  - PCM 16-bit mono   : PASS",
        "  - Opus 48kHz        : PASS",
        "  - FLAC lossless     : PASS",
        "  - WAV container     : PASS",
        "",
        "[TEST 2/6] Voiceprint embedding model...",
        "  - ECAPA-TDNN model  : LOADED",
        "  - Embedding dims    : 192",
        "  - Model checksum    : a3f7c9e1d4b2 (VALID)",
        "  - Inference test    : 12.4ms per embedding",
        "",
        "[TEST 3/6] Diarization pipeline...",
        "  - SincNet frontend  : OK",
        "  - Clustering module : OK",
        "  - Overlap detection : OK",
        "  - VAD threshold     : 0.62",
        "",
        "[TEST 4/6] Speaker verification engine...",
        "  - Cosine similarity : OPERATIONAL",
        "  - PLDA backend      : OPERATIONAL",
        "  - Threshold cache   : 0.7200",
        "",
        "[TEST 5/6] Cryptographic evidence chain...",
        "  - SHA-256 hashing   : OPERATIONAL",
        "  - Chain validation  : ALL BLOCKS INTACT",
        "  - Tamper detection  : ACTIVE",
        "",
        "[TEST 6/6] Cross-state matching service...",
        "  - DB connection pool : 8 workers",
        "  - Index freshness    : 47s ago",
        "  - Pending match queue: 3 jobs",
        "",
        "[RESULT] All diagnostics PASSED. System operational.",
        "[DURATION] 4.2s elapsed.",
      ],
      delays: [200, 300, 150, 250, 250, 250, 250, 300, 250, 250, 250, 250, 300, 250, 250, 250, 250, 300, 250, 250, 250, 250, 300, 300, 200, 200, 200, 200, 200, 200, 250],
    },
    "check_runtime.bat": {
      lines: [
        "[RUNTIME] Checking dependencies...",
        "",
        "  Node.js  v20.11.0    : INSTALLED",
        "  Python   v3.11.7     : INSTALLED",
        "  PyTorch  v2.1.2      : INSTALLED (CUDA 12.1)",
        "  SpeechBrain v1.0.0   : INSTALLED",
        "  FFmpeg   v6.1.1      : INSTALLED",
        "",
        "[RUNTIME] Checking model files...",
        "",
        "  ecapa_tdnn_192.ckpt   : 34.2 MB (MATCH)",
        "  sincnet_vad.ckpt      : 12.8 MB (MATCH)",
        "  diarization_config.yaml: 1.4 KB (MATCH)",
        "",
        "[RUNTIME] Checking API bridges...",
        "",
        "  NCIC voiceprint API   : REACHABLE (latency 87ms)",
        "  State DB connector    : REACHABLE (latency 34ms)",
        "  Evidence chain API    : REACHABLE (latency 12ms)",
        "",
        "[RUNTIME] All dependencies verified.",
      ],
      delays: [200, 150, 200, 200, 200, 200, 200, 250, 200, 200, 200, 200, 250, 200, 200, 200, 200, 250, 200],
    },
    "run_calibration.bat": {
      lines: [
        "[CALIBRATION] Starting voiceprint threshold calibration...",
        "[CALIBRATION] Loading enrolled voiceprint database...",
        "[CALIBRATION] 1,247 voiceprints loaded across 38 jurisdictions.",
        "",
        "[CALIBRATION] Running FAR/FRR optimization sweep...",
        "  Iteration   Threshold   FAR       FRR       EER",
        "  ---------   ---------   ---       ---       ---",
        "  1           0.6500      0.0234    0.1542    0.0888",
        "  2           0.6700      0.0189    0.1287    0.0738",
        "  3           0.6900      0.0142    0.1045    0.0593",
        "  4           0.7100      0.0098    0.0872    0.0485",
        "  5           0.7200      0.0071    0.0790    0.0431",
        "  6           0.7300      0.0052    0.0823    0.0438",
        "  7           0.7500      0.0034    0.0941    0.0488",
        "  8           0.7700      0.0021    0.1124    0.0573",
        "",
        "[CALIBRATION] Optimal threshold found: 0.7200",
        "[CALIBRATION] FAR at optimal: 0.0071 (target < 0.05)",
        "[CALIBRATION] FRR at optimal: 0.0790 (target < 0.08)",
        "",
        "[CALIBRATION] Threshold boundaries saved.",
        "[CALIBRATION] FAR/FRR plot data exported to calibration_plot.json",
        "[DURATION] 6.5s elapsed.",
      ],
      delays: [250, 300, 300, 200, 300, 250, 350, 350, 350, 350, 350, 350, 350, 350, 200, 200, 200, 200, 250, 200, 200],
    },
  };

  const script = scripts[scriptName];
  if (!script) {
    onLine(`[ERROR] Unknown script: ${scriptName}`);
    onComplete();
    return () => {};
  }

  let lineIdx = 0;
  let timerId: ReturnType<typeof setTimeout>;

  function next() {
    if (cancelled) return;
    if (lineIdx >= script.lines.length) {
      onComplete();
      return;
    }
    onLine(script.lines[lineIdx]);
    const delay = script.delays[lineIdx] ?? 200;
    lineIdx++;
    timerId = setTimeout(next, delay);
  }

  timerId = setTimeout(next, 300);
  return () => {
    cancelled = true;
    clearTimeout(timerId);
  };
}
