def build_description_prompt(data: dict) -> str:
    amenidades_text = ", ".join(data.get("amenidades", [])) or "No especificadas"

    recamaras = data.get("recamaras")
    banos = data.get("banos")
    metros_construidos = data.get("metros_construidos")

    detalles = []
    if recamaras is not None:
        detalles.append(f"Recámaras: {recamaras}")
    if banos is not None:
        detalles.append(f"Baños: {banos}")
    if metros_construidos is not None:
        detalles.append(f"Área construida: {metros_construidos} m²")
    detalles.append(f"Terreno: {data['metros_terreno']} m²")
    detalles.append(f"Estacionamientos: {data.get('estacionamientos', 0)}")

    detalles_text = " | ".join(detalles)

    return f"""Eres un redactor inmobiliario profesional en Ecuador. Genera una descripción atractiva y profesional para la siguiente propiedad:

Tipo: {data['tipo_propiedad']}
Operación: {data['operacion']}
Ubicación: {data['direccion']}, {data['ciudad']}, {data['provincia']}
Precio: ${data['precio']:,.2f} USD
{detalles_text}
Amenidades: {amenidades_text}
Notas del agente: {data.get('descripcion_agente', 'No proporcionadas')}

Escribe 2-3 párrafos profesionales en español, destacando los puntos fuertes de la propiedad.
No inventes características que no se hayan proporcionado.
El tono debe ser profesional pero cálido, orientado a familias y compradores ecuatorianos."""


def build_instagram_prompt(data: dict) -> str:
    amenidades_text = ", ".join(data.get("amenidades", [])) or "No especificadas"

    return f"""Crea un copy para Instagram para esta propiedad inmobiliaria en Ecuador:

Tipo: {data['tipo_propiedad']}
Operación: {data['operacion']}
Ubicación: {data['direccion']}, {data['ciudad']}, {data['provincia']}
Precio: ${data['precio']:,.2f} USD
Recámaras: {data.get('recamaras', 'N/A')} | Baños: {data.get('banos', 'N/A')}
Área construida: {data.get('metros_construidos', 'N/A')} m² | Terreno: {data['metros_terreno']} m²
Estacionamientos: {data.get('estacionamientos', 0)}
Amenidades: {amenidades_text}
Agente: {data['agente_nombre']} | Tel: {data['agente_telefono']}

Incluye:
- Texto atractivo de máximo 200 palabras
- Emojis relevantes (🏠🏡🏢🌴💰📍etc.)
- Hashtags ecuatorianos de bienes raíces como: #BienesRaícesEcuador #InmobiliariaEcuador #CasasEnVenta #{data['ciudad'].replace(' ', '')} #PropiedadesEcuador #VivEnEcuador #RealEstateEcuador #HogarEcuador
- Call to action para contactar al agente
- Formato listo para copiar y pegar en Instagram"""
