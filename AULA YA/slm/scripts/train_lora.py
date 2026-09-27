"""
Entrenamiento LoRA/QLoRA del SLM de AULA.
Se ejecuta en PC/GPU o servidor; no se entrena dentro del celular.

Antes de ejecutar:
  pip install torch transformers datasets peft accelerate
  (bitsandbytes si la plataforma lo soporta)

Base sugerida: Qwen/Qwen2.5-1.5B-Instruct.
Para dispositivos muy limitados, evaluar posteriormente un modelo 0.5B-1.5B
cuantizado a 4 bits. La selección final debe medirse en los teléfonos objetivo.
"""
import os
from datasets import load_dataset
from transformers import AutoTokenizer, AutoModelForCausalLM, TrainingArguments
from peft import LoraConfig
# El script queda como plantilla de entrenamiento: la carga exacta del trainer
# depende de la versión de TRL/Transformers que se use en el entorno de entrenamiento.

MODEL = os.getenv("AULA_BASE_MODEL", "Qwen/Qwen2.5-1.5B-Instruct")
DATA = os.path.join(os.path.dirname(__file__), "..", "data", "aula_curriculum_training.jsonl")
OUT = os.getenv("AULA_OUTPUT", "./aula-slm-lora")

print("Base:", MODEL)
print("Dataset:", DATA)
print("Salida:", OUT)
print("Ejemplos:", sum(1 for _ in open(DATA, encoding="utf-8")))

print("""
Siguiente paso:
1) cargar tokenizer/modelo;
2) aplicar LoRA/QLoRA;
3) entrenar con aula_curriculum_training.jsonl;
4) evaluar por grado/materia;
5) cuantizar el modelo final;
6) hacer benchmark en Android antes de distribuirlo.
""")
