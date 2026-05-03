import { useState } from "react";
import axios from "axios";
import Upload from "./components/Upload";
import Table from "./components/Table";
import Chart from "./components/Chart";

function App() {
  const [data, setData] = useState([]);
  const [query, setQuery] = useState("");
  const [aiResult, setAIResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAskAI = async () => {
    if (!data.length) {
      alert("Please upload a CSV file first!");
      return;
    }
    if (!query.trim()) {
      alert("Please type a question!");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/ask-ai", {
        query,
        columns: Object.keys(data[0]),
      });
      setAIResult(res.data);
    } catch (err) {
      console.error(err);
      alert("AI failed. Please check the backend or your API key.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0f1117] text-white font-sans">

      {/* Top navbar */}
      <nav className="border-b border-white/10 bg-[#0f1117]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-sm font-bold shadow-lg shadow-violet-500/30">
              AI
            </div>
            <span className="text-lg font-semibold tracking-tight">DataLens</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-white/40 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
            <span className={`w-1.5 h-1.5 rounded-full ${data.length ? "bg-emerald-400" : "bg-white/20"}`}></span>
            {data.length ? `${data.length} rows loaded` : "No data"}
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-10 space-y-6">

        {/* Hero text */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-white via-white/90 to-white/50 bg-clip-text text-transparent">
            Analyze your data with AI
          </h1>
          <p className="text-white/40 mt-2 text-sm">Upload a CSV, ask a question, get instant visual insights.</p>
        </div>

        {/* Top row: Upload + Ask AI side by side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* Upload card */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-colors">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-6 h-6 rounded-md bg-violet-500/20 flex items-center justify-center">
                <span className="text-xs">01</span>
              </div>
              <h2 className="text-sm font-semibold text-white/70 uppercase tracking-widest">Upload CSV</h2>
            </div>
            <Upload setData={setData} />
            {data.length > 0 && (
              <div className="mt-4 flex items-center gap-2 text-emerald-400 text-sm bg-emerald-400/10 border border-emerald-400/20 rounded-lg px-3 py-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {data.length} rows loaded successfully
              </div>
            )}
          </div>

          {/* Ask AI card */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-colors">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-6 h-6 rounded-md bg-indigo-500/20 flex items-center justify-center">
                <span className="text-xs">02</span>
              </div>
              <h2 className="text-sm font-semibold text-white/70 uppercase tracking-widest">Ask AI</h2>
            </div>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder='e.g. "Show sales by region"'
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAskAI()}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 focus:outline-none focus:border-violet-500/50 focus:bg-white/8 transition-all"
              />
              <button
                onClick={handleAskAI}
                disabled={loading}
                className={`px-5 py-3 rounded-xl text-sm font-semibold transition-all ${
                  loading
                    ? "bg-white/10 text-white/30 cursor-not-allowed"
                    : "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:scale-105 active:scale-95"
                }`}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Thinking
                  </span>
                ) : "Ask AI"}
              </button>
            </div>
            <p className="text-white/25 text-xs mt-3">Press Enter to submit · AI will auto-configure the chart</p>
          </div>
        </div>

        {/* Chart */}
        {data.length > 0 && <Chart data={data} aiResult={aiResult} />}

        {/* Table */}
        {data.length > 0 && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-6 h-6 rounded-md bg-cyan-500/20 flex items-center justify-center">
                <span className="text-xs text-cyan-400">≡</span>
              </div>
              <h2 className="text-sm font-semibold text-white/70 uppercase tracking-widest">Data Table</h2>
            </div>
            <Table data={data} />
          </div>
        )}

      </div>
    </div>
  );
}

export default App;
