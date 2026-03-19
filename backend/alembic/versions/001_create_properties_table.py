"""Create properties table

Revision ID: 001
Revises:
Create Date: 2026-03-19

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects.postgresql import JSONB, UUID

# revision identifiers, used by Alembic.
revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "properties",
        sa.Column("id", UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("tipo_propiedad", sa.String(20), nullable=False),
        sa.Column("operacion", sa.String(10), nullable=False),
        sa.Column("direccion", sa.Text, nullable=False),
        sa.Column("ciudad", sa.String(100), nullable=False),
        sa.Column("provincia", sa.String(100), nullable=False),
        sa.Column("precio", sa.Numeric(12, 2), nullable=False),
        sa.Column("recamaras", sa.SmallInteger, nullable=True),
        sa.Column("banos", sa.SmallInteger, nullable=True),
        sa.Column("metros_construidos", sa.Numeric(10, 2), nullable=True),
        sa.Column("metros_terreno", sa.Numeric(10, 2), nullable=False),
        sa.Column("estacionamientos", sa.SmallInteger, server_default="0"),
        sa.Column("amenidades", JSONB, server_default="[]"),
        sa.Column("descripcion_agente", sa.Text, nullable=True),
        sa.Column("fotos", JSONB, server_default="[]"),
        sa.Column("agente_nombre", sa.String(150), nullable=False),
        sa.Column("agente_telefono", sa.String(20), nullable=False),
        sa.Column("agente_email", sa.String(150), nullable=False),
        sa.Column("descripcion_generada", sa.Text, nullable=True),
        sa.Column("instagram_copy", sa.Text, nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )


def downgrade() -> None:
    op.drop_table("properties")
