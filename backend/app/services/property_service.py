import json
import uuid
from pathlib import Path

from fastapi import UploadFile
from sqlalchemy.orm import Session

from app.models.property import Property
from app.services.openai_service import generate_description, generate_instagram_copy

UPLOAD_DIR = Path("uploads")


async def save_photos(files: list[UploadFile]) -> list[str]:
    UPLOAD_DIR.mkdir(exist_ok=True)
    paths = []
    for file in files:
        ext = Path(file.filename).suffix if file.filename else ".jpg"
        filename = f"{uuid.uuid4()}{ext}"
        file_path = UPLOAD_DIR / filename
        content = await file.read()
        file_path.write_bytes(content)
        paths.append(f"/uploads/{filename}")
    return paths


def create_property(db: Session, data: dict, photo_paths: list[str]) -> Property:
    prop = Property(
        tipo_propiedad=data["tipo_propiedad"],
        operacion=data["operacion"],
        direccion=data["direccion"],
        ciudad=data["ciudad"],
        provincia=data["provincia"],
        precio=data["precio"],
        recamaras=data.get("recamaras"),
        banos=data.get("banos"),
        metros_construidos=data.get("metros_construidos"),
        metros_terreno=data["metros_terreno"],
        estacionamientos=data.get("estacionamientos", 0),
        amenidades=data.get("amenidades", []),
        descripcion_agente=data.get("descripcion_agente"),
        fotos=photo_paths,
        agente_nombre=data["agente_nombre"],
        agente_telefono=data["agente_telefono"],
        agente_email=data["agente_email"],
    )

    # Generate AI content
    descripcion = generate_description(data)
    instagram = generate_instagram_copy(data)

    prop.descripcion_generada = descripcion
    prop.instagram_copy = instagram

    db.add(prop)
    db.commit()
    db.refresh(prop)
    return prop


def get_property(db: Session, property_id: uuid.UUID) -> Property | None:
    return db.query(Property).filter(Property.id == property_id).first()


def regenerate_content(db: Session, prop: Property) -> Property:
    data = {
        "tipo_propiedad": prop.tipo_propiedad,
        "operacion": prop.operacion,
        "direccion": prop.direccion,
        "ciudad": prop.ciudad,
        "provincia": prop.provincia,
        "precio": float(prop.precio),
        "recamaras": prop.recamaras,
        "banos": prop.banos,
        "metros_construidos": float(prop.metros_construidos) if prop.metros_construidos else None,
        "metros_terreno": float(prop.metros_terreno),
        "estacionamientos": prop.estacionamientos,
        "amenidades": prop.amenidades or [],
        "descripcion_agente": prop.descripcion_agente,
        "agente_nombre": prop.agente_nombre,
        "agente_telefono": prop.agente_telefono,
        "agente_email": prop.agente_email,
    }

    prop.descripcion_generada = generate_description(data)
    prop.instagram_copy = generate_instagram_copy(data)

    db.commit()
    db.refresh(prop)
    return prop
