import React from "react";
import { AbsoluteFill } from "remotion";
import { useLocal } from "../frame";
import { C, F, TL, W, backOut, bounceOut, cubicInOut, elasticOut, expoOut, seg } from "../lib";

const ROWS: { name: string; tag: string; fn: (t: number) => number }[] = [
  { name: "linear", tag: "/IDEA", fn: (t) => t },
  { name: "ease-in-out", tag: "/PROMPT", fn: cubicInOut },
  { name: "expo-out", tag: "/DRAFT", fn: expoOut },
  { name: "back-out", tag: "/TEST", fn: (t) => backOut(t, 2.2) },
  { name: "elastic", tag: "/ITERATE", fn: elasticOut },
  { name: "bounce", tag: "/SHIP", fn: bounceOut },
];
const X0 = 760, X1 = 1700, Y0 = 330, DY = 104;

const Curve: React.FC<{ fn: (t: number) => number; x: number; y: number; k: number }> = ({ fn, x, y, k }) => {
  const pts = Array.from({ length: 41 }, (_, i) => { const t = i / 40; return `${x + t * 70},${y + 26 - fn(t) * 44}`; }).join(" ");
  return (
    <g opacity={k}>
      <rect x={x - 8} y={y - 26} width={86} height={64} rx={10} fill="rgba(10,11,61,0.35)" stroke="rgba(201,202,255,0.35)" />
      <polyline points={pts} fill="none" stroke={C.white} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
};

export const Easing: React.FC = () => {
  const f = useLocal();
  const head = expoOut(seg(f, 0, 22));
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 160, top: 160, fontFamily: F.serif, fontStyle: "italic", fontSize: 66, color: C.white,
        opacity: head, transform: `translateY(${(1 - head) * 24}px)`, textShadow: "0 0 24px rgba(255,255,255,0.3)" }}>
        Six ways to get an idea out in public.
      </div>
      <svg width={W} height={1080} style={{ position: "absolute", inset: 0 }}>
        {ROWS.map((r, i) => {
          const y = Y0 + i * DY;
          const rowIn = expoOut(seg(f, 6 + i * 3, 24 + i * 3));
          const t0 = TL.easingStart + i * TL.easingStagger;
          const at = (ff: number) => r.fn(seg(ff, t0, t0 + TL.easingDur));
          const x = X0 + (X1 - X0) * at(f);
          const dotCol = i % 2 === 0 ? C.white : C.navy;
          const arrive = seg(f, t0 + TL.easingDur, t0 + TL.easingDur + 16);
          return (
            <g key={r.name} opacity={rowIn} transform={`translate(${(1 - rowIn) * -40} 0)`}>
              <text x={160} y={y + 8} fontFamily={F.mono} fontSize={24} fill={C.ice} letterSpacing={2}>{r.tag}</text>
              <text x={360} y={y + 8} fontFamily={F.mono} fontSize={22} fill={C.white} opacity={0.75}>{r.name}</text>
              <Curve fn={r.fn} x={590} y={y - 4} k={1} />
              <line x1={X0} y1={y} x2={X1} y2={y} stroke={C.light} strokeWidth={2} strokeDasharray="2 12" strokeLinecap="round" />
              <circle cx={X1} cy={y} r={14} fill="none" stroke="rgba(201,202,255,0.5)" strokeWidth={2} />
              {/* stretched trail (motion blur): earlier sub-frame positions */}
              {[6, 5, 4, 3, 2, 1].map((k) => (
                <circle key={k} cx={X0 + (X1 - X0) * at(f - k * 0.7)} cy={y} r={13 - k} fill={dotCol} opacity={0.08 * (7 - k)} />
              ))}
              <circle cx={x} cy={y} r={14} fill={dotCol} style={{ filter: i % 2 === 0 ? "drop-shadow(0 0 10px rgba(255,255,255,0.9))" : undefined }} />
              {arrive > 0 && arrive < 1 ? (
                <circle cx={X1} cy={y} r={14 + 46 * expoOut(arrive)} fill="none" stroke={C.white} strokeWidth={3 * (1 - arrive) + 0.5} opacity={1 - arrive} />
              ) : null}
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};
