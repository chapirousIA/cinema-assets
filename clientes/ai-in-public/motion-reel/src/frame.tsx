import React, { createContext, useContext } from "react";
import { useCurrentFrame } from "remotion";

// Scenes are mounted PAD frames early (to overlap during transitions); this gives them their own clock,
// which can be negative during the incoming transition. Still driven by useCurrentFrame (motion-blur safe).
const Offset = createContext(0);
export const SceneClock: React.FC<{ offset: number; children: React.ReactNode }> = ({ offset, children }) => (
  <Offset.Provider value={offset}>{children}</Offset.Provider>
);
export const useLocal = () => useCurrentFrame() - useContext(Offset);
