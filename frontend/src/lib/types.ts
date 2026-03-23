export interface PropertyFormData {
  tipo_propiedad: "Casa" | "Departamento" | "Terreno" | "Penthouse";
  operacion: "Venta" | "Renta";
  direccion: string;
  ciudad: string;
  provincia: string;
  precio: number;
  recamaras: number | null;
  banos: number | null;
  metros_construidos: number | null;
  metros_terreno: number;
  estacionamientos: number;
  amenidades: string[];
  descripcion_agente: string;
  fotos: File[];
  agente_nombre: string;
  agente_telefono: string;
  agente_email: string;
}

export interface GenerationResult {
  property_id: string;
  descripcion_generada: string;
  instagram_copy: string;
}

export interface PublishInstagramResult {
  success: boolean;
  message: string;
  url?: string;
  request_id?: string;
  async?: boolean;
}

export interface VideoJobResult {
  jobId: string;
}

export interface VideoStatusResult {
  status: "rendering" | "done" | "error";
  progress: number;
  error: string | null;
}

export interface PropertyResponse {
  id: string;
  tipo_propiedad: string;
  operacion: string;
  direccion: string;
  ciudad: string;
  provincia: string;
  precio: number;
  recamaras: number | null;
  banos: number | null;
  metros_construidos: number | null;
  metros_terreno: number;
  estacionamientos: number;
  amenidades: string[];
  descripcion_agente: string | null;
  fotos: string[];
  agente_nombre: string;
  agente_telefono: string;
  agente_email: string;
  descripcion_generada: string | null;
  instagram_copy: string | null;
  created_at: string;
}
