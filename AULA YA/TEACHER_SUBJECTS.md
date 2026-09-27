# Configuración de materias del docente

AULA permite que un docente seleccione:
- uno o varios cursos: 1°, 2°, 3°, 4°, 5°, 9°, 10°;
- una o varias materias: Matemáticas, Español, Ciencias Naturales, Ciencias Sociales e Inglés.

Ejemplos:
- Docente de Inglés + Sociales → solo ve esas dos materias en su panel.
- Docente de Matemáticas → solo ve Matemáticas.
- Docente multigrado → puede elegir varios cursos y varias materias.

La configuración se guarda localmente para mantener el comportamiento offline-first.
El evento `aula:teacher-config-updated` permite conectar este filtro con el dashboard existente.

Importante: esto no elimina contenido del catálogo. Filtra lo que el docente administra/revisa; el estudiante conserva su contenido correspondiente a su curso.
