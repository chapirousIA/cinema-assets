import React from "react";
import { AbsoluteFill } from "remotion";
import { useLocal } from "../frame";
import { C, H, W, backOut, hash, seg } from "../lib";

const S = 96;
const COLS = Math.ceil(W / S) + 1, ROWS = Math.ceil(H / S) + 1;
const OX = (W - COLS * S) / 2, OY = (H - ROWS * S) / 2;
const TILES = Array.from({ length: COLS * ROWS }, (_, i) => {
  const c = i % COLS, r = Math.floor(i / COLS);
  const x = OX + c * S + S / 2, y = OY + r * S + S / 2;
  return { x, y, o: hash(i * 3.1) > 0.5 ? 90 : 0, d: Math.hypot(x - W / 2, y - H / 2) };
});
const h = S / 2;
const ARC = `M ${-h} 0 A ${h} ${h} 0 0 0 0 ${-h} M ${h} 0 A ${h} ${h} 0 0 0 0 ${h}`;

export const Truchet: React.FC = () => {
  const f = useLocal();
  const waveX = -200 + (W + 400) * seg(f, 34, 80);
  return (
    <AbsoluteFill>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {TILES.map((t, i) => {
          const rev = backOut(seg(f, t.d / 26, t.d / 26 + 12), 1.8);
          if (rev <= 0) return null;
          const w = seg(waveX - t.x, 0, 90); // wave passing this column
          const turned = backOut(w, 2);
          const navy = w > 0.5;
          return (
            <g key={i} transform={`translate(${t.x} ${t.y}) rotate(${t.o + 90 * turned}) scale(${rev})`}>
              <path d={ARC} fill="none" stroke={navy ? C.navy : C.white} strokeWidth={navy ? 7 : 6} strokeLinecap="round"
                strokeDasharray={navy ? "10 12" : undefined} opacity={navy ? 0.95 : 0.9} />
            </g>
          );
        })}
        {/* the wave front: soft white band */}
        <rect x={waveX - 40} y={0} width={80} height={H} fill="url(#wv)" opacity={f > 34 && f < 82 ? 0.55 : 0} />
        <defs>
          <linearGradient id="wv" x1="0" x2="1"><stop offset="0" stopColor="#fff" stopOpacity="0" /><stop offset="0.5" stopColor="#fff" stopOpacity="0.8" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></linearGradient>
        </defs>
      </svg>
    </AbsoluteFill>
  );
};
