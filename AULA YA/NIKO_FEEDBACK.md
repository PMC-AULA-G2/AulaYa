# Niko: retroalimentación ante respuestas incorrectas

Cuando una pregunta se responde incorrectamente, el motor puede llamar:
`AULA_showNikoFeedback(question, {retry, continue})`.

La pregunta debe conservar `grado`, `materia`, `tema_id` e `id`, para impedir que la retroalimentación se mezcle entre materias o temas.

Cada pregunta puede proporcionar:
- `feedback_title`
- `feedback_message`
- `hint`
- `explanation`

Los errores se registran localmente con `AULA_registerQuestionError`, lo que permite detectar temas que requieren refuerzo incluso sin internet.

## Comportamiento actualizado

Cuando el estudiante falla:
1. Niko aparece con una pose de explicación.
2. Dice “Mira, tenías que hacerlo así”.
3. Muestra la explicación específica de la pregunta.
4. Muestra una pista y la respuesta correcta.
5. Permite **Intentarlo otra vez** sin avanzar de pregunta.
6. Registra el error localmente para el análisis de progreso.

La explicación mantiene el `tema_id`, grado y materia de la pregunta, evitando mezclar retroalimentación entre materias.
