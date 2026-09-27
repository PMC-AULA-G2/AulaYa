# AULA Tutor v5

Esta versión mejora el tutor offline con una capa pedagógica determinista y bloqueada al tema del docente.

## Lo que sí hace
- Mantiene el contexto exacto: grado + materia + tema + clase.
- Prioriza ejemplos antes que definiciones abstractas.
- Responde a “dame un ejemplo”, “no entiendo”, “explícamelo paso a paso” y “dame ejercicios”.
- Tiene perfiles pedagógicos para conceptos frecuentes de Matemáticas, Lenguaje, Ciencias, Sociales e Inglés.
- Usa la malla y el banco local como recuperación de respaldo.
- Funciona sin internet.

## Lo que NO se debe afirmar todavía
El ZIP no contiene un SLM neuronal entrenado. Esta capa es un tutor offline de reglas + recuperación. Para integrar un SLM real se debe entrenar/ajustar un modelo pequeño con un dataset educativo validado por docentes y empaquetar el modelo cuantizado para el runtime móvil.

## Regla de calidad
Si el tema viene de una actividad del docente, el tutor no debe cambiar de tema. El modelo futuro deberá recibir el mismo contexto como restricción dura.
