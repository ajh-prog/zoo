"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import RouletteWheel, { RouletteWheelHandle } from "@/components/RouletteWheel";
import SettingsPanel from "@/components/SettingsPanel";
import LottoBalls from "@/components/LottoBalls";

/* ─── Constants ──────────────────────────────────── */
const DEFAULT_N = 20;
const LOTTO_COUNT = 6;

function defaultLabels(n: number) {
  return Array.from({ length: n }, (_, i) => String(i + 1));
}

/* ─── Star field ─────────────────────────────────── */
function StarField() {
  const stars = useMemo(
    () =>
      Array.from({ length: 60 }, (_, i) => ({
        id: i,
        x: (i * 37 + 11) % 100,
        y: (i * 53 + 7)  % 100,
        size: ((i * 13) % 3) + 1,
        delay: (i * 0.17) % 5,
        dur:   (i * 0.23) % 3 + 2,
      })),
    []
  );
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {stars.map((s) => (
        <div
          key={s.id}
          className="absolute rounded-full"
          style={{
            left: `${s.x}%`,
            top:  `${s.y}%`,
            width:  s.size,
            height: s.size,
            background: s.id % 4 === 0 ? "#ffd700" : "rgba(255,255,255,0.7)",
            animation: `twinkle ${s.dur}s ${s.delay}s ease-in-out infinite`,
          }}
        />
      ))}
    </div>
  );
}

/* ─── Confetti ───────────────────────────────────── */
function Confetti() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 90 }, (_, i) => ({
        id: i,
        x: (i * 31 + 3) % 100,
        color: ["#ffd700","#ff6b6b","#4ecdc4","#a29bfe","#55efc4","#fd79a8","#fdcb6e"][i % 7],
        delay: (i * 0.07) % 3,
        dur:   (i * 0.09) % 2 + 2.5,
        w:     (i % 5) + 4,
        h:     (i % 7) + 6,
      })),
    []
  );
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 100 }}>
      {pieces.map((p) => (
        <div
          key={p.id}
          className="absolute"
          style={{
            left:     `${p.x}%`,
            width:    p.w,
            height:   p.h,
            background: p.color,
            borderRadius: 1,
            animation: `confetti-fall ${p.dur}s ${p.delay}s linear forwards`,
          }}
        />
      ))}
    </div>
  );
}

