import Head from "next/head";
import Form from "../components/Form";

// ─── Feature Badge ────────────────────────────────────────────────────────────
function FeatureBadge({ emoji, text }) {
  return (
    <div className="flex items-center gap-2 text-sm text-indigo-100">
      <span>{emoji}</span>
      <span>{text}</span>
    </div>
  );
}

// ─── Tier Info Card ───────────────────────────────────────────────────────────
function TierInfoCard({ emoji, label, desc, color }) {
  const colors = {
    green: "bg-green-50 border-green-200 text-green-800",
    blue: "bg-blue-50 border-blue-200 text-blue-800",
    orange: "bg-orange-50 border-orange-200 text-orange-800",
    red: "bg-red-50 border-red-200 text-red-800",
  };
  return (
    <div className={`flex items-start gap-3 p-3 rounded-xl border ${colors[color]}`}>
      <span className="text-xl">{emoji}</span>
      <div>
        <p className="font-bold text-sm">{label}</p>
        <p className="text-xs opacity-80 mt-0.5">{desc}</p>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Home() {
  return (
    <>
      <Head>
        <title>KCET Smart Option Entry Planner</title>
        <meta name="description" content="Intelligently build your KCET counseling option entry list based on your rank, category, and preferred branches." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🎓</text></svg>" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50">
        {/* Hero Banner */}
        <div className="hero-gradient text-white">
          <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5 text-sm font-medium mb-4">
                <span>🎓</span>
                <span>Karnataka CET Counseling 2025</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-extrabold leading-tight mb-4">
                KCET Smart Option
                <br />Entry Planner
              </h1>
              <p className="text-lg text-indigo-100 mb-6">
                Build your perfect college preference list. Enter your rank once — get Dream, Target, Safe, and Backup colleges in seconds.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <FeatureBadge emoji="✅" text="Based on 2023–2025 cutoff data" />
                <FeatureBadge emoji="📊" text="Visual cutoff trend charts" />
                <FeatureBadge emoji="🤖" text="Automatic tier classification" />
                <FeatureBadge emoji="📥" text="Export your list as JSON/TXT" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

            {/* Left: Form */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8">
                <h2 className="text-xl font-bold text-slate-800 mb-1">Enter Your Details</h2>
                <p className="text-sm text-slate-500 mb-6">
                  Fill in your KCET rank, category, and preferred branches to get your personalized college list.
                </p>
                <Form />
              </div>
            </div>

            {/* Right: Info Panel */}
            <div className="lg:col-span-2 space-y-6">
              {/* How it works */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <span>💡</span> How the Tiers Work
                </h3>
                <div className="space-y-2">
                  <TierInfoCard emoji="🌟" label="Dream" desc="Your rank is ≤70% of the cutoff — very high chance" color="green" />
                  <TierInfoCard emoji="🎯" label="Target" desc="Your rank is within the closing rank — expected zone" color="blue" />
                  <TierInfoCard emoji="🛡️" label="Safe" desc="Rank is ≤120% of cutoff — needs some luck" color="orange" />
                  <TierInfoCard emoji="🔖" label="Backup" desc="Rank exceeds cutoff — keep as last resort" color="red" />
                </div>
              </div>

              {/* Tips */}
              <div className="bg-indigo-50 rounded-2xl border border-indigo-100 p-5">
                <h3 className="font-bold text-indigo-800 mb-3 flex items-center gap-2">
                  <span>📌</span> Pro Tips
                </h3>
                <ul className="space-y-2 text-sm text-indigo-700">
                  <li className="flex gap-2">
                    <span className="text-indigo-400 mt-0.5">▸</span>
                    Always enter at least 20+ options in the official portal.
                  </li>
                  <li className="flex gap-2">
                    <span className="text-indigo-400 mt-0.5">▸</span>
                    Never skip Safe/Backup colleges — cutoffs fluctuate each year.
                  </li>
                  <li className="flex gap-2">
                    <span className="text-indigo-400 mt-0.5">▸</span>
                    Check the trend: if cutoffs have been rising, be conservative.
                  </li>
                  <li className="flex gap-2">
                    <span className="text-indigo-400 mt-0.5">▸</span>
                    Select all three branches to maximize your options.
                  </li>
                </ul>
              </div>

              {/* Disclaimer */}
              <div className="bg-amber-50 rounded-2xl border border-amber-200 p-4">
                <p className="text-xs text-amber-700 leading-relaxed">
                  <strong>⚠️ Disclaimer:</strong> This tool uses simulated historical data for demonstration purposes. Always verify actual cutoff ranks with the official KEA (Karnataka Examinations Authority) website before finalizing your option entry.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
