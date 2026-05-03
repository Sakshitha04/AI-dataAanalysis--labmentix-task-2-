import Papa from "papaparse";
import axios from "axios";
import { useState } from "react";

function Upload({ setData }) {
  const [dragging, setDragging] = useState(false);

  const processFile = (file) => {
    if (!file) return;
    if (!file.name.endsWith(".csv")) {
      alert("Please upload a .csv file only.");
      return;
    }
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        if (!results.data || results.data.length === 0) {
          alert("The CSV file is empty or invalid.");
          return;
        }
        setData(results.data);
        try {
          await axios.post("http://localhost:5000/upload", { data: results.data });
        } catch (err) {
          console.error("⚠️ Could not send data to backend:", err.message);
        }
      },
      error: () => alert("Failed to read CSV file."),
    });
  };

  const handleFile = (e) => processFile(e.target.files[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    processFile(e.dataTransfer.files[0]);
  };

  return (
    <label
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={`flex flex-col items-center justify-center w-full h-36 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
        dragging
          ? "border-violet-400 bg-violet-500/10"
          : "border-white/15 bg-white/3 hover:border-violet-500/50 hover:bg-violet-500/5"
      }`}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
          dragging ? "bg-violet-500/30" : "bg-white/8"
        }`}>
          <svg className="w-5 h-5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-medium text-white/60">
            {dragging ? "Drop it here!" : "Drop CSV or click to browse"}
          </p>
          <p className="text-xs text-white/25 mt-0.5">.csv files only</p>
        </div>
      </div>
      <input type="file" accept=".csv" onChange={handleFile} className="hidden" />
    </label>
  );
}

export default Upload;
