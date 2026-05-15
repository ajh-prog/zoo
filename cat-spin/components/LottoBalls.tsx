"use client";

interface BallStyle {
  bg: string;
  border: string;
  text: string;
  glow: string;
  label: string;
}

function ballStyle(num: string): BallStyle {
  const n = parseInt(num);
  if (n >= 1  && n <= 5)  return { bg: "linear-gradient(135deg, #f9d423, #f7971e)", border: "#f7971e", text: "#7a3e00", glow: "rgba(247,151,30,0.7)",  label: "1–5" };
  if (n >= 6  && n <= 10) return { bg: "linear-gradient(135deg, #ff6b6b, #c0392b)", border: "#c0392b", text: "#fff",    glow: "rgba(192,57,43,0.7)",   label: "6–10" };
  if (n >= 11 && n <= 15) return { bg: "linear-gradient(135deg, #4fc3f7, #1565c0)", border: "#1565c0", text: "#fff",    glow: "rgba(21,101,192,0.7)",  label: "11–15" };
  if (n >= 16 && n <= 20) return { bg: "linear-gradient(135deg, #a8e063, #27ae60)", border: "#27ae60", text: "#fff",    glow: "rgba(39,174,96,0.7)",   label: "16–20" };
  // fallback (for custom ranges)
  return                         { bg: "linear-gradient(135deg, #d4a5ff, #9b59b6)", border: "#9b59b6", text: "#fff",    glow: "rgba(155,89,182,0.7)",  label: "" };
}

interface Props {
  numbers: string[];  // up to 6
  celebrating?: boolean;
}

export default function LottoBalls({ numbers, celebrating = false }: Props) {
  const slots = Array.from({ length: 6 }, (_, i) => numbers[i] ?? null);

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-xs tracking-[0.35em] uppercase opacity-50" style={{ color: "#ffd700" }}>
        뽑힌 번호
      </p>

      <div className="flex items-center gap-2 sm:gap-3">
        {slots.map((num, i) => {
          const filled = num !== null;
          const style = filled ? ballStyle(num!) : null;
          const isNew = filled && i === numbers.length - 1;

          return (
            <div
              key={i}
              className={filled ? (isNew ? "ball-pop" : "") : ""}
              style={{
                width: "clamp(44px, 10vw, 60px)",
                height: "clamp(44px, 10vw, 60px)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "clamp(13px, 3.5vw, 18px)",
                fontWeight: 900,
                letterSpacing: "-0.02em",
                transition: "all 0.3s",
                ...(filled
                  ? {
                      background: style!.bg,
                      border: `2.5px solid ${style!.border}`,
                      color: style!.text,
                      boxShadow: `0 0 16px ${style!.glow}, 0 0 32px ${style!.glow}, inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -2px 4px rgba(0,0,0,0.2)`,
                      textShadow: style!.text === "#fff" ? "0 1px 3px rgba(0,0,0,0.6)" : "none",
                    }
                  : {
                      background: "rgba(0,0,0,0.4)",
                      border: "2px dashed rgba(255,215,0,0.25)",
                      color: "rgba(255,215,0,0.15)",
                    }),
                ...(celebrating && filled ? { animation: "float-y 1.5s ease-in-out infinite" } : {}),
              }}
            >
              {filled ? num : "?"}
            </div>
          );
        })}
      </div>

      {celebrating && (
        <p
          className="text-sm tracking-widest font-bold"
          style={{ color: "#ffd700", textShadow: "0 0 16px rgba(255,215,0,0.8)" }}
        >
          🎉 행운의 번호 완성!
        </p>
      )}
    </div>
  );
}
