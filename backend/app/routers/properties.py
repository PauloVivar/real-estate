import json
from typing import Optional
from uuid import UUID

import httpx
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from fastapi.responses import Response, StreamingResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.property import GenerationResponse, PropertyResponse
from app.services.instagram_image_service import generate_instagram_image
from app.services.pdf_service import generate_property_pdf
from app.services.property_service import (
    create_property,
    get_property,
    regenerate_content,
    save_photos,
)
from app.services.upload_post_service import UploadPostError, publish_to_instagram

VIDEO_SERVICE_URL = "http://video:3001"

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


@router.get("/properties/{property_id}/instagram-image")
def download_instagram_image(property_id: UUID, db: Session = Depends(get_db)):
    prop = get_property(db, property_id)
    if not prop:
        raise HTTPException(status_code=404, detail="Propiedad no encontrada")

    image_bytes = generate_instagram_image(prop)

    filename = f"instagram_{prop.tipo_propiedad}_{prop.ciudad}.png".replace(" ", "_")
    return Response(
        content=image_bytes,
        media_type="image/png",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.post("/properties/{property_id}/publish-instagram")
async def publish_instagram_endpoint(
    property_id: UUID, db: Session = Depends(get_db)
):
    prop = get_property(db, property_id)
    if not prop:
        raise HTTPException(status_code=404, detail="Propiedad no encontrada")

    # Generate the Instagram image
    image_bytes = generate_instagram_image(prop)

    # Build the caption from the stored instagram_copy
    caption = prop.instagram_copy or ""

    filename = f"instagram_{prop.tipo_propiedad}_{prop.ciudad}.png".replace(" ", "_")

    try:
        result = await publish_to_instagram(
            image_bytes=image_bytes,
            caption=caption,
            filename=filename,
        )
        return result
    except UploadPostError as e:
        raise HTTPException(
            status_code=e.status_code or 500,
            detail=e.message,
        )


# ── Video generation endpoints ────────────────────────────────────────


@router.post("/properties/{property_id}/generate-video")
async def generate_video_endpoint(
    property_id: UUID, db: Session = Depends(get_db)
):
    """Start async video rendering. Returns a job_id to poll progress."""
    prop = get_property(db, property_id)
    if not prop:
        raise HTTPException(status_code=404, detail="Propiedad no encontrada")

    # Build inputProps for the Remotion composition
    input_props = {
        "photos": prop.fotos or [],
        "tipoPropiedad": prop.tipo_propiedad,
        "operacion": prop.operacion,
        "precio": float(prop.precio),
        "direccion": prop.direccion,
        "ciudad": prop.ciudad,
        "provincia": prop.provincia,
        "recamaras": prop.recamaras,
        "banos": prop.banos,
        "metrosConstruidos": float(prop.metros_construidos) if prop.metros_construidos else None,
        "metrosTerreno": float(prop.metros_terreno),
        "estacionamientos": prop.estacionamientos or 0,
        "agenteNombre": prop.agente_nombre,
        "agenteTelefono": prop.agente_telefono,
        "agenteEmail": prop.agente_email,
        "musicUrl": None,  # Set by video service if background.mp3 exists
    }

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(
                f"{VIDEO_SERVICE_URL}/render",
                json=input_props,
            )
            resp.raise_for_status()
            return resp.json()
    except httpx.ConnectError:
        raise HTTPException(
            status_code=503,
            detail="El servicio de video no está disponible. Verifica que el contenedor 'video' esté corriendo.",
        )
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail=str(e))


@router.get("/properties/{property_id}/video-status/{job_id}")
async def video_status_endpoint(property_id: UUID, job_id: str):
    """Poll render progress. Returns { status, progress, error }."""
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(f"{VIDEO_SERVICE_URL}/status/{job_id}")
            resp.raise_for_status()
            return resp.json()
    except httpx.ConnectError:
        raise HTTPException(status_code=503, detail="Servicio de video no disponible")
    except httpx.HTTPStatusError:
        raise HTTPException(status_code=404, detail="Job no encontrado")


@router.get("/properties/{property_id}/video/{job_id}")
async def download_video_endpoint(property_id: UUID, job_id: str):
    """Stream the rendered mp4 video for download."""
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.get(
                f"{VIDEO_SERVICE_URL}/download/{job_id}",
            )
            resp.raise_for_status()

            return Response(
                content=resp.content,
                media_type="video/mp4",
                headers={
                    "Content-Disposition": f'attachment; filename="reel_{job_id}.mp4"'
                },
            )
    except httpx.ConnectError:
        raise HTTPException(status_code=503, detail="Servicio de video no disponible")
    except httpx.HTTPStatusError:
        raise HTTPException(status_code=404, detail="Video no disponible")


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
