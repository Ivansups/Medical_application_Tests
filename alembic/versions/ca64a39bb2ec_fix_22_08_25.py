"""fix 22.08.25

Revision ID: ca64a39bb2ec
Revises: 4fc6ba77be0d
Create Date: 2025-08-22 13:31:25.387421

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'ca64a39bb2ec'
down_revision: Union[str, Sequence[str], None] = '4fc6ba77be0d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
