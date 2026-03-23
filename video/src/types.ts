/**
 * Props passed to the Remotion composition for rendering.
 * These come from the backend via the render server's inputProps.
 */
export interface PropertyVideoProps {
  photos: string[];
  tipoPropiedad: string;
  operacion: string; // "Venta" | "Renta"
  precio: number;
  direccion: string;
  ciudad: string;
  provincia: string;
  recamaras: number | null;
  banos: number | null;
  metrosConstruidos: number | null;
  metrosTerreno: number;
  estacionamientos: number;
  agenteNombre: string;
  agenteTelefono: string;
  agenteEmail: string;
  musicUrl: string | null;
}

// ── Video timing constants ───────────────────────────────────────────
export const FPS = 30;
export const MAX_PHOTOS = 5;
export const PHOTO_DURATION_FRAMES = FPS * 5; // 5 seconds per photo
export const TRANSITION_FRAMES = FPS * 1; // 1 second fade between slides
export const CONTACT_DURATION_FRAMES = FPS * 6; // 6 seconds final screen

/**
 * Each photo effectively advances the timeline by this many frames
 * (slide duration minus overlap).
 */
export const SLIDE_STEP = PHOTO_DURATION_FRAMES - TRANSITION_FRAMES; // 120 frames

/**
 * Calculate total video duration based on number of photos.
 */
export function calculateTotalFrames(photoCount: number): number {
  const n = Math.min(Math.max(photoCount, 1), MAX_PHOTOS);
  return n * SLIDE_STEP + TRANSITION_FRAMES + CONTACT_DURATION_FRAMES;
}
