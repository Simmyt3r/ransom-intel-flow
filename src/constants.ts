// RansomLink - User-editable constants, seed data, and algorithm settings
// All strings, thresholds, and mock data that users may want to customize live here.

export const BRAND = {
  name: "RansomLink",
  shortName: "RSML",
  tagline: "Voice-Driven Criminal Investigation Platform",
  version: "3.2.1",
  classification: "LAW ENFORCEMENT SENSITIVE",
  agency: "National Anti-Kidnapping Task Force",
} as const;

export const NAV_ITEMS = [
  { label: "Dashboard", path: "/", icon: "LayoutDashboard" },
  { label: "Case Intake", path: "/intake", icon: "FilePlus" },
  { label: "Case Workspace", path: "/workspace", icon: "FolderOpen" },
  { label: "Cross-State Match", path: "/matcher", icon: "Search" },
  { label: "Command Center", path: "/console", icon: "Terminal" },
] as const;

export const ALGORITHM_DEFAULTS = {
  voiceprintThreshold: 0.72,
  farThreshold: 0.05,
  frrThreshold: 0.08,
  minSpeechDuration: 2.5,
  diarizationWindowMs: 1500,
  hashAlgorithm: "SHA-256",
  embeddingDimensions: 192,
  matchConfidenceFloor: 0.55,
  proofOfLifeMinScore: 0.78,
} as const;

export const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  active: { label: "ACTIVE", color: "text-red-400" },
  pending: { label: "PENDING", color: "text-amber-400" },
  resolved: { label: "RESOLVED", color: "text-emerald-400" },
  cold: { label: "COLD", color: "text-slate-500" },
  monitoring: { label: "MONITORING", color: "text-cyan-400" },
};

export const PRIORITY_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  critical: { label: "CRITICAL", color: "text-red-100", bg: "bg-red-600" },
  high: { label: "HIGH", color: "text-amber-100", bg: "bg-amber-600" },
  medium: { label: "MEDIUM", color: "text-slate-100", bg: "bg-slate-600" },
  low: { label: "LOW", color: "text-slate-300", bg: "bg-slate-700" },
};

export const SCRIPTS = [
  { name: "run_tests.bat", description: "Run full system diagnostics and voice engine integrity tests", duration: 4200 },
  { name: "check_runtime.bat", description: "Verify runtime dependencies, model checksums, and API bridges", duration: 2800 },
  { name: "run_calibration.bat", description: "Calibrate voiceprint threshold boundaries (FAR/FRR optimization)", duration: 6500 },
] as const;

export const MOCK_VICTIMS = [
  { id: "victim-001", name: "Maria Santos", age: 8, gender: "female", language: "es", region: "TX-SOUTH", enrolledVoiceHash: "a3f7c9e1d4b2" },
  { id: "victim-002", name: "James Kowalski", age: 14, gender: "male", language: "en", region: "IL-NORTH", enrolledVoiceHash: "b8e2f4a6c1d9" },
  { id: "victim-003", name: "Amara Okafor", age: 6, gender: "female", language: "en", region: "GA-EAST", enrolledVoiceHash: "c5d1a8f3e7b0" },
  { id: "victim-004", name: "Diego Ramirez", age: 11, gender: "male", language: "es", region: "AZ-WEST", enrolledVoiceHash: "d9f6b3c0a5e2" },
  { id: "victim-005", name: "Lena Bergstrom", age: 16, gender: "female", language: "en", region: "MN-CENTRAL", enrolledVoiceHash: "e2a7c4f1b6d3" },
];

