import React from "react";
import { AbsoluteFill } from "remotion";
import { PropertyVideoProps } from "../types";
import { AnimatedText } from "./AnimatedText";

interface Props {
  slideIndex: number;
  data: PropertyVideoProps;
}

/**
 * Renders different text overlays depending on the slide index:
 *   0 → Badge (En Venta/Renta) + Price
 *   1 → Location (address + city)
 *   2 → Features (beds, baths, m²)
 */
export const TextOverlay: React.FC<Props> = ({ slideIndex, data }) => {
  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        padding: "0 60px 180px 60px",
      }}
    >
      {slideIndex === 0 && <PriceOverlay data={data} />}
      {slideIndex === 1 && <LocationOverlay data={data} />}
      {slideIndex === 2 && <FeaturesOverlay data={data} />}
    </AbsoluteFill>
  );
};

/* ── Slide 0: Badge + Price ─────────────────────────────────────── */

const PriceOverlay: React.FC<{ data: PropertyVideoProps }> = ({ data }) => {
  const isVenta = data.operacion.toLowerCase() === "venta";
  const badgeColor = isVenta ? "#2563eb" : "#10b981";
  const badgeText = `EN ${data.operacion.toUpperCase()}`;

  const priceFormatted =
    data.precio >= 1_000_000
      ? `$${(data.precio / 1_000_000).toFixed(2)}M`
      : `$${data.precio.toLocaleString("en-US")}`;

  return (
    <>
      <AnimatedText delay={25}>
        <span
          style={{
            display: "inline-block",
            backgroundColor: badgeColor,
            color: "white",
            fontFamily: "sans-serif",
            fontWeight: 700,
            fontSize: 32,
            padding: "10px 28px",
            borderRadius: 14,
            letterSpacing: 2,
          }}
        >
          {badgeText}
        </span>
      </AnimatedText>

      <AnimatedText delay={38} style={{ marginTop: 24 }}>
        <div
          style={{
            fontFamily: "sans-serif",
            fontWeight: 800,
            fontSize: 96,
            color: "white",
            lineHeight: 1.1,
            textShadow: "0 4px 20px rgba(0,0,0,0.5)",
          }}
        >
          {priceFormatted}
        </div>
        <div
          style={{
            fontFamily: "sans-serif",
            fontSize: 30,
            color: "rgba(255,255,255,0.7)",
            marginTop: 4,
            letterSpacing: 4,
          }}
        >
          USD
        </div>
      </AnimatedText>

      <AnimatedText delay={50} style={{ marginTop: 16 }}>
        <div
          style={{
            fontFamily: "sans-serif",
            fontSize: 28,
            color: "rgba(255,255,255,0.8)",
            fontWeight: 500,
          }}
        >
          {data.tipoPropiedad} en {data.ciudad}
        </div>
      </AnimatedText>
    </>
  );
};

/* ── Slide 1: Location ──────────────────────────────────────────── */

const LocationOverlay: React.FC<{ data: PropertyVideoProps }> = ({ data }) => {
  return (
    <>
      <AnimatedText delay={25}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {/* Pin icon */}
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="#ef4444"
            style={{ flexShrink: 0 }}
          >
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
          </svg>
          <div
            style={{
              fontFamily: "sans-serif",
              fontSize: 44,
              fontWeight: 700,
              color: "white",
              textShadow: "0 2px 12px rgba(0,0,0,0.5)",
            }}
          >
            {data.direccion}
          </div>
        </div>
      </AnimatedText>

      <AnimatedText delay={40} style={{ marginTop: 16 }}>
        <div
          style={{
            fontFamily: "sans-serif",
            fontSize: 36,
            color: "rgba(255,255,255,0.8)",
            fontWeight: 500,
            paddingLeft: 56,
          }}
        >
          {data.ciudad}, {data.provincia}
        </div>
      </AnimatedText>
    </>
  );
};

