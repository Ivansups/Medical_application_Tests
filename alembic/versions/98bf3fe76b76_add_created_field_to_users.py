"""add_created_field_to_users

Revision ID: 98bf3fe76b76
Revises: 2b372fabb0f3
Create Date: 2025-08-21 16:32:51.659519

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '98bf3fe76b76'
down_revision: Union[str, Sequence[str], None] = '2b372fabb0f3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
