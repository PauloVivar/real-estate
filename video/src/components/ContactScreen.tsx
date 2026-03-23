import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from "remotion";
import { PropertyVideoProps } from "../types";
import { AnimatedText } from "./AnimatedText";

interface Props {
  data: PropertyVideoProps;
}

/**
 * Final screen showing the agent's contact info.
 *
 * Each element enters with a staggered slide-up animation,
 * creating a professional cascading reveal.
 */
export const ContactScreen: React.FC<Props> = ({ data }) => {
  const frame = useCurrentFrame();

  // Background fade-in
  const bgOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Decorative line width animation
  const lineWidth = interpolate(frame, [15, 50], [0, 300], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  return (
    <AbsoluteFill
      style={{
        opacity: bgOpacity,
        background: "linear-gradient(160deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 80,
      }}
    >
      {/* Top decorative element */}
      <AnimatedText delay={10}>
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: 20,
            background: "linear-gradient(135deg, #2563eb, #7c3aed)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 40,
          }}
        >
          <span
            style={{
              fontFamily: "sans-serif",
              fontSize: 36,
              fontWeight: 900,
              color: "white",
            }}
          >
            VH
          </span>
        </div>
      </AnimatedText>

      {/* Title */}
      <AnimatedText delay={20}>
        <div
          style={{
            fontFamily: "sans-serif",
            fontSize: 30,
            fontWeight: 600,
            color: "rgba(255,255,255,0.5)",
            letterSpacing: 8,
            textTransform: "uppercase",
            marginBottom: 16,
          }}
        >
          Contacto
        </div>
      </AnimatedText>

      {/* Decorative line */}
      <div
        style={{
          width: lineWidth,
          height: 3,
          background: "linear-gradient(90deg, transparent, #2563eb, transparent)",
          marginBottom: 50,
          borderRadius: 2,
        }}
      />

      {/* Agent name */}
      <AnimatedText delay={30}>
        <div
          style={{
            fontFamily: "sans-serif",
            fontSize: 52,
            fontWeight: 800,
            color: "white",
            textAlign: "center",
            marginBottom: 50,
            textShadow: "0 2px 20px rgba(37,99,235,0.3)",
          }}
        >
          {data.agenteNombre}
        </div>
      </AnimatedText>

      {/* Phone */}
      <AnimatedText delay={45}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            marginBottom: 30,
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: "rgba(37,99,235,0.2)",
              border: "1px solid rgba(37,99,235,0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="#60a5fa">
              <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
            </svg>
          </div>
          <span
            style={{
              fontFamily: "sans-serif",
              fontSize: 38,
              color: "rgba(255,255,255,0.9)",
              fontWeight: 500,
            }}
          >
            {data.agenteTelefono}
          </span>
        </div>
      </AnimatedText>

      {/* Email */}
      <AnimatedText delay={55}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            marginBottom: 30,
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: "rgba(37,99,235,0.2)",
              border: "1px solid rgba(37,99,235,0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="#60a5fa">
              <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
            </svg>
          </div>
          <span
            style={{
              fontFamily: "sans-serif",
              fontSize: 34,
              color: "rgba(255,255,255,0.9)",
              fontWeight: 500,
            }}
          >
            {data.agenteEmail}
          </span>
        </div>
      </AnimatedText>

      {/* Property summary reminder */}
      <AnimatedText delay={70} style={{ marginTop: 40 }}>
        <div
          style={{
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: 20,
            padding: "24px 40px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontFamily: "sans-serif",
              fontSize: 26,
              color: "rgba(255,255,255,0.5)",
              marginBottom: 8,
            }}
          >
            {data.tipoPropiedad} en {data.operacion}
          </div>
          <div
            style={{
              fontFamily: "sans-serif",
              fontSize: 40,
              fontWeight: 800,
              color: "white",
            }}
          >
            $
            {data.precio >= 1_000_000
              ? `${(data.precio / 1_000_000).toFixed(2)}M`
              : data.precio.toLocaleString("en-US")}{" "}
            USD
          </div>
          <div
            style={{
              fontFamily: "sans-serif",
              fontSize: 24,
              color: "rgba(255,255,255,0.6)",
              marginTop: 6,
            }}
          >
            {data.direccion}, {data.ciudad}
          </div>
        </div>
      </AnimatedText>
    </AbsoluteFill>
  );
};
