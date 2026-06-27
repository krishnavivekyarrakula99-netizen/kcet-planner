import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import CollegeCard from "./CollegeCard";
import { ComparisonChart } from "./Chart";
import { getClassifiedColleges, TIER_CONFIG } from "../utils/rankClassifier";
import { FUTURE_SCOPE } from "../utils/data";

// ── Tier header bar ───────────────────────────────────────────────────────────
function TierHeader({ tier, count }) {
  const cfg = TIER_CONFIG[tier];
  const colors = {
    Dream:  "from-green-500/20 to-emerald-500/10 border-green-500/30 text-green-300",
    Target: "from-indigo-500/20 to-purple-500/10 border-indigo-500/30 text-indigo-300",
    Safe:   "from-orange-500/20 to-amber-500/10 border-orange-500/30 text-orange-300",
    Backup: "from-red-500/20 to-rose-500/10 border-red-500/30 text-red-300",
  };
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r border ${colors[tier]}`}>
      <span className="text-xl">{cfg.iconEmoji}</span>
      <div className="flex-1">
        <div className="font-bold text-base text-white">{cfg.label} Colleges</div>
        <div className="text-xs opacity-70 mt-0.5">{cfg.description}</div>
      </div>
      <span className="bg-white/10 text-white text-sm font-black px-3 py-1 rounded-full">{count}</span>
    </div>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, color }) {
  const borders = {
    indigo: "border-indigo-500/20 bg-indigo-500/5",
    green:  "border-green-500/20  bg-green-500/5",
    blue:   "border-blue-500/20   bg-blue-500/5",
    orange: "border-orange-500/20 bg-orange-500/5",
    red:    "border-red-500/20    bg-red-500/5",
  };
  const texts = {
    indigo: "text-indigo-300", green: "text-green-300",
    blue:   "text-blue-300",   orange: "text-orange-300", red: "text-red-300",
  };
  return (
    <div className={`rounded-2xl border p-4 ${borders[color]}`}>
      <div className={`text-3xl font-black ${texts[color]}`}>{value}</div>
      <div className="text-xs font-semibold text-white mt-1">{label}</div>
      {sub && <div className="text-xs text-slate-500 mt-0.5">{sub}</div>}
    </div>
  );
}

// ── Future scope card ─────────────────────────────────────────────────────────
function FutureScopePanel({ branches }) {
  const scopes = branches.filter(b => FUTURE_SCOPE[b]).map(b => ({ branch: b, ...FUTURE_SCOPE[b] }));
  if (!scopes.length) return null;
  return (
    <div className="glass rounded-3xl p-6">
      <h3 className="font-bold text-white text-lg mb-5 flex items-center gap-2">
        <span>🔭</span> Future Scope &amp; Career Paths
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {scopes.map(s => (
          <div key={s.branch} className="glass-card rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="font-black text-white text-lg">{s.branch}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                s.growth === "Very High" ? "bg-green-500/20 text-green-300" :
                s.growth === "High"      ? "bg-blue-500/20 text-blue-300" :
                                           "bg-orange-500/20 text-orange-300"}`}>
                {s.growth} growth
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Specializations</p>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {s.specializations.map(x => (
                <span key={x} className="text-xs bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full">{x}</span>
              ))}
            </div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Top Recruiters</p>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {s.companies.map(c => (
                <span key={c} className="text-xs bg-white/5 border border-white/10 text-slate-300 px-2 py-0.5 rounded-full font-medium">{c}</span>
              ))}
            </div>
            <div className="bg-white/5 rounded-xl px-3 py-2 text-xs text-slate-400 border border-white/5">
              💰 Avg Package: <span className="font-black text-white">{s.avgPackage}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Export helpers ────────────────────────────────────────────────────────────
function exportJSON(data, rank, category, branches) {
  const obj = {
    generatedAt: new Date().toISOString(),
    studentProfile: { rank: Number(rank), category, branches },
    summary: { total: data.allSorted.length, dream: data.Dream.length, target: data.Target.length, safe: data.Safe.length, backup: data.Backup.length },
    optionList: data.allSorted.map((d, i) => ({ preferenceNo: i+1, college: d.college, branch: d.branch, category: d.category, closingRank2025: d.closingRank, tier: d.tier, probability: `${d.probability}%` })),
  };
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([JSON.stringify(obj, null, 2)], { type: "application/json" }));
  a.download = `KCET_Rank${rank}_Options.json`; a.click();
}

