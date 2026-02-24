# ChatFlow

Plataforma de comunicação em tempo real tipo Slack.

## Stack
- Backend: FastAPI + PostgreSQL + Redis
- Frontend: React 18 + Vite + TypeScript + Tailwind
- Realtime: WebSocket
- IA: OpenAI / Anthropic / Ollama
- Bots: SDK customizável
- Deploy: Docker Compose

## Início rápido

```bash
git clone https://github.com/fypak-ai/chatflow.git
cd chatflow
cp .env.example .env
docker-compose up --build
```

Acesse: http://localhost:3000

## Estrutura

```
chatflow/
├── backend/          # FastAPI API + WebSocket + IA + Bots
├── frontend/         # React + Vite
├── bots/             # GitHub webhook service
├── code-runner/      # Sandbox execução de código
└── docker-compose.yml
```

## Roadmap

**Fase 1 (MVP)**
- [ ] Auth (registro/login/JWT)
- [ ] Workspaces e canais
- [ ] Chat em tempo real (WebSocket)
- [ ] IA assistente (@ai)

**Fase 2**
- [ ] Bots e /comandos
- [ ] Execução de código
- [ ] GitHub integration

**Fase 3**
- [ ] Upload de arquivos
- [ ] Threads
- [ ] Reações
- [ ] Notificações push