export const MOCK_CALLS = [
  {
    id: "call-001",
    caseId: "case-001",
    duration: 127,
    transcript: [
      { speaker: "A", start: 0, end: 5.2, text: "We have your daughter. If you want to see her alive, listen carefully." },
      { speaker: "B", start: 6.1, end: 9.8, text: "Please, just let me talk to her. I need to know she's okay." },
      { speaker: "A", start: 10.5, end: 18.3, text: "She's fine for now. Two million dollars. Small unmarked bills. You'll get instructions in 24 hours." },
      { speaker: "B", start: 19.0, end: 24.6, text: "I don't have that kind of money. Please, there must be another way." },
      { speaker: "A", start: 25.2, end: 32.1, text: "Find it. Sell your house. Borrow. We don't care how. No police or she dies. Understood?" },
      { speaker: "B", start: 33.0, end: 36.4, text: "I understand. Just please don't hurt her." },
      { speaker: "A", start: 37.0, end: 42.5, text: "Wait for the next call. And remember, we're watching." },
    ],
    speakerLabels: { A: "Kidnapper (Male, 30-45)", B: "Father (Negotiator)" },
    voiceHashes: { A: "kx7m3p9q2r5t", B: "jy4n8w1v6s2u" },
  },
  {
    id: "call-002",
    caseId: "case-002",
    duration: 94,
    transcript: [
      { speaker: "A", start: 0, end: 3.8, text: "The boy is with us. Cooperate fully if you want him back." },
      { speaker: "B", start: 4.5, end: 10.2, text: "I'm cooperating. What do you need? Money? Just name it." },
      { speaker: "A", start: 11.0, end: 19.7, text: "One point five million. We'll send a location for the drop. Come alone. No tracking devices." },
      { speaker: "B", start: 20.5, end: 26.3, text: "I'll get the money. Can I hear my son? Just his voice, please." },
      { speaker: "A", start: 27.0, end: 31.2, text: "He'll speak on the next call if you follow instructions." },
      { speaker: "B", start: 32.0, end: 35.8, text: "Alright. I'll be ready. Just tell me where." },
    ],
    speakerLabels: { A: "Kidnapper (Male, 25-35)", B: "Mother (Negotiator)" },
    voiceHashes: { A: "mz2p8q4r7s1w", B: "nx5t9y3u6v0a" },
  },
  {
    id: "call-003",
    caseId: "case-001",
    duration: 76,
    transcript: [
      { speaker: "A", start: 0, end: 4.3, text: "The drop is at the old warehouse on Miller Road. Tomorrow, 3 PM sharp." },
      { speaker: "B", start: 5.0, end: 10.8, text: "Miller Road warehouse. Got it. Let me speak to my daughter first." },
      { speaker: "C", start: 12.1, end: 18.7, text: "Papa? I'm okay. I'm scared but they didn't hurt me. Please come get me." },
      { speaker: "A", start: 19.5, end: 24.2, text: "That's enough. You heard her. She's alive. Now get the money ready." },
      { speaker: "B", start: 25.0, end: 30.1, text: "I'll be there. Please keep her safe until then." },
    ],
    speakerLabels: { A: "Kidnapper", B: "Father", C: "Victim (Maria Santos)" },
    voiceHashes: { A: "kx7m3p9q2r5t", B: "jy4n8w1v6s2u", C: "a3f7c9e1d4b2" },
  },
];

