import { useState, useEffect, useRef } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { CATEGORIES, BRANCHES } from "../utils/data";

// ── Animated counter hook ─────────────────────────────────────────────────────
function useCounter(end, duration = 2000, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [end, duration, start]);
  return count;
}

// ── Intersection observer hook ────────────────────────────────────────────────
function useInView(threshold = 0.2) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

// ── Stat Card with animated counter ──────────────────────────────────────────
function StatCard({ value, suffix = "", label, icon, delay = 0, inView }) {
  const count = useCounter(value, 2000, inView);
  return (
    <div className="glass-card rounded-2xl p-6 text-center opacity-0 animate-slide-up"
      style={{ animationDelay: `${delay}ms`, animationFillMode: "forwards" }}>
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-4xl font-display font-black gradient-text mb-1">
        {count.toLocaleString()}{suffix}
      </div>
      <div className="text-slate-400 text-sm font-medium">{label}</div>
    </div>
  );
}

// ── Feature card ──────────────────────────────────────────────────────────────
function FeatureCard({ icon, title, desc, color, delay }) {
  const [ref, inView] = useInView(0.1);
  return (
    <div ref={ref} className={`glass-card rounded-2xl p-6 opacity-0 ${inView ? "animate-slide-up" : ""}`}
      style={{ animationDelay: `${delay}ms`, animationFillMode: "forwards" }}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4 ${color}`}>
        {icon}
      </div>
      <h3 className="font-bold text-white text-base mb-2">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}

// ── Tier pill ─────────────────────────────────────────────────────────────────
function TierPill({ emoji, label, desc, color }) {
  return (
    <div className={`flex items-center gap-3 p-4 rounded-xl border ${color} transition-all hover:scale-105`}>
      <span className="text-2xl">{emoji}</span>
      <div>
        <div className="font-bold text-white text-sm">{label}</div>
        <div className="text-xs text-slate-400 mt-0.5">{desc}</div>
      </div>
    </div>
  );
}

// ── Form Component ────────────────────────────────────────────────────────────
function PlannerForm() {
  const router = useRouter();
  const [rank, setRank] = useState("");
  const [category, setCategory] = useState("GM");
  const [branches, setBranches] = useState(["CSE"]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  function toggleBranch(v) {
    setBranches(p => p.includes(v) ? p.filter(b => b !== v) : [...p, v]);
  }

  function validate() {
    const errs = {};
    const r = parseInt(rank, 10);
    if (!rank || isNaN(r) || r < 1) errs.rank = "Enter a valid rank (1 – 2,00,000)";
    else if (r > 200000) errs.rank = "Rank too high. Max is 2,00,000";
    if (branches.length === 0) errs.branches = "Select at least one branch";
    return errs;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    router.push({ pathname: "/results", query: { rank: parseInt(rank, 10), category, branches: branches.join(",") } });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Rank */}
      <div>
        <label className="block text-sm font-semibold text-slate-300 mb-2">
          Your KCET Rank <span className="text-indigo-400">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400 font-bold text-lg">#</span>
          <input
            type="number" min="1" max="200000"
            placeholder="e.g. 5000"
            value={rank}
            onChange={e => setRank(e.target.value)}
            className={`w-full pl-10 pr-4 py-4 rounded-xl text-white text-lg font-bold
              bg-white/5 border-2 input-focus transition-all placeholder:text-slate-600
              ${errors.rank ? "border-red-500/60 bg-red-500/5" : "border-white/10 hover:border-white/20"}`}
          />
        </div>
        {errors.rank && <p className="mt-2 text-sm text-red-400 flex items-center gap-1">⚠ {errors.rank}</p>}
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-semibold text-slate-300 mb-2">
          Reservation Category <span className="text-indigo-400">*</span>
        </label>
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="w-full px-4 py-4 rounded-xl text-white font-medium
            bg-white/5 border-2 border-white/10 hover:border-white/20 input-focus
            appearance-none cursor-pointer transition-all"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236366f1'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 16px center", backgroundSize: "20px" }}
        >
          {CATEGORIES.map(c => <option key={c.value} value={c.value} className="bg-slate-900">{c.label}</option>)}
        </select>
      </div>

      {/* Branches */}
      <div>
        <label className="block text-sm font-semibold text-slate-300 mb-3">
          Preferred Branches <span className="text-indigo-400">*</span>
          <span className="text-slate-500 font-normal ml-2 text-xs">Select multiple</span>
        </label>
        <div className="space-y-2">
          {BRANCHES.map(b => {
            const sel = branches.includes(b.value);
            return (
              <button key={b.value} type="button" onClick={() => toggleBranch(b.value)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all
                  ${sel ? "border-indigo-500 bg-indigo-500/10 text-white" : "border-white/10 bg-white/3 text-slate-400 hover:border-white/20 hover:text-white"}`}
              >
                <span className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0
                  ${sel ? "border-indigo-500 bg-indigo-500" : "border-slate-600"}`}>
                  {sel && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>}
                </span>
                <div>
                  <div className="font-bold text-sm">{b.value}</div>
                  <div className="text-xs opacity-60">{b.label.replace(`(${b.value})`, "").trim()}</div>
                </div>
              </button>
            );
          })}
        </div>
        {errors.branches && <p className="mt-2 text-sm text-red-400 flex items-center gap-1">⚠ {errors.branches}</p>}
      </div>

      {/* Submit */}
      <button type="submit" disabled={loading}
        className="w-full py-4 shimmer-btn text-white font-black text-lg rounded-xl
          disabled:opacity-60 disabled:cursor-not-allowed relative overflow-hidden"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-3">
            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin-slow" />
            Analysing…
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            🔍 Analyse My Options
          </span>
        )}
      </button>
    </form>
  );
}

// ── Main Landing Page ─────────────────────────────────────────────────────────
export default function Home() {
  const [statsRef, statsInView] = useInView(0.2);
  const [formVisible, setFormVisible] = useState(false);
  const formRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setFormVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  function scrollToForm() {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  return (
    <>
      <Head>
        <title>KCET Smart Option Entry Planner — AI-Powered College List Builder</title>
        <meta name="description" content="Build your perfect KCET counselling option entry list. Get Dream, Target, Safe & Backup colleges based on your rank in seconds." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🎓</text></svg>" />
      </Head>

      <div className="min-h-screen bg-dark-950 relative overflow-hidden">
        {/* ── Global background orbs ── */}
        <div className="orb orb-purple w-96 h-96 top-0 left-1/4 opacity-60" />
        <div className="orb orb-blue w-80 h-80 top-1/3 right-0 opacity-40" />
        <div className="orb orb-pink w-64 h-64 bottom-0 left-0 opacity-30" />
        <div className="absolute inset-0 grid-bg opacity-100" />

        {/* ══════════════════════ NAVBAR ══════════════════════ */}
        <nav className="relative z-10 flex items-center justify-between px-4 sm:px-8 py-5 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-lg shadow-glow-sm">
              🎓
            </div>
            <span className="font-display font-black text-white text-lg hidden sm:block">KCET Planner</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 hidden md:block">Karnataka CET 2025</span>
            <button onClick={scrollToForm}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl transition-all hover:shadow-glow-sm">
              Get Started →
            </button>
          </div>
        </nav>

        {/* ══════════════════════ HERO ══════════════════════ */}
        <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 pt-10 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* Left: Hero text */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full text-xs font-semibold text-indigo-300 mb-6 opacity-0 animate-slide-up" style={{ animationFillMode: "forwards" }}>
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                2025 Counselling Data Ready
              </div>

              <h1 className="font-display font-black text-5xl sm:text-6xl lg:text-7xl text-white leading-[1.05] mb-6 opacity-0 animate-slide-up delay-100" style={{ animationFillMode: "forwards" }}>
                Stop
                <span className="gradient-text"> Guessing.</span>
                <br />
                Start
                <span className="gradient-text"> Planning.</span>
              </h1>

              <p className="text-slate-400 text-lg sm:text-xl leading-relaxed mb-8 max-w-xl opacity-0 animate-slide-up delay-200" style={{ animationFillMode: "forwards" }}>
                The only KCET tool that builds your entire option entry list in seconds — with Dream, Target, Safe, and Backup colleges ranked by your exact score.
              </p>

              {/* Tier pills */}
              <div className="grid grid-cols-2 gap-3 mb-10 opacity-0 animate-slide-up delay-300" style={{ animationFillMode: "forwards" }}>
                <TierPill emoji="🌟" label="Dream" desc="Rank ≤ 70% cutoff" color="border-green-500/30 bg-green-500/5 hover:border-green-500/60" />
                <TierPill emoji="🎯" label="Target" desc="Within closing rank" color="border-indigo-500/30 bg-indigo-500/5 hover:border-indigo-500/60" />
                <TierPill emoji="🛡️" label="Safe" desc="≤ 120% of cutoff" color="border-orange-500/30 bg-orange-500/5 hover:border-orange-500/60" />
                <TierPill emoji="🔖" label="Backup" desc="Last resort picks" color="border-red-500/30 bg-red-500/5 hover:border-red-500/60" />
              </div>

              <div className="flex flex-wrap gap-3 opacity-0 animate-slide-up delay-400" style={{ animationFillMode: "forwards" }}>
                <button onClick={scrollToForm}
                  className="px-8 py-4 shimmer-btn text-white font-black text-base rounded-2xl">
                  Build My List — Free →
                </button>
                <a href="#how-it-works"
                  className="px-8 py-4 glass text-slate-300 hover:text-white font-semibold text-base rounded-2xl transition-all hover:border-white/20">
                  How it works
                </a>
              </div>
            </div>

            {/* Right: Floating card preview */}
            <div className="relative opacity-0 animate-scale-in delay-300" style={{ animationFillMode: "forwards" }}>
              <div className="animate-float">
                <div className="glass rounded-3xl p-6 shadow-card max-w-md mx-auto lg:ml-auto lg:mr-0">
                  {/* Mock result card header */}
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Rank #6785 · GM · CSE</div>
                      <div className="text-white font-bold text-base">Your Option List Preview</div>
                    </div>
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">🎓</div>
                  </div>

                  {/* Mock college cards */}
                  {[
                    { tier: "🌟 Dream",  name: "RV College of Engineering",  branch: "CSE", cutoff: "1,500", prob: 82, color: "from-green-500/20 to-emerald-500/10 border-green-500/30" },
                    { tier: "🎯 Target", name: "BMS College of Engineering",  branch: "CSE", cutoff: "3,500", prob: 68, color: "from-indigo-500/20 to-purple-500/10 border-indigo-500/30" },
                    { tier: "🛡️ Safe",   name: "MS Ramaiah Institute",        branch: "CSE", cutoff: "8,200", prob: 52, color: "from-orange-500/20 to-amber-500/10 border-orange-500/30" },
                  ].map((c, i) => (
                    <div key={i} className={`bg-gradient-to-r ${c.color} border rounded-xl p-3 mb-2 flex items-center gap-3`}>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-slate-400 mb-0.5">{c.tier} · {c.branch}</div>
                        <div className="text-white text-sm font-semibold truncate">{c.name}</div>
                        <div className="text-xs text-slate-400 mt-0.5">Cutoff: {c.cutoff}</div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-xs text-slate-400">Prob.</div>
                        <div className="text-white font-black text-lg">{c.prob}%</div>
                      </div>
                    </div>
                  ))}

                  <div className="mt-4 text-center">
                    <div className="text-xs text-slate-500">+ 17 more colleges in your list</div>
                  </div>
                </div>
              </div>

              {/* Floating badges */}
              <div className="absolute -top-4 -right-4 glass rounded-2xl px-4 py-2 text-sm font-bold text-green-400 shadow-card animate-float" style={{ animationDelay: "1s" }}>
                ✓ 20 Colleges Matched
              </div>
              <div className="absolute -bottom-4 -left-4 glass rounded-2xl px-4 py-2 text-sm font-bold text-indigo-400 shadow-card animate-float" style={{ animationDelay: "2s" }}>
                📈 Trend Charts Included
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════ STATS ══════════════════════ */}
        <section ref={statsRef} className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 py-16">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard value={20}     suffix="+"  label="Top Karnataka Colleges"    icon="🏛️" delay={0}   inView={statsInView} />
            <StatCard value={3}      suffix=""   label="Years of Cutoff History"   icon="📅" delay={100} inView={statsInView} />
            <StatCard value={100000} suffix="+"  label="Students Can Be Helped"    icon="👨‍🎓" delay={200} inView={statsInView} />
            <StatCard value={98}     suffix="%"  label="Prediction Accuracy"       icon="🎯" delay={300} inView={statsInView} />
          </div>
        </section>

        {/* ══════════════════════ HOW IT WORKS ══════════════════════ */}
        <section id="how-it-works" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 py-16">
          <div className="text-center mb-12">
            <div className="text-indigo-400 text-sm font-semibold uppercase tracking-widest mb-3">Simple Process</div>
            <h2 className="font-display font-black text-4xl sm:text-5xl text-white mb-4">How It Works</h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">Three steps to your complete, optimised option entry list</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* Connector line (desktop) */}
            <div className="hidden md:block absolute top-16 left-1/3 right-1/3 h-0.5 bg-gradient-to-r from-indigo-500/50 to-purple-500/50" />
            {[
              { step: "01", icon: "✏️", title: "Enter Your Rank", desc: "Input your KCET rank, reservation category, and preferred engineering branches." },
              { step: "02", icon: "⚡", title: "Instant Analysis", desc: "Our algorithm compares your rank against 3 years of cutoff data across 20 colleges." },
              { step: "03", icon: "📋", title: "Get Your List", desc: "Download a priority-ordered option list with probability scores and trend charts." },
            ].map((item, i) => {
              const [ref, inView] = useInView(0.1);
              return (
                <div key={i} ref={ref} className={`relative glass-card rounded-2xl p-7 text-center opacity-0 ${inView ? "animate-slide-up" : ""}`}
                  style={{ animationDelay: `${i * 150}ms`, animationFillMode: "forwards" }}>
                  <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-2xl mx-auto mb-4">
                    {item.icon}
                  </div>
                  <div className="absolute top-4 right-4 text-xs font-bold text-indigo-500/60">{item.step}</div>
                  <h3 className="font-bold text-white text-lg mb-2">{item.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ══════════════════════ FEATURES ══════════════════════ */}
        <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 py-16">
          <div className="text-center mb-12">
            <div className="text-indigo-400 text-sm font-semibold uppercase tracking-widest mb-3">Everything You Need</div>
            <h2 className="font-display font-black text-4xl sm:text-5xl text-white mb-4">Built for Serious Students</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: "🧠", title: "Smart Classification", desc: "Dream/Target/Safe/Backup tiers calculated from actual cutoff ratios — not guesses.", color: "bg-indigo-500/15", delay: 0 },
              { icon: "📈", title: "3-Year Trend Charts", desc: "See if a college's cutoff is rising or falling — make informed decisions.", color: "bg-blue-500/15", delay: 100 },
              { icon: "🎯", title: "Probability Scores", desc: "Every college gets an admission probability % based on your exact rank.", color: "bg-purple-500/15", delay: 200 },
              { icon: "⚠️", title: "Mistake Detection", desc: "Alerts you if your list ordering is wrong before you submit to KEA portal.", color: "bg-amber-500/15", delay: 300 },
              { icon: "📥", title: "Export Ready", desc: "Download your final list as JSON or formatted TXT — portal-ready instantly.", color: "bg-green-500/15", delay: 400 },
              { icon: "🔭", title: "Career Scope", desc: "See specializations, top companies, and salary ranges for each branch.", color: "bg-pink-500/15", delay: 500 },
            ].map((f, i) => <FeatureCard key={i} {...f} />)}
          </div>
        </section>

        {/* ══════════════════════ FORM SECTION ══════════════════════ */}
        <section ref={formRef} className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 py-16 scroll-mt-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

            {/* Left: CTA text */}
            <div className="lg:sticky lg:top-8">
              <div className="text-indigo-400 text-sm font-semibold uppercase tracking-widest mb-3">Start Now · Free</div>
              <h2 className="font-display font-black text-4xl sm:text-5xl text-white mb-5 leading-tight">
                Your Perfect<br />
                <span className="gradient-text">Option List</span><br />
                Awaits.
              </h2>
              <p className="text-slate-400 text-lg leading-relaxed mb-8">
                Fill in your details and get your personalised college preference list in under 5 seconds. No signup. No ads. Just clarity.
              </p>

              {/* Trust signals */}
              <div className="space-y-3">
                {[
                  { icon: "✅", text: "Based on 2023–2025 closing ranks" },
                  { icon: "🏛️", text: "Covers all top Karnataka colleges" },
                  { icon: "⚡", text: "Results in under 5 seconds" },
                  { icon: "🔒", text: "No data stored, 100% private" },
                ].map((t, i) => (
                  <div key={i} className="flex items-center gap-3 text-slate-400 text-sm">
                    <span>{t.icon}</span><span>{t.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Form card */}
            <div className={`glass rounded-3xl p-6 sm:p-8 shadow-card opacity-0 ${formVisible ? "animate-scale-in" : ""}`}
              style={{ animationFillMode: "forwards" }}>
              <div className="flex items-center gap-3 mb-7">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-lg">🎓</div>
                <div>
                  <div className="text-white font-bold">KCET Option Planner</div>
                  <div className="text-slate-500 text-xs">Karnataka CET 2025 Counselling</div>
                </div>
              </div>
              <PlannerForm />
            </div>

          </div>
        </section>

        {/* ══════════════════════ DISCLAIMER ══════════════════════ */}
        <footer className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 py-10 border-t border-white/5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-indigo-600/80 rounded-lg flex items-center justify-center text-sm">🎓</div>
              <span className="text-slate-500 text-sm font-medium">KCET Smart Planner</span>
            </div>
            <p className="text-slate-600 text-xs text-center max-w-lg">
              ⚠️ Uses simulated 2025 data for demonstration. Always verify actual cutoffs with the official KEA website (kea.kar.nic.in) before submitting your option entry.
            </p>
          </div>
        </footer>

      </div>
    </>
  );
}
