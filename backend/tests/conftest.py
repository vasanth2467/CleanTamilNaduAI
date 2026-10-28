import pytest
from app.database import init_db
from app.seed_data import seed_database

@pytest.fixture(autouse=True)
def setup_test_db():
    init_db()
    seed_database(force_reseed=False)
