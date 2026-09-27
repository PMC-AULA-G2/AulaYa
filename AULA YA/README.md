# AULA — Prototipo funcional (PWA)

Prototipo navegable de **AULA**, la plataforma educativa offline-first con
tutor IA (Niko), camino de aprendizaje, gamificación y panel docente,
implementado a partir del mockup de diseño del proyecto PMC.

Es una **PWA (Progressive Web App)**: se instala en el celular como un
ícono más, sin pasar por ninguna tienda de aplicaciones, y sigue
funcionando sin conexión.

## Cómo instalarla en un celular

1. Sube esta carpeta a un hosting simple (GitHub Pages, Netlify, Vercel,
   o cualquier servidor que sirva archivos estáticos por **HTTPS** —
   los navegadores exigen HTTPS para instalar una PWA, salvo en
   `localhost`).
2. Abre esa URL desde Chrome (Android) o Safari (iPhone).
3. Android: menú ⋮ → **"Instalar aplicación"** / **"Agregar a pantalla
   de inicio"**. iPhone: botón compartir → **"Agregar a pantalla de
   inicio"**.
4. Queda un ícono de AULA en el celular que abre a pantalla completa y
   funciona sin internet (gracias al `service-worker.js`).

## Cómo probarla ahora mismo (sin subir nada)

```bash
cd aula-app
python3 -m http.server 8000
# abre http://localhost:8000 en el navegador
```

## Personalizar a Niko

Inicia sesión como estudiante y abre **Mi perfil → ¡Personaliza a Niko!**
o **Gamificación → Abrir el vestidor de Niko**. En el vestidor puedes
desbloquear gestos, ropa y accesorios con las monedas ganadas en las
actividades, y equipar sin costo adicional los artículos desbloqueados.
Las monedas, los artículos y la selección equipada se guardan en el estado
local de cada cuenta del dispositivo. Los gestos usan los sprites existentes
de Niko; la ropa y los accesorios se muestran como insignias porque el
proyecto aún no incluye sprites superpuestos para esas prendas.

**Prueba rápida:** inicia sesión con una cuenta demo de estudiante (PIN
`1234`), completa el reto de Fracciones equivalentes para ganar monedas,
abre el vestidor desde el perfil, compra una prenda y tóquela otra vez para
equiparla. El saldo y la vista previa deben actualizarse, y conservarse al
recargar la página.

## Estructura

```
index.html            SPA con router por hash (#/inicio, #/docente/clases…)
manifest.json          metadatos de instalación (nombre, ícono, colores)
service-worker.js      cachea el shell para que funcione sin conexión
css/style.css          sistema de diseño (paleta verde AULA, componentes)
js/data.js             datos de ejemplo + estado persistente (localStorage),
                        colegios rurales, clases/estudiantes, cuentas
js/malla.js            malla académica de referencia 1.°-11.° (Colombia)
                        para Explorar y las recomendaciones del docente
js/app.js               router, pantallas, panel docente y toda la interacción
icons/                 ícono de la app (logo oficial) + icons/niko/ con
                        los sprites reales de Niko recortados de la hoja
                        de referencia oficial del proyecto
docs/raw-assets/       el logo y la hoja de referencia de Niko originales
                        que subió el usuario (fuente de los recortes)
dev/test_screens.js     script de Playwright: recorrido de pantallas (Turno 1-3)
dev/test_turn4.js       script de Playwright: registro/login, panel docente,
                        clases/roster, feedback de Niko (Turno 4)
dev/build_artifact.py  empaqueta todo en un único HTML para publicarlo como
                        Artifact de claude.ai (ver "Versión Artifact" abajo)
```

## Cuentas: registro e inicio de sesión

Antes de entrar, cada persona crea una cuenta o inicia sesión como
**estudiante** o **profesor** (pantalla `#/bienvenida`): nombre, correo,
colegio (ver más abajo) y un PIN de 4 dígitos.

Las nuevas cuentas se registran en el API FastAPI y su PIN se guarda
verificado con PBKDF2; el navegador conserva solo el perfil que necesita
la interfaz. En **“Ya tengo cuenta”** se puede elegir **“¿Olvidaste tu
PIN?”** para recibir un código de un solo uso por correo (vence en 10
minutos). Los códigos tienen límite de intentos y de envíos.

