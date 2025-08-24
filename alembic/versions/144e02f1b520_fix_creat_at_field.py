"""fix creat_at field

Revision ID: 144e02f1b520
Revises: b0247a19bea6
Create Date: 2025-08-21 16:45:46.268374

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '144e02f1b520'
down_revision: Union[str, Sequence[str], None] = 'b0247a19bea6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
