# AULA YA V11 — sincronización automática, notificaciones y tutor offline

## Cambios
- Eliminada la biblioteca final de poses "Niko siempre contigo" del shell común de la app.
- Sincronización de usuarios y clases cada máximo 3 segundos mientras hay conexión y la app está visible.
- Revisión de notificaciones de estudiantes cada máximo 3 segundos.
- Revisión de paquetes de contenido de clases cada máximo 3 segundos.
- Evento `storage` para refrescar inmediatamente cambios hechos en otra pestaña/cuenta del mismo dispositivo.
- Al agregar un estudiante a una clase se guarda `joinedAt`, `joinedBy` y `joinedByName`.
- Si la clase llega por sincronización pero el feed de notificaciones no llegó, el estudiante genera localmente la notificación de "Te agregaron a una clase" a partir de la pertenencia sincronizada.
- Service Worker actualizado y con prefetch del shell offline cuando vuelve internet.
- Tutor offline con ejemplos rotativos, menos respuestas repetidas y ejercicios generados por materia cuando el banco no contiene una pregunta de contenido adecuada.

## Límite importante
El tutor actual sigue siendo un motor pedagógico offline determinista; no se presenta como un SLM neuronal entrenado. Para usar un SLM real hace falta incorporar un modelo cuantizado y un runtime móvil, o un endpoint de inferencia cuando haya internet.
