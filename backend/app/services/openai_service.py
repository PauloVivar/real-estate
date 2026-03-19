from openai import OpenAI

from app.config import settings
from app.utils.prompts import build_description_prompt, build_instagram_prompt


def get_client() -> OpenAI:
    return OpenAI(api_key=settings.OPENAI_API_KEY)


def generate_description(property_data: dict) -> str:
    client = get_client()
    prompt = build_description_prompt(property_data)

    response = client.chat.completions.create(
        model=settings.OPENAI_MODEL,
        messages=[
            {"role": "system", "content": "Eres un experto redactor inmobiliario en Ecuador."},
            {"role": "user", "content": prompt},
        ],
        temperature=0.7,
        max_tokens=800,
    )

    return response.choices[0].message.content.strip()


def generate_instagram_copy(property_data: dict) -> str:
    client = get_client()
    prompt = build_instagram_prompt(property_data)

    response = client.chat.completions.create(
        model=settings.OPENAI_MODEL,
        messages=[
            {"role": "system", "content": "Eres un community manager experto en bienes raíces en Ecuador."},
            {"role": "user", "content": prompt},
        ],
        temperature=0.7,
        max_tokens=800,
    )

    return response.choices[0].message.content.strip()
