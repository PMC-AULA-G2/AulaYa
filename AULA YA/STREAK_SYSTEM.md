# Meta diaria y racha por estudiante

**Meta diaria:** completar al menos una lección corta antes de la medianoche de la hora local del estudiante.

**Contador:** cada día cumplido suma 1 al ícono del fuego del perfil.

**Regla:** la racha empieza en 0 para cada estudiante nuevo. Al completar la primera lección del día pasa a 1. Otras lecciones del mismo día no suman más. El siguiente día cumplido suma 1. Si se pierde uno o más días, la siguiente jornada cumplida inicia una nueva racha en 1.

**Recompensa:** mantener la racha puede otorgar logros y monedas. El estado se guarda por perfil de estudiante, no como contador global del dispositivo.

El motor usa `AULA_STREAK.initializeForNewStudent(id)` durante el registro y `AULA_STREAK.completeLesson(meta)` cuando una lección queda realmente completada.