function exportTXT(data, rank, category, branches) {
  const icons = { Dream: "★", Target: "●", Safe: "◆", Backup: "○" };
  const txt = [
    "═══════════════════════════════════════════════════",
    "        KCET SMART OPTION ENTRY PLANNER",
    `        ${new Date().toLocaleString("en-IN")}`,
    "═══════════════════════════════════════════════════",
    `Rank: ${rank}  Category: ${category}  Branches: ${branches.join(", ")}`,
    `Dream:${data.Dream.length}  Target:${data.Target.length}  Safe:${data.Safe.length}  Backup:${data.Backup.length}`,
    "───────────────────────────────────────────────────",
    ...data.allSorted.map((d, i) =>
      `${String(i+1).padStart(3)}. [${d.tier.padEnd(6)}] ${icons[d.tier]} ${d.college}\n` +
      `     ${d.branch} | Cutoff:${d.closingRank.toLocaleString()} | ${d.probability}% chance\n`
    ),
    "═══════════════════════════════════════════════════",
    "Verify at kea.kar.nic.in before final submission.",
  ].join("\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([txt], { type: "text/plain" }));
  a.download = `KCET_Rank${rank}_Options.txt`; a.click();
}

// ── Main Results Component ────────────────────────────────────────────────────
export default function ResultsPage() {
  const router = useRouter();
  const [results, setResults] = useState(null);
  const [activeTab, setActiveTab] = useState("grouped");
  const [activeTier, setActiveTier] = useState("Dream");
  const [mounted, setMounted] = useState(false);

  const { rank, category, branches: bStr } = router.query;
  const branches = bStr ? bStr.split(",") : [];

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!rank || !category || !bStr) return;
    const c = getClassifiedColleges({ rank: parseInt(rank, 10), category, branches });
    const tag = arr => arr.map(d => ({ ...d, rank: parseInt(rank, 10) }));
    setResults({ Dream: tag(c.Dream), Target: tag(c.Target), Safe: tag(c.Safe), Backup: tag(c.Backup), allSorted: tag(c.allSorted), warnings: c.warnings });
  }, [rank, category, bStr]);

  if (!mounted || !results) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-14 h-14 border-[3px] border-indigo-500 border-t-transparent rounded-full animate-spin-slow mx-auto mb-4" />
          <p className="text-slate-400 font-medium">Analysing your options…</p>
        </div>
      </div>
    );
  }

  const total = results.allSorted.length;
  const counts = { Dream: results.Dream.length, Target: results.Target.length, Safe: results.Safe.length, Backup: results.Backup.length };
  const tiers = ["Dream","Target","Safe","Backup"];

  return (
    <>
      <Head>
        <title>KCET Results — Rank #{rank}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-dark-950 relative">
        {/* Background */}
        <div className="orb orb-purple w-96 h-96 top-0 right-0 opacity-30 fixed pointer-events-none" />
        <div className="orb orb-blue w-80 h-80 bottom-0 left-0 opacity-20 fixed pointer-events-none" />
        <div className="absolute inset-0 grid-bg pointer-events-none" />

        {/* ── Header ── */}
        <header className="relative z-10 glass border-b border-white/5 sticky top-0 no-print">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-4">
                <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-all">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                  Back
                </Link>
                <div className="w-px h-5 bg-white/10" />
                <div>
                  <div className="text-white font-bold text-sm sm:text-base">Your KCET Option List</div>
                  <div className="text-slate-500 text-xs">
                    Rank <span className="text-indigo-400 font-bold">#{Number(rank).toLocaleString()}</span>
                    {" · "}{category}{" · "}{branches.join(", ")}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => exportTXT(results, rank, category, branches)}
                  className="flex items-center gap-1.5 glass border border-white/10 hover:border-white/20 text-slate-300 hover:text-white text-xs font-semibold px-3 py-2 rounded-xl transition-all">
                  📄 TXT
                </button>
                <button onClick={() => exportJSON(results, rank, category, branches)}
                  className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-glow-sm">
                  📥 JSON
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">

          {/* Warnings */}
          {results.warnings.length > 0 && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 animate-slide-up">
              {results.warnings.map((w, i) => (
                <p key={i} className="text-amber-300 text-sm font-medium flex items-center gap-2">
                  <span>⚠️</span>{w}
                </p>
              ))}
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 animate-slide-up">
            <StatCard label="Total Colleges" value={total}           sub="in your list"  color="indigo" />
            <StatCard label="Dream"           value={counts.Dream}   sub="≤70% of cutoff" color="green"  />
            <StatCard label="Target"          value={counts.Target}  sub="within range"   color="blue"   />
            <StatCard label="Safe"            value={counts.Safe}    sub="≤120% cutoff"  color="orange" />
            <StatCard label="Backup"          value={counts.Backup}  sub="above cutoff"  color="red"    />
          </div>

          {/* Tabs */}
          <div className="glass rounded-3xl overflow-hidden animate-slide-up delay-100" style={{ animationFillMode: "forwards" }}>
            {/* Tab bar */}
            <div className="flex border-b border-white/5 overflow-x-auto">
              {[
                { key: "grouped", icon: "📚", label: "By Tier"       },
                { key: "smart",   icon: "🧠", label: "Smart List"    },
                { key: "compare", icon: "📈", label: "Trend Chart"   },
              ].map(tab => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 flex items-center justify-center gap-2 py-4 px-3 text-sm font-semibold
                    whitespace-nowrap transition-all border-b-2
                    ${activeTab === tab.key
                      ? "border-indigo-500 text-white bg-indigo-500/10"
                      : "border-transparent text-slate-500 hover:text-slate-300 hover:bg-white/3"}`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            <div className="p-4 sm:p-6">

              {/* ── Grouped ── */}
              {activeTab === "grouped" && (
                <div className="space-y-5">
                  {/* Tier pills */}
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {tiers.map(tier => {
                      const icons   = { Dream: "🌟", Target: "🎯", Safe: "🛡️", Backup: "🔖" };
                      const active  = { Dream: "bg-green-500 text-white border-green-500", Target: "bg-indigo-500 text-white border-indigo-500", Safe: "bg-orange-500 text-white border-orange-500", Backup: "bg-red-500 text-white border-red-500" };
                      const passive = { Dream: "border-green-500/30 text-green-400 hover:border-green-500/60", Target: "border-indigo-500/30 text-indigo-400 hover:border-indigo-500/60", Safe: "border-orange-500/30 text-orange-400 hover:border-orange-500/60", Backup: "border-red-500/30 text-red-400 hover:border-red-500/60" };
                      return (
                        <button key={tier} onClick={() => setActiveTier(tier)}
                          className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold border transition-all
                            ${activeTier === tier ? active[tier] : passive[tier]}`}>
                          {icons[tier]} {tier} ({counts[tier]})
                        </button>
                      );
                    })}
                  </div>

                  {tiers.filter(t => t === activeTier).map(tier => (
                    <div key={tier} className="space-y-3">
                      <TierHeader tier={tier} count={results[tier].length} />
                      {results[tier].length === 0 ? (
                        <div className="text-center py-12 glass-card rounded-2xl">
                          <div className="text-4xl mb-3">🔍</div>
                          <p className="text-slate-400 font-medium">No colleges in this tier for your selection.</p>
                          <p className="text-slate-600 text-sm mt-1">Try adding more branches or checking your rank.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                          {results[tier].map((c, i) => (
                            <CollegeCard key={`${c.college}-${c.branch}`} data={c} index={i+1} showIndex />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* ── Smart List ── */}
              {activeTab === "smart" && (
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h3 className="font-bold text-white text-base">Recommended Entry Order</h3>
                      <p className="text-slate-500 text-xs mt-0.5">Enter colleges in this exact sequence in KEA portal — Dream → Target → Safe → Backup</p>
                    </div>
                    <span className="glass border border-indigo-500/30 text-indigo-300 text-xs font-bold px-3 py-1.5 rounded-full">
                      {total} options
                    </span>
                  </div>
                  <div className="space-y-2">
                    {results.allSorted.map((c, i) => (
                      <CollegeCard key={`${c.college}-${c.branch}-${i}`} data={c} index={i+1} showIndex />
                    ))}
                  </div>
                  {total === 0 && (
                    <div className="text-center py-16">
                      <div className="text-5xl mb-4">😕</div>
                      <p className="text-white font-bold text-lg">No colleges found.</p>
                      <p className="text-slate-500 text-sm mt-1 mb-6">Try adjusting your inputs.</p>
                      <Link href="/" className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl text-sm hover:bg-indigo-500 transition-all">
                        ← Go back
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* ── Comparison ── */}
              {activeTab === "compare" && (
                <div>
                  <h3 className="font-bold text-white text-base mb-1">Cutoff Trend Comparison</h3>
                  <p className="text-slate-500 text-xs mb-5">Top 5 Dream + Target colleges vs your rank across 3 years</p>
                  <ComparisonChart colleges={[...results.Dream, ...results.Target].slice(0, 5)} userRank={parseInt(rank, 10)} />
                  {results.Dream.length + results.Target.length === 0 && (
                    <div className="text-center py-8 text-slate-500 text-sm">
                      No Dream or Target colleges to compare. Widen your branch selection.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Future scope */}
          {branches.length > 0 && (
            <div className="animate-slide-up delay-200" style={{ animationFillMode: "forwards" }}>
              <FutureScopePanel branches={branches} />
            </div>
          )}

          {/* Disclaimer */}
          <div className="glass rounded-2xl p-4 border border-white/5">
            <p className="text-xs text-slate-600 leading-relaxed">
              <span className="text-amber-500 font-semibold">⚠️ Disclaimer: </span>
              This tool uses simulated historical data for demonstration purposes. Always verify actual cutoff ranks with the official KEA website (kea.kar.nic.in) before finalising your option entry list.
            </p>
          </div>
        </main>
      </div>
    </>
  );
}