/* ─── Main page ──────────────────────────────────── */
export default function Home() {
  const [sections, setSections]     = useState(DEFAULT_N);
  const [labels,   setLabels]       = useState<string[]>(() => defaultLabels(DEFAULT_N));
  const [spinning, setSpinning]     = useState(false);
  const [brightness, setBrightness] = useState(85);
  const [result, setResult]         = useState<{ index: number; label: string } | null>(null);
  const [lottoNumbers, setLottoNumbers] = useState<string[]>([]);
  const [celebrating, setCelebrating]   = useState(false);

  const wheelRef        = useRef<RouletteWheelHandle>(null);
  const lottoActiveRef  = useRef(false);
  const lottoPickedRef  = useRef<Set<string>>(new Set());
  const lottoCountRef   = useRef(0);

  /* ── Spin end handler ─────────────────────────── */
  const handleSpinEnd = useCallback((index: number, label: string) => {
    if (lottoActiveRef.current) {
      if (lottoPickedRef.current.has(label)) {
        // Duplicate → re-spin after short pause
        setTimeout(() => wheelRef.current?.spin(), 350);
      } else {
        lottoPickedRef.current.add(label);
        lottoCountRef.current += 1;
        setLottoNumbers((prev) => [...prev, label]);

        if (lottoCountRef.current >= LOTTO_COUNT) {
          lottoActiveRef.current = false;
          setSpinning(false);
          setCelebrating(true);
          setTimeout(() => setCelebrating(false), 5000);
        } else {
          // Pause before next spin
          setTimeout(() => wheelRef.current?.spin(), 900);
        }
      }
    } else {
      setSpinning(false);
      setResult({ index, label });
    }
  }, []);

  /* ── Single spin ──────────────────────────────── */
  const handleSpin = () => {
    if (spinning) return;
    lottoActiveRef.current = false;
    setSpinning(true);
    setResult(null);
    wheelRef.current?.spin();
  };

  /* ── Lotto auto-spin ──────────────────────────── */
  const handleLotto = () => {
    if (spinning) return;
    lottoActiveRef.current = true;
    lottoPickedRef.current = new Set();
    lottoCountRef.current  = 0;
    setLottoNumbers([]);
    setResult(null);
    setCelebrating(false);
    setSpinning(true);
    setTimeout(() => wheelRef.current?.spin(), 200);
  };

  /* ── Reset ────────────────────────────────────── */
  const handleReset = () => {
    if (spinning) return;
    lottoActiveRef.current = false;
    lottoPickedRef.current = new Set();
    lottoCountRef.current  = 0;
    setLottoNumbers([]);
    setResult(null);
    setCelebrating(false);
  };

  /* ─────────────────────────────────────────────── */
  return (
    <>
      {/* Fixed background */}
      <div
        className="fixed inset-0"
        style={{
          background: "radial-gradient(ellipse at 50% 25%, #0f5a0f 0%, #071f07 55%, #020b02 100%)",
          zIndex: -1,
        }}
      />
      <StarField />
      {celebrating && <Confetti />}

      {/* Brightness wrapper */}
      <div
        className="relative min-h-screen flex flex-col items-center justify-center gap-5 py-8 px-4"
        style={{ filter: `brightness(${brightness}%)`, zIndex: 1 }}
      >
        {/* Title */}
        <header className="text-center">
          <p className="text-yellow-700 text-xs tracking-[0.45em] uppercase mb-1">
            Lucky Spin
          </p>
          <h1
            className="shimmer-text font-black tracking-widest leading-none"
            style={{ fontSize: "clamp(2.2rem, 7vw, 4rem)" }}
          >
            카지노 룰렛
          </h1>
          <div
            className="mt-3 mx-auto"
            style={{
              height: 1,
              width: 220,
              background: "linear-gradient(to right, transparent, #ffd700 40%, #ffa500 60%, transparent)",
              opacity: 0.5,
            }}
          />
        </header>

        {/* Wheel */}
        <section
          className={celebrating ? "celebrate" : ""}
        >
          <RouletteWheel
            ref={wheelRef}
            sections={sections}
            labels={labels}
            isSpinning={spinning}
            onSpinEnd={handleSpinEnd}
          />
        </section>

        {/* Single spin result */}
        <div className="h-16 flex items-center justify-center">
          {result && !lottoActiveRef.current && lottoNumbers.length === 0 && (
            <div
              key={`${result.index}-${result.label}`}
              className="result-badge px-10 py-3 rounded-2xl text-center"
              style={{
                background: "linear-gradient(135deg, rgba(0,0,0,0.85), rgba(15,7,0,0.9))",
                border: "2px solid #ffd700",
                boxShadow: "0 0 36px rgba(255,215,0,0.35), 0 0 60px rgba(255,140,0,0.1), inset 0 1px 0 rgba(255,255,255,0.06)",
              }}
            >
              <p className="text-xs tracking-[0.35em] uppercase opacity-50 mb-0.5" style={{ color: "#ffd700" }}>
                결과
              </p>
              <p
                className="text-5xl font-black tracking-wide"
                style={{ color: "#ffd700", textShadow: "0 0 30px rgba(255,215,0,0.8)" }}
              >
                {result.label}
              </p>
            </div>
          )}
        </div>

        {/* Lotto balls */}
        <LottoBalls numbers={lottoNumbers} celebrating={celebrating} />

        {/* Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {/* Single spin */}
          <button
            onClick={handleSpin}
            disabled={spinning}
            className={`px-8 py-3.5 rounded-full font-black text-base tracking-[0.2em] uppercase transition-all duration-200 ${
              spinning ? "opacity-50 cursor-not-allowed" : "hover:scale-105 active:scale-95 spin-btn-idle"
            }`}
            style={{
              background: spinning
                ? "linear-gradient(135deg, #4a3000, #6b4800)"
                : "linear-gradient(135deg, #ffe066, #ffa500, #e67e00)",
              color:  spinning ? "#9a7320" : "#1a0800",
              border: `2px solid ${spinning ? "#5a3e00" : "#ffd700"}`,
              boxShadow: spinning ? "none" : "0 6px 24px rgba(255,160,0,0.35), 0 2px 8px rgba(0,0,0,0.7)",
            }}
          >
            {spinning && !lottoActiveRef.current ? "스핀 중…" : "단일 뽑기"}
          </button>

          {/* Lotto spin */}
          <button
            onClick={handleLotto}
            disabled={spinning}
            className={`px-8 py-3.5 rounded-full font-black text-base tracking-[0.15em] uppercase transition-all duration-200 ${
              spinning ? "opacity-50 cursor-not-allowed" : "hover:scale-105 active:scale-95"
            }`}
            style={{
              background: spinning
                ? "rgba(0,0,0,0.4)"
                : "linear-gradient(135deg, #a8e063 0%, #27ae60 50%, #1e8449 100%)",
              color:  spinning ? "#4a4a4a" : "#0a1f0a",
              border: `2px solid ${spinning ? "rgba(255,255,255,0.1)" : "#2ecc71"}`,
              boxShadow: spinning ? "none" : "0 6px 24px rgba(46,204,113,0.4), 0 2px 8px rgba(0,0,0,0.7)",
            }}
          >
            {spinning && lottoActiveRef.current ? `뽑는 중… (${lottoNumbers.length}/${LOTTO_COUNT})` : `로또 뽑기 (${LOTTO_COUNT}자리)`}
          </button>

          {/* Reset */}
          {(lottoNumbers.length > 0 || result) && (
            <button
              onClick={handleReset}
              disabled={spinning}
              className="px-5 py-3.5 rounded-full text-sm tracking-widest uppercase transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-40"
              style={{
                background: "rgba(0,0,0,0.5)",
                color: "rgba(255,215,0,0.5)",
                border: "1.5px solid rgba(255,215,0,0.2)",
              }}
            >
              초기화
            </button>
          )}
        </div>

        {/* Settings */}
        <SettingsPanel
          sections={sections}
          labels={labels}
          brightness={brightness}
          onSectionsChange={(n) => { setSections(n); setLabels(defaultLabels(n)); handleReset(); }}
          onLabelsChange={setLabels}
          onBrightnessChange={setBrightness}
        />

        {/* Footer */}
        <footer className="text-yellow-900 text-xs tracking-[0.3em] uppercase">
          행운을 빕니다 · 책임감 있게 즐기세요
        </footer>
      </div>
    </>
  );
}