Las cuentas creadas por versiones anteriores solo existían en el
almacenamiento local del navegador. En el mismo dispositivo, pueden
trasladarse al servicio central verificando el correo desde **“Recupera
tu cuenta”**. Las cuentas de demostración `@aula.demo` siguen disponibles
para la demo local y no reciben correos. El progreso educativo todavía
se guarda localmente o en la capacidad `db` del Artifact; centralizar las
credenciales no sincroniza por sí solo el progreso entre dispositivos.

La recuperación real requiere levantar el API, configurar una base de
datos persistente y proporcionar credenciales SMTP. Consulta
[`slm/README.md`](./slm/README.md) para la configuración. En producción,
sirve tanto la web como el API mediante HTTPS, limita CORS al dominio de
la aplicación y no publiques el archivo `slm/.env`.

Un estudiante puede escribir el **código de clase** de su profesor al
registrarse para unirse automáticamente a esa clase (por ejemplo
`MAT8A-247`). Un profesor puede en cambio agregar estudiantes a mano
(nombre + correo) desde el detalle de cada clase.

Al registrarse, un profesor también marca **qué materias dicta**
(Matemáticas, Lenguaje, Ciencias Naturales, Sociales, Inglés) o deja
marcado **"Todas las materias"** — la opción recomendada y la que viene
marcada por defecto, pensando en profes de zonas rurales que suelen
dictar de todo. Esto no es solo un dato de perfil: los selectores de tema
de "Recomendaciones y contenido" y "Asignar ejercicios" se filtran según
esto, así que un profesor que solo dicta Matemáticas ve únicamente los
temas de Matemáticas del grado de su clase, no toda la malla. Las cuentas
creadas antes de que existiera este campo (incluidas las cuentas demo)
se tratan automáticamente como "todas las materias", así nadie pierde
acceso a nada por la migración.

## Colegios de zonas rurales de Colombia

El selector de colegio (en el registro y al crear una clase) usa una
lista de **~30 colegios de ejemplo**, repartidos entre distintos
departamentos (Córdoba, Caquetá, Tolima, Nariño, Cauca, La Guajira,
Chocó, etc.) — ver `RURAL_SCHOOLS` en `js/data.js`.

**Aviso importante:** no es el registro oficial completo del Ministerio
de Educación (hay más de 90.000 sedes educativas en Colombia); armar y
verificar esa lista completa está fuera del alcance de este prototipo.
Es una muestra representativa para poder probar el flujo — cualquier
colegio real se puede escribir a mano si se agrega un campo "Otro" más
adelante.

## Base de datos compartida (opcional)

Todo funciona con `localStorage` por defecto (cada dispositivo guarda su
propia copia), igual que antes. Cuando la app corre **publicada como
Artifact de claude.ai** con la capacidad `db` habilitada, `js/app.js`
detecta esa capacidad al arrancar (`initDb()`) y sincroniza automáticamente
las cuentas (`usuarios`) y las clases con sus estudiantes (`clases`) en una
base de datos compartida entre navegadores/dispositivos — así un profesor
puede crear una clase desde su computador y el estudiante se une desde su
celular. Si la capacidad no está disponible (PWA normal, hosting propio),
la app sigue funcionando exactamente igual, solo sin ese sincronizado
entre dispositivos.

### Cómo se comporta con y sin internet

Mientras hay conexión, la app sincroniza con la base de datos compartida
al abrir y luego cada 45 segundos (`syncAll()` en `js/app.js`), y también
apenas se recupera la conexión (evento `online`) — así la copia guardada
en el dispositivo está lo más al día posible en todo momento. Si la
conexión se corta, la app lo detecta (evento `offline`), avisa con un
mensaje breve y sigue funcionando con normalidad usando la última copia
que quedó guardada — no hace falta tener internet para seguir estudiando
o para que el profesor revise sus clases. Un indicador pequeño junto al
reloj (estudiante) o en la barra lateral (docente) muestra el estado:
"🟢 En línea", "☁️ Sincronizado hace X min" o "📴 Sin conexión · usando tu
copia guardada".

## Niko: mascota animada (solo saluda — ya no "se pone triste o feliz")

Niko tiene **32 poses reales** recortadas de las dos hojas de referencia
oficiales del proyecto (`docs/raw-assets/niko-reference-sheet.png` y
`niko-reference-sheet-2.png`) — estados, interacciones, expresiones,
saludos, celebraciones y poses de estudio — como PNG transparentes en
`icons/niko/`. (El usuario pidió retirar 4 poses de la primera hoja —
guiño, risa cerrada, la pose de pie neutra y la cara con "¿?" — así que
ya no están en el proyecto; el resto de esa hoja sigue intacto.)

