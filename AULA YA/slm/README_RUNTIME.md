# AULA YA — SLM funcional local

Esta versión incorpora inferencia local real en navegador mediante **Transformers.js + ONNX Runtime Web**.

## Modelo

- Principal: `onnx-community/Qwen2.5-0.5B-Instruct`, cuantización Q4.
- Fallback: `onnx-community/SmolLM2-135M-Instruct-ONNX`, Q4.

El modelo **no se descarga automáticamente**. Desde el chat de Niko el estudiante elige el modo ligero (~181 MB) o avanzado (~786 MB) y puede ver el progreso. Transformers.js guarda los pesos y el tokenizador en su caché del navegador; el service worker conserva esa caché durante las actualizaciones y evita duplicar los grandes archivos del modelo en la caché de la aplicación. AULA también solicita al navegador almacenamiento persistente. Tras instalar el modelo, la aplicación intenta cargarlo al iniciar, incluso sin conexión.

El modo sin conexión requiere haber completado antes la descarga y que el navegador conserve sus datos. Borrar los datos del sitio, usar una ventana privada o una política de almacenamiento restrictiva puede quitar el modelo; el tutor curricular offline sigue disponible en esos casos.

## Flujo educativo

`pregunta → grado/materia/tema → RAG local → SLM local → respuesta pedagógica`

El SLM local es opcional; sin descargarlo, el chat utiliza el tutor curricular offline incluido en la aplicación. Como los modelos pequeños pueden repetir o alterar información, el runtime descarta respuestas repetitivas, con formato defectuoso, poco relacionadas con las fuentes curriculares o con números que no aparecen en la pregunta ni en el contenido aprobado; en esos casos Niko conserva la respuesta del tutor curricular.

El prompt bloquea el contexto al tema asignado por el docente y exige:
- explicación clara;
- ejemplos concretos;
- procedimiento paso a paso;
- adaptación por grado;
- ejercicios del mismo tema;
- reformulación cuando el estudiante dice que no entiende.

## Importante

El SLM base es un modelo preentrenado. Esta versión **sí ejecuta un SLM real**, pero todavía no contiene un fine-tuning propietario de AULA YA. El banco curricular y de preguntas se utiliza como contexto RAG para reducir respuestas fuera de tema.
