import { useState } from "react";
import { BrowserRouter, Routes, Route, NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  FilePlus,
  FolderOpen,
  Search,
  Terminal,
  Shield,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Toaster } from "sonner";
import { BRAND } from "@/constants";
import Dashboard from "@/pages/Dashboard";
import Intake from "@/pages/Intake";
import CaseWorkspace from "@/pages/CaseWorkspace";
import CrossStateMatcher from "@/pages/CrossStateMatcher";
import CommandCenter from "@/pages/CommandCenter";

const NAV_ITEMS = [
  { label: "Dashboard", path: "/", icon: LayoutDashboard },
  { label: "Case Intake", path: "/intake", icon: FilePlus },
  { label: "Case Workspace", path: "/workspace", icon: FolderOpen },
  { label: "Cross-State Match", path: "/matcher", icon: Search },
  { label: "Command Center", path: "/console", icon: Terminal },
] as const;

function AppShell() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 text-slate-100">
      <aside
        className={`flex flex-col bg-slate-900 border-r border-slate-800 transition-all duration-300 shrink-0 ${
          collapsed ? "w-[60px]" : "w-[220px]"
        }`}
      >
        <div className="flex items-center gap-2 px-4 h-14 border-b border-slate-800 shrink-0">
          <Shield className="w-5 h-5 text-red-500 shrink-0" />
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm font-bold tracking-tight text-slate-100 whitespace-nowrap"
            >
              {BRAND.name}
            </motion.span>
          )}
        </div>

        <nav className="flex-1 py-3 space-y-1 px-2 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-mono transition-colors ${
                  isActive
                    ? "bg-slate-800 text-slate-100"
                    : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/50"
                }`
              }
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {!collapsed && <span className="truncate text-xs">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-800 p-2">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center p-2 rounded-md text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 transition-colors"
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-900/80 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
              {BRAND.classification}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-mono text-slate-600">
              {BRAND.agency}
            </span>
            <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
              v{BRAND.version}
            </span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="p-6 max-w-[1400px] mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <Routes location={location}>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/intake" element={<Intake />} />
                  <Route path="/workspace" element={<CaseWorkspace />} />
                  <Route path="/matcher" element={<CrossStateMatcher />} />
                  <Route path="/console" element={<CommandCenter />} />
                </Routes>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>

      <Toaster
        position="bottom-right"
        theme="dark"
        toastOptions={{
          style: {
            background: "#1e293b",
            border: "1px solid #334155",
            color: "#e2e8f0",
            fontSize: "12px",
            fontFamily: "var(--font-mono)",
          },
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}
