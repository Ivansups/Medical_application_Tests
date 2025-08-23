"""add_created_field_to_users

Revision ID: 2b372fabb0f3
Revises: 6b521d8a631b
Create Date: 2025-08-21 16:31:03.728416

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '2b372fabb0f3'
down_revision: Union[str, Sequence[str], None] = '6b521d8a631b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
