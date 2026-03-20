# VIVARQ HOME

Herramienta web para agentes inmobiliarios en Ecuador. Genera descripciones profesionales y copies de Instagram para propiedades usando IA (OpenAI).

## Stack Técnico

- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Backend**: FastAPI (Python 3.12)
- **Base de Datos**: PostgreSQL 14
- **IA**: OpenAI API (gpt-4o-mini)
- **Infraestructura**: Docker Compose

## Inicio Rápido

1. Clonar el repositorio y configurar la API key de OpenAI:

```bash
cp .env.example .env
# Editar .env y agregar tu OPENAI_API_KEY
```

2. Levantar los servicios con Docker:

```bash
docker-compose up --build
```

3. Ejecutar la migración de base de datos:

```bash
docker-compose exec backend alembic upgrade head
```

4. Abrir la aplicación:
   - **Frontend**: http://localhost:3000
   - **Backend API**: http://localhost:8000
   - **API Docs (Swagger)**: http://localhost:8000/docs

## Funcionalidades

- Formulario completo para registrar propiedades (tipo, ubicación, precio, características, amenidades, fotos)
- Generación automática de descripción profesional con IA
- Generación de copy optimizado para Instagram con hashtags ecuatorianos
- Botones de copiar al portapapeles
- Soporte para todos los tipos de propiedad: Casa, Departamento, Terreno, Penthouse
- Las 24 provincias de Ecuador precargadas
- Precios en dólares americanos (USD)
