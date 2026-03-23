"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { PropertyResponse } from "@/lib/types";
import {
  getProperty,
  publishToInstagram,
  generateVideo,
  getVideoStatus,
  getVideoDownloadUrl,
} from "@/lib/api";
import ResultCard from "@/components/ResultCard";

function ResultadoContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get("id");

  const [property, setProperty] = useState<PropertyResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Instagram publish state
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishResult, setPublishResult] = useState<{
    type: "success" | "error";
    message: string;
    url?: string;
  } | null>(null);

  // Video generation state
  const [videoStatus, setVideoStatus] = useState<
    "idle" | "rendering" | "done" | "error"
  >("idle");
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoJobId, setVideoJobId] = useState<string | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Instagram publish handler ────────────────────────────────────
  const handlePublishInstagram = async () => {
    if (!id) return;
    setShowPublishModal(false);
    setPublishing(true);
    setPublishResult(null);

    try {
      const result = await publishToInstagram(id);
      setPublishResult({
        type: "success",
        message: result.message,
        url: result.url,
      });
    } catch (err) {
      setPublishResult({
        type: "error",
        message: err instanceof Error ? err.message : "Error desconocido",
      });
    } finally {
      setPublishing(false);
    }
  };

  // ── Video generation handler ─────────────────────────────────────
  const handleGenerateVideo = useCallback(async () => {
    if (!id) return;
    setVideoStatus("rendering");
    setVideoProgress(0);
    setVideoError(null);

    try {
      const { jobId } = await generateVideo(id);
      setVideoJobId(jobId);
    } catch (err) {
      setVideoStatus("error");
      setVideoError(
        err instanceof Error ? err.message : "Error al iniciar el video"
      );
    }
  }, [id]);

  // ── Poll video status ────────────────────────────────────────────
  useEffect(() => {
    if (videoStatus !== "rendering" || !videoJobId || !id) return;

    pollRef.current = setInterval(async () => {
      try {
        const status = await getVideoStatus(id, videoJobId);
        setVideoProgress(status.progress);

        if (status.status === "done") {
          setVideoStatus("done");
          if (pollRef.current) clearInterval(pollRef.current);
        } else if (status.status === "error") {
          setVideoStatus("error");
          setVideoError(status.error || "Error durante la renderización");
          if (pollRef.current) clearInterval(pollRef.current);
        }
      } catch {
        // Network error — keep polling
      }
    }, 2000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [videoStatus, videoJobId, id]);

  // ── Load property data ───────────────────────────────────────────
  useEffect(() => {
    if (!id) {
      setError("No se proporcionó un ID de propiedad");
      setLoading(false);
      return;
    }

    getProperty(id)
      .then(setProperty)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <svg
          className="animate-spin h-10 w-10 text-primary-500 mb-4"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
        <p className="text-gray-500">Cargando resultados...</p>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500 text-lg mb-4">
          {error || "Error desconocido"}
        </p>
        <button
          onClick={() => router.push("/")}
          className="bg-primary-500 text-white px-6 py-2 rounded-lg hover:bg-primary-600 transition-colors"
        >
          Volver al formulario
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Property Summary */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <span className="inline-block bg-primary-100 text-primary-700 text-xs font-medium px-2.5 py-1 rounded-full mb-2">
              {property.tipo_propiedad} en {property.operacion}
            </span>
            <h2 className="text-xl font-bold text-gray-800">
              {property.direccion}
            </h2>
            <p className="text-gray-500 text-sm">
              {property.ciudad}, {property.provincia}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary-600">
              $
              {property.precio.toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </p>
            <p className="text-xs text-gray-400">USD</p>
          </div>
        </div>

        <div className="flex gap-4 mt-4 text-sm text-gray-600">
          {property.recamaras !== null && (
            <span>{property.recamaras} rec.</span>
          )}
          {property.banos !== null && <span>{property.banos} baños</span>}
          {property.metros_construidos !== null && (
            <span>{property.metros_construidos} m² const.</span>
          )}
          <span>{property.metros_terreno} m² terreno</span>
          {property.estacionamientos > 0 && (
            <span>{property.estacionamientos} est.</span>
          )}
        </div>
      </div>

      {/* Generated Content */}
      <div className="space-y-6">
        {property.descripcion_generada && (
          <ResultCard
            title="Descripción Profesional"
            content={property.descripcion_generada}
          />
        )}

        {property.instagram_copy && (
          <ResultCard
            title="Copy para Instagram"
            content={property.instagram_copy}
          />
        )}
      </div>

      {/* Video Generation Card */}
      <div className="mt-6 bg-white rounded-xl shadow-md border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
            <svg
              className="w-5 h-5 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-gray-800">Video Reel</h3>
            <p className="text-xs text-gray-500">
              Video vertical 1080x1920 para Instagram y TikTok
            </p>
          </div>
        </div>

        {videoStatus === "idle" && (
          <button
            onClick={handleGenerateVideo}
            className="w-full inline-flex items-center justify-center gap-2 bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors font-medium shadow-md"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Generar Video Reel
          </button>
        )}

        {videoStatus === "rendering" && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Renderizando video...
              </span>
              <span className="text-sm font-bold text-red-600">
                {Math.round(videoProgress * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-red-500 to-orange-500 h-3 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${Math.max(videoProgress * 100, 2)}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Esto puede tomar 1-2 minutos. No cierres esta pagina.
            </p>
          </div>
        )}

        {videoStatus === "done" && videoJobId && id && (
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-2 text-green-600 mb-1">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="font-medium text-sm">Video listo</span>
            </div>
            <div className="flex gap-3">
              <a
                href={getVideoDownloadUrl(id, videoJobId)}
                download
                className="inline-flex items-center gap-2 bg-red-500 text-white px-6 py-2.5 rounded-lg hover:bg-red-600 transition-colors font-medium shadow-md"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                Descargar Video
              </a>
              <button
                onClick={() => {
                  setVideoStatus("idle");
                  setVideoJobId(null);
                  setVideoProgress(0);
                }}
                className="px-4 py-2.5 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                Generar otro
              </button>
            </div>
          </div>
        )}

        {videoStatus === "error" && (
          <div>
            <div className="flex items-center gap-2 text-red-600 mb-3">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-sm font-medium">
                {videoError || "Error al generar el video"}
              </span>
            </div>
            <button
              onClick={() => {
                setVideoStatus("idle");
                setVideoError(null);
              }}
              className="text-sm text-primary-600 hover:underline"
            >
              Intentar de nuevo
            </button>
          </div>
        )}
      </div>

      {/* Publish Result Toast */}
      {publishResult && (
        <div
          className={`mt-6 p-4 rounded-lg border ${
            publishResult.type === "success"
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          <div className="flex items-start gap-3">
            {publishResult.type === "success" ? (
              <svg
                className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            )}
            <div className="flex-1">
              <p className="font-medium">{publishResult.message}</p>
              {publishResult.url && (
                <a
                  href={publishResult.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm underline mt-1 inline-block"
                >
                  Ver publicación en Instagram
                </a>
              )}
            </div>
            <button
              onClick={() => setPublishResult(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 flex-wrap">
        <a
          href={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/properties/${id}/pdf`}
          download
          className="inline-flex items-center gap-2 bg-primary-500 text-white px-6 py-3 rounded-lg hover:bg-primary-600 transition-colors font-medium shadow-md hover:shadow-lg"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Descargar PDF
        </a>
        <a
          href={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/properties/${id}/instagram-image`}
          download
          className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all font-medium shadow-md hover:shadow-lg"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          Descargar Imagen Instagram
        </a>
        <button
          onClick={() => setShowPublishModal(true)}
          disabled={publishing}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-pink-600 text-white px-6 py-3 rounded-lg hover:from-orange-600 hover:to-pink-700 transition-all font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {publishing ? (
            <>
              <svg
                className="animate-spin w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Publicando...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
              </svg>
              Publicar en Instagram
            </>
          )}
        </button>
        <button
          onClick={() => router.push("/")}
          className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium"
        >
          Crear nueva publicación
        </button>
      </div>

      {/* Confirmation Modal */}
      {showPublishModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in">
            <div className="text-center">
              <div className="mx-auto w-14 h-14 bg-gradient-to-r from-orange-500 to-pink-600 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-7 h-7 text-white"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Publicar en Instagram
              </h3>
              <p className="text-gray-500 text-sm mb-6">
                Se generará la imagen de la propiedad y se publicará directamente
                en tu cuenta de Instagram con el copy generado por IA.
              </p>
            </div>

            {/* Preview of what will be posted */}
            <div className="bg-gray-50 rounded-lg p-3 mb-6 max-h-32 overflow-y-auto">
              <p className="text-xs text-gray-400 font-medium mb-1">
                CAPTION PREVIEW
              </p>
              <p className="text-xs text-gray-600 whitespace-pre-line leading-relaxed">
                {property.instagram_copy
                  ? property.instagram_copy.substring(0, 200) +
                    (property.instagram_copy.length > 200 ? "..." : "")
                  : "Sin copy generado"}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowPublishModal(false)}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handlePublishInstagram}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-pink-600 text-white rounded-lg hover:from-orange-600 hover:to-pink-700 transition-all font-medium"
              >
                Confirmar y publicar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ResultadoPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-gray-500">Cargando...</p>
        </div>
      }
    >
      <ResultadoContent />
    </Suspense>
  );
}
