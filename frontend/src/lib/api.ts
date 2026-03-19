import { GenerationResult, PropertyResponse } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function createProperty(
  formData: FormData
): Promise<GenerationResult> {
  const res = await fetch(`${API_URL}/api/properties`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Error al generar la descripción: ${error}`);
  }

  return res.json();
}

export async function getProperty(id: string): Promise<PropertyResponse> {
  const res = await fetch(`${API_URL}/api/properties/${id}`);

  if (!res.ok) {
    throw new Error("Propiedad no encontrada");
  }

  return res.json();
}
