import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";

interface Props {
  children: React.ReactNode;
  delay?: number; // frames before animation starts
  style?: React.CSSProperties;
}

/**
 * Wraps content with a fade-in + slide-up entrance animation.
 *
 * The `delay` prop staggers multiple elements so they animate
 * sequentially (e.g. title first, then price, then features).
 */
export const AnimatedText: React.FC<Props> = ({
  children,
  delay = 0,
  style,
}) => {
  const frame = useCurrentFrame();
  const t = Math.max(0, frame - delay);

  const opacity = interpolate(t, [0, 18], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const translateY = interpolate(t, [0, 22], [40, 0], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${translateY}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};
