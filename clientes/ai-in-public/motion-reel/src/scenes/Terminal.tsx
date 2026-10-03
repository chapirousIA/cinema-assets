import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { useLocal } from "../frame";
import { Glow } from "../Global";
import { C, F, H, TL, W, expoOut, seg } from "../lib";

const LOGS = ["reading brand", "studying reference", "writing scenes", "composing score"];
const BLOCKS = 28;

const Grid: React.FC<{ f: number }> = ({ f }) => {
  const cell = 90;
  const off = (f * 2.2) % cell;
  return (
    <div style={{ position: "absolute", left: -W, top: H * 0.48, width: W * 3, height: H * 1.6, perspective: 900, transformStyle: "preserve-3d" }}>
      <div style={{ position: "absolute", inset: 0, transform: `rotateX(72deg) translateY(${off}px)`, transformOrigin: "50% 0%", opacity: 0.32,
        backgroundImage: "linear-gradient(rgba(255,255,255,0.9) 2px, rgba(0,0,0,0) 2px), linear-gradient(90deg, rgba(255,255,255,0.9) 2px, rgba(0,0,0,0) 2px)",
        backgroundSize: `${cell}px ${cell}px` }} />
    </div>
  );
};

export const Terminal: React.FC = () => {
  const f = useLocal();
  const enter = spring({ frame: f, fps: 60, config: { damping: 16, stiffness: 120 } });
  const typed = Math.max(0, Math.min(TL.cmd.length, Math.floor((f - TL.typeStart) / TL.typeStep) + 1));
  const caretOn = Math.floor(f / 16) % 2 === 0;
  const bar = expoOut(seg(f, TL.barFrom, TL.barTo));
  const filled = Math.round(bar * BLOCKS);
  const ship = spring({ frame: f - TL.shippedAt, fps: 60, config: { damping: 11, stiffness: 160 } });
  const rx = 9 - 6 * enter + Math.sin(f / 50) * 2.5, ry = -14 + 10 * enter + Math.sin(f / 37) * 3;
  const line = (s: React.ReactNode, k: string, op = 1) => <div key={k} style={{ opacity: op, whiteSpace: "pre" }}>{s}</div>;
  const cmdDone = typed >= TL.cmd.length;
  return (
    <AbsoluteFill>
      <Grid f={f} />
      <Glow x={W / 2} y={H / 2 - 20} size={1500} opacity={0.4} />
      <div style={{ position: "absolute", left: 0, top: 0, width: W, height: H, perspective: 1600 }}>
        <div style={{ position: "absolute", left: W / 2 - 640, top: 190, width: 1280, height: 560, borderRadius: 22, background: C.navy,
          boxShadow: "0 0 0 2px rgba(201,202,255,0.35), 0 0 60px rgba(255,255,255,0.35), 0 40px 120px rgba(10,11,61,0.7)",
          transform: `translateY(${(1 - enter) * 120}px) rotateX(${rx}deg) rotateY(${ry}deg) scale(${0.85 + 0.15 * enter})`, opacity: Math.min(1, enter * 1.5) }}>
          <div style={{ height: 54, borderBottom: "1px solid rgba(201,202,255,0.18)", display: "flex", alignItems: "center", padding: "0 24px", gap: 12 }}>
            {[C.white, C.ice, C.light].map((c, i) => <div key={i} style={{ width: 15, height: 15, borderRadius: 8, background: c, opacity: 0.85 }} />)}
            <div style={{ marginLeft: 20, fontFamily: F.mono, fontSize: 18, color: C.ice, letterSpacing: "0.12em", opacity: 0.8 }}>ai-in-public — zsh — 120×32</div>
          </div>
          <div style={{ padding: "30px 40px", fontFamily: F.mono, fontSize: 30, lineHeight: 1.55, color: C.white }}>
            {line(<>
              <span style={{ color: C.light }}>{TL.cmd.slice(0, Math.min(typed, 4))}</span>
              <span>{TL.cmd.slice(4, typed)}</span>
              {!cmdDone || f < TL.logFrames[0] ? <span style={{ opacity: caretOn ? 1 : 0, background: C.white, color: C.navy }}>&nbsp;</span> : null}
            </>, "cmd")}
            {LOGS.map((l, i) => {
              const k = expoOut(seg(f, TL.logFrames[i], TL.logFrames[i] + 8));
              const dots = ".".repeat(24 - l.length);
              return f >= TL.logFrames[i] ? (
                <div key={l} style={{ fontSize: 24, color: C.ice, opacity: k, transform: `translateX(${(1 - k) * -20}px)`, whiteSpace: "pre" }}>
                  {"  › " + l + " " + dots + " "}<span style={{ color: C.white }}>{f >= TL.logFrames[i] + 6 ? "ok" : "··"}</span>
                </div>
              ) : null;
            })}
            {f >= TL.barFrom ? (
              <div style={{ fontSize: 26, marginTop: 10, whiteSpace: "pre", opacity: expoOut(seg(f, TL.barFrom, TL.barFrom + 6)) }}>
                <span style={{ color: C.white, textShadow: "0 0 12px rgba(255,255,255,0.8)" }}>{"█".repeat(filled)}</span>
                <span style={{ color: "rgba(140,142,255,0.35)" }}>{"█".repeat(BLOCKS - filled)}</span>
                <span style={{ color: C.white }}>{"  " + String(Math.round(bar * 100)).padStart(3, " ") + "%"}</span>
              </div>
            ) : null}
          </div>
        </div>
      </div>
      {f >= TL.shippedAt - 1 ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: 790, textAlign: "center", fontFamily: F.head, fontSize: 96, color: C.white,
          transform: `scale(${0.6 + 0.4 * ship})`, opacity: Math.min(1, ship * 2), textShadow: "0 0 30px rgba(255,255,255,0.6), 0 8px 0 rgba(10,11,61,0.55)" }}>
          ✓ shipped. <span style={{ fontFamily: F.serif, fontStyle: "italic", fontWeight: 400 }}>in public.</span>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