Niko **no reacciona emocionalmente a si la respuesta del estudiante fue
correcta o incorrecta** (no celebra en verde ni se pone triste
temblando por una sola pregunta). En vez de eso hay dos grupos de poses,
cada uno con sus propias animaciones CSS (flotar, aparecer con rebote,
menear, inclinar pensando, mecerse, saltar de alegría):

- **`NIKO_GREETING_POSES`** (`js/data.js` + `nikoGreeting()`/`nikoGreetImg()`
  en `js/app.js`) — 11 poses de saludo/variedad que rotan cada vez que
  aparece: en inicio, en el feedback de cada pregunta del quiz, al
  "probarse" ropa en la tienda. Nunca dependen de si acertaste o
  fallaste — es pura variedad.
- **`NIKO_CELEBRATION_POSES`** — 4 poses grandes y enérgicas (puño al
  aire, salto, mostrando un "A+", corriendo) reservadas **solo para
  logros reales**: terminar una clase completa (`renderQuizDone`) o la
  racha en Gamificación — nunca por una sola respuesta.

Además, varias poses nuevas se usan en contexto específico: Niko lee un
libro en la transcripción del video, usa una tablet pensando en el
resumen, sostiene un globo terráqueo en "Mi futuro", muestra la pista
con cara de duda en los ejercicios, y abraza a un pequeño robot cuando
el estudiante le da las gracias en el chat.

En el chat con Niko también conserva poses que responden a lo que se le
*pregunta* (explica, motiva, duda) — eso no cambió, porque no depende de
si acertaste o fallaste.

Si se agregan más poses a futuro, basta recortarlas hacia
`icons/niko/<nombre>.png` y agregar la entrada en `NIKO_MOOD_FILE` dentro
de `js/app.js`.

## Monedas y racha (recompensas reales por estudiar)

Cada "clase" que el estudiante completa da monedas para personalizar a
Niko en la tienda, y cuenta para la racha:

- Terminar el **video** de un tema: +15 monedas.
- Cada **respuesta correcta** del quiz: +20 monedas (como antes).
- Terminar el **reto completo** (las 5 preguntas): +30 monedas extra de
  bono, además de lo ganado por pregunta.

La **racha ya no es un número fijo**: se guarda la fecha de la última
actividad (`STATE.lastActivityDate`) y `registerDailyActivity()` en
`js/data.js` la actualiza de verdad — sube en 1 si la actividad de hoy
sigue justo después de la de ayer, se reinicia a 1 si hubo un día sin
actividad, y no cambia si ya se registró actividad hoy. La primera vez
que se detecta actividad simplemente empieza a contar desde ese día (no
resetea de golpe el número de ejemplo con el que arranca la demo).

## Malla académica de referencia (Prejardín a 11.°)

`js/malla.js` guarda una **malla académica de referencia para Colombia**
(`MALLA_ACADEMICA`) con los aprendizajes y competencias que normalmente se
trabajan en cada grado, desde **preescolar** hasta 11.°. Preescolar está
dividido en sus **tres niveles reales** (no uno solo): **Prejardín** (3
años, exploración sensorial y motricidad), **Jardín** (4 años,
aprestamiento con las 5 áreas de siempre) y **Transición** (5 años, el
grado obligatorio antes de 1.°, con aprestamiento ya más formal:
conciencia fonológica, conteo hasta 20, etc.) — cada uno con temas propios
de su edad, no el mismo contenido repetido tres veces. De 1.° a 9.° sigue
Matemáticas, Lenguaje, Ciencias Naturales, Sociales e Inglés; en 10.° y
11.° ya organizada como en Saber 11 (Matemáticas, Lectura Crítica,
Sociales y Ciudadanas, Ciencias Naturales con Biología/Química/Física, e
Inglés). `parseGradoNum()` reconoce el texto libre que escribe el
estudiante o el docente ("Prejardín", "Transición", "Grado 0", "9°",
"noveno"…) y lo normaliza a la clave interna correcta.

**Aviso importante, igual que con los colegios:** Colombia no tiene un
temario nacional idéntico para cada colegio, así que esto **no es el
currículo oficial** de una institución en particular — es una referencia
para que Niko sepa en qué parte del camino de aprendizaje va cada
estudiante y pueda, a futuro, armar rutas personalizadas (si un estudiante
de 10.° falla por un vacío de 8.°, el sistema podría retroceder a ese
prerrequisito). Eso de "retroceder al prerrequisito real" es una idea para
la próxima iteración, no algo que el prototipo ya calcule solo.

