# Especificación móvil AULA

## Regla de producto

La app debe tener dos capas:

1. **Core educativo obligatorio**
   - Flutter/Android UI
   - SQLite/local database
   - contenidos y actividades
   - videos descargados/gestionados
   - progreso
   - XP, monedas, rachas
   - Niko
   - cola de sincronización

2. **Capa de IA opcional**
   - SLM local según capacidad
   - IA online cuando exista conexión
   - fallback a contenido curado

## Presupuesto recomendado

Para gama baja:
- respuestas de IA: 80–160 tokens;
- contexto reducido;
- no cargar el modelo al iniciar la app;
- liberar memoria después de inferencia;
- no ejecutar IA en segundo plano;
- descargar modelos solo con Wi‑Fi y autorización;
- permitir desactivar IA local.

## Descargas

La app no debe obligar a descargar el SLM.

Un usuario con poco almacenamiento puede instalar AULA y usar el modo educativo completo sin modelo generativo.

## Sincronización

Guardar eventos localmente:

```text
lesson_completed
exercise_answered
xp_earned
coins_earned
streak_updated
teacher_recommendation_opened
```

Al recuperar internet:

```text
local events -> sync queue -> server -> confirmation -> mark synced
```

Enviar eventos pequeños en lugar de subir todo el estado de la aplicación.

## Decisión de IA

```text
¿Hay internet?
   ├─ Sí → SLM remoto/servicio online si conviene
   └─ No → ¿el dispositivo soporta SLM local?
              ├─ Sí → SLM local pequeño
              └─ No → contenido curado + ejercicios
```

La lógica anterior es una guía conceptual; la implementación final debe considerar batería, RAM, temperatura, almacenamiento y compatibilidad del runtime.
