import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { CameraMotionBlur } from "@remotion/motion-blur";
import { useLocal } from "../frame";
import { Glow } from "../Global";
import { C, F, H, W, expoOut, seg, sparklePath } from "../lib";

const WORD = "AI IN PUBLIC";
const SIZE = 230;

const Letters: React.FC<{ color: string; dx: number; dy: number; opacity: number; stroke?: boolean }> = ({ color, dx, dy, opacity }) => {
  const f = useLocal();
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 330, display: "flex", justifyContent: "center", transform: `translate(${dx}px, ${dy}px)`, opacity }}>
      {WORD.split("").map((ch, i) => {
        const s = spring({ frame: f - 2 - i * 2.2, fps: 60, config: { damping: 13, stiffness: 210, mass: 0.8 } });
        return (
          <span key={i} style={{ display: "inline-block", fontFamily: F.head, fontSize: SIZE, lineHeight: 1, color, width: ch === " " ? SIZE * 0.26 : undefined,
            letterSpacing: "-0.02em", transform: `translateY(${(1 - s) * 220}px) skewX(${(1 - s) * -22}deg) scaleY(${0.7 + 0.3 * s})`, opacity: Math.min(1, s * 1.6) }}>
            {ch === " " ? " " : ch}
          </span>
        );
      })}
    </div>
  );
};

const Word: React.FC = () => {
  const f = useLocal();
  // chromatic split settles, then glitches once
  const settle = 1 - expoOut(seg(f, 6, 46));
  const glitch = f >= 70 && f < 76 ? [14, -10, 18, -6, 9, 0][f - 70] : 0;
  const split = 16 * settle + 2 + Math.abs(glitch);
  return (
    <>
      <Letters color={C.navy} dx={split + glitch * 0.5} dy={split * 0.25} opacity={0.95} />
      <Letters color={C.ice} dx={-split + glitch * 0.3} dy={-split * 0.15} opacity={0.85} />
      <Letters color={C.white} dx={glitch * 0.4} dy={0} opacity={1} />
    </>
  );
};

export const Title: React.FC = () => {
  const f = useLocal();
  const sweep = seg(f, 50, 92);
  const sub = expoOut(seg(f, 40, 64));
  return (
    <AbsoluteFill>
      {/* huge soft sparkle behind */}
      <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: 0.13 * expoOut(seg(f, 0, 30)) }}>
        <g transform={`translate(${W / 2} ${H / 2 - 40}) rotate(${f * 0.4}) scale(${0.85 + 0.15 * expoOut(seg(f, 0, 40))})`}>
          <path d={sparklePath(0, 0, 520, 0.13)} fill={C.white} />
        </g>
      </svg>
      <Glow x={W / 2} y={H / 2 - 40} size={1500} opacity={0.35} />
      {f < 48 ? <CameraMotionBlur shutterAngle={200} samples={5}><Word /></CameraMotionBlur> : <Word />}
      {/* light sweep across the letters */}
      <div style={{ position: "absolute", left: -500, top: 290, width: 360, height: 320, mixBlendMode: "screen", opacity: Math.sin(Math.PI * sweep) * 0.8,
        background: "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.65) 50%, rgba(255,255,255,0) 100%)",
        transform: `translateX(${sweep * (W + 800)}px) skewX(-20deg)` }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 640, textAlign: "center", fontFamily: F.serif, fontStyle: "italic", fontSize: 68, color: C.white,
        opacity: sub, transform: `translateY(${(1 - sub) * 30}px)`, textShadow: "0 0 24px rgba(255,255,255,0.35)" }}>
        learn it <span style={{ color: C.ice }}>·</span> build it <span style={{ color: C.ice }}>·</span> share it
      </div>
    </AbsoluteFill>
  );
};
