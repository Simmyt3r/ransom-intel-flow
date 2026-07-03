import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  TriangleAlert,
  Phone,
  CircleCheck,
  Clock,
  Shield,
  Radio,
  Zap,
} from "lucide-react";
import { LocalStore } from "@/utils/mockEngine";
import { STATUS_LABELS, PRIORITY_LABELS } from "@/constants";
import type { CaseRecord } from "@/utils/mockEngine";

function KpiCard({
  label,
  value,
  sub,
  icon: Icon,
  color,
  pulse,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  color: string;
  pulse?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-800/60 border border-slate-700/60 rounded-lg p-4 flex items-start gap-3"
    >
      <div className={`p-2 rounded-md ${color} bg-slate-900/60 shrink-0`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <div className="text-xs text-slate-400 uppercase tracking-wider font-mono">
          {label}
        </div>
        <div className="flex items-baseline gap-2 mt-0.5">
          <span className="text-2xl font-bold font-mono text-slate-100">
            {value}
          </span>
          {pulse && (
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
            </span>
          )}
        </div>
        {sub && (
          <div className="text-xs text-slate-500 mt-0.5 truncate">{sub}</div>
        )}
      </div>
    </motion.div>
  );
}

function CaseRow({ c, onClick }: { c: CaseRecord; onClick: () => void }) {
  const status = STATUS_LABELS[c.status] ?? STATUS_LABELS.pending;
  const priority = PRIORITY_LABELS[c.priority] ?? PRIORITY_LABELS.medium;

  return (
    <motion.tr
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={onClick}
      className="border-b border-slate-700/40 hover:bg-slate-800/40 cursor-pointer transition-colors"
    >
      <td className="py-2.5 px-3 whitespace-nowrap">
        <span className={`text-xs px-2 py-0.5 rounded font-mono font-semibold ${priority.bg} ${priority.color}`}>
          {priority.label}
        </span>
      </td>
      <td className="py-2.5 px-3 font-mono text-sm text-slate-300">{c.caseNumber}</td>
      <td className="py-2.5 px-3 text-sm text-slate-200">{c.victimName}</td>
      <td className="py-2.5 px-3 text-xs text-slate-400">{c.location}</td>
      <td className="py-2.5 px-3">
        <span className={`text-xs font-mono font-semibold ${status.color}`}>
          {status.label}
        </span>
      </td>
      <td className="py-2.5 px-3 font-mono text-xs text-slate-500">{c.callsCount}</td>
      <td className="py-2.5 px-3 text-xs text-slate-400 hidden lg:table-cell">
        {new Date(c.lastActivity).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </td>
    </motion.tr>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [cases, setCases] = useState<CaseRecord[]>([]);

  useEffect(() => {
    setCases(LocalStore.getCases());
  }, []);

  const activeCases = cases.filter((c) => c.status === "active");
  const criticalCases = cases.filter((c) => c.priority === "critical");
  const pendingCalls = activeCases.reduce((sum, c) => sum + c.callsCount, 0);
  const resolvedCases = cases.filter((c) => c.status === "resolved").length;

  const recentTranscripts = [
    { caseNumber: "AK-2024-0047", speaker: "Kidnapper", text: "The drop is at the old warehouse on Miller Road...", time: "14:15 UTC" },
    { caseNumber: "AK-2024-0052", speaker: "Mother", text: "I'll get the money. Can I hear my son? Just his voice...", time: "18:42 UTC" },
    { caseNumber: "AK-2024-0047", speaker: "Victim", text: "Papa? I'm okay. I'm scared but they didn't hurt me...", time: "13:10 UTC" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-100 tracking-tight">
            Command Dashboard
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            NATIONAL ANTI-KIDNAPPING TASK FORCE - CLASSIFIED
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
          <Clock className="w-3.5 h-3.5" />
          <span>{new Date().toUTCString()}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard
          label="Active Cases"
          value={activeCases.length}
          sub={`${criticalCases.length} critical`}
          icon={Activity}
          color="text-red-400"
          pulse={criticalCases.length > 0}
        />
        <KpiCard
          label="National Match Rate"
          value="71.3%"
          sub="+2.1% this quarter"
          icon={Radio}
          color="text-amber-400"
        />
        <KpiCard
          label="Unprocessed Calls"
          value={pendingCalls}
          sub={`Across ${activeCases.length} active cases`}
          icon={Phone}
          color="text-cyan-400"
        />
        <KpiCard
          label="Verification Success"
          value={`${resolvedCases > 0 ? 88 : 0}%`}
          sub={`${resolvedCases} cases resolved`}
          icon={CircleCheck}
          color="text-emerald-400"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-800/40 border border-slate-700/50 rounded-lg">
          <div className="px-4 py-3 border-b border-slate-700/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-semibold text-slate-200">Case Matrix</span>
            </div>
            <button
              onClick={() => navigate("/intake")}
              className="text-xs px-3 py-1.5 bg-red-600/20 text-red-400 border border-red-600/30 rounded hover:bg-red-600/30 transition-colors font-mono"
            >
              + NEW CASE
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-700/40 text-xs text-slate-500 font-mono uppercase tracking-wider">
                  <th className="py-2 px-3">Priority</th>
                  <th className="py-2 px-3">Case #</th>
                  <th className="py-2 px-3">Victim</th>
                  <th className="py-2 px-3">Location</th>
                  <th className="py-2 px-3">Status</th>
                  <th className="py-2 px-3">Calls</th>
                  <th className="py-2 px-3 hidden lg:table-cell">Last Activity</th>
                </tr>
              </thead>
              <tbody>
                {cases.slice(0, 8).map((c) => (
                  <CaseRow key={c.id} c={c} onClick={() => navigate(`/workspace?id=${c.id}`)} />
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg flex flex-col">
          <div className="px-4 py-3 border-b border-slate-700/40 flex items-center gap-2">
            <Radio className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-semibold text-slate-200">Live Transcripts</span>
            <span className="relative flex h-2 w-2 ml-auto">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-3 p-3">
            {recentTranscripts.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-slate-900/50 border border-slate-700/30 rounded p-3"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono text-slate-500 uppercase">{t.caseNumber}</span>
                  <span className="text-[10px] font-mono text-slate-600">{t.time}</span>
                </div>
                <div className="text-[11px] font-mono text-amber-400 mb-1">{t.speaker}</div>
                <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">{t.text}</p>
              </motion.div>
            ))}
          </div>
          <div className="px-4 py-2 border-t border-slate-700/40">
            <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500">
              <Zap className="w-3 h-3 text-emerald-500" />
              <span>3 active transcription streams</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <TriangleAlert className="w-4 h-4 text-red-400" />
          <span className="text-sm font-semibold text-slate-200">Active Alerts</span>
        </div>
        <div className="space-y-2">
          {criticalCases.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between bg-red-950/30 border border-red-900/30 rounded px-3 py-2"
            >
              <div className="flex items-center gap-3">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                </span>
                <div>
                  <span className="text-xs font-mono font-semibold text-red-300">{c.caseNumber}</span>
                  <span className="text-xs text-red-400 ml-2">{c.victimName} - {c.location}</span>
                </div>
              </div>
              <button
                onClick={() => navigate(`/workspace?id=${c.id}`)}
                className="text-[10px] font-mono text-red-400 hover:text-red-300 transition-colors"
              >
                OPEN CASE
              </button>
            </div>
          ))}
          {criticalCases.length === 0 && (
            <p className="text-xs text-slate-500 font-mono">No active critical alerts.</p>
          )}
        </div>
      </div>
    </div>
  );
}