// components/GlobalBackground.tsx
import React from "react";

type Streak = {
  top: string;
  left: string;
  v: "cool" | "warm" | "lime";
  dir: "fwd" | "rev";
  delay: string;
  dur: string; // p.ej. "12s"
  op: number;
  h?: string;
};

const streaks: Streak[] = [
  // base
  { top: "8%",  left: "-35%", v: "cool", dir: "fwd", delay: "0s",   dur: "12s",  op: 0.85 },
  { top: "12%", left: "-28%", v: "warm", dir: "rev", delay: ".4s",  dur: "10.5s",op: 0.75 },
  { top: "20%", left: "-36%", v: "lime", dir: "fwd", delay: "1.0s", dur: "13s",  op: 0.80 },
  { top: "28%", left: "-22%", v: "cool", dir: "rev", delay: "1.6s", dur: "9.5s", op: 0.90 },
  { top: "36%", left: "-40%", v: "warm", dir: "fwd", delay: "2.1s", dur: "11.5s",op: 0.70 },
  { top: "44%", left: "-30%", v: "cool", dir: "rev", delay: "2.7s", dur: "12.5s",op: 0.85 },
  { top: "52%", left: "-26%", v: "warm", dir: "fwd", delay: "3.2s", dur: "10.2s",op: 0.80 },
  { top: "60%", left: "-18%", v: "lime", dir: "rev", delay: "3.8s", dur: "12.2s",op: 0.75 },
  { top: "68%", left: "-34%", v: "cool", dir: "fwd", delay: "4.4s", dur: "11.2s",op: 0.85 },
  { top: "76%", left: "-24%", v: "warm", dir: "rev", delay: "5.0s", dur: "9.8s", op: 0.72 },
  { top: "84%", left: "-20%", v: "cool", dir: "fwd", delay: "5.6s", dur: "13.2s",op: 0.82 },
  // extras finas (1px)
  { top: "6%",  left: "-38%", v: "cool", dir: "rev", delay: "0.6s", dur: "14s",  op: 0.55, h: "1px" },
  { top: "18%", left: "-33%", v: "warm", dir: "fwd", delay: "1.2s", dur: "12.8s",op: 0.55, h: "1px" },
  { top: "22%", left: "-27%", v: "lime", dir: "rev", delay: "1.8s", dur: "10.8s",op: 0.50, h: "1px" },
  { top: "34%", left: "-31%", v: "cool", dir: "fwd", delay: "2.4s", dur: "13.6s",op: 0.58, h: "1px" },
  { top: "42%", left: "-36%", v: "warm", dir: "rev", delay: "3.0s", dur: "12.2s",op: 0.52, h: "1px" },
  { top: "58%", left: "-21%", v: "lime", dir: "fwd", delay: "3.6s", dur: "11.8s",op: 0.50, h: "1px" },
  { top: "66%", left: "-29%", v: "cool", dir: "rev", delay: "4.2s", dur: "14.4s",op: 0.55, h: "1px" },
  { top: "74%", left: "-19%", v: "warm", dir: "fwd", delay: "4.8s", dur: "12.6s",op: 0.50, h: "1px" },
  { top: "90%", left: "-25%", v: "lime", dir: "rev", delay: "5.4s", dur: "13.8s",op: 0.52, h: "1px" },
  // marcadas (3px)
  { top: "14%", left: "-32%", v: "cool", dir: "fwd", delay: ".2s",  dur: "11.4s",op: 0.92, h: "3px" },
  { top: "48%", left: "-35%", v: "warm", dir: "rev", delay: "2.9s", dur: "10.6s",op: 0.88, h: "3px" },
  { top: "82%", left: "-28%", v: "lime", dir: "fwd", delay: "5.3s", dur: "12.4s",op: 0.86, h: "3px" },
];

export default function GlobalBackground() {
  return (
    <>
      <div className="mw-global-bg" aria-hidden>
        <div className="mw-global-base" />
        {streaks.map((s, i) => (
          <div
            key={i}
            className="streak-wrap"
            style={{
              top: s.top as any,
              left: s.left as any,
              // grosor por línea
              // @ts-ignore
              ["--streak-h" as any]: s.h ?? "2px",
            }}
          >
            <div
              className={`streak streak-${s.v} ${s.dir === "rev" ? "dir-rev" : "dir-fwd"}`}
              style={{
                opacity: s.op as any,
                animationDelay: s.delay as any,
                // Pasamos la duración base como variable CSS
                // @ts-ignore
                ["--dur" as any]: s.dur,
              }}
            />
          </div>
        ))}
      </div>

      <style jsx global>{`
        /* Control global de velocidad (1 = normal) */
        :root { --speed: 1; }

        .mw-global-bg {
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          overflow: hidden;
        }
        .mw-global-base {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(120% 80% at 20% 10%, rgba(0,0,0,0.15) 0%, transparent 60%),
            radial-gradient(120% 80% at 80% 90%, rgba(0,0,0,0.18) 0%, transparent 60%),
            linear-gradient(180deg, rgba(4,18,16,0.85), rgba(4,18,16,0.85));
        }

        .streak-wrap {
          position: absolute;
          width: 220%;
          height: var(--streak-h, 2px);
          transform: rotate(-12deg);
        }
        .streak {
          position: absolute;
          left: 0;
          top: 0;
          width: 220%;
          height: 100%;
          will-change: transform, opacity;
          filter: blur(.5px);
          /* Aquí aplicamos la variable de duración base y el multiplicador global */
          animation-duration: calc(var(--dur, 11s) * var(--speed, 1));
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
        @keyframes slide-fwd {
          0%   { transform: translateX(-30%); opacity: 0; }
          10%  { opacity: .9; }
          100% { transform: translateX(130%); opacity: 0; }
        }
        @keyframes slide-rev {
          0%   { transform: translateX(130%); opacity: 0; }
          10%  { opacity: .9; }
          100% { transform: translateX(-30%); opacity: 0; }
        }
        .streak.dir-fwd { animation-name: slide-fwd; }
        .streak.dir-rev { animation-name: slide-rev; }

        .streak-cool { background: linear-gradient(90deg, transparent, rgba(12,224,178,.95), transparent); }
        .streak-warm { background: linear-gradient(90deg, transparent, rgba(255,122,26,.95), transparent); }
        .streak-lime { background: linear-gradient(90deg, transparent, rgba(163,255,18,.9), transparent); }

        /* Respeto a usuarios con menor movimiento */
        @media (prefers-reduced-motion: reduce) {
          .streak { animation: none !important; opacity: .25; }
        }
      `}</style>
    </>
  );
}
