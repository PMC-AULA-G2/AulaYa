# AULA YA — SLM funcional local

Esta versión incorpora inferencia local real en navegador mediante **Transformers.js + ONNX Runtime Web**.

## Modelo

- Principal: `onnx-community/Qwen2.5-0.5B-Instruct`, cuantización Q4.
- Fallback: `onnx-community/SmolLM2-135M-Instruct-ONNX`, Q4.

El modelo se descarga automáticamente cuando hay internet, se almacena en la caché del navegador y después puede utilizarse sin conexión. La primera descarga del modelo principal es grande (~786 MB); el fallback es de ~181 MB.

## Flujo educativo

`pregunta → grado/materia/tema → RAG local → SLM local → respuesta pedagógica`

El prompt bloquea el contexto al tema asignado por el docente y exige:
- explicación clara;
- ejemplos concretos;
- procedimiento paso a paso;
- adaptación por grado;
- ejercicios del mismo tema;
- reformulación cuando el estudiante dice que no entiende.

## Importante

El SLM base es un modelo preentrenado. Esta versión **sí ejecuta un SLM real**, pero todavía no contiene un fine-tuning propietario de AULA YA. El banco curricular y de preguntas se utiliza como contexto RAG para reducir respuestas fuera de tema.
