import json,sqlite3
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
db=ROOT/"data/aula_rag.sqlite"
con=sqlite3.connect(db); c=con.cursor()
c.execute("DROP TABLE IF EXISTS contenido")
c.execute("""CREATE TABLE contenido(
id INTEGER PRIMARY KEY, grado TEXT, materia TEXT, tema TEXT,
tipo TEXT, instruction TEXT, response TEXT)""")
with open(ROOT/"data/aula_seed.jsonl",encoding="utf-8") as f:
    rows=[json.loads(x) for x in f if x.strip()]
c.executemany("""INSERT INTO contenido(grado,materia,tema,tipo,instruction,response)
VALUES(:grado,:materia,:tema,:tipo,:instruction,:response)""",rows)
con.commit(); con.close()
print("RAG listo:",db,"registros:",len(rows))
