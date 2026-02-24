"""GitHub Bot — formats webhook events as chat messages."""
from typing import Optional


def format_push_event(payload: dict) -> Optional[str]:
    repo = payload.get("repository", {}).get("full_name", "")
    pusher = payload.get("pusher", {}).get("name", "alguém")
    commits = payload.get("commits", [])
    branch = payload.get("ref", "").replace("refs/heads/", "")
    n = len(commits)
    return f"[GitHub] `{pusher}` fez push de {n} commit(s) em `{repo}:{branch}`"


def format_pr_event(payload: dict) -> Optional[str]:
    action = payload.get("action", "")
    pr = payload.get("pull_request", {})
    title = pr.get("title", "")
    url = pr.get("html_url", "")
    user = pr.get("user", {}).get("login", "")
    return f"[GitHub] PR `{action}` por `{user}`: [{title}]({url})"