Dónde se usa hoy:

- **Explorar** (estudiante): reemplaza la antigua grilla genérica de
  materias por una sola lista ordenada y completa, impulsada por el
  grado. Arranca en el grado que el estudiante escribió al registrarse
  (o en 8.° si no se pudo leer) y deja cambiar de grado con chips
  Prejardín, Jardín, Transición, 1.°-11.°; debajo, el encabezado
  "Materias de X°" muestra cuántas
  materias y cuántos temas hay en total (para que quede claro que está
  toda la malla, no un resumen). Cada materia es una tarjeta con su
  ícono, desplegable con `<details>` (sin JavaScript de por medio), y
  sus temas en una grilla de 2 columnas — ya no una fila de chips de
  ancho variable, que se veía desordenada. Tocar **"Fracciones
  equivalentes"** (el único tema con video y ejercicios ya construidos)
  lleva a esa lección real; tocar cualquier otro tema muestra un aviso
  honesto ("llega pronto a AULA") en vez de un enlace roto — a propósito
  no se prometió contenido que no existe.
- **Recomendaciones y contenido** (docente): el selector de tema ya no es
  una lista fija de 3 opciones — se arma agrupado por área
  (`<optgroup>`) según el grado real de la clase seleccionada, tomando la
  malla como fuente, y se actualiza solo si el profesor cambia de clase.
  Si el grado de la clase no se puede leer, se usa la lista corta de
  respaldo de siempre (nunca se rompe el flujo).

Niko se mantuvo deliberadamente discreto en esta parte: una sola burbuja
pequeña arriba de Explorar (la misma de siempre), sin un aviso de Niko por
cada tema ni interrupciones al navegar la malla o al recomendar contenido.

## Pantallas implementadas

**Estudiante** (marco de teléfono, navegación inferior Inicio · Explorar
· Retos · Niko · Perfil): Bienvenida (registro/login), Inicio,
Notificaciones, Tema recomendado, Video con IA (con "Pregúntale a Niko"
funcional), Ejercicios (quiz de opción múltiple con pista, feedback
correcto/incorrecto y recompensa en monedas), Retos / Gamificación
(racha + monedas), Perfil y progreso (con avatar personalizable), Ranking por salón y
"Cerrar sesión"), Explorar materias, Mi futuro (11°) y chat completo con
Niko.

**Docente** (`#/docente/<sección>`, layout de escritorio, 7 secciones):

- **Inicio** — saludo, estadísticas rápidas (clases, estudiantes,
  progreso promedio) y vista rápida de tus clases.
- **Mis clases** — tarjetas con anillo de progreso por clase + formulario
  para crear una clase nueva (grado, sección, materia, colegio; el nombre
  es opcional y se arma solo). El campo "Grado" es un texto libre con
  sugerencias (Prejardín a 11.°) y "Sección" (letra o número, ej. "A",
  "B", "1") es para cuando hay más de un salón del mismo grado — la malla
  sembrada de ejemplo ya trae un caso así (6.°A y 6.°B) y una clase por
  cada grado de Prejardín a 11.°, para que el selector de clase en
  Recomendaciones/Comunicaciones muestre el rango completo desde el
  primer momento y no solo los dos grados con los que arrancó el
  prototipo.
- **Detalle de clase** (`#/docente/clase/<id>`) — tabla real de
  estudiantes con progreso y estado (al día / en riesgo / atrasado,
  editable), código de clase para compartir, y formulario para agregar
  un estudiante a mano.
- **Recomendaciones y contenido** — crear y enviar una recomendación de
  tema a una clase (crea una notificación real del lado del estudiante)
  + botón "Generar contenido con IA" (demo) + **"Asignar ejercicios de
  práctica"** a toda una clase o a un estudiante puntual.
- **Seguimiento y reportes** — barras de rendimiento por tema + gráfico
  de dona con la distribución real de estados de los estudiantes.
- **Orientación (11°)** — barras con el interés por carrera del curso.
- **Evaluaciones** — tabla de evaluaciones aplicadas + tabla de
  seguimiento/promoción por estudiante (estado editable).
- **Comunicaciones** — **"Enviar mensaje a una clase o estudiante"** (real,
  llega como notificación) + pestañas Mensajes / Anuncios / Recordatorios
  con un cuadro para anotar (ese cuadro es solo una libreta local, no
  envía nada — lo real es el mensaje dirigido de arriba).

