import { useState } from "react";
import { TIER_CONFIG } from "../utils/rankClassifier";
import CutoffChart from "./Chart";

// ─── Probability Ring ──────────────────────────────────────────────────────────
function ProbabilityRing({ probability, tier }) {
  const config = TIER_CONFIG[tier];
  const circumference = 2 * Math.PI * 20; // r=20
  const offset = circumference - (probability / 100) * circumference;

  const strokeColors = {
    Dream: "#16a34a",
    Target: "#2563eb",
    Safe: "#ea580c",
    Backup: "#dc2626",
  };

  return (
    <div className="relative w-14 h-14 flex-shrink-0">
      <svg className="w-14 h-14 -rotate-90" viewBox="0 0 48 48">
        <circle cx="24" cy="24" r="20" fill="none" stroke="#e2e8f0" strokeWidth="4" />
        <circle
          cx="24" cy="24" r="20" fill="none"
          stroke={strokeColors[tier]}
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-700">
        {probability}%
      </span>
    </div>
  );
}

// ─── Main CollegeCard ─────────────────────────────────────────────────────────
export default function CollegeCard({ data, index, showIndex = false }) {
  const [expanded, setExpanded] = useState(false);
  const config = TIER_CONFIG[data.tier];

  const borderColors = {
    Dream: "border-green-400",
    Target: "border-blue-400",
    Safe: "border-orange-400",
    Backup: "border-red-400",
  };
  const bgColors = {
    Dream: "bg-green-50",
    Target: "bg-blue-50",
    Safe: "bg-orange-50",
    Backup: "bg-red-50",
  };
  const badgeColors = {
    Dream: "bg-green-500 text-white",
    Target: "bg-blue-500 text-white",
    Safe: "bg-orange-500 text-white",
    Backup: "bg-red-500 text-white",
  };
  const rankDiffColors = {
    Dream: "text-green-700 bg-green-100",
    Target: "text-blue-700 bg-blue-100",
    Safe: "text-orange-700 bg-orange-100",
    Backup: "text-red-700 bg-red-100",
  };

  const rankDiff = data.closingRank - data.rank;
  const rankDiffLabel =
    rankDiff > 0
      ? `${rankDiff.toLocaleString()} ranks buffer`
      : `${Math.abs(rankDiff).toLocaleString()} ranks above cutoff`;

  return (
    <div className={`card-hover rounded-2xl border-2 ${borderColors[data.tier]} ${bgColors[data.tier]} overflow-hidden`}>
      {/* Main row */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Serial number */}
          {showIndex && (
            <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-slate-600">{index}</span>
            </div>
          )}

          {/* Main content */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-start gap-2 mb-1">
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${badgeColors[data.tier]}`}>
                {config.iconEmoji} {config.label}
              </span>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-200 text-slate-600">
                {data.branch}
              </span>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                {data.category}
              </span>
            </div>

            <h3 className="text-sm font-bold text-slate-800 leading-snug mt-1 truncate" title={data.college}>
              {data.college}
            </h3>

            <div className="flex flex-wrap items-center gap-3 mt-2">
              <div className="text-xs text-slate-600">
                <span className="font-medium">Cutoff:</span>{" "}
                <span className="font-bold text-slate-800">{data.closingRank.toLocaleString()}</span>
              </div>
              <div className={`text-xs font-semibold px-2 py-0.5 rounded-full ${rankDiffColors[data.tier]}`}>
                {rankDiffLabel}
              </div>
            </div>
          </div>

          {/* Probability ring */}
          <ProbabilityRing probability={data.probability} tier={data.tier} />
        </div>

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-3 w-full flex items-center justify-center gap-1 text-xs font-medium text-slate-500
            hover:text-slate-700 py-1 rounded-lg hover:bg-white/60 transition-all"
        >
          {expanded ? "Hide trend chart ▲" : "View cutoff trend ▼"}
        </button>
      </div>

      {/* Expanded: Cutoff Trend Chart */}
      {expanded && (
        <div className="border-t border-white/60 bg-white/50 p-4">
          <p className="text-xs font-semibold text-slate-600 mb-3">
            📈 Historical Cutoff Trend — {data.college} ({data.branch}, {data.category})
          </p>
          <CutoffChart data={data.history} tier={data.tier} userRank={data.rank} />
        </div>
      )}
    </div>
  );
}
