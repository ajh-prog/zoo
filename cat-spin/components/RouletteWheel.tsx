"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";

export interface RouletteWheelHandle {
  spin: () => void;
}

interface Props {
  sections: number;
  labels: string[];
  isSpinning?: boolean;
  onSpinEnd: (index: number, label: string) => void;
}

const GOLD = "#ffd700";
const GOLD_DARK = "#8b6914";
const CANVAS_SIZE = 500;

// Section fill colors — alternating metallic red / dark charcoal, first = green
function sectionColor(i: number): string {
  if (i === 0) return "#1e7a3a";
  return i % 2 === 1 ? "#9b1e1e" : "#151515";
}
function sectionHighlight(i: number): string {
  if (i === 0) return "#27ae60";
  return i % 2 === 1 ? "#e74c3c" : "#2c2c2c";
}

const RouletteWheel = forwardRef<RouletteWheelHandle, Props>(
  function RouletteWheel({ sections, labels, isSpinning = false, onSpinEnd }, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const rotRef = useRef(0);
    const rafRef = useRef(0);
    const spinningRef = useRef(false);

    const draw = useCallback(
      (rot: number) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const S = CANVAS_SIZE;
        const cx = S / 2;
        const cy = S / 2;
        const R = S / 2 - 20;
        const arc = (2 * Math.PI) / sections;

        ctx.clearRect(0, 0, S, S);

        /* ── outer ambient glow ─────────────────── */
        const ambient = ctx.createRadialGradient(cx, cy, R * 0.7, cx, cy, R + 22);
        ambient.addColorStop(0, "rgba(255,215,0,0)");
        ambient.addColorStop(0.7, "rgba(255,165,0,0.08)");
        ambient.addColorStop(1, "rgba(255,100,0,0)");
        ctx.beginPath();
        ctx.arc(cx, cy, R + 22, 0, 2 * Math.PI);
        ctx.fillStyle = ambient;
        ctx.fill();

        /* ── sections ───────────────────────────── */
        for (let i = 0; i < sections; i++) {
          const sa = rot + i * arc;
          const ea = sa + arc;
          const mid = sa + arc / 2;

          // Base fill
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.arc(cx, cy, R, sa, ea);
          ctx.closePath();
          ctx.fillStyle = sectionColor(i);
          ctx.fill();

          // Radial highlight (sheen)
          const sheen = ctx.createLinearGradient(
            cx + R * 0.15 * Math.cos(mid),
            cy + R * 0.15 * Math.sin(mid),
            cx + R * 0.85 * Math.cos(mid),
            cy + R * 0.85 * Math.sin(mid)
          );
          sheen.addColorStop(0, "rgba(255,255,255,0.12)");
          sheen.addColorStop(0.5, "rgba(255,255,255,0.03)");
          sheen.addColorStop(1, "rgba(0,0,0,0.15)");
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.arc(cx, cy, R, sa, ea);
          ctx.closePath();
          ctx.fillStyle = sheen;
          ctx.fill();

          // Divider lines
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.arc(cx, cy, R, sa, ea);
          ctx.closePath();
          ctx.strokeStyle = "rgba(255,215,0,0.5)";
          ctx.lineWidth = sections > 16 ? 0.8 : 1.2;
          ctx.stroke();

          // Label
          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate(mid);
          const maxFs = sections > 16 ? 13 : 17;
          const fs = Math.max(9, Math.min(maxFs, (R * 0.28 * Math.PI) / sections));
          ctx.font = `900 ${fs}px Cinzel, Georgia, serif`;
          ctx.fillStyle = "#ffffff";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.shadowColor = "rgba(0,0,0,0.95)";
          ctx.shadowBlur = 6;
          ctx.fillText((labels[i] ?? String(i)).slice(0, 5), R * 0.64, 0);
          ctx.restore();
        }

        /* ── outer gold rim (triple ring) ──────── */
        // Dark shadow ring
        ctx.beginPath();
        ctx.arc(cx, cy, R + 4, 0, 2 * Math.PI);
        ctx.strokeStyle = "rgba(0,0,0,0.6)";
        ctx.lineWidth = 10;
        ctx.stroke();

        // Main gold ring
        ctx.beginPath();
        ctx.arc(cx, cy, R, 0, 2 * Math.PI);
        ctx.strokeStyle = GOLD;
        ctx.lineWidth = 7;
        ctx.stroke();

        // Inner accent ring
        ctx.beginPath();
        ctx.arc(cx, cy, R - 8, 0, 2 * Math.PI);
        ctx.strokeStyle = "rgba(255,215,0,0.25)";
        ctx.lineWidth = 2;
        ctx.stroke();

        /* ── rim diamonds / dots ────────────────── */
        const dotN = Math.min(sections * 2, 60);
        for (let i = 0; i < dotN; i++) {
          const a = rot + (i * 2 * Math.PI) / dotN;
          const dr = R + 1;
          const dx = cx + dr * Math.cos(a);
          const dy = cy + dr * Math.sin(a);

          ctx.save();
          ctx.translate(dx, dy);
          ctx.rotate(a + Math.PI / 4);
          ctx.beginPath();
          const ds = i % 3 === 0 ? 4 : 2.5;
          ctx.rect(-ds / 2, -ds / 2, ds, ds);
          ctx.fillStyle = i % 3 === 0 ? GOLD : "rgba(255,255,255,0.6)";
          ctx.shadowColor = GOLD;
          ctx.shadowBlur = i % 3 === 0 ? 8 : 0;
          ctx.fill();
          ctx.restore();
        }

        /* ── spoke lines from center ────────────── */
        for (let i = 0; i < sections; i++) {
          const a = rot + i * arc;
          ctx.beginPath();
          ctx.moveTo(cx + 28 * Math.cos(a), cy + 28 * Math.sin(a));
          ctx.lineTo(cx + (R - 2) * Math.cos(a), cy + (R - 2) * Math.sin(a));
          ctx.strokeStyle = "rgba(255,215,0,0.18)";
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }

        /* ── center hub ─────────────────────────── */
        // Hub outer shadow
        ctx.beginPath();
        ctx.arc(cx, cy, 30, 0, 2 * Math.PI);
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.fill();

        // Hub gradient
        const hub = ctx.createRadialGradient(cx - 7, cy - 7, 2, cx, cy, 28);
        hub.addColorStop(0, "#fffde4");
        hub.addColorStop(0.35, "#ffd700");
        hub.addColorStop(0.7, "#c8973b");
        hub.addColorStop(1, GOLD_DARK);
        ctx.beginPath();
        ctx.arc(cx, cy, 28, 0, 2 * Math.PI);
        ctx.fillStyle = hub;
        ctx.fill();
        ctx.strokeStyle = "rgba(0,0,0,0.4)";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Hub ring
        ctx.beginPath();
        ctx.arc(cx, cy, 20, 0, 2 * Math.PI);
        ctx.strokeStyle = "rgba(255,255,255,0.3)";
        ctx.lineWidth = 1;
        ctx.stroke();

        // Pin
        const pin = ctx.createRadialGradient(cx - 2, cy - 2, 1, cx, cy, 9);
        pin.addColorStop(0, "#7a4f00");
        pin.addColorStop(1, "#3d2700");
        ctx.beginPath();
        ctx.arc(cx, cy, 9, 0, 2 * Math.PI);
        ctx.fillStyle = pin;
        ctx.fill();
      },
      [sections, labels]
    );

    useEffect(() => { draw(rotRef.current); }, [draw]);

    const spin = useCallback(() => {
      if (spinningRef.current) return;
      spinningRef.current = true;

      const extra = Math.random() * 2 * Math.PI;
      const totalRot = (Math.floor(Math.random() * 8) + 8) * 2 * Math.PI + extra;
      const duration = 4200 + Math.random() * 1800;
      const t0 = performance.now();
      const startRot = rotRef.current;

      // Quartic ease-out
      const ease = (t: number) => 1 - Math.pow(1 - t, 4);

      function step(now: number) {
        const t = Math.min((now - t0) / duration, 1);
        rotRef.current = startRot + totalRot * ease(t);
        draw(rotRef.current);

        if (t < 1) {
          rafRef.current = requestAnimationFrame(step);
        } else {
          spinningRef.current = false;
          const arc = (2 * Math.PI) / sections;
          const nr = ((rotRef.current % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
          const rel = (((3 * Math.PI) / 2 - nr) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
          const winIdx = Math.floor(rel / arc) % sections;
          onSpinEnd(winIdx, labels[winIdx] ?? String(winIdx));
        }
      }

      rafRef.current = requestAnimationFrame(step);
    }, [sections, labels, onSpinEnd, draw]);

    useImperativeHandle(ref, () => ({ spin }));
    useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

    return (
      <div className="relative flex items-center justify-center select-none">
        {/* Pointer */}
        <div
          className="absolute z-20 pointer-events-none"
          style={{ top: -6, left: "50%", transform: "translateX(-50%)" }}
        >
          <svg width="32" height="50" viewBox="0 0 32 50" aria-hidden>
            <defs>
              <linearGradient id="ptr-grad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#fffde4" />
                <stop offset="45%" stopColor={GOLD} />
                <stop offset="100%" stopColor={GOLD_DARK} />
              </linearGradient>
              <filter id="ptr-shadow">
                <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="rgba(0,0,0,0.7)" />
              </filter>
            </defs>
            <polygon
              points="16,50 1,3 31,3"
              fill="url(#ptr-grad)"
              stroke={GOLD_DARK}
              strokeWidth="1.5"
              filter="url(#ptr-shadow)"
            />
            <polygon points="16,44 7,9 25,9" fill="rgba(255,255,255,0.2)" />
            <circle cx="16" cy="8" r="4" fill={GOLD} stroke={GOLD_DARK} strokeWidth="1" />
          </svg>
        </div>

        {/* Canvas */}
        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className={isSpinning ? "wheel-spinning" : ""}
          style={{
            maxWidth: "min(88vw, 500px)",
            maxHeight: "min(88vw, 500px)",
            filter: isSpinning
              ? undefined
              : "drop-shadow(0 0 30px rgba(255,215,0,0.45)) drop-shadow(0 0 60px rgba(255,140,0,0.15))",
            borderRadius: "50%",
          }}
        />
      </div>
    );
  }
);

export default RouletteWheel;
