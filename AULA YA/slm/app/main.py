import sqlite3
from pathlib import Path
from fastapi import FastAPI
from pydantic import BaseModel

ROOT = Path(__file__).resolve().parents[1]
DB = ROOT / "data/aula_rag.sqlite"
app = FastAPI(title="SLM AULA Multi-Device", version="0.2")

class Chat(BaseModel):
    grado: int
    materia: str
    tema: str | None = None
    pregunta: str
    modo: str = "explicar"
    device_tier: str = "auto"  # auto | alto | medio | bajo

def retrieve(x):
    con = sqlite3.connect(DB)
    params = [str(x.grado), x.materia]
    sql = "SELECT tema,tipo,response FROM contenido WHERE grado=? AND materia=?"
    if x.tema:
        sql += " AND tema=?"
        params.append(x.tema)
    sql += " LIMIT 5"
    rows = con.execute(sql, params).fetchall()
    con.close()
    return rows

def choose_tier(tier: str):
    # The app can determine this from RAM/CPU/model support.
    # A low-end phone never needs to load a generative model.
    if tier in {"alto", "medio", "bajo"}:
        return tier
    return "medio"

@app.get("/health")
def health():
    return {"ok": True, "service": "SLM AULA", "architecture": "adaptive"}

@app.post("/chat")
def chat(x: Chat):
    tier = choose_tier(x.device_tier)
    rows = retrieve(x)

    if x.modo == "motivar":
        answer = "¡Casi! 💪 Vamos paso a paso. Intenta identificar primero qué información te da el ejercicio."
        niko = "motivar"
    elif x.modo == "recompensa":
        answer = "¡Muy bien! 🎉 Completaste la actividad."
        niko = "celebrar"
    elif rows:
        answer = rows[0][2]
        niko = "pensar"
    else:
        answer = "Vamos paso a paso. Dime qué parte del tema te resulta difícil y la dividimos en una idea pequeña."
        niko = "confundido"

    return {
        "answer": answer,
        "niko_state": niko,
        "recommended_topic": rows[0][0] if rows else x.tema,
        "context_used": len(rows),
        "offline_ready": True,
        "device_tier": tier,
        "ai_policy": {
            "alto": "local_sLM_or_remote",
            "medio": "small_local_sLM_or_remote",
            "bajo": "curated_content_only"
        }[tier]
    }
