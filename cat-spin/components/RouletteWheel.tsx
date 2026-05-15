"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";

/* ─── Types ─────────────────────────────────────────────── */
export interface RouletteWheelHandle {
  spin: () => void;
}

interface Props {
  sections: number;
  labels: string[];
  onSpinEnd: (index: number, label: string) => void;
}

/* ─── Constants ─────────────────────────────────────────── */
const GOLD = "#ffd700";
const GOLD_DARK = "#8b6914";
const CANVAS_SIZE = 500;

function sectionColor(index: number): string {
  if (index === 0) return "#27ae60";        // 0 → green
  return index % 2 === 1 ? "#c0392b" : "#1a1a1a"; // odd→red, even→black
}

/* ─── Component ─────────────────────────────────────────── */
const RouletteWheel = forwardRef<RouletteWheelHandle, Props>(
  function RouletteWheel({ sections, labels, onSpinEnd }, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const rotRef = useRef(0);
    const rafRef = useRef(0);
    const spinningRef = useRef(false);

    /* ── Draw ─────────────────────────────────────────── */
    const draw = useCallback(
      (rot: number) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const S = CANVAS_SIZE;
        const cx = S / 2;
        const cy = S / 2;
        const R = S / 2 - 16;
        const arc = (2 * Math.PI) / sections;

        ctx.clearRect(0, 0, S, S);

        /* outer glow ring */
        const glowGrad = ctx.createRadialGradient(cx, cy, R - 2, cx, cy, R + 14);
        glowGrad.addColorStop(0, "rgba(255,215,0,0.6)");
        glowGrad.addColorStop(1, "rgba(255,215,0,0)");
        ctx.beginPath();
        ctx.arc(cx, cy, R + 14, 0, 2 * Math.PI);
        ctx.fillStyle = glowGrad;
        ctx.fill();

        /* sections */
        for (let i = 0; i < sections; i++) {
          const sa = rot + i * arc;
          const ea = sa + arc;

          /* slice fill */
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.arc(cx, cy, R, sa, ea);
          ctx.closePath();
          ctx.fillStyle = sectionColor(i);
          ctx.fill();

          /* slice border */
          ctx.strokeStyle = GOLD;
          ctx.lineWidth = 1.5;
          ctx.stroke();

          /* label */
          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate(sa + arc / 2);
          const fs = Math.max(11, Math.min(20, (R * 0.3 * Math.PI) / sections));
          ctx.font = `bold ${fs}px Cinzel, Georgia, serif`;
          ctx.fillStyle = "#ffffff";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.shadowColor = "rgba(0,0,0,0.9)";
          ctx.shadowBlur = 5;
          ctx.fillText((labels[i] ?? String(i)).slice(0, 9), R * 0.62, 0);
          ctx.restore();
        }

        /* outer gold ring */
        ctx.beginPath();
        ctx.arc(cx, cy, R, 0, 2 * Math.PI);
        ctx.strokeStyle = GOLD;
        ctx.lineWidth = 7;
        ctx.stroke();

        /* decorative rim dots */
        const dotN = Math.min(sections * 3, 72);
        for (let i = 0; i < dotN; i++) {
          const a = rot + (i * 2 * Math.PI) / dotN;
          const dx = cx + (R - 5) * Math.cos(a);
          const dy = cy + (R - 5) * Math.sin(a);
          ctx.beginPath();
          ctx.arc(dx, dy, 2, 0, 2 * Math.PI);
          ctx.fillStyle = i % 3 === 0 ? "#ffffff" : GOLD;
          ctx.fill();
        }

        /* inner bevel ring */
        ctx.beginPath();
        ctx.arc(cx, cy, R * 0.12, 0, 2 * Math.PI);
        ctx.strokeStyle = GOLD;
        ctx.lineWidth = 4;
        ctx.stroke();

        /* hub gradient */
        const hubGrad = ctx.createRadialGradient(cx - 6, cy - 6, 2, cx, cy, R * 0.12);
        hubGrad.addColorStop(0, "#fffacd");
        hubGrad.addColorStop(0.5, GOLD);
        hubGrad.addColorStop(1, GOLD_DARK);
        ctx.beginPath();
        ctx.arc(cx, cy, R * 0.12, 0, 2 * Math.PI);
        ctx.fillStyle = hubGrad;
        ctx.fill();

        /* hub pin */
        ctx.beginPath();
        ctx.arc(cx, cy, R * 0.04, 0, 2 * Math.PI);
        ctx.fillStyle = GOLD_DARK;
        ctx.fill();
      },
      [sections, labels]
    );

    useEffect(() => {
      draw(rotRef.current);
    }, [draw]);

    /* ── Spin ─────────────────────────────────────────── */
    const spin = useCallback(() => {
      if (spinningRef.current) return;
      spinningRef.current = true;

      // Random extra angle so ball stops at unpredictable spot
      const extra = Math.random() * 2 * Math.PI;
      const totalRot = (Math.floor(Math.random() * 8) + 7) * 2 * Math.PI + extra;
      const duration = 4000 + Math.random() * 2000;
      const t0 = performance.now();
      const startRot = rotRef.current;

      // Quartic ease-out for realistic deceleration
      const ease = (t: number) => 1 - Math.pow(1 - t, 4);

      function step(now: number) {
        const t = Math.min((now - t0) / duration, 1);
        rotRef.current = startRot + totalRot * ease(t);
        draw(rotRef.current);

        if (t < 1) {
          rafRef.current = requestAnimationFrame(step);
        } else {
          spinningRef.current = false;

          // Pointer is at top = angle 3π/2 from right (canvas coord)
          const arc = (2 * Math.PI) / sections;
          const normalRot = ((rotRef.current % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
          const rel = (((3 * Math.PI) / 2 - normalRot) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
          const winIdx = Math.floor(rel / arc) % sections;

          onSpinEnd(winIdx, labels[winIdx] ?? String(winIdx));
        }
      }

      rafRef.current = requestAnimationFrame(step);
    }, [sections, labels, onSpinEnd, draw]);

    useImperativeHandle(ref, () => ({ spin }));

    useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

    /* ── Render ───────────────────────────────────────── */
    return (
      <div className="relative flex items-center justify-center select-none">
        {/* Pointer arrow */}
        <div
          className="absolute z-20 pointer-events-none"
          style={{ top: -2, left: "50%", transform: "translateX(-50%)" }}
        >
          <svg width="28" height="44" viewBox="0 0 28 44" aria-hidden>
            <defs>
              <linearGradient id="ptr" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#fffacd" />
                <stop offset="50%" stopColor={GOLD} />
                <stop offset="100%" stopColor={GOLD_DARK} />
              </linearGradient>
            </defs>
            <polygon points="14,44 1,2 27,2" fill="url(#ptr)" stroke={GOLD_DARK} strokeWidth="1.5" />
            <polygon points="14,38 6,7 22,7" fill="rgba(255,255,255,0.25)" />
          </svg>
        </div>

        {/* Canvas */}
        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className="rounded-full"
          style={{
            maxWidth: "min(90vw, 500px)",
            maxHeight: "min(90vw, 500px)",
            filter: "drop-shadow(0 0 28px rgba(255,215,0,0.4))",
          }}
        />
      </div>
    );
  }
);

export default RouletteWheel;
