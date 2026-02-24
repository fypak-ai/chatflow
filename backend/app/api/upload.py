import os
import uuid
import aiofiles
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from fastapi.responses import FileResponse

from app.api.auth import get_current_user
from app.models.user import User

router = APIRouter()

UPLOAD_DIR = "/app/uploads"
MAX_FILE_SIZE = 20 * 1024 * 1024  # 20MB

ALLOWED_TYPES = {
    "image/jpeg", "image/png", "image/gif", "image/webp",
    "video/mp4", "video/webm",
    "application/pdf",
    "text/plain", "text/markdown",
    "application/zip",
}

os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/")
async def upload_file(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail=f"Tipo não permitido: {file.content_type}")

    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="Arquivo muito grande (máx 20MB)")

    ext = os.path.splitext(file.filename or "")[1].lower()
    file_id = str(uuid.uuid4())
    saved_name = f"{file_id}{ext}"
    path = os.path.join(UPLOAD_DIR, saved_name)

    async with aiofiles.open(path, "wb") as f:
        await f.write(content)

    return {
        "file_url": f"/api/upload/{saved_name}",
        "file_name": file.filename,
        "file_type": file.content_type,
        "size": len(content),
    }


@router.get("/{filename}")
async def serve_file(filename: str):
    path = os.path.join(UPLOAD_DIR, filename)
    if not os.path.exists(path) or "..", in filename:
        raise HTTPException(status_code=404, detail="Arquivo não encontrado")
    return FileResponse(path)
