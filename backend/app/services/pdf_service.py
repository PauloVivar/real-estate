import io
import os
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch, mm
from reportlab.lib.utils import ImageReader
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    Image,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)

BRAND_COLOR = colors.HexColor("#2563eb")
BRAND_DARK = colors.HexColor("#1e3a8a")
GRAY_TEXT = colors.HexColor("#374151")
GRAY_LIGHT = colors.HexColor("#f3f4f6")
UPLOAD_DIR = Path("uploads")


def _get_styles():
    styles = getSampleStyleSheet()

    styles.add(ParagraphStyle(
        "BrandTitle",
        parent=styles["Title"],
        fontSize=22,
        textColor=colors.white,
        spaceAfter=4,
        fontName="Helvetica-Bold",
    ))
    styles.add(ParagraphStyle(
        "BrandSubtitle",
        parent=styles["Normal"],
        fontSize=10,
        textColor=colors.HexColor("#bfdbfe"),
        fontName="Helvetica",
    ))
    styles.add(ParagraphStyle(
        "PropertyType",
        parent=styles["Normal"],
        fontSize=11,
        textColor=BRAND_COLOR,
        fontName="Helvetica-Bold",
        spaceAfter=2,
    ))
    styles.add(ParagraphStyle(
        "PropertyAddress",
        parent=styles["Normal"],
        fontSize=16,
        textColor=BRAND_DARK,
        fontName="Helvetica-Bold",
        spaceAfter=4,
    ))
    styles.add(ParagraphStyle(
        "PropertyLocation",
        parent=styles["Normal"],
        fontSize=10,
        textColor=GRAY_TEXT,
        spaceAfter=6,
    ))
    styles.add(ParagraphStyle(
        "Price",
        parent=styles["Normal"],
        fontSize=20,
        textColor=BRAND_COLOR,
        fontName="Helvetica-Bold",
        spaceAfter=12,
    ))
    styles.add(ParagraphStyle(
        "SectionTitle",
        parent=styles["Heading2"],
        fontSize=13,
        textColor=BRAND_DARK,
        fontName="Helvetica-Bold",
        spaceBefore=14,
        spaceAfter=6,
        borderPadding=(0, 0, 3, 0),
    ))
    styles.add(ParagraphStyle(
        "BodyText2",
        parent=styles["Normal"],
        fontSize=10,
        textColor=GRAY_TEXT,
        leading=14,
        spaceAfter=4,
    ))
    styles.add(ParagraphStyle(
        "AgentName",
        parent=styles["Normal"],
        fontSize=12,
        textColor=BRAND_DARK,
        fontName="Helvetica-Bold",
        spaceAfter=2,
    ))
    styles.add(ParagraphStyle(
        "AgentDetail",
        parent=styles["Normal"],
        fontSize=10,
        textColor=GRAY_TEXT,
        spaceAfter=1,
    ))

    return styles


def _header_footer(canvas, doc):
    canvas.saveState()
    # Header bar
    canvas.setFillColor(BRAND_COLOR)
    canvas.rect(0, letter[1] - 60, letter[0], 60, fill=1, stroke=0)
    # Header text
    canvas.setFillColor(colors.white)
    canvas.setFont("Helvetica-Bold", 18)
    canvas.drawString(30, letter[1] - 38, "VIVARQ HOME")
    canvas.setFont("Helvetica", 9)
    canvas.setFillColor(colors.HexColor("#bfdbfe"))
    canvas.drawString(30, letter[1] - 52, "Generador de Contenido Inmobiliario")
    # Footer
    canvas.setFillColor(GRAY_TEXT)
    canvas.setFont("Helvetica", 7)
    canvas.drawString(30, 20, "VIVARQ HOME — Hecho en Ecuador")
    canvas.drawRightString(letter[0] - 30, 20, f"Página {doc.page}")
    canvas.restoreState()


def _resolve_photo_path(photo_path: str) -> str | None:
    """Resolve a photo path relative to uploads directory."""
    if photo_path.startswith("/uploads/"):
        local = UPLOAD_DIR / photo_path.replace("/uploads/", "", 1)
    else:
        local = Path(photo_path)

    if local.exists():
        return str(local)
    return None


def _fit_image(photo_path: str, max_width: float, max_height: float) -> Image | None:
    resolved = _resolve_photo_path(photo_path)
    if not resolved:
        return None

    try:
        img = ImageReader(resolved)
        iw, ih = img.getSize()
        ratio = min(max_width / iw, max_height / ih)
        return Image(resolved, width=iw * ratio, height=ih * ratio)
    except Exception:
        return None


