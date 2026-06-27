import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Legend,
} from "recharts";

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label, userRank }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-3 text-xs">
      <p className="font-bold text-slate-700 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }} className="font-medium">
          {p.name}: <span className="font-bold">{p.value?.toLocaleString()}</span>
        </p>
      ))}
      {userRank && (
        <p className="text-indigo-600 font-semibold mt-1 border-t border-slate-100 pt-1">
          Your Rank: {Number(userRank).toLocaleString()}
        </p>
      )}
    </div>
  );
}

// ─── Stroke colors per tier ───────────────────────────────────────────────────
const tierColors = {
  Dream: "#16a34a",
  Target: "#2563eb",
  Safe: "#ea580c",
  Backup: "#dc2626",
};

// ─── Main Chart Component ─────────────────────────────────────────────────────
export default function CutoffChart({ data, tier, userRank }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-32 flex items-center justify-center text-xs text-slate-400">
        No historical data available for this combination.
      </div>
    );
  }

  const color = tierColors[tier] || "#6366f1";

  // Determine Y-axis domain with some padding
  const ranks = data.map((d) => d.closingRank);
  if (userRank) ranks.push(Number(userRank));
  const minRank = Math.min(...ranks);
  const maxRank = Math.max(...ranks);
  const padding = Math.round((maxRank - minRank) * 0.15) || 500;
  const yMin = Math.max(1, minRank - padding);
  const yMax = maxRank + padding;

  return (
    <div style={{ width: "100%", height: 180 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="year"
            tick={{ fontSize: 11, fill: "#64748b" }}
            tickLine={false}
            axisLine={{ stroke: "#e2e8f0" }}
          />
          <YAxis
            domain={[yMin, yMax]}
            tick={{ fontSize: 10, fill: "#64748b" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v}
            width={36}
          />
          <Tooltip content={<CustomTooltip userRank={userRank} />} />
          <Legend
            wrapperStyle={{ fontSize: 11 }}
            formatter={(value) => <span style={{ color: "#475569", fontSize: 11 }}>{value}</span>}
          />

          {/* Cutoff trend line */}
          <Line
            type="monotone"
            dataKey="closingRank"
            name="Closing Rank"
            stroke={color}
            strokeWidth={2.5}
            dot={{ fill: color, strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, strokeWidth: 2 }}
          />

          {/* User's rank reference line */}
          {userRank && (
            <ReferenceLine
              y={Number(userRank)}
              stroke="#6366f1"
              strokeDasharray="5 3"
              strokeWidth={1.5}
              label={{
                value: "Your Rank",
                position: "insideTopRight",
                fontSize: 10,
                fill: "#6366f1",
                fontWeight: 600,
              }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Multi-College Comparison Chart ──────────────────────────────────────────
export function ComparisonChart({ colleges, userRank }) {
  if (!colleges || colleges.length === 0) return null;

  // Build data keyed by year
  const yearSet = new Set();
  colleges.forEach((c) => c.history?.forEach((h) => yearSet.add(h.year)));
  const years = [...yearSet].sort();

  const chartData = years.map((year) => {
    const row = { year };
    colleges.slice(0, 5).forEach((c) => {
      const match = c.history?.find((h) => h.year === year);
      if (match) {
        row[`${c.college.split(" ").slice(0, 2).join(" ")} (${c.branch})`] = match.closingRank;
      }
    });
    return row;
  });

  const colors = ["#6366f1", "#22c55e", "#f97316", "#3b82f6", "#ec4899"];
  const keys = Object.keys(chartData[0] || {}).filter((k) => k !== "year");

  return (
    <div style={{ width: "100%", height: 240 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="year" tick={{ fontSize: 11, fill: "#64748b" }} tickLine={false} />
          <YAxis
            tick={{ fontSize: 10, fill: "#64748b" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v}
            width={36}
          />
          <Tooltip content={<CustomTooltip userRank={userRank} />} />
          <Legend wrapperStyle={{ fontSize: 10 }} />
          {keys.map((key, i) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={colors[i % colors.length]}
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          ))}
          {userRank && (
            <ReferenceLine
              y={Number(userRank)}
              stroke="#6366f1"
              strokeDasharray="5 3"
              strokeWidth={1.5}
              label={{ value: "Your Rank", position: "insideTopRight", fontSize: 10, fill: "#6366f1" }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
