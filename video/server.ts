/**
 * Remotion Render Server
 *
 * Express API that bundles the Remotion project on startup and handles
 * async video render requests. The backend calls this service to
 * generate property videos.
 *
 * Endpoints:
 *   POST /render       → start a new render job, returns { jobId }
 *   GET  /status/:id   → poll render progress, returns { status, progress }
 *   GET  /download/:id → download the finished .mp4 file
 */

import express from "express";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";

// ── Types ────────────────────────────────────────────────────────────

interface RenderJob {
  status: "rendering" | "done" | "error";
  progress: number;
  outputPath?: string;
  error?: string;
}

// ── State ────────────────────────────────────────────────────────────

const jobs = new Map<string, RenderJob>();
let bundleLocation: string | null = null;

const OUTPUT_DIR = path.resolve("/app/output");
const UPLOADS_DIR = path.resolve("/app/uploads");
const MUSIC_DIR = path.resolve("/app/public/music");
const PORT = 3001;

// ── Express setup ────────────────────────────────────────────────────

const app = express();
app.use(express.json({ limit: "10mb" }));

// Serve uploaded photos so Remotion's Chrome can fetch them
app.use("/uploads", express.static(UPLOADS_DIR));

// Serve music files
app.use("/music", express.static(MUSIC_DIR));

// ── POST /render ─────────────────────────────────────────────────────

app.post("/render", async (req, res) => {
  if (!bundleLocation) {
    return res.status(503).json({ error: "Server still bundling, try again shortly" });
  }

  const jobId = uuidv4();
  const outputPath = path.join(OUTPUT_DIR, `${jobId}.mp4`);

  jobs.set(jobId, { status: "rendering", progress: 0 });

  // Build photo URLs that Remotion's Chrome can reach
  const props = { ...req.body };
  if (props.photos && Array.isArray(props.photos)) {
    props.photos = props.photos.map((p: string) => {
      // Convert /uploads/file.jpg → http://localhost:PORT/uploads/file.jpg
      const filename = path.basename(p);
      return `http://localhost:${PORT}/uploads/${filename}`;
    });
  }

  // Check for background music
  const musicFile = path.join(MUSIC_DIR, "background.mp3");
  if (fs.existsSync(musicFile)) {
    props.musicUrl = `http://localhost:${PORT}/music/background.mp3`;
  } else {
    props.musicUrl = null;
  }

  // Fire and forget – render in background
  renderVideo(jobId, props, outputPath).catch((err) => {
    console.error(`Render ${jobId} failed:`, err);
    jobs.set(jobId, {
      status: "error",
      progress: 0,
      error: err instanceof Error ? err.message : String(err),
    });
  });

  res.json({ jobId });
});

// ── GET /status/:jobId ───────────────────────────────────────────────

app.get("/status/:jobId", (req, res) => {
  const job = jobs.get(req.params.jobId);
  if (!job) {
    return res.status(404).json({ error: "Job not found" });
  }
  res.json({
    status: job.status,
    progress: Math.round(job.progress * 100) / 100,
    error: job.error || null,
  });
});

// ── GET /download/:jobId ─────────────────────────────────────────────

app.get("/download/:jobId", (req, res) => {
  const job = jobs.get(req.params.jobId);
  if (!job || job.status !== "done" || !job.outputPath) {
    return res.status(404).json({ error: "Video not ready" });
  }
  res.download(job.outputPath, `reel_${req.params.jobId}.mp4`);
});

// ── Render logic ─────────────────────────────────────────────────────

async function renderVideo(
  jobId: string,
  inputProps: Record<string, unknown>,
  outputPath: string
): Promise<void> {
  if (!bundleLocation) throw new Error("Bundle not ready");

  console.log(`[${jobId}] Selecting composition...`);

  const composition = await selectComposition({
    serveUrl: bundleLocation,
    id: "PropertyVideo",
    inputProps,
  });

  console.log(
    `[${jobId}] Rendering ${composition.durationInFrames} frames at ${composition.fps}fps...`
  );

  await renderMedia({
    composition,
    serveUrl: bundleLocation,
    codec: "h264",
    outputLocation: outputPath,
    inputProps,
    onProgress: ({ progress }) => {
      const job = jobs.get(jobId);
      if (job) {
        job.progress = progress;
      }
    },
  });

  console.log(`[${jobId}] Render complete → ${outputPath}`);
  jobs.set(jobId, { status: "done", progress: 1, outputPath });
}

// ── Startup ──────────────────────────────────────────────────────────

async function main() {
  console.log("Bundling Remotion project...");

  try {
    bundleLocation = await bundle({
      entryPoint: path.resolve(__dirname, "src/index.ts"),
      webpackOverride: (config) => config,
    });
    console.log(`Bundle ready at: ${bundleLocation}`);
  } catch (err) {
    console.error("Failed to bundle:", err);
    process.exit(1);
  }

  // Ensure output directory exists
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  app.listen(PORT, () => {
    console.log(`Render server listening on port ${PORT}`);
  });
}

main();
