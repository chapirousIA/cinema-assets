import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import { CameraMotionBlur } from "@remotion/motion-blur";
import { SceneClock } from "./frame";
import { Background, Finish, FlashOverlay, HUD } from "./Global";
import { C, H, PAD, SCENES, TRANS, W, cubicIn, cubicInOut, expoIn, expoOut, seg, shakeAt } from "./lib";
import { Signal } from "./scenes/Signal";
import { Warp } from "./scenes/Warp";
import { Title } from "./scenes/Title";
import { Terminal } from "./scenes/Terminal";
import { Easing } from "./scenes/Easing";
import { Network } from "./scenes/Network";
import { Morph } from "./scenes/Morph";
import { Truchet } from "./scenes/Truchet";
import { Depth } from "./scenes/Depth";
import { Kinetic } from "./scenes/Kinetic";
import { Finale } from "./scenes/Finale";

const COMPONENTS: Record<string, React.FC> = {
  signal: Signal, warp: Warp, title: Title, terminal: Terminal, easing: Easing, network: Network,
  morph: Morph, truchet: Truchet, depth: Depth, kinetic: Kinetic, finale: Finale,
};
const N = SCENES.length;
const D = 2300; // iris diameter (covers the 1920×1080 diagonal)

// Computes this scene's transition transform from the frame, so CameraMotionBlur can blur the move itself.
const Moving: React.FC<{ i: number }> = ({ i }) => {
  const s = SCENES[i];
  const lf = useCurrentFrame() - (i > 0 ? PAD : 0); // frame relative to the scene's own start
  const Scene = COMPONENTS[s.id];
  let tx = 0, sc = 1, op = 1, iris = -1;

  if (i > 0 && lf < PAD) {
    const q = seg(lf, -PAD, PAD);
    const kind = TRANS[i - 1];
    if (kind === "zoom") { sc *= 0.45 + 0.55 * expoOut(q); op *= seg(q, 0.1, 0.6); }
    if (kind === "flash") op *= seg(q, 0.45, 0.6);
    if (kind === "whip") tx += W * (1 - cubicInOut(q));
    if (kind === "iris") iris = Math.max(0.0015, cubicInOut(q));
  }
  if (i < N - 1 && lf > s.dur - PAD) {
    const p = seg(lf, s.dur - PAD, s.dur + PAD);
    const kind = TRANS[i];
    if (kind === "zoom") { sc *= 1 + 3 * expoIn(p); op *= 1 - seg(p, 0.35, 0.85); }
    if (kind === "flash") op *= 1 - seg(p, 0.4, 0.55);
    if (kind === "whip") tx -= W * cubicInOut(p);
    if (kind === "iris") sc *= 1 + 0.06 * cubicIn(p);
  }

  const body = (
    <AbsoluteFill style={{ transform: `translateX(${tx}px) scale(${sc})`, opacity: op }}>
      <SceneClock offset={i > 0 ? PAD : 0}><Scene /></SceneClock>
    </AbsoluteFill>
  );
  if (iris < 0) return body;
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: W / 2 - D / 2, top: H / 2 - D / 2, width: D, height: D, borderRadius: "50%", overflow: "hidden", transform: `scale(${iris})` }}>
        <div style={{ position: "absolute", left: D / 2 - W / 2, top: D / 2 - H / 2, width: W, height: H, transform: `scale(${1 / iris})` }}>
          <Background />
          {body}
        </div>
      </div>
      <div style={{ position: "absolute", left: W / 2 - D / 2, top: H / 2 - D / 2, width: D, height: D, borderRadius: "50%",
        border: `6px solid ${C.white}`, boxShadow: "0 0 30px rgba(255,255,255,0.8), inset 0 0 30px rgba(201,202,255,0.6)",
        transform: `scale(${iris})`, opacity: 1 - iris * 0.6 }} />
    </AbsoluteFill>
  );
};

const SceneSlot: React.FC<{ i: number }> = ({ i }) => {
  const s = SCENES[i];
  const lf = useCurrentFrame() - (i > 0 ? PAD : 0);
  // real motion blur on whip-pans
  const inWhip = (i > 0 && TRANS[i - 1] === "whip" && lf < PAD) || (i < N - 1 && TRANS[i] === "whip" && lf > s.dur - PAD);
  if (inWhip) return <CameraMotionBlur shutterAngle={240} samples={5}><Moving i={i} /></CameraMotionBlur>;
  return <Moving i={i} />;
};

export const Reel: React.FC = () => {
  const f = useCurrentFrame();
  const sh = shakeAt(f);
  return (
    <AbsoluteFill style={{ background: C.navy }}>
      <Background />
      <AbsoluteFill style={{ transform: `translate(${sh.x}px, ${sh.y}px)` }}>
        {SCENES.map((s, i) => {
          const from = s.from - (i > 0 ? PAD : 0);
          const dur = s.dur + (i > 0 ? PAD : 0) + (i < N - 1 ? PAD : 0);
          return (
            <Sequence key={s.id} from={from} durationInFrames={dur} name={s.label} layout="none">
              <SceneSlot i={i} />
            </Sequence>
          );
        })}
      </AbsoluteFill>
      <FlashOverlay />
      <Finish />
      <HUD />
      {/* finale fade to deep navy covers everything, HUD included */}
      <AbsoluteFill style={{ background: C.navy, opacity: 0.94 * cubicInOut(seg(f, 1392, 1439)) }} />
      <Audio src={staticFile("music.wav")} />
    </AbsoluteFill>
  );
};
