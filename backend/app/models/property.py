import uuid

from sqlalchemy import Column, DateTime, Numeric, SmallInteger, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB, UUID

from app.database import Base


class Property(Base):
    __tablename__ = "properties"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tipo_propiedad = Column(String(20), nullable=False)
    operacion = Column(String(10), nullable=False)
    direccion = Column(Text, nullable=False)
    ciudad = Column(String(100), nullable=False)
    provincia = Column(String(100), nullable=False)
    precio = Column(Numeric(12, 2), nullable=False)
    recamaras = Column(SmallInteger, nullable=True)
    banos = Column(SmallInteger, nullable=True)
    metros_construidos = Column(Numeric(10, 2), nullable=True)
    metros_terreno = Column(Numeric(10, 2), nullable=False)
    estacionamientos = Column(SmallInteger, default=0)
    amenidades = Column(JSONB, default=[])
    descripcion_agente = Column(Text, nullable=True)
    fotos = Column(JSONB, default=[])
    agente_nombre = Column(String(150), nullable=False)
    agente_telefono = Column(String(20), nullable=False)
    agente_email = Column(String(150), nullable=False)
    descripcion_generada = Column(Text, nullable=True)
    instagram_copy = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
