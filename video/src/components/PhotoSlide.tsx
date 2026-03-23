import React from "react";
import {
  AbsoluteFill,
  Img,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
} from "remotion";
import { TRANSITION_FRAMES } from "../types";

/**
 * Ken Burns presets – each defines a start/end scale + translation
 * so every slide has a unique slow-zoom+pan direction.
 */
const KB_PRESETS = [
  { s0: 1.0, s1: 1.18, x0: 0, x1: -30, y0: 0, y1: -15 },
  { s0: 1.15, s1: 1.0, x0: -20, x1: 20, y0: 10, y1: -10 },
  { s0: 1.0, s1: 1.14, x0: 15, x1: -15, y0: -10, y1: 10 },
  { s0: 1.08, s1: 1.2, x0: 0, x1: 0, y0: 20, y1: -20 },
  { s0: 1.18, s1: 1.02, x0: -10, x1: 10, y0: -15, y1: 15 },
];

interface Props {
  src: string;
  index: number;
}

/**
 * A single photo slide with the Ken Burns (slow zoom+pan) effect.
 *
 * The slide fades in during the first TRANSITION_FRAMES and fades out
 * during the last TRANSITION_FRAMES, creating smooth cross-fades when
 * slides overlap in the Sequence timeline.
 */
export const PhotoSlide: React.FC<Props> = ({ src, index }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const kb = KB_PRESETS[index % KB_PRESETS.length];

  // Ken Burns: slow zoom + pan over the full slide duration
  const progress = frame / durationInFrames;
  const eased = Easing.inOut(Easing.quad)(progress);

  const scale = kb.s0 + (kb.s1 - kb.s0) * eased;
  const tx = kb.x0 + (kb.x1 - kb.x0) * eased;
  const ty = kb.y0 + (kb.y1 - kb.y0) * eased;

  // Cross-fade: fade in → hold → fade out
  const opacity = interpolate(
    frame,
    [0, TRANSITION_FRAMES, durationInFrames - TRANSITION_FRAMES, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ opacity }}>
      <div
        style={{
          width: "100%",
          height: "100%",
          overflow: "hidden",
        }}
      >
        <Img
          src={src}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: `scale(${scale}) translate(${tx}px, ${ty}px)`,
            transformOrigin: "center center",
          }}
        />
      </div>

      {/* Dark gradient at bottom for text readability */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "55%",
          background:
            "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)",
        }}
      />
    </AbsoluteFill>
  );
};
