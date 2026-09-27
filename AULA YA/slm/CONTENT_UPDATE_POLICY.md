# Política recomendada: contenidos del profesor vs. entrenamiento del SLM

## NO recomendamos reentrenar el SLM cada vez que un profesor suba un tema.

El profesor puede subir contenido y AULA debe poder usarlo rápidamente sin esperar un nuevo entrenamiento.

### Flujo recomendado

Profesor sube:
- documento/guía;
- video;
- PDF;
- actividad;
- recomendación.

AULA:
1. valida formato y permisos;
2. guarda el contenido;
3. genera metadatos: grado, materia, tema, docente;
4. crea/actualiza índices RAG;
5. sincroniza una copia ligera al dispositivo del estudiante cuando sea posible;
6. el SLM consulta ese contenido como contexto.

### ¿Cuándo se entrena el SLM?

Solo cuando se quiere mejorar el comportamiento general del modelo:
- explicar mejor;
- dar mejores pistas;
- adaptar lenguaje por edad;
- detectar errores frecuentes;
- generar recomendaciones más útiles.

El contenido nuevo del profesor **no necesita modificar los pesos del modelo**.

### Ventajas

- actualización inmediata;
- funciona offline después de sincronizar;
- menos consumo de recursos;
- evita entrenamientos constantes;
- el docente mantiene control sobre el material;
- se puede retirar o actualizar un contenido sin volver a entrenar el modelo.

### Excepción

Si un contenido se considera conocimiento curricular estable y validado, puede entrar posteriormente a una nueva versión del dataset de entrenamiento. Eso ocurre por versiones, no cada vez que un profesor sube un archivo.

## Frase para la sustentación

> “AULA separa el conocimiento del comportamiento del modelo. Los contenidos del docente se actualizan mediante RAG y sincronización, mientras que el SLM se entrena por versiones para mejorar su capacidad pedagógica. Así podemos actualizar una clase sin tener que reentrenar toda la inteligencia artificial.”
