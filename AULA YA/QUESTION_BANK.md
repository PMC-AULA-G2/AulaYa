# Banco de preguntas AULA YA V10

Se incorporó un **super banco de 9.870 preguntas**: 10 preguntas por cada uno de los **987 temas** de la malla de grados 1°, 2°, 3°, 4°, 5°, 8°, 9° y 10°.

## Regla de aislamiento

Cada pregunta tiene:
- `grado`
- `materia`
- `tema`
- `tema_id`
- `topic_key`
- `post_video`

La app busca primero coincidencia exacta de **tema + materia + grado**. Por diseño, una pregunta de un tema no se reutiliza automáticamente en otro.

## Flujo después del video

El banco funciona como un pool de 10 preguntas por tema. Después del microvideo, la app selecciona **5 preguntas al azar** para la sesión. Las preguntas falladas pasan al repaso hasta quedar correctas.

## Cobertura

El banco está enlazado a los temas del currículo suministrado para AULA YA. Cuando un tema ya tenía preguntas específicas, se conservaron; cuando faltaban preguntas para completar el pool de 10, se añadieron preguntas pedagógicas de cobertura alineadas al tema.

La siguiente etapa recomendada es sustituir progresivamente las preguntas de cobertura por preguntas de contenido validadas por docentes, especialmente para Matemáticas, Ciencias y preparación tipo Saber 11.
