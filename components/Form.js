import { useState } from "react";
import { useRouter } from "next/router";
import { CATEGORIES, BRANCHES } from "../utils/data";

export default function Form() {
  const router = useRouter();
  const [rank, setRank] = useState("");
  const [category, setCategory] = useState("GM");
  const [branches, setBranches] = useState(["CSE"]);
  const [errors, setErrors] = useState({});

  // Toggle a branch on/off in the multiselect
  function toggleBranch(value) {
    setBranches((prev) =>
      prev.includes(value) ? prev.filter((b) => b !== value) : [...prev, value]
    );
  }

  function validate() {
    const errs = {};
    const r = parseInt(rank, 10);
    if (!rank || isNaN(r) || r < 1) {
      errs.rank = "Please enter a valid rank (minimum 1).";
    } else if (r > 200000) {
      errs.rank = "Rank seems too high. Max supported is 2,00,000.";
    }
    if (branches.length === 0) {
      errs.branches = "Please select at least one branch.";
    }
    return errs;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    router.push({
      pathname: "/results",
      query: {
        rank: parseInt(rank, 10),
        category,
        branches: branches.join(","),
      },
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Rank Input */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Your KCET Rank
          <span className="text-red-500 ml-1">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">
            #
          </span>
          <input
            type="number"
            min="1"
            max="200000"
            placeholder="e.g. 5000"
            value={rank}
            onChange={(e) => setRank(e.target.value)}
            className={`w-full pl-8 pr-4 py-3 rounded-xl border-2 text-lg font-semibold
              focus:outline-none focus:ring-4 focus:ring-indigo-100 transition-all
              ${errors.rank
                ? "border-red-400 bg-red-50"
                : "border-slate-200 bg-white focus:border-indigo-400"
              }`}
          />
        </div>
        {errors.rank && (
          <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
            <span>⚠</span> {errors.rank}
          </p>
        )}
        <p className="mt-1 text-xs text-slate-500">
          Enter your CET rank from your rank card. Range: 1 – 2,00,000
        </p>
      </div>

      {/* Category Dropdown */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Reservation Category
          <span className="text-red-500 ml-1">*</span>
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white text-slate-700
            focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 transition-all"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-slate-500">
          Select the category as mentioned in your CET application.
        </p>
      </div>

      {/* Branch Multiselect */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-3">
          Preferred Branches
          <span className="text-red-500 ml-1">*</span>
          <span className="text-xs font-normal text-slate-500 ml-2">(Select one or more)</span>
        </label>
        <div className="grid grid-cols-1 gap-3">
          {BRANCHES.map((branch) => {
            const selected = branches.includes(branch.value);
            return (
              <button
                key={branch.value}
                type="button"
                onClick={() => toggleBranch(branch.value)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all
                  ${selected
                    ? "border-indigo-500 bg-indigo-50 text-indigo-800"
                    : "border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:bg-indigo-50/50"
                  }`}
              >
                <span className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0
                  ${selected ? "border-indigo-500 bg-indigo-500" : "border-slate-300"}`}>
                  {selected && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </span>
                <div>
                  <div className="font-semibold text-sm">{branch.value}</div>
                  <div className="text-xs text-slate-500">{branch.label.replace(`(${branch.value})`, "").trim()}</div>
                </div>
              </button>
            );
          })}
        </div>
        {errors.branches && (
          <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
            <span>⚠</span> {errors.branches}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold
          text-lg rounded-xl shadow-lg hover:shadow-xl hover:from-indigo-700 hover:to-purple-700
          transform hover:-translate-y-0.5 transition-all focus:outline-none focus:ring-4 focus:ring-indigo-300"
      >
        🔍 Analyze My Options
      </button>
    </form>
  );
}
