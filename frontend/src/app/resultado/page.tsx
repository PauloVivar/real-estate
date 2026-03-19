"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { PropertyResponse } from "@/lib/types";
import { getProperty } from "@/lib/api";
import ResultCard from "@/components/ResultCard";

function ResultadoContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get("id");

  const [property, setProperty] = useState<PropertyResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

      {/* Back Button */}
      <div className="mt-8 text-center">
        <button
          onClick={() => router.push("/")}
          className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium"
        >
          Crear nueva publicación
        </button>
      </div>
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
