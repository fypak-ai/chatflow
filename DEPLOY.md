# Deploy no Railway

## Pré-requisitos
- Conta no [Railway](https://railway.app)
- Repositório `fypak-ai/chatflow` no GitHub

---

## Estrutura de serviços

| Serviço | Pasta | Porta |
|---------|-------|-------|
| **backend** | `backend/` | `$PORT` (Railway injeta) |
| **frontend** | `frontend/` | `$PORT` (Railway injeta) |
| **PostgreSQL** | plugin Railway | automático |
| **Redis** | plugin Railway | automático |

---

## Passo a passo

### 1. Criar projeto no Railway

1. Acesse [railway.app/new](https://railway.app/new)
2. Clique **Deploy from GitHub repo**
3. Selecione `fypak-ai/chatflow`

---

### 2. Adicionar plugins

No painel do projeto:
- Clique **+ New** → **Database** → **PostgreSQL** → Add
- Clique **+ New** → **Database** → **Redis** → Add

O Railway injeta `DATABASE_URL` e `REDIS_URL` automaticamente.

---

### 3. Configurar serviço Backend

1. Clique **+ New** → **GitHub Repo** → `fypak-ai/chatflow`
2. Em **Settings** → **Root Directory**: `backend`
3. Em **Variables**, adicione:

```
SECRET_KEY=<gere com: openssl rand -hex 32>
FRONTEND_URL=https://<seu-frontend>.railway.app
DEFAULT_AI_MODEL=gpt-4o
OPENAI_API_KEY=<sua key, se quiser IA>
```

> O Railway detecta `backend/railway.toml` automaticamente.

---

### 4. Configurar serviço Frontend

1. Clique **+ New** → **GitHub Repo** → `fypak-ai/chatflow`
2. Em **Settings** → **Root Directory**: `frontend`
3. Em **Variables**, adicione:

```
VITE_API_URL=https://<seu-backend>.railway.app
```

> O `VITE_WS_URL` é derivado automaticamente do `VITE_API_URL` (https→wss).

---

### 5. Deploy

Clique **Deploy** em cada serviço. O Railway vai:
1. Detectar `nixpacks.toml` e buildar
2. Rodar `python -m app.migrate` (cria tabelas no Postgres)
3. Subir o servidor na porta `$PORT`

---

### 6. Domínios

Em cada serviço → **Settings** → **Domains** → **Generate Domain**

Você vai ter URLs tipo:
- Backend: `https://chatflow-backend-production.railway.app`
- Frontend: `https://chatflow-frontend-production.railway.app`

Atualize `FRONTEND_URL` no backend e `VITE_API_URL` no frontend com essas URLs.

---

## Variáveis de ambiente completas

### Backend
| Variável | Valor | Obrigatório |
|----------|-------|-------------|
| `SECRET_KEY` | `openssl rand -hex 32` | ✅ |
| `FRONTEND_URL` | URL do frontend Railway | ✅ |
| `OPENAI_API_KEY` | Chave OpenAI | Opcional |
| `ANTHROPIC_API_KEY` | Chave Anthropic | Opcional |
| `DEFAULT_AI_MODEL` | `gpt-4o` ou `claude-3-5-sonnet-20241022` | Opcional |
| `GITHUB_WEBHOOK_SECRET` | Secret do webhook GitHub | Opcional |
| `DATABASE_URL` | Injetado pelo plugin Postgres | Auto |
| `REDIS_URL` | Injetado pelo plugin Redis | Auto |

### Frontend
| Variável | Valor | Obrigatório |
|----------|-------|-------------|
| `VITE_API_URL` | URL do backend Railway | ✅ |

---

## Troubleshooting

**WebSocket não conecta**
- Verifique que `VITE_API_URL` começa com `https://` (não `http://`)
- O hook `useWebSocket` converte `https://` → `wss://` automaticamente

**Erro de CORS**
- Confirme que `FRONTEND_URL` no backend está exatamente igual à URL do frontend (sem barra no final)

**Banco não inicia**
- O Railway pode demorar 1-2 min para provisionar o Postgres na primeira vez
- Veja os logs em **Deployments** → clique no deploy → **Build Logs**

**`postgres://` vs `postgresql+asyncpg://`**
- O Railway injeta `postgres://...` mas o SQLAlchemy precisa de `postgresql+asyncpg://`
- Isso é tratado automaticamente em `config.py` → `async_database_url`

---

## Deploy local (Docker Compose)

Se preferir rodar localmente ou em VPS:

```bash
git clone https://github.com/fypak-ai/chatflow.git
cd chatflow
cp .env.example .env
# edite .env com suas chaves
docker-compose up --build
```

Acesse: http://localhost:3000
