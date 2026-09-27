# AULA — mejora de clases y práctica

## Acceso desde la clase
- Las clases del estudiante ahora son botones navegables.
- Entrar a una clase muestra **¿Qué quieres practicar?**.
- Cada recomendación del docente aparece dentro de su clase con botón **Practicar**.
- La notificación sigue funcionando como acceso rápido al mismo contenido.
- Solo se muestran recomendaciones de clases a las que pertenece el estudiante.

## Práctica de Matemáticas
- Los temas de Matemáticas priorizan ejercicios prácticos y contextualizados.
- `Radicales`, `Radicación`, `Potenciación` y `Potencias` usan una batería práctica específica.
- Otros temas matemáticos tienen generadores prácticos por familia (fracciones, porcentajes, ecuaciones/álgebra, geometría, estadística/probabilidad) y un fallback contextual.
- Las preguntas incluyen pista y explicación paso a paso.

## Errores y repaso
- Una pregunta incorrecta se puede dejar para después o repetir inmediatamente.
- Cada pregunta fallada por primera vez descuenta **5 puntos porcentuales** del resultado final.
- Al terminar la primera vuelta, AULA muestra un repaso de las preguntas que quedaron mal.
- La lección **no termina** hasta que todas las preguntas estén correctamente resueltas.
- Corregir una pregunta en el repaso no devuelve el 5% descontado: el objetivo es aprender, no borrar el historial del primer intento.
- Las monedas/XP no se pueden farmear repitiendo una pregunta ya recompensada.

## Pantalla final
- Incluye a Niko.
- Muestra XP, tiempo, resultado porcentual, racha y monedas.
- Si hubo errores, explica que el porcentaje conserva el descuento de 5% por cada pregunta fallada al primer intento.

## Offline incremental
- Se conserva la sincronización incremental de contenidos en IndexedDB.
- Las recomendaciones de clase se materializan solo una vez por versión.
- Mientras la PWA está abierta/activa se revisan cambios cada 60 segundos.