### Mensajes y ejercicios dirigidos a un curso o a un estudiante puntual

Tanto "Enviar mensaje" (Comunicaciones) como "Asignar ejercicios de
práctica" (Recomendaciones) piden **clase** y, dentro de esa clase,
**"Toda la clase" o un estudiante específico**. La notificación que se
crea guarda esa segmentación (`target: { type: "clase" | "estudiante",
… }`), y `#/notificaciones` del lado del estudiante solo muestra lo que le
corresponde: si te lo mandaron a ti, lo ves; si es para tu clase, lo ves;
si es para otro estudiante puntual, no aparece en tu bandeja. Las
notificaciones antiguas (sin ese campo) se siguen mostrando a todo el
mundo, para no romper nada de lo que ya existía. Verificado con
`dev/test_targeting.js` simulando dos estudiantes de la misma clase.

Desde el perfil del estudiante hay un enlace "Modo docente (demo)" para
saltar a esa vista sin cerrar sesión (además del flujo real de login como
profesor).

## Diseño sin emoji (más profesional)

Toda la interfaz reemplazó los pictogramas de emoji de color (🔥🪙🔔🎓, etc.)
por **íconos de línea propios** (`js/app.js` → `ICON_PATHS`/`icon()`, SVG en
línea, un solo color heredado del texto) y por **monogramas de texto**
(`Σ`, `Cn`, `Le`…) para materias y recursos — el mismo lenguaje visual que
ya usaba el ícono "Σ" de Matemáticas. La idea es una interfaz limpia y
ordenada tipo panel profesional (se usó como referencia el estilo del
sitio de la NASA: texto claro, jerarquía simple, casi sin pictogramas) sin
dejar de ser amigable para niños y jóvenes. Quedan sin tocar los símbolos
tipográficos planos que no son emoji de color (✓, ✕, ➤, ▶, ←, →), que ya
eran parte del lenguaje visual del proyecto.

## Detalle que vale la pena mostrar

Cuando el docente envía una recomendación desde su panel, se crea una
notificación real que aparece en `#/notificaciones` del estudiante — es
el mismo almacenamiento (local o compartido vía `db`), así que el ciclo
"el profesor marca el destino → el estudiante lo recibe" se puede
demostrar en vivo abriendo las dos vistas. Lo mismo pasa con "crear una
clase → el estudiante se une con el código → aparece en la tabla del
profesor".

## Video con IA: video real + descarga offline

El tema "Fracciones equivalentes" (grado 4°, la primera lección real de la
app) tiene un **video corto real** — `media/videos/fracciones-equivalentes.mp4`,
generado con `dev/make_demo_video.py` (Python + PIL para los fotogramas,
ffmpeg para el encoding) — en vez de la maqueta de video simulada que tenía
el resto de temas. Es honesto decir qué es y qué no es:

- **Es un video real y reproducible**, vertical (9:16, estilo TikTok/Reels),
  de 24 segundos, con la explicación animada (pizza en 4 vs. pizza en 8,
  barras comparativas, el "truco" de multiplicar arriba y abajo) y la
  identidad visual de AULA.
- **Es mudo, con texto en pantalla en vez de narración.** Este entorno de
  desarrollo no tuvo en ningún momento acceso a una herramienta de
  texto-a-voz (sin conexión a internet para descargarla ni paquetes de voz
  instalados) — por eso no hay locución. Es un formato perfectamente válido
  y muy usado en contenido corto (mucha gente los ve sin sonido), pero vale
  aclararlo en vez de dar a entender que tiene narración.
- **Todos los demás temas de la malla siguen mostrando la maqueta
  ilustrativa** (la pizza + botón de play decorativo) hasta que se graben o
  generen sus videos reales — `dev/make_demo_video.py` queda como el patrón
  reutilizable para producir el resto, tema por tema.

### Descarga para ver sin internet

En la pantalla de video de un tema con video real aparece un botón
**"⬇️ Descargar para ver sin internet"**. Al tocarlo, la app:

