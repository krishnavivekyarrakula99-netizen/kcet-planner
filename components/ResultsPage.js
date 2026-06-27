import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import CollegeCard from "./CollegeCard";
import { ComparisonChart } from "./Chart";
import { getClassifiedColleges, TIER_CONFIG } from "../utils/rankClassifier";
import { FUTURE_SCOPE } from "../utils/data";

// ─── Tier Section Header ──────────────────────────────────────────────────────
function TierHeader({ tier, count }) {
  const config = TIER_CONFIG[tier];
  const headerColors = {
    Dream:  "bg-green-500",
    Target: "bg-blue-500",
    Safe:   "bg-orange-500",
    Backup: "bg-red-500",
  };
  return (
    <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl ${headerColors[tier]} text-white`}>
      <span className="text-lg">{config.iconEmoji}</span>
      <div className="flex-1">
        <h3 className="font-bold text-base">{config.label} Colleges</h3>
        <p className="text-xs opacity-90">{config.description}</p>
      </div>
      <span className="bg-white/25 text-white text-sm font-bold px-3 py-1 rounded-full">
        {count}
      </span>
    </div>
  );
}

// ─── Summary Stats Card ───────────────────────────────────────────────────────
function StatCard({ label, value, sub, color }) {
  const colors = {
    indigo: "bg-indigo-50 border-indigo-200 text-indigo-700",
    green:  "bg-green-50 border-green-200 text-green-700",
    blue:   "bg-blue-50 border-blue-200 text-blue-700",
    orange: "bg-orange-50 border-orange-200 text-orange-700",
    red:    "bg-red-50 border-red-200 text-red-700",
  };
  return (
    <div className={`rounded-xl border p-3 ${colors[color]}`}>
      <div className="text-2xl font-extrabold">{value}</div>
      <div className="text-xs font-semibold mt-0.5">{label}</div>
      {sub && <div className="text-xs opacity-70 mt-0.5">{sub}</div>}
    </div>
  );
}

// ─── Future Scope Panel ───────────────────────────────────────────────────────
function FutureScopePanel({ branches }) {
  const selectedScopes = branches
    .filter((b) => FUTURE_SCOPE[b])
    .map((b) => ({ branch: b, ...FUTURE_SCOPE[b] }));
  if (selectedScopes.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <h3 className="font-bold text-slate-800 text-base mb-4 flex items-center gap-2">
        <span>🔭</span> Future Scope &amp; Career Paths
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {selectedScopes.map((scope) => (
          <div key={scope.branch} className="bg-gradient-to-br from-slate-50 to-indigo-50 rounded-xl border border-indigo-100 p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="font-bold text-indigo-700 text-base">{scope.branch}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                scope.growth === "Very High" ? "bg-green-100 text-green-700" :
                scope.growth === "High"      ? "bg-blue-100 text-blue-700" :
                                               "bg-orange-100 text-orange-700"
              }`}>
                {scope.growth} growth
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-600 mb-1">Specializations:</p>
            <div className="flex flex-wrap gap-1 mb-3">
              {scope.specializations.map((s) => (
                <span key={s} className="text-xs bg-white border border-indigo-200 text-indigo-700 px-2 py-0.5 rounded-full">{s}</span>
              ))}
            </div>
            <p className="text-xs font-semibold text-slate-600 mb-1">Top Recruiters:</p>
            <div className="flex flex-wrap gap-1 mb-3">
              {scope.companies.map((c) => (
                <span key={c} className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-medium">{c}</span>
              ))}
            </div>
            <div className="text-xs text-slate-600 bg-white rounded-lg px-3 py-2 border border-slate-200">
              💰 Avg. Package: <span className="font-bold text-slate-800">{scope.avgPackage}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Export Helpers ───────────────────────────────────────────────────────────
function exportAsJSON(data, rank, category, branches) {
  const exportObj = {
    generatedAt: new Date().toISOString(),
    studentProfile: { rank: Number(rank), category, branches },
    summary: { total: data.allSorted.length, dream: data.Dream.length, target: data.Target.length, safe: data.Safe.length, backup: data.Backup.length },
    optionList: data.allSorted.map((d, i) => ({
      preferenceNo: i + 1, college: d.college, branch: d.branch,
      category: d.category, closingRank2025: d.closingRank,
      tier: d.tier, admissionProbability: `${d.probability}%`,
    })),
  };
  const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `KCET_Option_List_Rank${rank}.json`; a.click();
  URL.revokeObjectURL(url);
}

function exportAsText(data, rank, category, branches) {
  const icons = { Dream: "★", Target: "●", Safe: "◆", Backup: "○" };
  const lines = [
    "═══════════════════════════════════════════════════════════",
    "         KCET SMART OPTION ENTRY PLANNER",
    `         Generated: ${new Date().toLocaleString("en-IN")}`,
    "═══════════════════════════════════════════════════════════",
    `  Rank    : ${Number(rank).toLocaleString()}`,
    `  Category: ${category}`,
    `  Branches: ${branches.join(", ")}`,
    "═══════════════════════════════════════════════════════════",
    `  Summary: Dream(${data.Dream.length}) | Target(${data.Target.length}) | Safe(${data.Safe.length}) | Backup(${data.Backup.length})`,
    "",
    "───────────────────────────────────────────────────────────",
    "  OPTION ENTRY LIST (recommended preference order)",
    "───────────────────────────────────────────────────────────",
    "",
    ...data.allSorted.map((d, i) =>
      `  ${String(i + 1).padStart(3)}. [${d.tier.toUpperCase().padEnd(6)}] ${icons[d.tier]} ${d.college}\n` +
      `       Branch: ${d.branch} | Cutoff: ${d.closingRank.toLocaleString()} | Probability: ${d.probability}%\n`
    ),
    "═══════════════════════════════════════════════════════════",
    "  Disclaimer: Based on simulated 2025 data. Verify with KEA.",
    "═══════════════════════════════════════════════════════════",
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `KCET_Option_List_Rank${rank}.txt`; a.click();
  URL.revokeObjectURL(url);
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ResultsPage() {
  const router = useRouter();
  const [results, setResults] = useState(null);
  const [activeTab, setActiveTab] = useState("grouped");
  const [activeTier, setActiveTier] = useState("Dream");

  const { rank, category, branches: branchesStr } = router.query;
  const branches = branchesStr ? branchesStr.split(",") : [];

  useEffect(() => {
    if (!rank || !category || !branchesStr) return;
    const classified = getClassifiedColleges({
      rank: parseInt(rank, 10),
      category,
      branches,
    });
    const withRank = (arr) => arr.map((d) => ({ ...d, rank: parseInt(rank, 10) }));
    setResults({
      Dream:     withRank(classified.Dream),
      Target:    withRank(classified.Target),
      Safe:      withRank(classified.Safe),
      Backup:    withRank(classified.Backup),
      allSorted: withRank(classified.allSorted),
      warnings:  classified.warnings,
    });
  }, [rank, category, branchesStr]);

  if (!results) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Analysing your options…</p>
        </div>
      </div>
    );
  }

  const totalColleges = results.allSorted.length;
  const tierCounts = { Dream: results.Dream.length, Target: results.Target.length, Safe: results.Safe.length, Backup: results.Backup.length };
  const tiers = ["Dream", "Target", "Safe", "Backup"];

  return (
    <>
      <Head>
        <title>Your KCET Option List — Rank {rank}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50">

        {/* Header */}
        <div className="hero-gradient text-white">
          <div className="max-w-6xl mx-auto px-4 py-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <Link href="/" className="text-indigo-200 hover:text-white text-sm flex items-center gap-1 mb-1">
                  ← Back to Planner
                </Link>
                <h1 className="text-2xl font-extrabold">Your KCET Option List</h1>
                <p className="text-indigo-200 text-sm mt-0.5">
                  Rank <strong className="text-white">#{Number(rank).toLocaleString()}</strong>
                  {" · "}Category <strong className="text-white">{category}</strong>
                  {" · "}Branches <strong className="text-white">{branches.join(", ")}</strong>
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => exportAsText(results, rank, category, branches)}
                  className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-sm font-semibold px-3 py-2 rounded-xl transition-all"
                >
                  📄 Export TXT
                </button>
                <button
                  onClick={() => exportAsJSON(results, rank, category, branches)}
                  className="flex items-center gap-1.5 bg-white text-indigo-700 text-sm font-bold px-3 py-2 rounded-xl hover:bg-indigo-50 transition-all"
                >
                  📥 Export JSON
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">

          {/* Warnings */}
          {results.warnings.length > 0 && (
            <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 space-y-1">
              {results.warnings.map((w, i) => (
                <p key={i} className="text-amber-800 text-sm font-medium">{w}</p>
              ))}
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <StatCard label="Total Colleges" value={totalColleges}      sub="in your list"  color="indigo" />
            <StatCard label="Dream"           value={tierCounts.Dream}  sub="≤70% cutoff"   color="green"  />
            <StatCard label="Target"          value={tierCounts.Target} sub="within cutoff" color="blue"   />
            <StatCard label="Safe"            value={tierCounts.Safe}   sub="≤120% cutoff"  color="orange" />
            <StatCard label="Backup"          value={tierCounts.Backup} sub="above cutoff"  color="red"    />
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex border-b border-slate-100">
              {[
                { key: "grouped", label: "📚 Grouped by Tier"  },
                { key: "smart",   label: "🧠 Smart Option List" },
                { key: "compare", label: "📈 Comparison Chart"  },
              ].map((tab) => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 py-3 px-2 text-sm font-semibold transition-all border-b-2
                    ${activeTab === tab.key
                      ? "border-indigo-500 text-indigo-700 bg-indigo-50"
                      : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-4 md:p-6">

              {/* Tab 1: Grouped */}
              {activeTab === "grouped" && (
                <div className="space-y-4">
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {tiers.map((tier) => {
                      const icons   = { Dream: "🌟", Target: "🎯", Safe: "🛡️", Backup: "🔖" };
                      const active  = { Dream: "bg-green-500 text-white", Target: "bg-blue-500 text-white", Safe: "bg-orange-500 text-white", Backup: "bg-red-500 text-white" };
                      const passive = { Dream: "bg-green-50 text-green-700 border border-green-300", Target: "bg-blue-50 text-blue-700 border border-blue-300", Safe: "bg-orange-50 text-orange-700 border border-orange-300", Backup: "bg-red-50 text-red-700 border border-red-300" };
                      return (
                        <button key={tier} onClick={() => setActiveTier(tier)}
                          className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold transition-all
                            ${activeTier === tier ? active[tier] : passive[tier]}`}
                        >
                          {icons[tier]} {tier} ({tierCounts[tier]})
                        </button>
                      );
                    })}
                  </div>
                  {tiers.filter((t) => t === activeTier).map((tier) => (
                    <div key={tier}>
                      <div className="mb-3"><TierHeader tier={tier} count={results[tier].length} /></div>
                      {results[tier].length === 0 ? (
                        <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-xl">
                          <p className="text-2xl mb-2">🔍</p>
                          <p className="text-sm">No colleges in this tier for your selection.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                          {results[tier].map((college, i) => (
                            <CollegeCard key={`${college.college}-${college.branch}`} data={college} index={i + 1} showIndex />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Tab 2: Smart List */}
              {activeTab === "smart" && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-slate-800 text-base">Recommended Option Entry Order</h3>
                      <p className="text-xs text-slate-500 mt-0.5">Enter colleges in this order in the KEA portal. Dream → Target → Safe → Backup</p>
                    </div>
                    <span className="text-xs bg-indigo-100 text-indigo-700 font-bold px-2 py-1 rounded-full">{totalColleges} options</span>
                  </div>
                  <div className="space-y-2">
                    {results.allSorted.map((college, i) => (
                      <CollegeCard key={`${college.college}-${college.branch}-${i}`} data={college} index={i + 1} showIndex />
                    ))}
                  </div>
                  {totalColleges === 0 && (
                    <div className="text-center py-12 text-slate-400">
                      <p className="text-3xl mb-2">😕</p>
                      <p className="font-medium">No colleges found for your selection.</p>
                      <Link href="/" className="mt-4 inline-block text-indigo-600 font-semibold text-sm hover:underline">
                        ← Go back and modify inputs
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: Comparison */}
              {activeTab === "compare" && (
                <div>
                  <h3 className="font-bold text-slate-800 text-base mb-1">Cutoff Comparison (Top 5 Colleges)</h3>
                  <p className="text-xs text-slate-500 mb-4">Historical closing ranks of your top Dream and Target colleges vs your rank.</p>
                  <ComparisonChart colleges={[...results.Dream, ...results.Target].slice(0, 5)} userRank={parseInt(rank, 10)} />
                  {results.Dream.length + results.Target.length === 0 && (
                    <div className="text-center py-8 text-slate-400">
                      <p className="text-sm">No Dream or Target colleges to compare.</p>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>

          {branches.length > 0 && <FutureScopePanel branches={branches} />}

          <div className="bg-white rounded-2xl border border-slate-100 p-4 text-xs text-slate-500">
            <strong className="text-slate-700">⚠️ Disclaimer:</strong> This tool uses simulated historical data for educational purposes only.
            Always verify with the official KEA website (kea.kar.nic.in) before submitting your option entry list.
          </div>

        </div>
      </div>
    </>
  );
}
