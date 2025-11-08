"""create user table

Revision ID: ae1ce67d89a4
Revises: 191d1a7897c8
Create Date: 2025-11-08 11:35:36.906986

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'ae1ce67d89a4'
down_revision: Union[str, None] = '191d1a7897c8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