def generate_property_pdf(prop) -> bytes:
    """Generate a PDF for a property listing and return as bytes."""
    buffer = io.BytesIO()
    styles = _get_styles()

    frame = Frame(
        30, 40,
        letter[0] - 60, letter[1] - 110,
        id="main",
    )
    template = PageTemplate(id="main", frames=frame, onPage=_header_footer)

    doc = BaseDocTemplate(
        buffer,
        pagesize=letter,
        pageTemplates=[template],
        title=f"Propiedad - {prop.direccion}",
        author="VIVARQ HOME",
    )

    story = []

    # --- Property type badge + address ---
    story.append(Paragraph(
        f"{prop.tipo_propiedad} en {prop.operacion}",
        styles["PropertyType"],
    ))
    story.append(Paragraph(prop.direccion, styles["PropertyAddress"]))
    story.append(Paragraph(
        f"{prop.ciudad}, {prop.provincia}",
        styles["PropertyLocation"],
    ))

    # --- Price ---
    precio_fmt = f"${float(prop.precio):,.2f} USD"
    story.append(Paragraph(precio_fmt, styles["Price"]))

    # --- Cover photo ---
    fotos = prop.fotos or []
    if fotos:
        cover = _fit_image(fotos[0], letter[0] - 80, 3.5 * inch)
        if cover:
            story.append(cover)
            story.append(Spacer(1, 10))

    # --- Extra photos grid ---
    extra_photos = fotos[1:]
    if extra_photos:
        row_images = []
        for photo_path in extra_photos[:6]:
            img = _fit_image(photo_path, 1.6 * inch, 1.2 * inch)
            if img:
                row_images.append(img)

        if row_images:
            # Build rows of 3
            rows = []
            for i in range(0, len(row_images), 3):
                row = row_images[i:i + 3]
                while len(row) < 3:
                    row.append("")
                rows.append(row)

            col_width = (letter[0] - 80) / 3
            tbl = Table(rows, colWidths=[col_width] * 3)
            tbl.setStyle(TableStyle([
                ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ]))
            story.append(tbl)
            story.append(Spacer(1, 8))

    # --- Key details table ---
    story.append(Paragraph("Datos Clave", styles["SectionTitle"]))

    detail_data = []
    detail_labels = []

    if prop.recamaras is not None:
        detail_labels.append("Recámaras")
        detail_data.append(str(prop.recamaras))
    if prop.banos is not None:
        detail_labels.append("Baños")
        detail_data.append(str(prop.banos))
    if prop.metros_construidos is not None:
        detail_labels.append("m² Construidos")
        detail_data.append(f"{float(prop.metros_construidos):,.1f}")
    detail_labels.append("m² Terreno")
    detail_data.append(f"{float(prop.metros_terreno):,.1f}")
    if prop.estacionamientos and prop.estacionamientos > 0:
        detail_labels.append("Estacionamientos")
        detail_data.append(str(prop.estacionamientos))

    if detail_labels:
        n = len(detail_labels)
        col_w = (letter[0] - 80) / n
        tbl = Table(
            [detail_labels, detail_data],
            colWidths=[col_w] * n,
        )
        tbl.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), BRAND_COLOR),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, 0), 9),
            ("ALIGN", (0, 0), (-1, -1), "CENTER"),
            ("BACKGROUND", (0, 1), (-1, 1), GRAY_LIGHT),
            ("TEXTCOLOR", (0, 1), (-1, 1), BRAND_DARK),
            ("FONTNAME", (0, 1), (-1, 1), "Helvetica-Bold"),
            ("FONTSIZE", (0, 1), (-1, 1), 13),
            ("TOPPADDING", (0, 0), (-1, -1), 8),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.white),
            ("ROUNDEDCORNERS", [4, 4, 4, 4]),
        ]))
        story.append(tbl)
        story.append(Spacer(1, 6))

    # --- Amenidades ---
    amenidades = prop.amenidades or []
    if amenidades:
        story.append(Paragraph("Amenidades", styles["SectionTitle"]))
        amenidades_text = "  •  ".join(amenidades)
        story.append(Paragraph(amenidades_text, styles["BodyText2"]))
        story.append(Spacer(1, 4))

    # --- AI Description ---
    if prop.descripcion_generada:
        story.append(Paragraph("Descripción", styles["SectionTitle"]))
        for paragraph in prop.descripcion_generada.split("\n"):
            paragraph = paragraph.strip()
            if paragraph:
                story.append(Paragraph(paragraph, styles["BodyText2"]))
        story.append(Spacer(1, 4))

    # --- Agent contact ---
    story.append(Paragraph("Contacto del Agente", styles["SectionTitle"]))

    agent_table = Table(
        [
            [
                Paragraph(prop.agente_nombre, styles["AgentName"]),
            ],
            [
                Paragraph(f"Tel: {prop.agente_telefono}  |  Email: {prop.agente_email}", styles["AgentDetail"]),
            ],
        ],
        colWidths=[letter[0] - 80],
    )
    agent_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), GRAY_LIGHT),
        ("TOPPADDING", (0, 0), (-1, 0), 10),
        ("BOTTOMPADDING", (0, -1), (-1, -1), 10),
        ("LEFTPADDING", (0, 0), (-1, -1), 12),
        ("ROUNDEDCORNERS", [6, 6, 6, 6]),
    ]))
    story.append(agent_table)

    doc.build(story)
    buffer.seek(0)
    return buffer.read()
