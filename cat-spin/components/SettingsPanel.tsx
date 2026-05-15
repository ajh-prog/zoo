"use client";

import { useState } from "react";

interface Props {
  sections: number;
  labels: string[];
  brightness: number;
  onSectionsChange: (n: number) => void;
  onLabelsChange: (labels: string[]) => void;
  onBrightnessChange: (v: number) => void;
}

export default function SettingsPanel({
  sections,
  labels,
  brightness,
  onSectionsChange,
  onLabelsChange,
  onBrightnessChange,
}: Props) {
  const [open, setOpen] = useState(false);

  function handleCount(n: number) {
    onSectionsChange(n);
    onLabelsChange(Array.from({ length: n }, (_, i) => labels[i] ?? String(i + 1)));
  }

  function handleLabel(i: number, val: string) {
    const next = [...labels];
    next[i] = val;
    onLabelsChange(next);
  }

  return (
    <div className="w-full max-w-sm relative z-10">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-3 rounded-xl border border-yellow-500/30 bg-black/40 backdrop-blur text-yellow-400 hover:bg-black/60 transition-colors text-sm tracking-wider"
      >
        <span>⚙ 설정</span>
        <span className="text-xs opacity-50">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="mt-2 p-5 rounded-xl border border-yellow-500/25 bg-black/65 backdrop-blur space-y-5">

          {/* Brightness */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-yellow-300 text-sm tracking-wider">☀ 밝기</label>
              <span className="text-yellow-400 font-bold tabular-nums">{brightness}%</span>
            </div>
            <input
              type="range" min={30} max={100} value={brightness}
              onChange={(e) => onBrightnessChange(Number(e.target.value))}
              className="w-full h-2 rounded-full cursor-pointer appearance-none"
              style={{
                background: `linear-gradient(to right, #ffd700 0%, #ffd700 ${((brightness - 30) / 70) * 100}%, #1a1a1a ${((brightness - 30) / 70) * 100}%, #1a1a1a 100%)`,
              }}
            />
          </div>

          {/* Section count */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-yellow-300 text-sm tracking-wider">칸 수</label>
              <span className="text-yellow-400 font-bold tabular-nums">{sections}</span>
            </div>
            <input
              type="range" min={2} max={36} value={sections}
              onChange={(e) => handleCount(Number(e.target.value))}
              className="w-full h-2 rounded-full cursor-pointer appearance-none"
              style={{
                background: `linear-gradient(to right, #ffd700 0%, #ffd700 ${((sections - 2) / 34) * 100}%, #1a1a1a ${((sections - 2) / 34) * 100}%, #1a1a1a 100%)`,
              }}
            />
            <div className="flex justify-between text-yellow-700 text-xs mt-1">
              <span>2</span><span>36</span>
            </div>
          </div>

          {/* Labels */}
          <div>
            <p className="text-yellow-300 text-sm tracking-wider mb-3">라벨 편집</p>
            <div className="grid grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1">
              {Array.from({ length: sections }, (_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span
                    className="w-5 h-5 rounded-full shrink-0 flex items-center justify-center text-white"
                    style={{
                      background: i === 0 ? "#1e7a3a" : i % 2 === 1 ? "#9b1e1e" : "#222",
                      border: "1px solid #ffd700",
                      fontSize: 9,
                      fontWeight: 900,
                    }}
                  >
                    {i}
                  </span>
                  <input
                    type="text"
                    value={labels[i] ?? String(i + 1)}
                    onChange={(e) => handleLabel(i, e.target.value)}
                    maxLength={5}
                    className="flex-1 min-w-0 px-2 py-1 rounded-lg bg-black/50 border border-yellow-500/25 text-yellow-200 text-sm focus:outline-none focus:border-yellow-400 transition-colors"
                  />
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onLabelsChange(Array.from({ length: sections }, (_, i) => String(i + 1)))}
            className="w-full py-2 rounded-lg border border-yellow-500/25 text-yellow-600 text-xs tracking-widest hover:text-yellow-400 hover:border-yellow-500/50 transition-colors"
          >
            라벨 초기화 (1 ~ {sections})
          </button>
        </div>
      )}
    </div>
  );
}
