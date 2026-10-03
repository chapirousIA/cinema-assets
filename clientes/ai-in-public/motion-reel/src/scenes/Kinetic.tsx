import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { CameraMotionBlur } from "@remotion/motion-blur";
import { useLocal } from "../frame";
import { C, F, TL, W } from "../lib";

const WORDS = ["PROMPT", "BUILD", "SHIP", "REPEAT"];
const SIZE = 220;
const STARTS = TL.kineticHits.map((h) => h - TL.scenes[9].from);

const Word: React.FC<{ w: string; t0: number; idx: number }> = ({ w, t0, idx }) => {
  const f = useLocal() - t0;
  const chars = (w + ".").split("");
  const line = (dy: number, outline: boolean, op: number, lag: number) => (
    <div style={{ position: "absolute", left: 0, right: 0, top: 540 - SIZE * 0.55 + dy, display: "flex", justifyContent: "center", opacity: op }}>
      {chars.map((ch, i) => {
        const s = spring({ frame: f - i * 1.6 - lag, fps: 60, config: { damping: 12, stiffness: 260, mass: 0.7 } });
        const dot = ch === ".";
        return (
          <span key={i} style={{ display: "inline-block", fontFamily: F.head, fontSize: SIZE, lineHeight: 1,
            color: outline ? "transparent" : dot ? C.navy : C.white, WebkitTextStroke: outline ? `2px ${C.ice}` : undefined,
            transform: `translateY(${(1 - s) * 260}px) scale(${1.25 - 0.25 * s})`, opacity: Math.min(1, s * 1.8),
            textShadow: outline || dot ? undefined : "0 0 26px rgba(255,255,255,0.4)" }}>{ch}</span>
        );
      })}
    </div>
  );
  const g = 0.9 + 0.1 * idx; // intensity builds
  return (
    <AbsoluteFill style={{ transform: `scale(${g})` }}>
      {line(-SIZE * 0.78 * 2, true, 0.18, 6)}
      {line(-SIZE * 0.78, true, 0.4, 3)}
      {line(SIZE * 0.78, true, 0.4, 3)}
      {line(SIZE * 0.78 * 2, true, 0.18, 6)}
      {line(0, false, 1, 0)}
    </AbsoluteFill>
  );
};

export const Kinetic: React.FC = () => {
  const f = useLocal();
  let idx = 0;
  STARTS.forEach((s, i) => { if (f >= s) idx = i; });
  const t0 = STARTS[idx];
  const fresh = f - t0 < 14;
  const w = <Word key={idx} w={WORDS[idx]} t0={t0} idx={idx} />;
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 160, top: 160, fontFamily: F.mono, fontSize: 20, letterSpacing: "0.3em", color: C.ice }}>
        {String(idx + 1).padStart(2, "0")} / 04
      </div>
      {fresh ? <CameraMotionBlur shutterAngle={220} samples={5}>{w}</CameraMotionBlur> : w}
    </AbsoluteFill>
  );
};
