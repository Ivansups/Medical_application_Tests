"""some fix

Revision ID: b0247a19bea6
Revises: 98bf3fe76b76
Create Date: 2025-08-21 16:36:40.052909

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b0247a19bea6'
down_revision: Union[str, Sequence[str], None] = '98bf3fe76b76'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
