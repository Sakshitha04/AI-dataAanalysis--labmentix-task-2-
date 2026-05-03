import { useState } from "react";

function Table({ data }) {
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  if (!data || data.length === 0) return null;

  const columns = Object.keys(data[0]);
  const totalPages = Math.ceil(data.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentRows = data.slice(startIndex, startIndex + rowsPerPage);

  return (
    <div>
      <p className="text-xs text-white/25 mb-4">
        Showing {startIndex + 1}–{Math.min(startIndex + rowsPerPage, data.length)} of {data.length} rows
      </p>

      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              {columns.map((col) => (
                <th key={col} className="px-4 py-3 text-left text-xs font-semibold text-white/40 uppercase tracking-widest whitespace-nowrap">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentRows.map((row, i) => (
              <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                {Object.values(row).map((val, j) => (
                  <td key={j} className="px-4 py-3 whitespace-nowrap text-white/60 text-sm">
                    {val}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center gap-3 mt-5">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded-lg border text-xs font-medium transition-all ${
              currentPage === 1
                ? "border-white/5 text-white/15 cursor-not-allowed"
                : "border-white/10 text-white/50 hover:bg-white/8 hover:text-white/80 hover:border-white/20"
            }`}
          >
            ← Prev
          </button>

          <span className="text-xs text-white/30">
            Page <span className="text-white/60 font-semibold">{currentPage}</span> of {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 rounded-lg border text-xs font-medium transition-all ${
              currentPage === totalPages
                ? "border-white/5 text-white/15 cursor-not-allowed"
                : "border-white/10 text-white/50 hover:bg-white/8 hover:text-white/80 hover:border-white/20"
            }`}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

export default Table;
