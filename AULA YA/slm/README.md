# SLM AULA — arquitectura para todo tipo de celular

AULA se diseña con una **arquitectura adaptativa**, no suponiendo que todos los teléfonos tienen la misma potencia.

## API de cuentas y recuperación por correo

La aplicación usa este FastAPI para registrar e iniciar sesión con
credenciales centrales. El PIN de 4 dígitos se guarda con PBKDF2, nunca
en texto plano en la base de datos. La recuperación envía un código de
seis dígitos por SMTP, válido durante 10 minutos; es de un solo uso y
tiene límites de intentos y solicitudes.

### Preparar y ejecutar el API en Windows

Desde la carpeta `AULA YA\slm`:

```powershell
py -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
Copy-Item .env.example .env
```

Edita `.env`: configura `SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`,
`SMTP_PASSWORD` y `SMTP_FROM` con datos de un proveedor SMTP. Genera un
secreto para `AULA_AUTH_SECRET` con:

```powershell
python -c "import secrets; print(secrets.token_urlsafe(48))"
```

Copia el valor generado a `.env`. `AULA_CORS_ORIGINS` debe contener el
origen exacto donde se sirve la PWA; por defecto se permite
`http://localhost:8000` y `http://127.0.0.1:8000` para desarrollo.
Después inicia el API:

```powershell
.\.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8001
```

Sirve la PWA desde otra terminal, en `AULA YA`:

```powershell
py -m http.server 8000
```

Abre `http://localhost:8000`. La URL de API de desarrollo es
`http://127.0.0.1:8001`; para desplegarla en otro host, configura
`window.AULA_API_BASE_URL` en `js/config.js` y permite el origen de la PWA
en `AULA_CORS_ORIGINS`. En producción, configura HTTPS para ambos
servicios y utiliza una base de datos persistente protegida. Nunca subas
`.env` ni expongas el servidor SMTP al navegador.

Las credenciales se guardan en `data/aula_auth.sqlite`. El perfil y el
progreso de aprendizaje continúan en el almacenamiento local o en el
Artifact; esta actualización no migra ese progreso entre dispositivos.
Las cuentas locales anteriores se pueden trasladar desde su dispositivo
original al verificar el correo y cambiar el PIN. Las cuentas de demo
`@aula.demo` no usan el API ni envían correos.

### Endpoints de autenticación

- `POST /auth/register`: crear una cuenta.
- `POST /auth/login`: validar correo y PIN.
- `POST /auth/recovery/request`: solicitar un código (la respuesta no
  revela si el correo está registrado).
- `POST /auth/recovery/verify`: canjear el código por un token de
  restablecimiento.
- `POST /auth/recovery/reset`: cambiar el PIN con ese token.

Los detalles del API también están en `http://127.0.0.1:8001/docs`.
Las pruebas de las reglas de cuenta y recuperación se ejecutan con:

```powershell
.\.venv\Scripts\python.exe -m unittest discover -s tests -v
```

## Idea central

**AULA funciona en cualquier celular compatible con Android que pueda ejecutar la app, pero la IA se adapta al dispositivo.**

La aplicación educativa básica NO depende de la IA para funcionar.

### 3 niveles

| Perfil del dispositivo | IA | Qué hace AULA |
|---|---|---|
| Alto | SLM local cuantizado + posibilidad de IA online | Personalización, explicaciones y feedback |
| Medio | SLM pequeño cuantizado o IA online | IA limitada, respuestas cortas |
| Bajo | Sin SLM local | Contenido, videos, juegos, ejercicios, progreso, rachas y Niko offline |

Esto evita que un celular sencillo quede excluido.

## Offline-first

Cuando no hay internet, AULA conserva localmente:
- contenidos aprobados;
- ejercicios y juegos;
- progreso;
- monedas y rachas;
- configuración de Niko;
- recomendaciones pendientes;
- cola de sincronización.

Cuando vuelve internet, sincroniza **solo los cambios pendientes**.

La IA es una capa adicional. Si el teléfono no puede ejecutar el SLM, AULA sigue funcionando normalmente.

## Cómo decidir el nivel

La app puede medir al iniciar:
- RAM disponible;
- arquitectura CPU (32/64 bits);
- espacio libre;
- versión de Android;
- soporte de aceleración;
- temperatura/batería y estado de memoria.

No se recomienda detectar solamente por el modelo comercial del teléfono.

## Modelos

Para los teléfonos capaces de ejecutar IA local:
- priorizar modelos pequeños (aprox. 0.5B–1.5B);
- cuantización 4-bit cuando sea compatible;
- respuestas cortas;
- contexto pequeño;
- inferencia bajo demanda, nunca permanentemente en segundo plano.

