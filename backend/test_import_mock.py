import sys
from unittest.mock import MagicMock

class MockPackage(MagicMock):
    __path__ = []

sys.modules['fastapi'] = MockPackage()
sys.modules['fastapi.security'] = MockPackage()
sys.modules['sqlalchemy'] = MockPackage()
sys.modules['sqlalchemy.ext'] = MockPackage()
sys.modules['sqlalchemy.ext.asyncio'] = MockPackage()
sys.modules['sqlalchemy.orm'] = MockPackage()
sys.modules['sqlalchemy.sql'] = MockPackage()
sys.modules['sqlalchemy.pool'] = MockPackage()
sys.modules['passlib'] = MockPackage()
sys.modules['passlib.context'] = MockPackage()
sys.modules['jose'] = MockPackage()
sys.modules['pydantic'] = MockPackage()
sys.modules['pydantic_settings'] = MockPackage()

try:
    from app.routers import dashboard
    print("SUCCESS")
except Exception as e:
    import traceback
    traceback.print_exc()
