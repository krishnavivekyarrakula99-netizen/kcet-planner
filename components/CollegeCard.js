import { useState } from "react";
import { TIER_CONFIG } from "../utils/rankClassifier";
import CutoffChart from "./Chart";

const TIER_STYLES = {
  Dream:  { bg: "tier-dream",  ring: "#22c55e", label: "bg-green-500/20 text-green-300 border border-green-500/30",  dot: "bg-green-400"  },
  Target: { bg: "tier-target", ring: "#6366f1", label: "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30", dot: "bg-indigo-400" },
  Safe:   { bg: "tier-safe",   ring: "#f97316", label: "bg-orange-500/20 text-orange-300 border border-orange-500/30", dot: "bg-orange-400" },
  Backup: { bg: "tier-backup", ring: "#ef4444", label: "bg-red-500/20 text-red-300 border border-red-500/30",         dot: "bg-red-400"    },
};

// ── SVG Probability Ring ──────────────────────────────────────────────────────
function ProbRing({ probability, tier }) {
  const r = 22;
  const circ = 2 * Math.PI * r;
  const offset = circ - (probability / 100) * circ;
  const colors = { Dream: "#22c55e", Target: "#6366f1", Safe: "#f97316", Backup: "#ef4444" };

  return (
    <div className="relative w-16 h-16 flex-shrink-0">
      <svg className="w-16 h-16 -rotate-90" viewBox="0 0 52 52">
        <circle cx="26" cy="26" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
        <circle
          cx="26" cy="26" r={r} fill="none"
          stroke={colors[tier]}
          strokeWidth="4"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s ease", filter: `drop-shadow(0 0 4px ${colors[tier]}80)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xs font-black text-white leading-none">{probability}%</span>
        <span className="text-[9px] text-slate-500 leading-none mt-0.5">admit</span>
      </div>
    </div>
  );
}

// ── Main Card ─────────────────────────────────────────────────────────────────
export default function CollegeCard({ data, index, showIndex }) {
  const [expanded, setExpanded] = useState(false);
  const config = TIER_CONFIG[data.tier];
  const style  = TIER_STYLES[data.tier];
  const diff   = data.closingRank - data.rank;
  const diffLabel = diff > 0
    ? `${diff.toLocaleString()} below cutoff ✓`
    : `${Math.abs(diff).toLocaleString()} above cutoff`;

  return (
    <div className={`${style.bg} tier-card rounded-2xl overflow-hidden`}>
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Serial number */}
          {showIndex && (
            <div className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-slate-400">{index}</span>
            </div>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-1.5 mb-2">
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${style.label}`}>
                {config.iconEmoji} {config.label}
              </span>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-400">
                {data.branch}
              </span>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-500">
                {data.category}
              </span>
            </div>

            {/* College name */}
            <h3 className="text-sm font-bold text-white leading-snug mb-2" title={data.college}>
              {data.college}
            </h3>

            {/* Stats row */}
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <div className="text-slate-400">
                Cutoff <span className="text-white font-bold">{data.closingRank.toLocaleString()}</span>
              </div>
              <div className={`px-2 py-0.5 rounded-full font-semibold ${diff > 0 ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
                {diffLabel}
              </div>
            </div>
          </div>

          {/* Prob ring */}
          <ProbRing probability={data.probability} tier={data.tier} />
        </div>

        {/* Expand button */}
        <button onClick={() => setExpanded(!expanded)}
          className="mt-3 w-full flex items-center justify-center gap-1.5 text-xs font-medium text-slate-500
            hover:text-slate-300 py-1.5 rounded-lg hover:bg-white/5 transition-all">
          {expanded ? "▲ Hide trend" : "▼ View cutoff trend"}
        </button>
      </div>

      {/* Expanded chart */}
      {expanded && (
        <div className="border-t border-white/5 bg-black/20 p-4">
          <p className="text-xs font-semibold text-slate-500 mb-3">
            📈 Historical Cutoff — {data.college} ({data.branch}, {data.category})
          </p>
          <CutoffChart data={data.history} tier={data.tier} userRank={data.rank} />
        </div>
      )}
    </div>
  );
}
