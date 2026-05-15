"use client";

import { useState } from "react";

interface Props {
  sections: number;
  labels: string[];
  onSectionsChange: (n: number) => void;
  onLabelsChange: (labels: string[]) => void;
}

export default function SettingsPanel({
  sections,
  labels,
  onSectionsChange,
  onLabelsChange,
}: Props) {
  const [open, setOpen] = useState(false);

  function handleCount(n: number) {
    onSectionsChange(n);
    const next = Array.from({ length: n }, (_, i) => labels[i] ?? String(i));
    onLabelsChange(next);
  }

  function handleLabel(i: number, val: string) {
    const next = [...labels];
    next[i] = val;
    onLabelsChange(next);
  }

  return (
    <div className="w-full max-w-sm relative z-10">
      {/* Toggle button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-3 rounded-xl border border-yellow-500/40 bg-black/40 backdrop-blur text-yellow-400 hover:bg-black/60 transition-colors duration-200 tracking-wider text-sm"
      >
        <span className="flex items-center gap-2">
          <span className="text-base">⚙</span> 설정
        </span>
        <span className="text-xs opacity-60">{open ? "▲" : "▼"}</span>
      </button>

      {/* Panel */}
      {open && (
        <div className="mt-2 p-5 rounded-xl border border-yellow-500/30 bg-black/60 backdrop-blur space-y-5">
          {/* Section count slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-yellow-300 text-sm tracking-wider">섹션 수</label>
              <span className="text-yellow-400 font-bold text-lg tabular-nums">{sections}</span>
            </div>
            <input
              type="range"
              min={2}
              max={36}
              value={sections}
              onChange={(e) => handleCount(Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #ffd700 0%, #ffd700 ${((sections - 2) / 34) * 100}%, #1a1a1a ${((sections - 2) / 34) * 100}%, #1a1a1a 100%)`,
                accentColor: "#ffd700",
              }}
            />
            <div className="flex justify-between text-yellow-700 text-xs mt-1">
              <span>2</span>
              <span>36</span>
            </div>
          </div>

          {/* Labels */}
          <div>
            <p className="text-yellow-300 text-sm tracking-wider mb-3">섹션 라벨 편집</p>
            <div className="grid grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1">
              {Array.from({ length: sections }, (_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span
                    className="w-5 h-5 rounded-full shrink-0 flex items-center justify-center text-white text-xs font-bold"
                    style={{
                      background:
                        i === 0 ? "#27ae60" : i % 2 === 1 ? "#c0392b" : "#1a1a1a",
                      border: "1px solid #ffd700",
                      fontSize: 9,
                    }}
                  >
                    {i}
                  </span>
                  <input
                    type="text"
                    value={labels[i] ?? String(i)}
                    onChange={(e) => handleLabel(i, e.target.value)}
                    maxLength={9}
                    className="flex-1 min-w-0 px-2 py-1 rounded-lg bg-black/50 border border-yellow-500/30 text-yellow-200 text-sm focus:outline-none focus:border-yellow-400 transition-colors"
                    placeholder={String(i)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Reset button */}
          <button
            onClick={() =>
              onLabelsChange(Array.from({ length: sections }, (_, i) => String(i)))
            }
            className="w-full py-2 rounded-lg border border-yellow-500/30 text-yellow-600 text-xs tracking-widest hover:text-yellow-400 hover:border-yellow-500/60 transition-colors"
          >
            라벨 초기화
          </button>
        </div>
      )}
    </div>
  );
}
