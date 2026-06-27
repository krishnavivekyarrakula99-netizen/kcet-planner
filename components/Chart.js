import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ReferenceLine, Legend,
} from "recharts";

const TIER_COLORS = { Dream: "#22c55e", Target: "#6366f1", Safe: "#f97316", Backup: "#ef4444" };

function CustomTooltip({ active, payload, label, userRank }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 border border-white/10 rounded-xl shadow-xl p-3 text-xs">
      <p className="font-bold text-slate-300 mb-1.5">{label}</p>
      {payload.map(p => (
        <p key={p.dataKey} style={{ color: p.color }} className="font-semibold mb-0.5">
          {p.name}: <span className="font-black">{p.value?.toLocaleString()}</span>
        </p>
      ))}
      {userRank && (
        <p className="text-indigo-400 font-bold mt-1.5 pt-1.5 border-t border-white/10">
          Your Rank: {Number(userRank).toLocaleString()}
        </p>
      )}
    </div>
  );
}

export default function CutoffChart({ data, tier, userRank }) {
  if (!data || data.length === 0) return (
    <div className="h-32 flex items-center justify-center text-xs text-slate-600">
      No historical data available.
    </div>
  );
  const color = TIER_COLORS[tier] || "#6366f1";
  const ranks = data.map(d => d.closingRank);
  if (userRank) ranks.push(Number(userRank));
  const pad = Math.round((Math.max(...ranks) - Math.min(...ranks)) * 0.15) || 500;

  return (
    <div style={{ width: "100%", height: 170 }}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="year" tick={{ fontSize: 11, fill: "#64748b" }} tickLine={false} axisLine={false} />
          <YAxis
            domain={[Math.max(1, Math.min(...ranks) - pad), Math.max(...ranks) + pad]}
            tick={{ fontSize: 10, fill: "#64748b" }} tickLine={false} axisLine={false}
            tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}K` : v}
            width={32}
          />
          <Tooltip content={<CustomTooltip userRank={userRank} />} />
          <Legend wrapperStyle={{ fontSize: 11 }}
            formatter={v => <span style={{ color: "#94a3b8", fontSize: 11 }}>{v}</span>} />
          <Line type="monotone" dataKey="closingRank" name="Closing Rank"
            stroke={color} strokeWidth={2.5}
            dot={{ fill: color, strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, strokeWidth: 2 }}
          />
          {userRank && (
            <ReferenceLine y={Number(userRank)} stroke="#6366f1" strokeDasharray="5 3" strokeWidth={1.5}
              label={{ value: "Your Rank", position: "insideTopRight", fontSize: 10, fill: "#818cf8", fontWeight: 700 }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ComparisonChart({ colleges, userRank }) {
  if (!colleges?.length) return null;
  const yearSet = new Set();
  colleges.forEach(c => c.history?.forEach(h => yearSet.add(h.year)));
  const years = [...yearSet].sort();
  const chartData = years.map(year => {
    const row = { year };
    colleges.slice(0, 5).forEach(c => {
      const match = c.history?.find(h => h.year === year);
      if (match) row[`${c.college.split(" ").slice(0, 2).join(" ")} (${c.branch})`] = match.closingRank;
    });
    return row;
  });
  const colors = ["#6366f1", "#22c55e", "#f97316", "#3b82f6", "#ec4899"];
  const keys = Object.keys(chartData[0] || {}).filter(k => k !== "year");

  return (
    <div style={{ width: "100%", height: 230 }}>
      <ResponsiveContainer>
        <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="year" tick={{ fontSize: 11, fill: "#64748b" }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 10, fill: "#64748b" }} tickLine={false} axisLine={false}
            tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}K` : v} width={32} />
          <Tooltip content={<CustomTooltip userRank={userRank} />} />
          <Legend wrapperStyle={{ fontSize: 10 }}
            formatter={v => <span style={{ color: "#94a3b8", fontSize: 10 }}>{v}</span>} />
          {keys.map((key, i) => (
            <Line key={key} type="monotone" dataKey={key}
              stroke={colors[i % colors.length]} strokeWidth={2}
              dot={{ r: 3 }} activeDot={{ r: 5 }}
            />
          ))}
          {userRank && (
            <ReferenceLine y={Number(userRank)} stroke="#6366f1" strokeDasharray="5 3" strokeWidth={1.5}
              label={{ value: "Your Rank", position: "insideTopRight", fontSize: 10, fill: "#818cf8" }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
