"""add document categories

Revision ID: cd970935e385
Revises: 658d99175898
Create Date: 2025-10-28 12:43:54.442053

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'cd970935e385'
down_revision: Union[str, Sequence[str], None] = '658d99175898'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Adiciona a coluna com valor default
    op.add_column('documents', sa.Column('category', 
                                       sa.Enum('LEGISLACAO', 'NOTAS_FISCAIS', name='documentcategory'), 
                                       nullable=False, 
                                       server_default='LEGISLACAO'))
    
    # Atualiza registros existentes (caso existam) para o valor default
    op.execute("UPDATE documents SET category = 'LEGISLACAO' WHERE category IS NULL")


def downgrade() -> None:
    """Downgrade schema."""
    # Remove a coluna
    op.drop_column('documents', 'category')
    
    # Remove o tipo enum (opcional, mas recomendado para limpeza completa)
    op.execute("DROP TYPE IF EXISTS documentcategory")
