"use client";

import { useCallback, useRef, useState } from "react";
import RouletteWheel, { RouletteWheelHandle } from "@/components/RouletteWheel";
import SettingsPanel from "@/components/SettingsPanel";

const DEFAULT_N = 8;

function defaultLabels(n: number) {
  return Array.from({ length: n }, (_, i) => String(i));
}

export default function Home() {
  const [sections, setSections] = useState(DEFAULT_N);
  const [labels, setLabels] = useState<string[]>(() => defaultLabels(DEFAULT_N));
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<{ index: number; label: string } | null>(null);
  const wheelRef = useRef<RouletteWheelHandle>(null);

  const handleSpin = () => {
    if (spinning) return;
    setSpinning(true);
    setResult(null);
    wheelRef.current?.spin();
  };

  const handleSpinEnd = useCallback((index: number, label: string) => {
    setSpinning(false);
    setResult({ index, label });
  }, []);

  return (
    <main
      className="relative flex flex-col items-center justify-center min-h-screen gap-6 py-8 px-4 overflow-hidden"
      style={{ zIndex: 1 }}
    >
      {/* Background decorative circles */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 flex items-center justify-center"
        style={{ zIndex: 0 }}
      >
        <div
          className="rounded-full opacity-10"
          style={{
            width: 700,
            height: 700,
            border: "2px solid #ffd700",
            boxShadow: "0 0 60px rgba(255,215,0,0.15)",
          }}
        />
        <div
          className="rounded-full opacity-5 absolute"
          style={{ width: 560, height: 560, border: "1px solid #ffd700" }}
        />
      </div>

      {/* Title */}
      <header className="text-center relative z-10">
        <p className="text-yellow-600 text-xs tracking-[0.4em] uppercase mb-1">
          Welcome to
        </p>
        <h1
          className="font-black tracking-widest leading-none"
          style={{
            fontSize: "clamp(2rem, 6vw, 3.5rem)",
            color: "#ffd700",
            textShadow:
              "0 0 30px rgba(255,215,0,0.5), 0 0 60px rgba(255,165,0,0.2), 0 3px 6px rgba(0,0,0,0.9)",
          }}
        >
          CASINO ROULETTE
        </h1>
        <div
          className="mt-2 mx-auto h-px w-48 opacity-40"
          style={{
            background:
              "linear-gradient(to right, transparent, #ffd700, transparent)",
          }}
        />
      </header>

      {/* Wheel */}
      <section className="relative z-10">
        <RouletteWheel
          ref={wheelRef}
          sections={sections}
          labels={labels}
          onSpinEnd={handleSpinEnd}
        />
      </section>

      {/* Result badge */}
      <div className="h-20 flex items-center justify-center relative z-10">
        {result && (
          <div
            key={`${result.index}-${result.label}`}
            className="result-badge px-10 py-4 rounded-2xl text-center"
            style={{
              background:
                "linear-gradient(135deg, rgba(0,0,0,0.8), rgba(20,10,0,0.9))",
              border: "2px solid #ffd700",
              boxShadow:
                "0 0 30px rgba(255,215,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)",
            }}
          >
            <p
              className="text-xs tracking-[0.35em] uppercase opacity-60 mb-1"
              style={{ color: "#ffd700" }}
            >
              Result
            </p>
            <p
              className="text-4xl font-black tracking-wide"
              style={{
                color: "#ffd700",
                textShadow: "0 0 20px rgba(255,215,0,0.6)",
              }}
            >
              {result.label}
            </p>
          </div>
        )}
      </div>

      {/* Spin button */}
      <button
        onClick={handleSpin}
        disabled={spinning}
        className={`relative z-10 px-14 py-4 rounded-full font-black text-xl tracking-[0.25em] uppercase transition-all duration-200 ${
          spinning
            ? "cursor-not-allowed opacity-60"
            : "spin-button hover:scale-105 active:scale-95"
        }`}
        style={{
          background: spinning
            ? "linear-gradient(135deg, #4a3000, #6b4800)"
            : "linear-gradient(135deg, #ffe066, #ffa500, #e67e00)",
          color: spinning ? "#9a7320" : "#1a0800",
          border: `2px solid ${spinning ? "#5a3e00" : "#ffd700"}`,
          boxShadow: spinning
            ? "none"
            : "0 6px 24px rgba(255,160,0,0.35), 0 2px 8px rgba(0,0,0,0.7)",
        }}
      >
        {spinning ? "SPINNING…" : "SPIN"}
      </button>

      {/* Settings panel */}
      <div className="relative z-10 w-full flex justify-center">
        <SettingsPanel
          sections={sections}
          labels={labels}
          onSectionsChange={(n) => {
            setSections(n);
            setLabels(defaultLabels(n));
            setResult(null);
          }}
          onLabelsChange={setLabels}
        />
      </div>

      {/* Footer */}
      <footer className="relative z-10 text-center text-yellow-900 text-xs tracking-[0.3em] uppercase">
        Good Luck · Play Responsibly
      </footer>
    </main>
  );
}
