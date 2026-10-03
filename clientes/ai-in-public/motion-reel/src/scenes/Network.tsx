import React from "react";
import { AbsoluteFill } from "remotion";
import { useLocal } from "../frame";
import { C, F, TL, W, expoOut, rng, seg } from "../lib";

const LAYERS = [3, 6, 8, 6, 3];
const XS = [380, 670, 960, 1250, 1540];
const CY = 500, GAP = 84;
const nodes = LAYERS.map((n, l) => Array.from({ length: n }, (_, k) => ({ x: XS[l], y: CY + (k - (n - 1) / 2) * GAP })));
const R = rng(77);
// highlighted signal paths: one node per layer
const PATHS = Array.from({ length: 5 }, () => LAYERS.map((n) => Math.floor(R() * n)));
const hot = new Set<string>();
PATHS.forEach((p) => p.slice(0, -1).forEach((k, l) => hot.add(`${l}-${k}-${p[l + 1]}`)));
const STEP = 12; // frames per layer hop

export const Network: React.FC = () => {
  const f = useLocal();
  const layerIn = (l: number) => expoOut(seg(f, 6 + l * 9, 22 + l * 9));
  const fire: Record<string, number> = {};
  const pulses: { x: number; y: number }[] = [];
  PATHS.forEach((p, pi) => {
    const t0 = TL.networkFire[pi];
    p.forEach((k, l) => {
      const arr = t0 + l * STEP; const d = f - arr;
      if (d >= 0 && d < 22) fire[`${l}-${k}`] = Math.max(fire[`${l}-${k}`] ?? 0, 1 - d / 22);
      if (l < p.length - 1) {
        const u = seg(f, arr, arr + STEP);
        if (u > 0 && u < 1) {
          const a = nodes[l][k], b = nodes[l + 1][p[l + 1]];
          for (let s = 0; s < 4; s++) { const uu = Math.max(0, u - s * 0.05); pulses.push({ x: a.x + (b.x - a.x) * uu, y: a.y + (b.y - a.y) * uu, s } as any); }
        }
      }
    });
  });
  const cap = expoOut(seg(f, 70, 96));
  return (
    <AbsoluteFill>
      <svg width={W} height={1080} style={{ position: "absolute", inset: 0 }}>
        {LAYERS.slice(0, -1).map((_, l) =>
          nodes[l].map((a, i) => nodes[l + 1].map((b, j) => {
            const h = hot.has(`${l}-${i}-${j}`);
            const k = layerIn(l + 1);
            return <line key={`${l}-${i}-${j}`} x1={a.x} y1={a.y} x2={a.x + (b.x - a.x) * k} y2={a.y + (b.y - a.y) * k}
              stroke={h ? C.white : C.ice} strokeWidth={h ? 2.6 : 1} opacity={h ? 0.85 * k : 0.28 * k} />;
          })))}
        {pulses.map((p: any, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={p.s === 0 ? 8 : 6 - p.s} fill={C.white} opacity={p.s === 0 ? 1 : 0.35 / p.s}
            style={p.s === 0 ? { filter: "drop-shadow(0 0 10px rgba(255,255,255,0.95))" } : undefined} />
        ))}
        {nodes.map((col, l) => col.map((n, k) => {
          const s = layerIn(l); const fr = fire[`${l}-${k}`] ?? 0;
          return (
            <g key={`${l}-${k}`} transform={`translate(${n.x} ${n.y}) scale(${s * (1 + fr * 0.35)})`}>
              {fr > 0 ? <circle r={34} fill="rgba(255,255,255,0.25)" opacity={fr} /> : null}
              <circle r={17} fill={fr > 0.05 ? C.white : C.navy} stroke={C.white} strokeWidth={3}
                style={fr > 0.05 ? { filter: "drop-shadow(0 0 16px rgba(255,255,255,0.95))" } : undefined} />
            </g>
          );
        }))}
        <text x={XS[0]} y={CY + 230} textAnchor="middle" fontFamily={F.mono} fontSize={20} letterSpacing={4} fill={C.white} opacity={layerIn(0)}>INPUT · YOU</text>
        <text x={XS[4]} y={CY + 230} textAnchor="middle" fontFamily={F.mono} fontSize={20} letterSpacing={4} fill={C.white} opacity={layerIn(4)}>OUTPUT · EVERYONE</text>
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 850, textAlign: "center", fontFamily: F.serif, fontStyle: "italic", fontSize: 64, color: C.white,
        opacity: cap, transform: `translateY(${(1 - cap) * 24}px)`, textShadow: "0 0 24px rgba(255,255,255,0.3)" }}>
        Ideas compound when you share them.
      </div>
    </AbsoluteFill>
  );
};
