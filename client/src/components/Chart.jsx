import { useState, useEffect, useMemo } from "react";
import {
  BarChart, Bar,
  LineChart, Line,
  XAxis, YAxis,
  Tooltip, CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1a1d27] border border-white/15 rounded-xl px-4 py-3 shadow-xl text-sm">
        <p className="text-white/50 text-xs mb-1">{label}</p>
        <p className="text-white font-semibold">{payload[0].value?.toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

function Chart({ data, aiResult }) {
  const [xKey, setXKey] = useState("");
  const [yKey, setYKey] = useState("");
  const [operation, setOperation] = useState("avg");
  const [chartType, setChartType] = useState("bar");

  useEffect(() => {
    if (!aiResult) return;
    if (aiResult.xKey) setXKey(aiResult.xKey);
    if (aiResult.yKey) setYKey(aiResult.yKey);
    if (aiResult.operation) setOperation(aiResult.operation);
  }, [aiResult]);

  const keys = useMemo(() => {
    if (!data || data.length === 0) return [];
    return Object.keys(data[0]);
  }, [data]);

  const numericKeys = useMemo(() => {
    return keys.filter((key) =>
      data.some((row) => !isNaN(Number(row[key])) && row[key] !== "")
    );
  }, [keys, data]);

  const chartData = useMemo(() => {
    if (!data || data.length === 0 || !xKey) return [];
    const groups = {};
    data.forEach((row) => {
      const xVal = row[xKey];
      if (!xVal) return;
      if (!groups[xVal]) groups[xVal] = { total: 0, count: 0 };
      if (operation !== "count" && yKey) {
        const num = Number(row[yKey]);
        if (!isNaN(num)) groups[xVal].total += num;
      }
      groups[xVal].count += 1;
    });
    return Object.keys(groups).map((key) => {
      let value;
      if (operation === "avg") value = groups[key].total / groups[key].count;
      else if (operation === "sum") value = groups[key].total;
      else value = groups[key].count;
      return { [xKey]: key, value: Math.round(value * 100) / 100 };
    });
  }, [data, xKey, yKey, operation]);

  if (!data || data.length === 0) return null;

  const selectClass = "bg-white/5 border border-white/10 text-white/70 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-violet-500/50 transition-colors cursor-pointer";

  const typeBtn = (val, label) => (
    <button
      onClick={() => setChartType(val)}
      className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
        chartType === val
          ? "bg-violet-600 text-white shadow-lg shadow-violet-500/25"
          : "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/70"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-violet-500/20 flex items-center justify-center">
            <span className="text-xs text-violet-400">↗</span>
          </div>
          <h2 className="text-sm font-semibold text-white/70 uppercase tracking-widest">Chart</h2>
        </div>
        <div className="flex gap-2">
          {typeBtn("bar", "Bar")}
          {typeBtn("line", "Line")}
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-white/30 uppercase tracking-widest">X-Axis</label>
          <select value={xKey} onChange={(e) => setXKey(e.target.value)} className={selectClass}>
            <option value="">Select column</option>
            {keys.map((k) => <option key={k} value={k}>{k}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-white/30 uppercase tracking-widest">Y-Axis</label>
          <select value={yKey} onChange={(e) => setYKey(e.target.value)} className={selectClass}>
            <option value="">Select column</option>
            {numericKeys.map((k) => <option key={k} value={k}>{k}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-white/30 uppercase tracking-widest">Operation</label>
          <select value={operation} onChange={(e) => setOperation(e.target.value)} className={selectClass}>
            <option value="avg">Average</option>
            <option value="sum">Sum</option>
            <option value="count">Count</option>
          </select>
        </div>
      </div>

      {/* Chart */}
      {xKey && (yKey || operation === "count") && chartData.length > 0 ? (
        <>
          <div style={{ width: "100%", height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              {chartType === "bar" ? (
                <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#7c3aed" />
                      <stop offset="100%" stopColor="#4f46e5" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: "rgba(255,255,255,0.35)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "rgba(255,255,255,0.35)" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                  <Bar dataKey="value" fill="url(#barGrad)" radius={[6, 6, 0, 0]} />
                </BarChart>
              ) : (
                <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#7c3aed" />
                      <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: "rgba(255,255,255,0.35)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "rgba(255,255,255,0.35)" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="value" stroke="url(#lineGrad)" strokeWidth={2.5} dot={{ fill: "#7c3aed", r: 4, strokeWidth: 0 }} activeDot={{ r: 6 }} />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
          <p className="mt-4 text-xs text-white/30">
            Showing <span className="text-white/60 font-medium">{operation}</span> of{" "}
            <span className="text-white/60 font-medium">{operation === "count" ? "records" : yKey}</span> grouped by{" "}
            <span className="text-white/60 font-medium">{xKey}</span>
          </p>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-48 rounded-xl border border-dashed border-white/10 bg-white/2">
          <div className="text-3xl mb-2 opacity-30">📊</div>
          <p className="text-white/25 text-sm">Select X-Axis and Y-Axis to display chart</p>
        </div>
      )}
    </div>
  );
}

export default Chart;
