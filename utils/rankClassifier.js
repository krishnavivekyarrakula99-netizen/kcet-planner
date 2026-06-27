import { cutoffData } from "./data";

// ─── Classification thresholds ────────────────────────────────────────────────
// rank <= 70%  of cutoff  → Dream   (you're comfortably in)
// rank <= 100% of cutoff  → Target  (you're right in range)
// rank <= 120% of cutoff  → Safe    (slight buffer below cutoff)
// rank >  120% of cutoff  → Backup  (rank exceeds cutoff, needs luck)
//
// NOTE: Lower rank number = better performance in KCET (rank 1 is the topper).
// So "rank <= cutoff" means the student has a BETTER rank than the cutoff.

export const TIER_CONFIG = {
  Dream: {
    label: "Dream",
    description: "Your rank is well within the cutoff — high admission probability.",
    color: "green",
    bgClass: "bg-dream-50 border-dream-500",
    badgeClass: "bg-dream-500 text-white",
    textClass: "text-dream-700",
    borderClass: "border-dream-500",
    iconEmoji: "🌟",
    probabilityThreshold: 0.7, // rank / cutoff <= 0.70
  },
  Target: {
    label: "Target",
    description: "Your rank is within the expected range — good chance of admission.",
    color: "blue",
    bgClass: "bg-target-50 border-target-500",
    badgeClass: "bg-target-500 text-white",
    textClass: "text-target-700",
    borderClass: "border-target-500",
    iconEmoji: "🎯",
    probabilityThreshold: 1.0, // rank / cutoff <= 1.00
  },
  Safe: {
    label: "Safe",
    description: "Your rank slightly exceeds the cutoff — possible with luck or lower competition.",
    color: "orange",
    bgClass: "bg-safe-50 border-safe-500",
    badgeClass: "bg-safe-500 text-white",
    textClass: "text-safe-700",
    borderClass: "border-safe-500",
    iconEmoji: "🛡️",
    probabilityThreshold: 1.2, // rank / cutoff <= 1.20
  },
  Backup: {
    label: "Backup",
    description: "Your rank significantly exceeds the cutoff — keep as last resort.",
    color: "red",
    bgClass: "bg-backup-50 border-backup-500",
    badgeClass: "bg-backup-500 text-white",
    textClass: "text-backup-700",
    borderClass: "border-backup-500",
    iconEmoji: "🔖",
    probabilityThreshold: Infinity,
  },
};

/**
 * Classifies a single cutoff record against a student's rank.
 * @param {number} userRank  - Student's KCET rank
 * @param {number} cutoffRank - College's closing rank for that branch+category
 * @returns {"Dream"|"Target"|"Safe"|"Backup"}
 */
export function classifyTier(userRank, cutoffRank) {
  const ratio = userRank / cutoffRank;
  if (ratio <= 0.7) return "Dream";
  if (ratio <= 1.0) return "Target";
  if (ratio <= 1.2) return "Safe";
  return "Backup";
}

/**
 * Calculates admission probability as a percentage.
 * @param {number} userRank
 * @param {number} cutoffRank
 * @returns {number} 0–100
 */
export function calcProbability(userRank, cutoffRank) {
  if (userRank <= 0 || cutoffRank <= 0) return 0;
  // Better rank (lower number) → higher probability
  const raw = cutoffRank / userRank; // > 1 means rank is better than cutoff
  const clamped = Math.min(raw, 2); // cap at 200%
  return Math.round((clamped / 2) * 100);
}

/**
 * Main filtering and classification function.
 *
 * @param {object} input
 * @param {number}   input.rank       - Student's KCET rank
 * @param {string}   input.category   - e.g. "GM", "OBC"
 * @param {string[]} input.branches   - e.g. ["CSE", "ECE"]
 * @returns {{
 *   Dream: object[],
 *   Target: object[],
 *   Safe: object[],
 *   Backup: object[],
 *   allSorted: object[],
 *   warnings: string[]
 * }}
 */
export function getClassifiedColleges({ rank, category, branches }) {
  // ── 1. Filter latest year records matching category + selected branches ──
  const latestYear = Math.max(...cutoffData.map((d) => d.year));

  const filtered = cutoffData.filter(
    (d) =>
      d.year === latestYear &&
      d.category === category &&
      branches.includes(d.branch)
  );

  // ── 2. Classify each record ───────────────────────────────────────────────
  const enriched = filtered.map((d) => ({
    ...d,
    tier: classifyTier(rank, d.closingRank),
    probability: calcProbability(rank, d.closingRank),
    // Historical data for the chart (all years for this college+branch+category)
    history: cutoffData
      .filter(
        (h) =>
          h.college === d.college &&
          h.branch === d.branch &&
          h.category === d.category
      )
      .sort((a, b) => a.year - b.year),
  }));

  // ── 3. Group into tiers ───────────────────────────────────────────────────
  const grouped = {
    Dream:  enriched.filter((d) => d.tier === "Dream").sort((a, b) => a.closingRank - b.closingRank),
    Target: enriched.filter((d) => d.tier === "Target").sort((a, b) => a.closingRank - b.closingRank),
    Safe:   enriched.filter((d) => d.tier === "Safe").sort((a, b) => a.closingRank - b.closingRank),
    Backup: enriched.filter((d) => d.tier === "Backup").sort((a, b) => a.closingRank - b.closingRank),
  };

  // ── 4. Build the final smart option list (Dream → Target → Safe → Backup) ─
  const allSorted = [
    ...grouped.Dream,
    ...grouped.Target,
    ...grouped.Safe,
    ...grouped.Backup,
  ];

  // ── 5. Mistake detection ──────────────────────────────────────────────────
  const warnings = [];
  let seenTarget = false;
  let safeBeforeTargetFound = false;

  for (const entry of allSorted) {
    if (entry.tier === "Target") seenTarget = true;
    if ((entry.tier === "Safe" || entry.tier === "Backup") && !seenTarget) {
      safeBeforeTargetFound = true;
    }
  }
  if (safeBeforeTargetFound) {
    warnings.push("⚠️ No Target colleges found for your rank. Consider widening your branch selection.");
  }
  if (grouped.Dream.length === 0 && grouped.Target.length === 0) {
    warnings.push("⚠️ No Dream or Target colleges found. Your rank may be high for the selected branches and category.");
  }
  if (grouped.Backup.length === allSorted.length) {
    warnings.push("⚠️ All colleges are in Backup tier. Consider selecting a different category or additional branches.");
  }
  if (allSorted.length === 0) {
    warnings.push("⚠️ No colleges found for the selected criteria. Try selecting a different category or branches.");
  }

  return { ...grouped, allSorted, warnings };
}

/**
 * Gets historical cutoff trend data for a specific college+branch+category.
 */
export function getCutoffTrend(college, branch, category) {
  return cutoffData
    .filter(
      (d) =>
        d.college === college &&
        d.branch === branch &&
        d.category === category
    )
    .sort((a, b) => a.year - b.year);
}
