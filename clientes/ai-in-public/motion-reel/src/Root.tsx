import React from "react";
import { Composition } from "remotion";
import { Reel } from "./Reel";
import { LogoMark } from "./LogoMark";
import { TL } from "./lib";

export const Root: React.FC = () => (
  <>
    <Composition id="Reel" component={Reel} durationInFrames={TL.frames} fps={TL.fps} width={1920} height={1080} />
    <Composition id="LogoMark" component={LogoMark} durationInFrames={1} fps={60} width={1024} height={1024} />
  </>
);
