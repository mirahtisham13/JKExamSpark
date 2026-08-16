import sys
from unittest.mock import MagicMock

class MockPackage(MagicMock):
    __path__ = []
    
class MockBaseModel:
    pass

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

pyd_mock = MockPackage()
pyd_mock.BaseModel = MockBaseModel
sys.modules['pydantic'] = pyd_mock
sys.modules['pydantic_settings'] = MockPackage()

import builtins
builtins.BaseModel = MockBaseModel

try:
    from app.routers import dashboard
    print("SUCCESS")
except Exception as e:
    import traceback
    traceback.print_exc()
