from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr


class PropertyCreate(BaseModel):
    tipo_propiedad: str
    operacion: str
    direccion: str
    ciudad: str
    provincia: str
    precio: float
    recamaras: Optional[int] = None
    banos: Optional[int] = None
    metros_construidos: Optional[float] = None
    metros_terreno: float
    estacionamientos: int = 0
    amenidades: list[str] = []
    descripcion_agente: Optional[str] = None
    agente_nombre: str
    agente_telefono: str
    agente_email: str


class GenerationResponse(BaseModel):
    property_id: UUID
    descripcion_generada: str
    instagram_copy: str


class PropertyResponse(BaseModel):
    id: UUID
    tipo_propiedad: str
    operacion: str
    direccion: str
    ciudad: str
    provincia: str
    precio: float
    recamaras: Optional[int] = None
    banos: Optional[int] = None
    metros_construidos: Optional[float] = None
    metros_terreno: float
    estacionamientos: int
    amenidades: list[str]
    descripcion_agente: Optional[str] = None
    fotos: list[str]
    agente_nombre: str
    agente_telefono: str
    agente_email: str
    descripcion_generada: Optional[str] = None
    instagram_copy: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
