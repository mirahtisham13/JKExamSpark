"""Storage service using Supabase Storage. Swap this class to use S3 or local disk."""
import os
from typing import Optional
from ..config import settings

try:
    from supabase import create_client, Client
    SUPABASE_AVAILABLE = True
except ImportError:
    SUPABASE_AVAILABLE = False


class SupabaseStorageService:
    def __init__(self):
        if SUPABASE_AVAILABLE and settings.supabase_url and settings.supabase_service_role_key:
            self._client: Optional[Client] = create_client(
                settings.supabase_url, settings.supabase_service_role_key
            )
        else:
            self._client = None

    def _is_available(self) -> bool:
        return self._client is not None

    def upload_file(self, path: str, file_bytes: bytes, content_type: str = "application/octet-stream") -> str:
        """Upload file to Supabase Storage. Returns public URL."""
        if not self._is_available():
            raise RuntimeError("Supabase Storage not configured")
        bucket = settings.supabase_storage_bucket
        self._client.storage.from_(bucket).upload(path, file_bytes, {"content-type": content_type})
        return self._client.storage.from_(bucket).get_public_url(path)

    def delete_file(self, path: str) -> None:
        if not self._is_available():
            return
        self._client.storage.from_(settings.supabase_storage_bucket).remove([path])

    def get_signed_url(self, path: str, expires_in: int = 3600) -> str:
        """Generate a signed URL for temporary file access."""
        if not self._is_available():
            raise RuntimeError("Supabase Storage not configured")
        result = self._client.storage.from_(settings.supabase_storage_bucket).create_signed_url(
            path, expires_in
        )
        return result.get("signedURL", "")


_storage_service: Optional[SupabaseStorageService] = None


def get_storage_service() -> SupabaseStorageService:
    global _storage_service
    if _storage_service is None:
        _storage_service = SupabaseStorageService()
    return _storage_service
