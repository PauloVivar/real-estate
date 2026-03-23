"""
Generates a 1080x1080 Instagram-ready image for a property listing.

Uses the cover photo as background with a dark overlay,
then draws badges, price, location, and feature icons.
"""

import io
import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

# ── Font paths (Vera shipped with reportlab) ─────────────────────────
_FONT_DIR = Path("/usr/local/lib/python3.12/site-packages/reportlab/fonts")
_FONT_REGULAR = str(_FONT_DIR / "Vera.ttf")
_FONT_BOLD = str(_FONT_DIR / "VeraBd.ttf")

SIZE = 1080
PADDING = 60


def _load_font(bold: bool = False, size: int = 32) -> ImageFont.FreeTypeFont:
    path = _FONT_BOLD if bold else _FONT_REGULAR
    try:
        return ImageFont.truetype(path, size)
    except OSError:
        return ImageFont.load_default()


# ── Small icon drawers (drawn with primitives, no icon files needed) ──


def _draw_bed_icon(draw: ImageDraw.ImageDraw, x: int, y: int, s: int):
    """Simple bed icon."""
    c = "white"
    # Base
    draw.rectangle([x, y + s * 7 // 10, x + s, y + s * 8 // 10], fill=c)
    # Headboard
    draw.rectangle([x, y + s * 3 // 10, x + s // 8, y + s * 7 // 10], fill=c)
    # Mattress / pillow
    draw.rectangle(
        [x + s // 6, y + s * 4 // 10, x + s * 5 // 12, y + s * 6 // 10],
        fill=c,
        outline=c,
    )
    draw.rectangle(
        [x + s // 2, y + s * 4 // 10, x + s * 3 // 4, y + s * 6 // 10],
        fill=c,
        outline=c,
    )
    # Legs
    draw.rectangle([x, y + s * 8 // 10, x + s // 10, y + s], fill=c)
    draw.rectangle([x + s * 9 // 10, y + s * 8 // 10, x + s, y + s], fill=c)


def _draw_bath_icon(draw: ImageDraw.ImageDraw, x: int, y: int, s: int):
    """Simple bath/shower icon."""
    c = "white"
    # Tub body
    draw.rounded_rectangle(
        [x, y + s * 4 // 10, x + s, y + s * 8 // 10], radius=8, fill=c
    )
    # Water line
    draw.rectangle(
        [x + s // 8, y + s * 3 // 10, x + s * 2 // 10, y + s * 4 // 10], fill=c
    )
    # Legs
    draw.rectangle([x + s // 8, y + s * 8 // 10, x + s * 2 // 8, y + s], fill=c)
    draw.rectangle([x + s * 6 // 8, y + s * 8 // 10, x + s * 7 // 8, y + s], fill=c)


def _draw_area_icon(draw: ImageDraw.ImageDraw, x: int, y: int, s: int):
    """Simple m² / area icon (square with arrows)."""
    c = "white"
    lw = 3
    draw.rectangle([x, y, x + s, y + s], outline=c, width=lw)
    # Diagonal arrow
    draw.line([x + s // 4, y + s * 3 // 4, x + s * 3 // 4, y + s // 4], fill=c, width=lw)
    # Arrow head
    draw.polygon(
        [
            (x + s * 3 // 4, y + s // 4),
            (x + s * 3 // 4 - s // 8, y + s // 4),
            (x + s * 3 // 4, y + s // 4 + s // 8),
        ],
        fill=c,
    )


def _draw_car_icon(draw: ImageDraw.ImageDraw, x: int, y: int, s: int):
    """Simple car / parking icon."""
    c = "white"
    # Body
    draw.rounded_rectangle(
        [x, y + s * 4 // 10, x + s, y + s * 7 // 10], radius=6, fill=c
    )
    # Roof
    draw.polygon(
        [
            (x + s * 2 // 10, y + s * 4 // 10),
            (x + s * 3 // 10, y + s * 2 // 10),
            (x + s * 7 // 10, y + s * 2 // 10),
            (x + s * 8 // 10, y + s * 4 // 10),
        ],
        fill=c,
    )
    # Wheels
    r = s // 8
    draw.ellipse(
        [x + s * 2 // 10 - r, y + s * 7 // 10 - r, x + s * 2 // 10 + r, y + s * 7 // 10 + r],
        fill="#1a1a2e",
        outline=c,
        width=2,
    )
    draw.ellipse(
        [x + s * 8 // 10 - r, y + s * 7 // 10 - r, x + s * 8 // 10 + r, y + s * 7 // 10 + r],
        fill="#1a1a2e",
        outline=c,
        width=2,
    )


# ── Main generator ────────────────────────────────────────────────────


def generate_instagram_image(prop) -> bytes:
    """
    Build a 1080×1080 Instagram image from a Property ORM object.

    Returns PNG bytes.
    """

    # 1. Load cover photo (first photo in list) ───────────────────────
    cover_path = Path("uploads") / Path(prop.fotos[0]).name if prop.fotos else None

    if cover_path and cover_path.exists():
        bg = Image.open(cover_path).convert("RGBA")
    else:
        # Fallback: dark gradient
        bg = Image.new("RGBA", (SIZE, SIZE), (30, 30, 60, 255))

    # Resize & crop to 1080×1080 (cover fit)
    bg = _cover_crop(bg, SIZE, SIZE)

    # 2. Dark overlay ─────────────────────────────────────────────────
    overlay = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 160))
    bg = Image.alpha_composite(bg, overlay)

    # Add a subtle gradient at bottom for better text readability
    gradient = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    gradient_draw = ImageDraw.Draw(gradient)
    for y in range(SIZE // 2, SIZE):
        alpha = int(120 * ((y - SIZE // 2) / (SIZE // 2)))
        gradient_draw.line([(0, y), (SIZE, y)], fill=(0, 0, 0, alpha))
    bg = Image.alpha_composite(bg, gradient)

    draw = ImageDraw.Draw(bg)

    # 3. Fonts ────────────────────────────────────────────────────────
    font_badge = _load_font(bold=True, size=28)
    font_price = _load_font(bold=True, size=72)
    font_location = _load_font(bold=False, size=30)
    font_feature_value = _load_font(bold=True, size=36)
    font_feature_label = _load_font(bold=False, size=22)

    # 4. Badge ("En Venta" / "En Renta") ──────────────────────────────
    op = prop.operacion or "Venta"
    badge_text = f"EN {op.upper()}"

    badge_color = (37, 99, 235, 230) if op.lower() == "venta" else (16, 185, 129, 230)

    bbox = draw.textbbox((0, 0), badge_text, font=font_badge)
    bw, bh = bbox[2] - bbox[0], bbox[3] - bbox[1]
    badge_pad_x, badge_pad_y = 24, 12
    badge_rect = [
        PADDING,
        PADDING,
        PADDING + bw + badge_pad_x * 2,
        PADDING + bh + badge_pad_y * 2,
    ]
    _draw_rounded_rect(draw, badge_rect, radius=12, fill=badge_color)
    draw.text(
        (PADDING + badge_pad_x, PADDING + badge_pad_y),
        badge_text,
        fill="white",
        font=font_badge,
    )

    # 5. Price ─────────────────────────────────────────────────────────
    price_val = float(prop.precio)
    if price_val >= 1_000_000:
        price_text = f"${price_val / 1_000_000:,.2f}M"
    elif price_val >= 1_000:
        price_text = f"${price_val:,.0f}"
    else:
        price_text = f"${price_val:,.2f}"

    price_y = SIZE // 2 - 60
    draw.text(
        (PADDING, price_y),
        price_text,
        fill="white",
        font=font_price,
    )

    # USD label
    usd_font = _load_font(bold=False, size=28)
    price_bbox = draw.textbbox((PADDING, price_y), price_text, font=font_price)
    draw.text(
        (price_bbox[2] + 12, price_y + 40),
        "USD",
        fill=(255, 255, 255, 180),
        font=usd_font,
    )

    # 6. Location ──────────────────────────────────────────────────────
    loc_y = price_y + 100

    location_text = f"     {prop.direccion}"
    city_text = f"     {prop.ciudad}, {prop.provincia}"

    # Draw a location pin marker
    pin_x = PADDING
    pin_y = loc_y + 6
    pin_r = 8
    # Pin circle
    draw.ellipse(
        [pin_x, pin_y, pin_x + pin_r * 2, pin_y + pin_r * 2],
        fill=(239, 68, 68),
        outline="white",
        width=2,
    )
    # Pin point
    draw.polygon(
        [
            (pin_x + pin_r - 5, pin_y + pin_r * 2 - 2),
            (pin_x + pin_r + 5, pin_y + pin_r * 2 - 2),
            (pin_x + pin_r, pin_y + pin_r * 2 + 10),
        ],
        fill=(239, 68, 68),
    )
    draw.text((PADDING, loc_y), location_text, fill="white", font=font_location)
    draw.text(
        (PADDING, loc_y + 42), city_text, fill=(220, 220, 220), font=font_location
    )

    # 7. Feature icons bar ─────────────────────────────────────────────
    features = []
    if prop.recamaras is not None and prop.recamaras > 0:
        features.append(("bed", str(prop.recamaras), "Rec."))
    if prop.banos is not None and prop.banos > 0:
        features.append(("bath", str(prop.banos), "Baños"))
    if prop.metros_construidos is not None and float(prop.metros_construidos) > 0:
        features.append(("area", f"{float(prop.metros_construidos):g}", "m² const."))
    if float(prop.metros_terreno) > 0:
        features.append(("area", f"{float(prop.metros_terreno):g}", "m² terr."))
    if prop.estacionamientos is not None and prop.estacionamientos > 0:
        features.append(("car", str(prop.estacionamientos), "Est."))

    if features:
        bar_y = SIZE - PADDING - 140
        icon_size = 36
        col_width = (SIZE - PADDING * 2) // max(len(features), 1)

        # Semi-transparent bar background
        bar_bg = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
        bar_draw = ImageDraw.Draw(bar_bg)
        _draw_rounded_rect(
            bar_draw,
            [PADDING - 20, bar_y - 20, SIZE - PADDING + 20, bar_y + 120],
            radius=16,
            fill=(255, 255, 255, 30),
        )
        bg = Image.alpha_composite(bg, bar_bg)
        draw = ImageDraw.Draw(bg)

        # Separator line above features
        draw.line(
            [(PADDING, bar_y - 25), (SIZE - PADDING, bar_y - 25)],
            fill=(255, 255, 255, 80),
            width=1,
        )

        for i, (icon_type, value, label) in enumerate(features):
            cx = PADDING + col_width * i + col_width // 2

            # Draw icon
            icon_x = cx - icon_size // 2
            icon_y = bar_y
            if icon_type == "bed":
                _draw_bed_icon(draw, icon_x, icon_y, icon_size)
            elif icon_type == "bath":
                _draw_bath_icon(draw, icon_x, icon_y, icon_size)
            elif icon_type == "area":
                _draw_area_icon(draw, icon_x, icon_y, icon_size)
            elif icon_type == "car":
                _draw_car_icon(draw, icon_x, icon_y, icon_size)

            # Value
            v_bbox = draw.textbbox((0, 0), value, font=font_feature_value)
            v_w = v_bbox[2] - v_bbox[0]
            draw.text(
                (cx - v_w // 2, bar_y + icon_size + 8),
                value,
                fill="white",
                font=font_feature_value,
            )

            # Label
            l_bbox = draw.textbbox((0, 0), label, font=font_feature_label)
            l_w = l_bbox[2] - l_bbox[0]
            draw.text(
                (cx - l_w // 2, bar_y + icon_size + 48),
                label,
                fill=(200, 200, 200),
                font=font_feature_label,
            )

    # 8. Convert to RGB and return PNG bytes ──────────────────────────
    final = bg.convert("RGB")
    buf = io.BytesIO()
    final.save(buf, format="PNG", quality=95)
    return buf.getvalue()


# ── Helpers ───────────────────────────────────────────────────────────


def _cover_crop(img: Image.Image, target_w: int, target_h: int) -> Image.Image:
    """Resize and center-crop to fill target dimensions."""
    iw, ih = img.size
    scale = max(target_w / iw, target_h / ih)
    new_w = math.ceil(iw * scale)
    new_h = math.ceil(ih * scale)
    img = img.resize((new_w, new_h), Image.LANCZOS)

    left = (new_w - target_w) // 2
    top = (new_h - target_h) // 2
    return img.crop((left, top, left + target_w, top + target_h))


def _draw_rounded_rect(
    draw: ImageDraw.ImageDraw,
    coords: list,
    radius: int = 10,
    fill=None,
):
    """Draw a rounded rectangle (Pillow ≥ 8.2 has this built-in)."""
    draw.rounded_rectangle(coords, radius=radius, fill=fill)
