"""Code execution bot — handles /run command."""
import httpx

CODE_RUNNER_URL = "http://code-runner:8001"


async def run_code(language: str, code: str) -> str:
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{CODE_RUNNER_URL}/run",
                json={"language": language, "code": code},
                timeout=30,
            )
            data = response.json()
            return data.get("output", "Sem saída")
        except Exception as e:
            return f"Erro ao executar: {e}"
