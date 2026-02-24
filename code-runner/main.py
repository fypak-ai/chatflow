from fastapi import FastAPI
from pydantic import BaseModel
import subprocess
import tempfile
import os

app = FastAPI(title="Code Runner")


class RunRequest(BaseModel):
    language: str
    code: str
    timeout: int = 10


LANGUAGE_CONFIG = {
    "python": {"cmd": "python3", "ext": ".py"},
    "javascript": {"cmd": "node", "ext": ".js"},
    "bash": {"cmd": "bash", "ext": ".sh"},
}


@app.post("/run")
async def run_code(req: RunRequest):
    config = LANGUAGE_CONFIG.get(req.language)
    if not config:
        return {"error": f"Linguagem não suportada: {req.language}"}

    with tempfile.NamedTemporaryFile(
        mode="w", suffix=config["ext"], delete=False
    ) as f:
        f.write(req.code)
        tmp_path = f.name

    try:
        result = subprocess.run(
            [config["cmd"], tmp_path],
            capture_output=True,
            text=True,
            timeout=req.timeout,
        )
        output = result.stdout or result.stderr
    except subprocess.TimeoutExpired:
        output = "Timeout: execução excedeu o limite de tempo"
    finally:
        os.unlink(tmp_path)

    return {"output": output, "language": req.language}


@app.get("/health")
async def health():
    return {"status": "ok"}
