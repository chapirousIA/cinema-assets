import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { useLocal } from "../frame";
import { Glow } from "../Global";
import { C, F, H, W, expoIn, expoOut, seg, sparklePath } from "../lib";

const CX = W / 2, CY = H / 2;
const RING_TEXT = "AI IN PUBLIC · LEARN · BUILD · SHARE · ";

export const Signal: React.FC = () => {
  const f = useLocal();
  const dot = spring({ frame: f - 2, fps: 60, config: { damping: 12, stiffness: 180 } });
  const toSpark = spring({ frame: f - 16, fps: 60, config: { damping: 11, stiffness: 120 } });
  const burst = expoOut(seg(f, 24, 70));
  const raysOut = 1 - seg(f, 62, 92);
  const ringT = seg(f, 26, 84);
  const textIn = expoOut(seg(f, 30, 52));
  const flare = Math.sin(Math.PI * seg(f, 22, 66));
  const zoom = 1 + 8 * expoIn(seg(f, 98, 120)); // zoom-through: 9× into the sparkle
  const rot = f * 0.35;

  const rays = Array.from({ length: 16 }, (_, i) => {
    const a = (i / 16) * Math.PI * 2 + 0.2;
    const long = i % 2 === 0;
    const r0 = 90 + 40 * burst, r1 = r0 + (long ? 520 : 300) * burst;
    return (
      <line key={i} x1={CX + Math.cos(a) * r0} y1={CY + Math.sin(a) * r0} x2={CX + Math.cos(a) * r1} y2={CY + Math.sin(a) * r1}
        stroke={long ? C.white : C.ice} strokeWidth={long ? 5 : 3} strokeLinecap="round" opacity={(long ? 0.95 : 0.7) * raysOut} />
    );
  });

  return (
    <AbsoluteFill style={{ transform: `scale(${zoom})`, transformOrigin: `${CX}px ${CY}px` }}>
      <Glow x={CX} y={CY} size={900} opacity={0.55 * toSpark} scale={0.8 + 0.2 * Math.sin(f / 9)} />
      {/* horizontal lens flare */}
      <div style={{ position: "absolute", left: CX - 900, top: CY - 70, width: 1800, height: 140, opacity: flare * 0.85,
        background: "radial-gradient(ellipse 50% 50% at 50% 50%, rgba(255,255,255,0.9) 0%, rgba(201,202,255,0.35) 30%, rgba(255,255,255,0) 70%)",
        transform: `scaleX(${0.3 + 0.7 * expoOut(seg(f, 22, 44))})` }} />
      <div style={{ position: "absolute", left: CX - 860, top: CY - 2, width: 1720, height: 4, background: "linear-gradient(90deg, rgba(255,255,255,0), #fff 50%, rgba(255,255,255,0))",
        opacity: flare, transform: `scaleX(${expoOut(seg(f, 22, 40))})` }} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <g transform={`rotate(${rot * 0.5} ${CX} ${CY})`}>{rays}</g>
        {/* expanding ring */}
        <circle cx={CX} cy={CY} r={120 + 620 * expoOut(ringT)} fill="none" stroke={C.white} strokeWidth={4 * (1 - ringT) + 0.5} opacity={(1 - ringT) * 0.9} />
        <circle cx={CX} cy={CY} r={100 + 420 * expoOut(seg(f, 34, 90))} fill="none" stroke={C.ice} strokeWidth={2} opacity={(1 - seg(f, 34, 90)) * 0.7} />
        {/* rotating text ring */}
        <defs>
          <path id="ringPath" d={`M ${CX - 250} ${CY} a 250 250 0 1 1 500 0 a 250 250 0 1 1 -500 0`} />
        </defs>
        <g transform={`rotate(${rot} ${CX} ${CY}) translate(${CX} ${CY}) scale(${0.85 + 0.15 * textIn}) translate(${-CX} ${-CY})`} opacity={textIn}>
          <text fontFamily={F.mono} fontSize={25} letterSpacing={5.0} fill={C.white}>
            <textPath href="#ringPath">{RING_TEXT + RING_TEXT}</textPath>
          </text>
        </g>
        <circle cx={CX} cy={CY} r={212} fill="none" stroke={C.ice} strokeWidth={1.5} strokeDasharray="4 10" opacity={0.6 * textIn} transform={`rotate(${-rot * 1.4} ${CX} ${CY})`} />
        {/* dot → sparkle */}
        <circle cx={CX} cy={CY} r={22 * dot * (1 - toSpark)} fill={C.white} />
        <g transform={`translate(${CX} ${CY}) rotate(${(1 - toSpark) * -90 + Math.sin(f / 14) * 4}) scale(${toSpark})`} style={{ filter: "drop-shadow(0 0 18px rgba(255,255,255,0.9))" }}>
          <path d={sparklePath(0, 0, 120, 0.13)} fill={C.white} />
        </g>
      </svg>
    </AbsoluteFill>
  );
};
