# AULA YA V14 — SLM funcional

## Qué se integró

- SLM real local en navegador con Transformers.js + ONNX Runtime Web.
- Modelo principal: Qwen2.5-0.5B-Instruct Q4.
- Fallback: SmolLM2-135M-Instruct Q4.
- Descarga automática al tener internet.
- Caché del modelo para reutilizarlo sin internet.
- RAG local: grado + materia + tema + 3 preguntas del banco.
- Prompt pedagógico estricto para evitar salir del tema.
- Ejemplos concretos, paso a paso, adaptación por grado y reformulación cuando el estudiante no entiende.
- Si el SLM no puede cargar, AULA vuelve al tutor curricular offline sin bloquear la aplicación.

## Primera ejecución

La primera carga necesita internet para descargar el modelo elegido. El modelo principal Qwen Q4 es grande; en dispositivos limitados AULA puede elegir automáticamente el fallback de 135M. Una vez cacheado, el modelo puede ejecutarse sin internet.

## Prueba recomendada

1. Entrar como estudiante.
2. Abrir una actividad asignada por el docente.
3. Abrir Niko.
4. Preguntar: "No entiendo, explícamelo con peras y manzanas".
5. Preguntar: "Dame otro ejemplo".
6. Preguntar: "Ahora dame un ejercicio".
7. Comprobar que las tres respuestas siguen en el mismo grado, materia y tema.
8. Desactivar internet y repetir la conversación después de que el modelo termine de descargarse.