/* ── Slide 2: Features ──────────────────────────────────────────── */

const FeaturesOverlay: React.FC<{ data: PropertyVideoProps }> = ({ data }) => {
  const features: { icon: string; value: string; label: string }[] = [];

  if (data.recamaras != null && data.recamaras > 0) {
    features.push({ icon: "bed", value: String(data.recamaras), label: "Rec." });
  }
  if (data.banos != null && data.banos > 0) {
    features.push({ icon: "bath", value: String(data.banos), label: "Banos" });
  }
  if (data.metrosConstruidos != null && data.metrosConstruidos > 0) {
    features.push({
      icon: "area",
      value: `${data.metrosConstruidos}`,
      label: "m2 const.",
    });
  }
  if (data.metrosTerreno > 0) {
    features.push({
      icon: "area",
      value: `${data.metrosTerreno}`,
      label: "m2 terr.",
    });
  }
  if (data.estacionamientos > 0) {
    features.push({
      icon: "car",
      value: String(data.estacionamientos),
      label: "Est.",
    });
  }

  return (
    <>
      <AnimatedText delay={20}>
        <div
          style={{
            fontFamily: "sans-serif",
            fontSize: 34,
            fontWeight: 600,
            color: "rgba(255,255,255,0.7)",
            marginBottom: 24,
            letterSpacing: 3,
            textTransform: "uppercase",
          }}
        >
          Caracteristicas
        </div>
      </AnimatedText>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        {features.map((f, i) => (
          <AnimatedText key={i} delay={30 + i * 8}>
            <div
              style={{
                background: "rgba(255,255,255,0.15)",
                backdropFilter: "blur(10px)",
                borderRadius: 20,
                padding: "20px 28px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                minWidth: 130,
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            >
              <FeatureIcon type={f.icon} />
              <div
                style={{
                  fontFamily: "sans-serif",
                  fontSize: 42,
                  fontWeight: 800,
                  color: "white",
                  marginTop: 8,
                }}
              >
                {f.value}
              </div>
              <div
                style={{
                  fontFamily: "sans-serif",
                  fontSize: 22,
                  color: "rgba(255,255,255,0.7)",
                  marginTop: 4,
                }}
              >
                {f.label}
              </div>
            </div>
          </AnimatedText>
        ))}
      </div>
    </>
  );
};

/* ── Feature SVG Icons ──────────────────────────────────────────── */

const FeatureIcon: React.FC<{ type: string }> = ({ type }) => {
  const size = 36;
  const color = "white";

  if (type === "bed") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <path d="M7 13c1.66 0 3-1.34 3-3S8.66 7 7 7s-3 1.34-3 3 1.34 3 3 3zm12-6h-8v7H3V5H1v15h2v-3h18v3h2v-9c0-2.21-1.79-4-4-4z" />
      </svg>
    );
  }
  if (type === "bath") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <path d="M7 5h10c1.1 0 2 .9 2 2v1h2V7c0-2.21-1.79-4-4-4H7C4.79 3 3 4.79 3 7v1h2V7c0-1.1.9-2 2-2zm14 7H3c-.55 0-1 .45-1 1v3c0 1.1.9 2 2 2h1v2h2v-2h10v2h2v-2h1c1.1 0 2-.9 2-2v-3c0-.55-.45-1-1-1z" />
      </svg>
    );
  }
  if (type === "car") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <path d="M18.92 5.01C18.72 4.42 18.16 4 17.5 4h-11c-.66 0-1.21.42-1.42 1.01L3 11v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 15c-.83 0-1.5-.67-1.5-1.5S5.67 12 6.5 12s1.5.67 1.5 1.5S7.33 15 6.5 15zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 10l1.5-4.5h11L19 10H5z" />
      </svg>
    );
  }
  // Default: area/m² icon
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M3 5v14h18V5H3zm16 12H5V7h14v10zM7 9h4v4H7z" />
    </svg>
  );
};