export const MOCK_CASES = [
  {
    id: "case-001",
    caseNumber: "AK-2024-0047",
    status: "active",
    priority: "critical",
    victimId: "victim-001",
    victimName: "Maria Santos",
    location: "Laredo, TX",
    jurisdiction: "TX-SOUTH",
    reportedAt: "2024-11-15T22:30:00Z",
    lastActivity: "2024-11-16T14:15:00Z",
    callsCount: 2,
    demands: "$2,000,000 USD",
    leadNegotiator: "Agent M. Chen",
    notes: "Ransom demand received via phone call. Victim voice confirmed on second call. Cross-state match pending with NM and AZ cases.",
  },
  {
    id: "case-002",
    caseNumber: "AK-2024-0052",
    status: "active",
    priority: "high",
    victimId: "victim-002",
    victimName: "James Kowalski",
    location: "Chicago, IL",
    jurisdiction: "IL-NORTH",
    reportedAt: "2024-11-18T08:15:00Z",
    lastActivity: "2024-11-18T18:42:00Z",
    callsCount: 1,
    demands: "$1,500,000 USD",
    leadNegotiator: "Agent R. Park",
    notes: "Single ransom call received. Male kidnapper voice detected. Awaiting proof-of-life call. No victim voice confirmed yet.",
  },
  {
    id: "case-003",
    caseNumber: "AK-2024-0041",
    status: "resolved",
    priority: "high",
    victimId: "victim-004",
    victimName: "Diego Ramirez",
    location: "Phoenix, AZ",
    jurisdiction: "AZ-WEST",
    reportedAt: "2024-10-22T16:40:00Z",
    lastActivity: "2024-10-25T09:30:00Z",
    callsCount: 4,
    demands: "$800,000 USD",
    leadNegotiator: "Agent M. Chen",
    notes: "Resolved. Victim recovered safely. Three suspects in custody. Voice evidence submitted to court.",
  },
  {
    id: "case-004",
    caseNumber: "AK-2024-0055",
    status: "pending",
    priority: "medium",
    victimId: "victim-005",
    victimName: "Lena Bergstrom",
    location: "Minneapolis, MN",
    jurisdiction: "MN-CENTRAL",
    reportedAt: "2024-11-20T11:00:00Z",
    lastActivity: "2024-11-20T11:00:00Z",
    callsCount: 0,
    demands: "Unknown",
    leadNegotiator: "Agent S. Torvald",
    notes: "Missing person report upgraded to potential kidnapping. No ransom call received yet. Surveillance ongoing.",
  },
  {
    id: "case-005",
    caseNumber: "AK-2024-0038",
    status: "cold",
    priority: "low",
    victimId: "victim-003",
    victimName: "Amara Okafor",
    location: "Atlanta, GA",
    jurisdiction: "GA-EAST",
    reportedAt: "2024-09-10T14:20:00Z",
    lastActivity: "2024-09-28T07:45:00Z",
    callsCount: 3,
    demands: "$3,000,000 USD",
    leadNegotiator: "Agent R. Park",
    notes: "No communication in 53 days. Voiceprints archived. Periodic cross-state match scan enabled.",
  },
];

export const MOCK_MATCHES = [
  { id: "match-001", sourceCase: "case-001", targetCase: "case-002", speaker: "A", score: 0.43, matchedRegion: "MIDWEST", timestamp: "2024-11-19T02:15:00Z" },
  { id: "match-002", sourceCase: "case-001", targetCase: "case-005", speaker: "A", score: 0.71, matchedRegion: "SOUTHEAST", timestamp: "2024-11-19T02:15:00Z" },
  { id: "match-003", sourceCase: "case-001", targetCase: "case-003", speaker: "A", score: 0.88, matchedRegion: "SOUTHWEST", timestamp: "2024-11-19T02:15:00Z" },
  { id: "match-004", sourceCase: "case-002", targetCase: "case-005", speaker: "A", score: 0.37, matchedRegion: "SOUTHEAST", timestamp: "2024-11-19T02:15:00Z" },
  { id: "match-005", sourceCase: "case-001", targetCase: "case-002", speaker: "B", score: 0.15, matchedRegion: "MIDWEST", timestamp: "2024-11-19T02:15:00Z" },
];

export const STORAGE_KEYS = {
  cases: "ransomlink_cases",
  calls: "ransomlink_calls",
  timeline: "ransomlink_timeline",
  settings: "ransomlink_settings",
} as const;

export const COMMAND_HELP = [
  "AVAILABLE COMMANDS:",
  "  run_tests         Execute full system diagnostics",
  "  check_runtime     Verify runtime dependencies",
  "  run_calibration   Calibrate voiceprint thresholds",
  "  status            Show system status",
  "  clear             Clear terminal buffer",
  "  help              Show this help",
];
