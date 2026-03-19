"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PropertyFormData } from "@/lib/types";
import { createProperty } from "@/lib/api";
import AmenityCheckboxes from "./AmenityCheckboxes";
import PhotoUploader from "./PhotoUploader";
import AgentInfoFields from "./AgentInfoFields";

const PROVINCIAS = [
  "Azuay",
  "Bolívar",
  "Cañar",
  "Carchi",
  "Chimborazo",
  "Cotopaxi",
  "El Oro",
  "Esmeraldas",
  "Galápagos",
  "Guayas",
  "Imbabura",
  "Loja",
  "Los Ríos",
  "Manabí",
  "Morona Santiago",
  "Napo",
  "Orellana",
  "Pastaza",
  "Pichincha",
  "Santa Elena",
  "Santo Domingo de los Tsáchilas",
  "Sucumbíos",
  "Tungurahua",
  "Zamora Chinchipe",
];

export default function PropertyForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<PropertyFormData>({
    tipo_propiedad: "Casa",
    operacion: "Venta",
    direccion: "",
    ciudad: "",
    provincia: "",
    precio: 0,
    recamaras: null,
    banos: null,
    metros_construidos: null,
    metros_terreno: 0,
    estacionamientos: 0,
    amenidades: [],
    descripcion_agente: "",
    fotos: [],
    agente_nombre: "",
    agente_telefono: "",
    agente_email: "",
  });

  const updateField = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (form.fotos.length === 0) {
      setError("Debes subir al menos una foto de la propiedad.");
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("tipo_propiedad", form.tipo_propiedad);
      formData.append("operacion", form.operacion);
      formData.append("direccion", form.direccion);
      formData.append("ciudad", form.ciudad);
      formData.append("provincia", form.provincia);
      formData.append("precio", form.precio.toString());
      if (form.recamaras !== null)
        formData.append("recamaras", form.recamaras.toString());
      if (form.banos !== null)
        formData.append("banos", form.banos.toString());
      if (form.metros_construidos !== null)
        formData.append(
          "metros_construidos",
          form.metros_construidos.toString()
        );
      formData.append("metros_terreno", form.metros_terreno.toString());
      formData.append("estacionamientos", form.estacionamientos.toString());
      formData.append("amenidades", JSON.stringify(form.amenidades));
      formData.append("descripcion_agente", form.descripcion_agente);
      formData.append("agente_nombre", form.agente_nombre);
      formData.append("agente_telefono", form.agente_telefono);
      formData.append("agente_email", form.agente_email);

      form.fotos.forEach((file) => {
        formData.append("fotos", file);
      });

      const result = await createProperty(formData);
      router.push(`/resultado?id=${result.property_id}`);
    } catch (err: any) {
      setError(err.message || "Error al procesar la solicitud");
    } finally {
      setLoading(false);
    }
  };

  const isTerrenoType = form.tipo_propiedad === "Terreno";

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Información de la Propiedad */}
      <section className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Información de la Propiedad
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de propiedad *
            </label>
            <select
              value={form.tipo_propiedad}
              onChange={(e) => updateField("tipo_propiedad", e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
            >
              <option value="Casa">Casa</option>
              <option value="Departamento">Departamento</option>
              <option value="Terreno">Terreno</option>
              <option value="Penthouse">Penthouse</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Operación *
            </label>
            <div className="flex gap-4 mt-2">
              {["Venta", "Renta"].map((op) => (
                <label
                  key={op}
                  className={`flex-1 text-center py-2 rounded-lg border cursor-pointer transition-colors ${
                    form.operacion === op
                      ? "border-primary-500 bg-primary-50 text-primary-700 font-medium"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <input
                    type="radio"
                    name="operacion"
                    value={op}
                    checked={form.operacion === op}
                    onChange={(e) => updateField("operacion", e.target.value)}
                    className="sr-only"
                  />
                  {op}
                </label>
              ))}
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dirección / Ubicación *
            </label>
            <input
              type="text"
              value={form.direccion}
              onChange={(e) => updateField("direccion", e.target.value)}
              placeholder="Ej: Av. 6 de Diciembre y Colón, sector La Mariscal"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ciudad *
            </label>
            <input
              type="text"
              value={form.ciudad}
              onChange={(e) => updateField("ciudad", e.target.value)}
              placeholder="Ej: Quito"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Provincia *
            </label>
            <select
              value={form.provincia}
              onChange={(e) => updateField("provincia", e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              required
            >
              <option value="">Selecciona una provincia</option>
              {PROVINCIAS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Características */}
      <section className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Características
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Precio (USD) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500 text-sm">
                $
              </span>
              <input
                type="number"
                value={form.precio || ""}
                onChange={(e) =>
                  updateField("precio", parseFloat(e.target.value) || 0)
                }
                className="w-full rounded-lg border border-gray-300 pl-7 pr-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>
          {!isTerrenoType && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Recámaras
                </label>
                <input
                  type="number"
                  value={form.recamaras ?? ""}
                  onChange={(e) =>
                    updateField(
                      "recamaras",
                      e.target.value ? parseInt(e.target.value) : null
                    )
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Baños
                </label>
                <input
                  type="number"
                  value={form.banos ?? ""}
                  onChange={(e) =>
                    updateField(
                      "banos",
                      e.target.value ? parseInt(e.target.value) : null
                    )
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Metros construidos (m²)
                </label>
                <input
                  type="number"
                  value={form.metros_construidos ?? ""}
                  onChange={(e) =>
                    updateField(
                      "metros_construidos",
                      e.target.value ? parseFloat(e.target.value) : null
                    )
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                  min="0"
                />
              </div>
            </>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Metros de terreno (m²) *
            </label>
            <input
              type="number"
              value={form.metros_terreno || ""}
              onChange={(e) =>
                updateField("metros_terreno", parseFloat(e.target.value) || 0)
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              min="0"
              required
            />
          </div>
          {!isTerrenoType && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estacionamientos
              </label>
              <input
                type="number"
                value={form.estacionamientos}
                onChange={(e) =>
                  updateField(
                    "estacionamientos",
                    parseInt(e.target.value) || 0
                  )
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                min="0"
              />
            </div>
          )}
        </div>
      </section>

      {/* Amenidades */}
      {!isTerrenoType && (
        <section className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Amenidades
          </h2>
          <AmenityCheckboxes
            selected={form.amenidades}
            onChange={(amenidades) => updateField("amenidades", amenidades)}
          />
        </section>
      )}

      {/* Fotos */}
      <section className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Fotos de la Propiedad
        </h2>
        <PhotoUploader
          files={form.fotos}
          onChange={(fotos) => updateField("fotos", fotos)}
        />
      </section>

      {/* Descripción del Agente */}
      <section className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Descripción Breve
        </h2>
        <textarea
          value={form.descripcion_agente}
          onChange={(e) => updateField("descripcion_agente", e.target.value)}
          placeholder="Escribe 2-3 líneas sobre lo que más destaca de esta propiedad..."
          rows={3}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
        />
      </section>

      {/* Datos del Agente */}
      <section className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Datos del Agente
        </h2>
        <AgentInfoFields
          nombre={form.agente_nombre}
          telefono={form.agente_telefono}
          email={form.agente_email}
          onChange={(field, value) => updateField(field, value)}
        />
      </section>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className={`w-full py-4 rounded-xl text-white font-semibold text-lg transition-colors ${
          loading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-primary-500 hover:bg-primary-600 shadow-lg hover:shadow-xl"
        }`}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg
              className="animate-spin h-5 w-5"
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
            Generando con IA...
          </span>
        ) : (
          "Generar Descripción con IA"
        )}
      </button>
    </form>
  );
}
