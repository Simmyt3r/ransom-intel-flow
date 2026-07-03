import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Terminal, Play, Square, Trash2, Zap } from "lucide-react";
import { simulateScriptExecution, runCalibration } from "@/utils/mockEngine";
import { SCRIPTS, ALGORITHM_DEFAULTS } from "@/constants";
import type { CalibrationResult } from "@/utils/mockEngine";

export default function CommandCenter() {
  const [lines, setLines] = useState<string[]>([
    "RansomLink Command Console v3.2.1",
    'Type "help" for available commands.',
    "",
  ]);
  const [input, setInput] = useState("");
  const [running, setRunning] = useState(false);
  const [activeScript, setActiveScript] = useState<string | null>(null);
  const [calibrationResult, setCalibrationResult] = useState<CalibrationResult | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  const append = (line: string) => setLines((prev) => [...prev, line]);

  const execute = (cmd: string) => {
    append("");
    append("> " + cmd);

    if (cmd === "help") {
      append("");
      append("AVAILABLE COMMANDS:");
      append("  run_tests         Execute full system diagnostics");
      append("  check_runtime     Verify runtime dependencies");
      append("  run_calibration   Calibrate voiceprint thresholds");
      append("  status            Show system status");
      append("  clear             Clear terminal buffer");
      append("  help              Show this help");
      return;
    }

    if (cmd === "clear") {
      setLines([]);
      return;
    }

    if (cmd === "status") {
      append("");
      append("[STATUS] Voice Engine : OPERATIONAL");
      append("[STATUS] Threshold     : " + ALGORITHM_DEFAULTS.voiceprintThreshold);
      append("[STATUS] Embedding Dims: " + ALGORITHM_DEFAULTS.embeddingDimensions);
      append("[STATUS] FAR Target    : " + ALGORITHM_DEFAULTS.farThreshold);
      append("[STATUS] FRR Target    : " + ALGORITHM_DEFAULTS.frrThreshold);
      append("[STATUS] Evidence Chain: INTACT");
      return;
    }

    const scriptMap: Record<string, string> = {
      run_tests: "run_tests.bat",
      check_runtime: "check_runtime.bat",
      run_calibration: "run_calibration.bat",
    };

    const scriptName = scriptMap[cmd];
    if (scriptName) {
      setRunning(true);
      setActiveScript(scriptName);
      setCalibrationResult(null);
      append("");
      const cancel = simulateScriptExecution(
        scriptName,
        (line) => append(line),
        () => {
          setRunning(false);
          setActiveScript(null);
          append("");
          if (scriptName === "run_calibration.bat") {
            const result = runCalibration();
            setCalibrationResult(result);
            append("[CALIBRATION] Results saved.");
          }
        }
      );
      cancelRef.current = cancel;
      return;
    }

    append("[ERROR] Unknown command: " + cmd + '. Type "help" for available commands.');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && input.trim()) {
      execute(input.trim());
      setInput("");
    }
  };

  const stopScript = () => {
    if (cancelRef.current) {
      cancelRef.current();
      cancelRef.current = null;
      setRunning(false);
      setActiveScript(null);
      append("");
      append("[SYSTEM] Script terminated by user.");
    }
  };

  const clearBuffer = () => setLines([]);

  function lineColor(line: string): string {
    if (line.startsWith("[ERROR]")) return "text-red-400";
    if (line.startsWith(">")) return "text-amber-400";
    if (line.startsWith("[")) return "text-cyan-300";
    if (line.includes("PASS") || line.includes("OPERATIONAL") || line.includes("INTACT") || line.includes("VALID") || line.includes("MATCH")) return "text-emerald-400";
    if (line.includes("REACHABLE") || line.includes("INSTALLED")) return "text-emerald-300";
    return "text-slate-400";
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-100 tracking-tight">Command Center</h1>
        <p className="text-xs text-slate-400 font-mono mt-0.5">
          STANDALONE SYSTEM CONSOLE - DIRECT TOOL EXECUTION
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-3">
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-amber-400" />
              Available Scripts
            </h3>
            <div className="space-y-2">
              {SCRIPTS.map((script) => (
                <button
                  key={script.name}
                  onClick={() => execute(script.name.replace(".bat", ""))}
                  disabled={running}
                  className="w-full text-left bg-slate-900/50 border border-slate-700/40 rounded p-3 hover:bg-slate-800/60 disabled:opacity-40 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Play className="w-3 h-3 text-emerald-400" />
                    <span className="text-xs font-mono font-semibold text-slate-200">{script.name}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1 ml-5">{script.description}</p>
                </button>
              ))}
            </div>
          </div>

          {calibrationResult && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-800/40 border border-emerald-700/30 rounded-lg p-4"
            >
              <h3 className="text-sm font-semibold text-emerald-400 flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4" />
                Calibration Results
              </h3>
              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">Threshold</span>
                  <span className="text-slate-200">{calibrationResult.threshold}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">FAR</span>
                  <span className={calibrationResult.far <= ALGORITHM_DEFAULTS.farThreshold ? "text-emerald-400" : "text-red-400"}>
                    {calibrationResult.far}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">FRR</span>
                  <span className={calibrationResult.frr <= ALGORITHM_DEFAULTS.frrThreshold ? "text-emerald-400" : "text-amber-400"}>
                    {calibrationResult.frr}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Samples</span>
                  <span className="text-slate-200">{calibrationResult.samples}</span>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-700/50 rounded-lg overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-4 py-2 bg-slate-800/80 border-b border-slate-700/40">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-mono text-slate-300">
                {activeScript ? "EXECUTING: " + activeScript : "RANSOMLINK CONSOLE"}
              </span>
              {running && (
                <span className="text-[10px] font-mono text-amber-400 animate-pulse">RUNNING</span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {running && (
                <button onClick={stopScript} className="p-1.5 rounded hover:bg-red-900/30 text-red-400 transition-colors">
                  <Square className="w-3.5 h-3.5" />
                </button>
              )}
              <button onClick={clearBuffer} className="p-1.5 rounded hover:bg-slate-700 text-slate-400 transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div
            ref={scrollRef}
            className="flex-1 p-4 min-h-[400px] max-h-[500px] overflow-y-auto font-mono text-xs leading-relaxed"
            style={{ scrollbarWidth: "thin", scrollbarColor: "#334155 #0f172a" }}
          >
            {lines.length === 0 ? (
              <span className="text-slate-600">Buffer cleared. Type a command to begin.</span>
            ) : (
              lines.map((line, i) => (
                <motion.div
                  key={i + "-" + (line ? line.slice(0, 8) : "blank")}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={lineColor(line)}
                >
                  {line || " "}
                </motion.div>
              ))
            )}
          </div>

          <div className="px-4 py-2 bg-slate-800/80 border-t border-slate-700/40 flex items-center gap-2">
            <span className="text-emerald-400 font-mono text-xs">&gt;</span>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={running}
              placeholder={running ? "Script running..." : 'Type "help" for commands...'}
              className="flex-1 bg-transparent border-none outline-none text-xs font-mono text-slate-200 placeholder:text-slate-600"
              autoFocus
            />
          </div>
        </div>
      </div>
    </div>
  );
}
