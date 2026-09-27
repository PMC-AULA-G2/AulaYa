# Sincronización de progreso estudiante → docente

## Flujo
1. El estudiante trabaja offline.
2. Cada actividad se guarda localmente con `grado`, `materia`, `tema_id`, respuesta/resultado y estado de completado.
3. Al recuperar internet, AULA intenta sincronizar automáticamente.
4. La cola local solo se elimina después de confirmación del servidor.
5. El backend asocia el progreso al estudiante y a su clase/docente autorizado.
6. El dashboard docente calcula evolución por curso, materia y tema.

## Indicadores
- precisión de respuestas;
- temas trabajados;
- temas completados;
- actividad reciente;
- estado orientativo: `Va bien`, `Va avanzando`, `Necesita ayuda`, `Aún no hay suficiente actividad`.

## Importante
Los estados son señales pedagógicas, no diagnósticos. El docente mantiene la decisión y puede revisar el detalle de respuestas y temas antes de intervenir.

## Endpoint
Definir `window.AULA_SYNC_ENDPOINT` con el endpoint HTTPS autenticado del backend AULA. El cliente envía eventos en JSON mediante POST. La implementación de servidor debe validar identidad, clase y permisos antes de aceptar datos.
