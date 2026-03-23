import React from "react";
import { AbsoluteFill, Audio, Sequence } from "remotion";
import {
  PropertyVideoProps,
  MAX_PHOTOS,
  PHOTO_DURATION_FRAMES,
  CONTACT_DURATION_FRAMES,
  TRANSITION_FRAMES,
  SLIDE_STEP,
} from "./types";
import { PhotoSlide } from "./components/PhotoSlide";
import { TextOverlay } from "./components/TextOverlay";
import { ContactScreen } from "./components/ContactScreen";

/**
 * Main video composition.
 *
 * Timeline layout (with 5 photos, 30fps):
 *
 *   [0]──Photo1──[150]
 *          [120]──Photo2──[270]
 *                   [240]──Photo3──[390]
 *                            [360]──Photo4──[510]
 *                                     [480]──Photo5──[630]
 *                                              [600]──Contact──[780]
 *
 * Each photo overlaps the next by TRANSITION_FRAMES (30 frames = 1s),
 * creating smooth cross-fade transitions via the PhotoSlide's opacity.
 *
 * Text overlays appear on the first 3 slides:
 *   Slide 0 → Badge + Price
 *   Slide 1 → Location
 *   Slide 2 → Features
 */
export const PropertyVideo: React.FC<PropertyVideoProps> = (props) => {
  const photos = props.photos.slice(0, MAX_PHOTOS);
  const photoCount = Math.max(photos.length, 1);

  // Contact screen starts after the last photo's effective start
  const contactStart = photoCount * SLIDE_STEP;

  return (
    <AbsoluteFill style={{ backgroundColor: "#0f172a" }}>
      {/* ── Photo slides ────────────────────────────────────────── */}
      {photos.map((photoUrl, i) => (
        <Sequence
          key={`photo-${i}`}
          from={i * SLIDE_STEP}
          durationInFrames={PHOTO_DURATION_FRAMES}
          name={`Photo ${i + 1}`}
        >
          <PhotoSlide src={photoUrl} index={i} />
        </Sequence>
      ))}

      {/* ── Text overlays on first 3 slides ─────────────────────── */}
      {photos.slice(0, 3).map((_, i) => (
        <Sequence
          key={`text-${i}`}
          from={i * SLIDE_STEP}
          durationInFrames={PHOTO_DURATION_FRAMES}
          name={`Text overlay ${i + 1}`}
        >
          <TextOverlay slideIndex={i} data={props} />
        </Sequence>
      ))}

      {/* ── Contact screen (final) ──────────────────────────────── */}
      <Sequence
        from={contactStart}
        durationInFrames={CONTACT_DURATION_FRAMES + TRANSITION_FRAMES}
        name="Contact Screen"
      >
        <ContactScreen data={props} />
      </Sequence>

      {/* ── Background music (optional) ─────────────────────────── */}
      {props.musicUrl && (
        <Audio src={props.musicUrl} volume={0.25} startFrom={0} />
      )}
    </AbsoluteFill>
  );
};
