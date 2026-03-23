import React from "react";
import { Composition } from "remotion";
import { PropertyVideo } from "./PropertyVideo";
import {
  PropertyVideoProps,
  FPS,
  MAX_PHOTOS,
  calculateTotalFrames,
} from "./types";

/**
 * Remotion Root – registers the "PropertyVideo" composition.
 *
 * `calculateMetadata` makes the duration dynamic: it depends on
 * how many photos the property has (1-5 slides + contact screen).
 */
export const Root: React.FC = () => {
  const defaultProps: PropertyVideoProps = {
    photos: [],
    tipoPropiedad: "Casa",
    operacion: "Venta",
    precio: 150000,
    direccion: "Av. Principal 123",
    ciudad: "Quito",
    provincia: "Pichincha",
    recamaras: 3,
    banos: 2,
    metrosConstruidos: 120,
    metrosTerreno: 200,
    estacionamientos: 2,
    agenteNombre: "Agente Demo",
    agenteTelefono: "+593 99 123 4567",
    agenteEmail: "agente@vivarq.com",
    musicUrl: null,
  };

  return (
    <Composition
      id="PropertyVideo"
      component={PropertyVideo}
      durationInFrames={calculateTotalFrames(3)}
      fps={FPS}
      width={1080}
      height={1920}
      defaultProps={defaultProps}
      calculateMetadata={async ({ props }) => {
        const count = Math.min(
          Math.max((props as PropertyVideoProps).photos.length, 1),
          MAX_PHOTOS
        );
        return { durationInFrames: calculateTotalFrames(count) };
      }}
    />
  );
};