1. Descarga el archivo del video una sola vez y lo guarda en el
   [Cache Storage](https://developer.mozilla.org/es/docs/Web/API/Cache) del
   navegador (caché aparte, `aula-videos-v1`, distinta de la caché del
   "shell" de la app).
2. Marca el tema como descargado en el progreso del estudiante (persistido
   en `localStorage`, igual que el resto de su progreso), y la fila cambia a
   "✓ Descargado — disponible sin internet" con un botón para eliminarlo.
3. El `service-worker.js` sirve ese video desde la caché cuando el
   estudiante lo abre sin conexión; si nunca lo descargó, simplemente no
   está disponible offline (no se pre-descarga nada automáticamente, a
   propósito: el video pesa bastante más que el resto de la app y el ancho
   de banda/almacenamiento en zonas rurales es limitado, así que la
   decisión de qué guardar es del estudiante).

En la versión Artifact (ver abajo) el video va incrustado directamente en
el HTML, así que ahí siempre está disponible sin necesidad de descargarlo
aparte.

## Versión Artifact (para verla en el navegador sin instalar nada)

`python3 dev/build_artifact.py` genera `../artifact-build/aula-artifact.html`:
un único archivo HTML autocontenido (CSS, JS, los sprites de Niko/logo y el
video de "Fracciones equivalentes" incrustados como base64) listo para
publicarse como Artifact de claude.ai. Al reconstruirlo, publícalo con la
capacidad `db` habilitada para que el registro/login y las clases se
sincronicen entre quien lo abra.

## Estado y datos

Estudiante: monedas, racha, ítems equipados de Niko y progreso de
ejercicios siguen en `localStorage` del dispositivo. Cuentas y clases
usan `localStorage` como base y se sincronizan con la base de datos
compartida del Artifact cuando está disponible (ver arriba).

## Pendiente / ideas para la próxima iteración

- Lista completa y verificada de colegios rurales (hoy es una muestra).
- Identidad real por cuenta (hoy el PIN es solo para la demo).
- Construir video + ejercicios reales para más temas de la malla
  académica además de "Fracciones equivalentes" (hoy los demás temas de
  `js/malla.js` se pueden explorar, pero avisan que "llegan pronto").
- Que Niko de verdad retroceda al prerrequisito cuando detecta un vacío
  (hoy la malla es la referencia, pero esa lógica de ruta personalizada
  todavía no está calculada por el sistema).
- Código QR además del código de clase por texto.
- Sección "Comunidad" mencionada en la fase inicial del proyecto.
- Reemplazar los recortes del mockup por assets finales de la mascota
  Niko en distintas poses/atuendos (hoy son recortes fijos de una sola
  imagen).
- Producir videos reales para más temas de la malla siguiendo el guion
  de `docs/guiones/guiones-tiktok-grado4-matematicas.md` (hoy cubre los
  21 temas de Grado 4° · Matemáticas; se puede extender a otras materias
  y grados).
- Notificaciones (mensajes, recomendaciones, ejercicios asignados) hoy
  viven solo en `localStorage`/`STATE` — no se sincronizan todavía por la
  base de datos compartida del Artifact como sí lo hacen cuentas y
  clases, así que la segmentación por clase/estudiante funciona de verdad
  dentro de un mismo dispositivo (cambiando de cuenta), pero no llega aún
  de un dispositivo a otro en tiempo real.


## Vista estudiante responsive
La vista de estudiante ocupa el viewport y se adapta de forma fluida a móviles, tablets y escritorio. No usa marco de teléfono ni barra de estado simulada. La navegación y las áreas táctiles respetan safe-area y tamaños pequeños.


## Cambios de esta versión
- El avatar funciona como foto de perfil y permite cambiar género, piel, cabello, ojos, nariz, boca, ropa, accesorios y fondo.
- Al agregar un estudiante a una clase se guarda una notificación de incorporación.
- Las notificaciones de estudiantes se revisan periódicamente y, cuando hay base compartida disponible, se sincronizan también desde la nube.
- Lección/microvideo, transcripción, tutor y ejercicios quedan atados al tema exacto que el docente asignó; no se reutiliza una explicación de otro tema.
- El tutor local usa preguntas y explicaciones del banco curricular exacto y estructura sus respuestas con lenguaje sencillo, pasos y ejemplos concretos.
- El enfoque sigue siendo offline-first: el shell, malla, banco de preguntas y lógica local funcionan sin internet; los videos pesados solo quedan disponibles sin conexión después de descargarlos.


## SLM local funcional

La versión actual integra un SLM real en navegador mediante Transformers.js + ONNX. El modelo principal es Qwen2.5-0.5B-Instruct Q4 y existe un fallback SmolLM2-135M-Instruct Q4 para dispositivos limitados. El modelo se descarga automáticamente cuando hay internet y queda en caché para uso posterior sin conexión. La respuesta se construye con contexto local de grado, materia, tema y banco de preguntas.
