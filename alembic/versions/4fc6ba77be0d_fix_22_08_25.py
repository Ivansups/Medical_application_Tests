"""fix 22.08.25

Revision ID: 4fc6ba77be0d
Revises: 144e02f1b520
Create Date: 2025-08-22 13:31:02.337430

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '4fc6ba77be0d'
down_revision: Union[str, Sequence[str], None] = '144e02f1b520'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
