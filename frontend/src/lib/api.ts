import {
  GenerationResult,
  PropertyResponse,
  PublishInstagramResult,
} from "./types";

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

export async function publishToInstagram(
  id: string
): Promise<PublishInstagramResult> {
  const res = await fetch(`${API_URL}/api/properties/${id}/publish-instagram`, {
    method: "POST",
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    const detail = data?.detail || "Error al publicar en Instagram";
    throw new Error(detail);
  }

  return res.json();
}
