"""
Service to publish images to Instagram via the Upload Post API.

API docs: https://docs.upload-post.com
Endpoint: POST https://api.upload-post.com/api/upload_photos
"""

import httpx

from app.config import settings

UPLOAD_POST_URL = "https://api.upload-post.com/api/upload_photos"


class UploadPostError(Exception):
    """Raised when the Upload Post API returns an error."""

    def __init__(self, message: str, status_code: int | None = None):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)


async def publish_to_instagram(
    image_bytes: bytes,
    caption: str,
    filename: str = "instagram_post.png",
) -> dict:
    """
    Upload a photo to Instagram via the Upload Post API.

    Args:
        image_bytes: The PNG image as raw bytes.
        caption: The Instagram caption/copy text.
        filename: The filename for the uploaded image.

    Returns:
        The API response as a dict with success status and details.

    Raises:
        UploadPostError: If the API key is missing or the API returns an error.
    """

    if not settings.UPLOADPOST_API_KEY:
        raise UploadPostError(
            "UPLOADPOST_API_KEY no está configurada. "
            "Agrega tu API key de Upload Post al archivo .env",
            status_code=500,
        )

    headers = {
        "Authorization": f"Apikey {settings.UPLOADPOST_API_KEY}",
    }

    async with httpx.AsyncClient(timeout=120.0) as client:
        response = await client.post(
            UPLOAD_POST_URL,
            headers=headers,
            data={
                "user": settings.UPLOADPOST_USER,
                "platform[]": "instagram",
                "title": caption,
            },
            files={
                "photos[]": (filename, image_bytes, "image/png"),
            },
        )

    body = response.json()

    if response.status_code == 401:
        raise UploadPostError("API key inválida o expirada.", status_code=401)

    if response.status_code == 429:
        usage = body.get("usage", {})
        raise UploadPostError(
            f"Límite mensual alcanzado ({usage.get('count', '?')}/{usage.get('limit', '?')}). "
            "Intenta de nuevo el próximo mes.",
            status_code=429,
        )

    if response.status_code == 404:
        raise UploadPostError(
            "Usuario no encontrado en Upload Post. Verifica UPLOADPOST_USER en tu .env",
            status_code=404,
        )

    if response.status_code >= 400:
        error_msg = body.get("error") or body.get("message") or "Error desconocido"
        raise UploadPostError(f"Error de Upload Post: {error_msg}", status_code=response.status_code)

    # Handle async upload (background processing)
    if body.get("request_id"):
        return {
            "success": True,
            "message": "Publicación iniciada. Se está procesando en segundo plano.",
            "request_id": body["request_id"],
            "async": True,
        }

    # Handle scheduled post
    if body.get("job_id"):
        return {
            "success": True,
            "message": "Publicación programada exitosamente.",
            "job_id": body["job_id"],
            "async": False,
        }

    # Handle synchronous success — extract Instagram-specific result
    results = body.get("results", {})
    ig_result = results.get("instagram", {})

    if ig_result.get("success"):
        return {
            "success": True,
            "message": "Publicado exitosamente en Instagram.",
            "url": ig_result.get("url", ""),
            "async": False,
        }

    # Instagram-specific error within a 200 response
    ig_error = ig_result.get("error", "Error al publicar en Instagram")
    raise UploadPostError(ig_error, status_code=200)
