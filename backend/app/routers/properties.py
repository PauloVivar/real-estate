import json
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from fastapi.responses import Response
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.property import GenerationResponse, PropertyResponse
from app.services.pdf_service import generate_property_pdf
from app.services.property_service import (
    create_property,
    get_property,
    regenerate_content,
    save_photos,
)

router = APIRouter()


@router.post("/properties", response_model=GenerationResponse)
async def create_property_endpoint(
    tipo_propiedad: str = Form(...),
    operacion: str = Form(...),
    direccion: str = Form(...),
    ciudad: str = Form(...),
    provincia: str = Form(...),
    precio: float = Form(...),
    recamaras: Optional[int] = Form(None),
    banos: Optional[int] = Form(None),
    metros_construidos: Optional[float] = Form(None),
    metros_terreno: float = Form(...),
    estacionamientos: int = Form(0),
    amenidades: str = Form("[]"),
    descripcion_agente: Optional[str] = Form(None),
    agente_nombre: str = Form(...),
    agente_telefono: str = Form(...),
    agente_email: str = Form(...),
    fotos: list[UploadFile] = File(...),
    db: Session = Depends(get_db),
):
    photo_paths = await save_photos(fotos)

    data = {
        "tipo_propiedad": tipo_propiedad,
        "operacion": operacion,
        "direccion": direccion,
        "ciudad": ciudad,
        "provincia": provincia,
        "precio": precio,
        "recamaras": recamaras,
        "banos": banos,
        "metros_construidos": metros_construidos,
        "metros_terreno": metros_terreno,
        "estacionamientos": estacionamientos,
        "amenidades": json.loads(amenidades),
        "descripcion_agente": descripcion_agente,
        "agente_nombre": agente_nombre,
        "agente_telefono": agente_telefono,
        "agente_email": agente_email,
    }

    prop = create_property(db, data, photo_paths)

    return GenerationResponse(
        property_id=prop.id,
        descripcion_generada=prop.descripcion_generada,
        instagram_copy=prop.instagram_copy,
    )


@router.get("/properties/{property_id}", response_model=PropertyResponse)
def get_property_endpoint(property_id: UUID, db: Session = Depends(get_db)):
    prop = get_property(db, property_id)
    if not prop:
        raise HTTPException(status_code=404, detail="Propiedad no encontrada")
    return prop


@router.get("/properties/{property_id}/pdf")
def download_pdf(property_id: UUID, db: Session = Depends(get_db)):
    prop = get_property(db, property_id)
    if not prop:
        raise HTTPException(status_code=404, detail="Propiedad no encontrada")

    pdf_bytes = generate_property_pdf(prop)

    filename = f"propiedad_{prop.tipo_propiedad}_{prop.ciudad}.pdf".replace(" ", "_")
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.post("/properties/{property_id}/regenerate", response_model=GenerationResponse)
def regenerate_endpoint(property_id: UUID, db: Session = Depends(get_db)):
    prop = get_property(db, property_id)
    if not prop:
        raise HTTPException(status_code=404, detail="Propiedad no encontrada")

    prop = regenerate_content(db, prop)

    return GenerationResponse(
        property_id=prop.id,
        descripcion_generada=prop.descripcion_generada,
        instagram_copy=prop.instagram_copy,
    )