El modelo base se adapta con LoRA/QLoRA en un PC o servidor. El teléfono recibe el modelo/adaptador ya preparado.

**El SLM incluido en este proyecto NO está entrenado todavía.** El dataset y el script son una base de entrenamiento.

## RAG primero, generación después

Flujo recomendado:

1. El estudiante pregunta.
2. AULA busca contenido curricular aprobado localmente.
3. Si encuentra una explicación/actividad adecuada, la usa primero.
4. Si el dispositivo permite IA, el SLM puede reformularla de forma breve.
5. Si no hay capacidad de IA, se entrega el contenido curado.
6. Se registra el progreso localmente.

Así se reduce consumo y se evita que una respuesta generada contradiga el contenido educativo validado.

## Arquitectura

```text
                 ┌─────────────────────┐
                 │      APP AULA        │
                 │ Android / offline    │
                 └──────────┬──────────┘
                            │
             ┌──────────────┴──────────────┐
             │                             │
      Contenido local                Motor adaptativo
      SQLite + recursos              detecta capacidad
             │                             │
             │             ┌───────────────┼───────────────┐
             │             │               │               │
             │          ALTO            MEDIO            BAJO
             │        SLM local       SLM pequeño     Sin SLM
             │             │               │               │
             └─────────────┴───────────────┴───────────────┘
                            │
                       Sincronización
                       cuando haya red
```

## Sustentación del proyecto

La idea se puede defender así:

> **“No diseñamos AULA para el celular ideal; diseñamos AULA para la realidad del estudiante rural. Por eso separamos las funciones esenciales de la inteligencia artificial. El aprendizaje, los contenidos, los ejercicios y el progreso funcionan offline. En dispositivos con mayor capacidad incorporamos un SLM pequeño y cuantizado para personalizar la experiencia. En dispositivos de baja gama, la IA simplemente se desactiva y la aplicación conserva toda su funcionalidad educativa principal.”**

### ¿Por qué es técnicamente viable?

Porque no intentamos ejecutar el mismo modelo pesado en todos los teléfonos. Usamos **computación adaptativa**:
- contenido local para todos;
- IA local solo donde sea viable;
- IA remota cuando haya conexión;
- sincronización de datos cuando vuelva internet.

### ¿Qué problema resuelve?

La decisión técnica responde directamente al contexto rural:
- conectividad intermitente;
- celulares con capacidades diferentes;
- necesidad de consumir pocos datos;
- necesidad de que el aprendizaje no se detenga sin internet.

### ¿Cómo lo demostraríamos?

En la sustentación pueden hacer una prueba con tres perfiles:

**Celular A — gama baja**
- activar modo offline;
- abrir una lección;
- hacer ejercicios;
- ganar XP/monedas;
- cambiar Niko;
- apagar internet;
- demostrar que todo sigue funcionando.

**Celular B — gama media**
- mismo flujo;
- mostrar que puede usar un SLM pequeño si el hardware lo permite.

**Celular C — gama alta**
- mostrar personalización/feedback con SLM local o IA online.

Luego conectar el internet y demostrar que los cambios se sincronizan.

## Métricas para validar la propuesta

No prometan “funciona en todos los celulares” sin medir. La forma correcta de sustentarlo es:

- tiempo de apertura;
- RAM utilizada;
- almacenamiento ocupado;
- consumo de datos;
- batería durante una sesión;
- tiempo de respuesta del SLM;
- porcentaje de funciones disponibles offline;
- tasa de sincronización exitosa;
- calidad de las respuestas del SLM evaluada por docentes.

El objetivo es establecer un **mínimo técnico de dispositivos soportados** y mantener el modo educativo offline como requisito principal.

## Importante

El currículo incluido es una semilla técnica y debe ser revisado por docentes antes de usarlo con estudiantes reales.

El SLM no reemplaza al docente. En AULA, el docente sigue marcando el camino y la IA funciona como apoyo para explicar, practicar, dar pistas y personalizar.

## Cobertura curricular actual del prototipo

La versión actual prioriza **1° a 5° y 8° a 10°**. El índice `curriculum_scope.json` contiene todos los temas de esa malla de referencia (no es un currículo oficial de un colegio particular).

El tutor offline usa tres capas: contenido curado de la malla, banco de preguntas cuando existe y generador pedagógico de ejercicios de respaldo para que un tema nuevo no quede sin práctica. Para 8° se generan ejercicios de respaldo mientras se amplía el banco específico.

El **SLM neural todavía no está entrenado dentro del ZIP**; esta capa prepara el conocimiento, recuperación y ejercicios que el modelo local deberá consumir cuando se integre el modelo cuantizado.
