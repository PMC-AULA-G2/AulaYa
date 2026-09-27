// AULA — datos de ejemplo (mock) + estado persistente en localStorage.
// Todo lo que el estudiante gana/equipa se guarda en el dispositivo,
// igual que describe la pantalla "Funcionamiento offline y online".

const STORAGE_KEY = "aula_state_v1";

const NIKO_WARDROBE_ITEMS = {
  gestos: [
    { id: "niko-saludo", nombre: "Saludo amistoso", categoria: "gestos", precio: 0, visualRef: "icons/niko/estado-saludo.png", pose: "saludo", estado: "desbloqueado", icono: "👋" },
    { id: "niko-celebracion", nombre: "¡Lo logré!", categoria: "gestos", precio: 60, visualRef: "icons/niko/celebracion-puno.png", pose: "celebracionPuno", estado: "bloqueado", icono: "🎉" },
    { id: "niko-lector", nombre: "Modo lectura", categoria: "gestos", precio: 40, visualRef: "icons/niko/leyendo-libro.png", pose: "leyendoLibro", estado: "bloqueado", icono: "📚" },
    { id: "niko-musica", nombre: "¡A bailar!", categoria: "gestos", precio: 70, visualRef: "icons/niko/escucha-musica.png", pose: "escuchaMusica", estado: "bloqueado", icono: "🎵" },
  ],
  ropa: [
    { id: "niko-uniforme", nombre: "Uniforme AULA", categoria: "ropa", precio: 0, visualRef: "👕", estado: "desbloqueado", icono: "👕" },
    { id: "niko-camiseta-azul", nombre: "Camiseta exploradora", categoria: "ropa", precio: 80, visualRef: "🧥", estado: "bloqueado", icono: "🧥" },
    { id: "niko-sudadera-lila", nombre: "Sudadera espacial", categoria: "ropa", precio: 120, visualRef: "🧥", estado: "bloqueado", icono: "🪐" },
    { id: "niko-camiseta-estrella", nombre: "Camiseta estrella", categoria: "ropa", precio: 100, visualRef: "👕", estado: "bloqueado", icono: "⭐" },
  ],
  accesorios: [
    { id: "niko-sin-accesorio", nombre: "Sin accesorio", categoria: "accesorios", precio: 0, visualRef: "—", estado: "desbloqueado", icono: "✨" },
    { id: "niko-audifonos", nombre: "Audífonos", categoria: "accesorios", precio: 60, visualRef: "🎧", estado: "bloqueado", icono: "🎧" },
    { id: "niko-gorra", nombre: "Gorra aventurera", categoria: "accesorios", precio: 80, visualRef: "🧢", estado: "bloqueado", icono: "🧢" },
    { id: "niko-lentes", nombre: "Lentes curiosos", categoria: "accesorios", precio: 90, visualRef: "🤓", estado: "bloqueado", icono: "🤓" },
  ],
};

const DEFAULT_NIKO_WARDROBE = {
  unlocked: ["niko-saludo", "niko-uniforme", "niko-sin-accesorio"],
  equipped: {
    gestos: "niko-saludo",
    ropa: "niko-uniforme",
    accesorios: "niko-sin-accesorio",
  },
};

function normalizeNikoWardrobe(wardrobe) {
  const saved = wardrobe && typeof wardrobe === "object" ? wardrobe : {};
  const unlocked = Array.isArray(saved.unlocked) ? saved.unlocked : DEFAULT_NIKO_WARDROBE.unlocked;
  const equipped = saved.equipped && typeof saved.equipped === "object" ? saved.equipped : {};
  const normalized = {
    unlocked: [...new Set([...DEFAULT_NIKO_WARDROBE.unlocked, ...unlocked.filter((id) =>
      Object.values(NIKO_WARDROBE_ITEMS).some((items) => items.some((item) => item.id === id))
    )])],
    equipped: {},
  };
  for (const category of Object.keys(NIKO_WARDROBE_ITEMS)) {
    const selected = equipped[category];
    normalized.equipped[category] = normalized.unlocked.includes(selected)
      && NIKO_WARDROBE_ITEMS[category].some((item) => item.id === selected)
      ? selected
      : DEFAULT_NIKO_WARDROBE.equipped[category];
  }
  return normalized;
}

const DEFAULT_STATE = {
  student: { name: "Alex", grade: "9°" },
  coins: 0,
  streak: 0,
  xp: 0,
  xpGoal: 100,
  level: 1,
  retosCompletados: 0,
  equipped: { ropa: "jacket-green", accesorio: null, fondo: null },
  ownedItems: ["jacket-green"],
  avatar: { gender:"gender-female", skin:"skin-1", hair:"hair-f-1", eyes:"eyes-1", nose:"nose-1", mouth:"mouth-1", outfit:"outfit-1", accessory:"accessory-none", background:"bg-1" },
  avatarOwned: ["gender-female","skin-1","hair-f-1","eyes-1","nose-1","mouth-1","outfit-1","accessory-none","bg-1"],
  nikoWardrobe: structuredClone(DEFAULT_NIKO_WARDROBE),
  quizDone: {},
  completedResources: {},
  notifications: null, // null = usar semilla por defecto la primera vez
  auth: null, // { role: "estudiante"|"profesor", nombre, correo, colegio, classId? }
  nikoGreetIdx: 0, // rotación de poses de saludo de Niko (variedad sin ligarlo al acierto/error)
  nikoCelebIdx: 0, // rotación de poses de celebración (solo por logros reales, no por pregunta)
  lastActivityDate: null, // última fecha (YYYY-MM-DD) en que completó una clase — para la racha real
  downloadedVideos: {}, // { [temaId]: { sizeMB, at } } — videos guardados para verlos sin internet
  downloadedTopics: {}, // { [temaId]: { at, resources, videoDownloaded } } — paquetes completos recomendados por el docente
  subjectProgress: {},
  lessonTopics: {},
  sessionScores: [], // resultados reales de sesiones completadas: [{score, temaId, completedAt}]
};

function isResourceDone(temaId, resourceId) {
  return !!(STATE.completedResources[temaId] && STATE.completedResources[temaId][resourceId]);
}

function markResourceDone(temaId, resourceId) {
  const map = Object.assign({}, STATE.completedResources);
  map[temaId] = Object.assign({}, map[temaId], { [resourceId]: true });
  updateState({ completedResources: map });
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(DEFAULT_STATE);
    const parsed = JSON.parse(raw);
    const state = Object.assign(structuredClone(DEFAULT_STATE), parsed);
    state.nikoWardrobe = normalizeNikoWardrobe(parsed.nikoWardrobe);
    return state;
  } catch (e) {
    return structuredClone(DEFAULT_STATE);
  }
}

function saveState(state) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
  catch (e) { /* seguimos en memoria */ }
}
const USER_STATE_KEY = "aula_user_state_v1";
function userStateKey(user) { return user && user.correo ? String(user.correo).trim().toLowerCase() : ""; }
function loadUserState(user) {
  const key = userStateKey(user);
  if (!key) return structuredClone(DEFAULT_STATE);
  try {
    const all = JSON.parse(localStorage.getItem(USER_STATE_KEY) || "{}");
    const saved=Object.assign(structuredClone(DEFAULT_STATE), all[key] || {});
    saved.nikoWardrobe=normalizeNikoWardrobe(saved.nikoWardrobe);
    if (Array.isArray(user?.notificationFeed)) {
      const existing=Array.isArray(saved.notifications)?saved.notifications:[];
      const ids=new Set(existing.map(n=>n.id));
      saved.notifications=existing.concat(user.notificationFeed.filter(n=>n && !ids.has(n.id)));
    }
    return saved;
  } catch(e) { return structuredClone(DEFAULT_STATE); }
}
function saveUserState(state) {
  const key = userStateKey(state.auth);
  if (!key) return;
  try {
    const all = JSON.parse(localStorage.getItem(USER_STATE_KEY) || "{}");
    all[key] = state;
    localStorage.setItem(USER_STATE_KEY, JSON.stringify(all));
  } catch(e) {}
}
function freshUserState(user) {
  const s = structuredClone(DEFAULT_STATE);
  s.auth = user ? { role:user.role, nombre:user.nombre, correo:user.correo, colegioId:user.colegioId, grado:user.grado || "", salon:user.salon || "", materias:user.materias || "todas" } : null;
  if (user?.correo === "mateo.demo.tresesquinas@aula.demo") {
    s.coins = 5000;
    s.xp = 4200;
    s.xpGoal = 5000;
    s.level = 12;
    s.avatarOwned = ["gender-female","gender-male","gender-neutral","skin-1","skin-2","skin-3","skin-4","skin-5","hair-f-1","hair-f-2","hair-f-3","hair-f-4","hair-m-1","hair-m-2","hair-m-3","hair-m-4","eyes-1","eyes-2","eyes-3","eyes-4","eyes-5","nose-1","nose-2","nose-3","nose-4","mouth-1","mouth-2","mouth-3","mouth-4","mouth-5","outfit-1","outfit-2","outfit-3","outfit-4","outfit-5","outfit-6","accessory-none","accessory-glasses","accessory-cap","accessory-headphones","accessory-bow","bg-1","bg-2","bg-3","bg-4","bg-5"];
    s.avatar = {gender:"gender-male",skin:"skin-2",hair:"hair-m-2",eyes:"eyes-2",nose:"nose-2",mouth:"mouth-2",outfit:"outfit-3",accessory:"accessory-glasses",background:"bg-2"};
  }

  s.student = { name:user?.nombre || "", grade:user?.grado || "", salon:user?.salon || "" };
  s.notifications = [];
  s.subjectProgress = {};
  s.lessonTopics = {};
  return s;
}
let STATE = loadState();
function updateState(patch) {
  STATE = Object.assign({}, STATE, patch);
  saveState(STATE);
  if (STATE.auth) saveUserState(STATE);
  return STATE;
}

// ---------------------------------------------------------------------
// Sesiones persistentes: hasta 5 cuentas iniciadas en el mismo dispositivo.
// ---------------------------------------------------------------------
const ACTIVE_SESSIONS_KEY = "aula_active_sessions_v1";
function loadActiveSessions() {
  try {
    const list=JSON.parse(localStorage.getItem(ACTIVE_SESSIONS_KEY)||"[]");
    return Array.isArray(list) ? list.slice(0,5) : [];
  } catch(e){ return []; }
}
function saveActiveSessions(list){ try{localStorage.setItem(ACTIVE_SESSIONS_KEY,JSON.stringify(list.slice(0,5)));}catch(e){} }
function addActiveSession(user){
  if(!user?.correo) return loadActiveSessions();
  const email=String(user.correo).trim().toLowerCase();
  const list=loadActiveSessions().filter(s=>String(s.correo).toLowerCase()!==email);
  list.unshift({correo:user.correo,nombre:user.nombre,role:user.role,colegioId:user.colegioId||"",grado:user.grado||"",salon:user.salon||"",addedAt:Date.now()});
  saveActiveSessions(list); return list;
}
function removeActiveSession(correo){
  const email=String(correo||"").trim().toLowerCase();
  const list=loadActiveSessions().filter(s=>String(s.correo).toLowerCase()!==email);
  saveActiveSessions(list); return list;
}
function isActiveSession(correo){
  const email=String(correo||"").trim().toLowerCase();
  return loadActiveSessions().some(s=>String(s.correo).toLowerCase()===email);
}
function switchToStoredSession(correo){
  const user=findUserByEmail(correo); if(!user) return false;
  const saved=loadUserState(user);
  STATE=Object.assign(freshUserState(user),saved);
  STATE.auth={role:user.role,nombre:user.nombre,correo:user.correo,colegioId:user.colegioId,grado:user.grado||"",salon:user.salon||"",materias:user.materias||"todas"};
  if(user.role==="estudiante"){
    localStorage.setItem("aula_current_student_id",String(user.correo));
    if(window.AULA_STREAK){const ss=window.AULA_STREAK.get(user.correo);STATE.streak=ss.count;STATE.lastActivityDate=ss.last_completed_day;}
  }
  addActiveSession(user); updateState(STATE); go(user.role==="profesor"?"docente":"inicio"); return true;
}

// ---------------------------------------------------------------------
// Contenido estático
// ---------------------------------------------------------------------

// Íconos como monograma de texto (no emoji) — mismo lenguaje visual que
// "Σ" para Matemáticas, para que la interfaz se vea limpia y profesional
// en vez de una fila de pictogramas de color.
const SUBJECTS = [
  { id: "mate", name: "Matemáticas", icon: "Σ", color: "#3b6fd6", bg: "#e7effe", progress: 68 },
  { id: "ciencias", name: "Ciencias", icon: "Cs", color: "#279a5b", bg: "#dcf3e3", progress: 54 },
  { id: "espanol", name: "Español", icon: "Es", color: "#c76b2c", bg: "#fbe7d8", progress: 81 },
  { id: "ingles", name: "Inglés", icon: "En", color: "#3b6fd6", bg: "#e7effe", progress: 46 },
  { id: "historia", name: "Historia", icon: "Hi", color: "#a6472f", bg: "#f6e2dd", progress: 73 },
  { id: "arte", name: "Arte", icon: "Ar", color: "#b8478a", bg: "#fbe3f1", progress: 39 },
  { id: "tecnologia", name: "Tecnología", icon: "Tc", color: "#2b8a8a", bg: "#dcf3f3", progress: 61 },
  { id: "edufisica", name: "Educación Física", icon: "Ef", color: "#e35353", bg: "#fdeaea", progress: 88 },
  { id: "ciudadania", name: "Ciudadanía", icon: "Ci", color: "#7a5bd0", bg: "#eae4fb", progress: 57 },
];

const SUBJECT_DESC = {
  mate: "Números, álgebra, geometría…",
  ciencias: "Biología, física, química…",
  espanol: "Lectura, escritura, comunicación…",
  ingles: "Vocabulario, gramática, speaking…",
  historia: "Civilizaciones, culturas, sociedad…",
  arte: "Creatividad, expresión…",
  tecnologia: "Programación, internet, IA…",
  edufisica: "Salud, deporte, bienestar…",
  ciudadania: "Convivencia, valores, sociedad…",
};

function seedNotifications() {
  // Vacía hasta que exista una recomendación/mensaje real.
  return [];
}

function getNotifications() {
  if (!STATE.notifications) {
    updateState({ notifications: [] });
  }
  return Array.isArray(STATE.notifications) ? STATE.notifications : [];
}

const TEMAS = {
  fracciones: {
    id: "fracciones",
    title: "Fracciones equivalentes",
    subject: "Matemáticas · 8°",
    recommendedBy: "Profe. Mariana Ruiz",
    quote: "Este tema te ayudará en lo que veremos la próxima semana. ¡Tú puedes!",
    // video real, corto y vertical (estilo TikTok/Reels, mudo con texto en
    // pantalla — sin narración porque este entorno no tiene ninguna
    // herramienta de texto-a-voz disponible) generado como prueba de
    // concepto de la descarga offline (ver dev/make_demo_video.py).
    videoSrc: "media/videos/fracciones-equivalentes.mp4",
    videoDuration: "0:24",
    resources: [
      { id: "video", label: "Video interactivo", meta: "6 min", icon: "▶", color: "#e7effe", route: "video" },
      { id: "ejercicios", label: "Ejercicios guiados", meta: "Practica con Niko", icon: "Ej", color: "#dcf3e3", route: "ejercicios" },
      { id: "reto", label: "Reto", meta: "Gana monedas", icon: "Re", color: "#fff1de", route: "ejercicios" },
      { id: "evaluacion", label: "Evaluación", meta: "Demuestra lo aprendido", icon: "Ev", color: "#fdeaea", route: "ejercicios" },
    ],
  },
};

const QUIZ_FRACCIONES = [
  {
    q: "¿Cuál de estas fracciones es equivalente a 3/6?",
    options: ["1/2", "2/3", "6/9", "1/3"],
    correct: 0,
    hint: "Simplifica 3/6 dividiendo el numerador y el denominador entre el mismo número.",
  },
  {
    q: "¿Cuál de estas fracciones es equivalente a 2/4?",
    options: ["3/8", "1/2", "2/3", "4/6"],
    correct: 1,
    hint: "Divide numerador y denominador de 2/4 entre 2.",
  },
  {
    q: "¿Cuál de estas fracciones NO es equivalente a 1/3?",
    options: ["2/6", "3/9", "4/12", "2/5"],
    correct: 3,
    hint: "Multiplica 1/3 por el mismo número arriba y abajo y compara.",
  },
  {
    q: "¿Qué número falta para que 4/5 sea equivalente a ?/10?",
    options: ["6", "7", "8", "9"],
    correct: 2,
    hint: "Si el denominador se multiplicó por 2, el numerador también.",
  },
  {
    q: "¿Cuál de estas parejas de fracciones es equivalente?",
    options: ["3/4 y 6/9", "5/10 y 1/2", "2/3 y 3/5", "1/4 y 2/5"],
    correct: 1,
    hint: "Simplifica cada fracción a su forma más simple y compara.",
  },
];

const SHOP = {
  ropa: [
    { id: "jacket-green", label: "Chaqueta verde", icon: "Ch", price: 150 },
    { id: "jacket-red", label: "Chaqueta roja", icon: "Ch", price: 200 },
    { id: "jacket-blue", label: "Chaqueta azul", icon: "Ch", price: 200 },
  ],
  accesorios: [
    { id: "cap", label: "Gorra", icon: "Go", price: 100 },
    { id: "headphones", label: "Audífonos", icon: "Au", price: 120 },
    { id: "glasses", label: "Gafas", icon: "Ga", price: 180 },
  ],
  fondos: [
    { id: "bg-forest", label: "Bosque", icon: "Bo", price: 90 },
    { id: "bg-space", label: "Espacio", icon: "Es", price: 160 },
    { id: "bg-beach", label: "Playa", icon: "Pl", price: 110 },
  ],
};

const AVATAR_SHOP = {
  genero: [
    { id:"gender-female", label:"Femenino", icon:"♀", price:0 },
    { id:"gender-male", label:"Masculino", icon:"♂", price:0 },
    { id:"gender-neutral", label:"Neutro", icon:"●", price:0 },
  ],
  piel: [
    { id:"skin-1", label:"Piel clara", icon:"1", price:0 },
    { id:"skin-2", label:"Piel cálida", icon:"2", price:0 },
    { id:"skin-3", label:"Piel media", icon:"3", price:60 },
    { id:"skin-4", label:"Piel morena", icon:"4", price:60 },
    { id:"skin-5", label:"Piel oscura", icon:"5", price:60 },
  ],
  cabello: [
    { id:"hair-f-1", label:"Largo suave", icon:"F1", price:0 },
    { id:"hair-f-2", label:"Ondulado", icon:"F2", price:90 },
    { id:"hair-f-3", label:"Coleta", icon:"F3", price:110 },
    { id:"hair-f-4", label:"Corto", icon:"F4", price:80 },
    { id:"hair-m-1", label:"Corto clásico", icon:"M1", price:0 },
    { id:"hair-m-2", label:"Peinado", icon:"M2", price:90 },
    { id:"hair-m-3", label:"Rizado", icon:"M3", price:100 },
    { id:"hair-m-4", label:"Largo", icon:"M4", price:110 },
  ],
  ojos: [
    { id:"eyes-1", label:"Clásicos", icon:"◉", price:0 },
    { id:"eyes-2", label:"Grandes", icon:"◎", price:70 },
    { id:"eyes-3", label:"Almendrados", icon:"◍", price:80 },
    { id:"eyes-4", label:"Curiosos", icon:"◌", price:90 },
    { id:"eyes-5", label:"Dormilones", icon:"⌒", price:90 },
  ],
  nariz: [
    { id:"nose-1", label:"Pequeña", icon:"•", price:0 },
    { id:"nose-2", label:"Redonda", icon:"●", price:50 },
    { id:"nose-3", label:"Suave", icon:"◡", price:60 },
    { id:"nose-4", label:"Puntita", icon:"⌁", price:60 },
  ],
  boca: [
    { id:"mouth-1", label:"Sonrisa", icon:"⌣", price:0 },
    { id:"mouth-2", label:"Sonrisa grande", icon:"◡", price:70 },
    { id:"mouth-3", label:"Seria", icon:"—", price:60 },
    { id:"mouth-4", label:"Sonrisa tímida", icon:"⌒", price:80 },
    { id:"mouth-5", label:"Risa", icon:"◠", price:100 },
  ],
  ropa: [
    { id:"outfit-1", label:"Camiseta verde", icon:"V", price:0 },
    { id:"outfit-2", label:"Camiseta azul", icon:"A", price:80 },
    { id:"outfit-3", label:"Sudadera", icon:"S", price:100 },
    { id:"outfit-4", label:"Camiseta naranja", icon:"N", price:100 },
    { id:"outfit-5", label:"Chaqueta", icon:"J", price:140 },
    { id:"outfit-6", label:"Uniforme AULA", icon:"U", price:180 },
  ],
  accesorio: [
    { id:"accessory-none", label:"Sin accesorio", icon:"—", price:0 },
    { id:"accessory-glasses", label:"Gafas", icon:"G", price:120 },
    { id:"accessory-cap", label:"Gorra", icon:"C", price:140 },
    { id:"accessory-headphones", label:"Audífonos", icon:"H", price:160 },
    { id:"accessory-bow", label:"Moño", icon:"M", price:130 },
  ],
  fondo: [
    { id:"bg-1", label:"AULA", icon:"A", price:0 },
    { id:"bg-2", label:"Cielo", icon:"C", price:90 },
    { id:"bg-3", label:"Atardecer", icon:"T", price:120 },
    { id:"bg-4", label:"Bosque", icon:"B", price:140 },
    { id:"bg-5", label:"Espacio", icon:"E", price:180 },
  ],
};

const CAREERS = ["Ingeniería de Sistemas", "Medicina", "Diseño Industrial"];

const OPPORTUNITIES = {
  becas: [
    { title: "Beca Talento Joven", org: "Universidad de los Andes", deadline: "Cierre: 15 nov 2025", icon: "TJ" },
    { title: "Beca Excelencia Académica", org: "Universidad Nacional", deadline: "Cierre: 30 oct 2025", icon: "EA" },
  ],
  universidades: [
    { title: "Feria de universidades 2025", org: "Bogotá, D.C.", deadline: "22 sep 2025", icon: "Fu" },
  ],
  eventos: [
    { title: "Charla: ¿Cómo elegir tu carrera?", org: "Universidad de Antioquia", deadline: "12 sep 2025 · Virtual", icon: "Ch" },
  ],
};

const TEACHER_STUDENTS = [
  { name: "Ana Torres", status: "promover" },
  { name: "Luis Ramírez", status: "promover" },
  { name: "Sofía Gómez", status: "revision" },
  { name: "Diego Pérez", status: "promover" },
  { name: "Valentina Ruiz", status: "no" },
  { name: "Mateo Salazar", status: "promover" },
  { name: "Camila Ortiz", status: "revision" },
];

// ---------------------------------------------------------------------
// Catálogo oficial de sedes educativas rurales
// ---------------------------------------------------------------------
// Se carga desde data/colegios_rurales_2024.json, generado a partir de
// BDATOS-EDUC-2024 del DANE. La copia local queda disponible offline.
// El catálogo contiene sedes rurales y conserva su código DANE, municipio,
// departamento y relación con la sede principal cuando existe.
let RURAL_SCHOOLS = [];
let RURAL_SCHOOLS_READY = false;

function schoolLabel(s) {
  return `${s.nombre} — ${s.municipio}, ${s.departamento}`;
}
// ---------------------------------------------------------------------
// Perfiles en caché local y cuentas de demostración.
// ---------------------------------------------------------------------
// Las cuentas nuevas se validan contra el API. Este almacenamiento conserva
// perfiles para la experiencia offline; solo las cuentas de demo mantienen
// un PIN local para que sigan funcionando en las demostraciones.
const USERS_KEY = "aula_usuarios_v1";

function loadUsers() {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return ensureDemoTestUsers(raw ? JSON.parse(raw) : []);
  } catch (e) { return ensureDemoTestUsers([]); }
}
const DEMO_SCHOOL_TEST_ID = "268770000265"; // Escuela Rural Tres Esquinas, Suaita, Santander
const DEMO_TEST_USERS = [
  { role:"estudiante", nombre:"Ana Torres", correo:"ana.torres.tresesquinas@aula.demo", colegioId:DEMO_SCHOOL_TEST_ID, grado:"8°", salon:"A", pin:"1234" },
  { role:"estudiante", nombre:"Luis Ramírez", correo:"luis.ramirez.tresesquinas@aula.demo", colegioId:DEMO_SCHOOL_TEST_ID, grado:"8°", salon:"A", pin:"1234" },
  { role:"estudiante", nombre:"Sofía Gómez", correo:"sofia.gomez.tresesquinas@aula.demo", colegioId:DEMO_SCHOOL_TEST_ID, grado:"8°", salon:"A", pin:"1234" },
  { role:"estudiante", nombre:"Diego Pérez", correo:"diego.perez.tresesquinas@aula.demo", colegioId:DEMO_SCHOOL_TEST_ID, grado:"8°", salon:"A", pin:"1234" },
  { role:"estudiante", nombre:"Valentina Ruiz", correo:"valentina.ruiz.tresesquinas@aula.demo", colegioId:DEMO_SCHOOL_TEST_ID, grado:"8°", salon:"A", pin:"1234" },
  { role:"estudiante", nombre:"Mateo Demo", correo:"mateo.demo.tresesquinas@aula.demo", colegioId:DEMO_SCHOOL_TEST_ID, grado:"8°", salon:"A", pin:"1234" },
  { role:"profesor", nombre:"Profe de Prueba Tres Esquinas", correo:"docente.tresesquinas@aula.demo", colegioId:DEMO_SCHOOL_TEST_ID, materias:"todas", pin:"1234" },
];
function ensureDemoTestUsers(list) {
  const out = Array.isArray(list) ? list.slice() : [];
  for (const demo of DEMO_TEST_USERS) {
    const idx = out.findIndex(x=>String(x.correo||"").toLowerCase()===demo.correo.toLowerCase());
    if (idx === -1) out.push({...demo});
    else out[idx] = {...out[idx], ...demo};
  }
  return out;
}

function saveUsers(list) {
  try { localStorage.setItem(USERS_KEY, JSON.stringify(list)); } catch (e) {}
}
function findUserByEmail(correo) {
  return loadUsers().find((u) => u.correo.toLowerCase() === String(correo).toLowerCase());
}
function registerUserLocal(user) {
  const email = String(user.correo || "").trim().toLowerCase();
  const list = loadUsers().filter((existing) => String(existing.correo || "").trim().toLowerCase() !== email);
  list.push(user);
  saveUsers(list);
  return user;
}

// ---------------------------------------------------------------------
// Clases del docente (demo local; se sincroniza con la base de datos
// compartida del artefacto cuando está disponible — ver initDb() en app.js)
// ---------------------------------------------------------------------
const CLASSES_KEY = "aula_clases_v1";

// Una clase de ejemplo por cada grado de la malla (Prejardín a 11.°), para
// que el panel docente muestre desde el primer momento el rango completo
// — antes solo había dos clases sembradas (8°A y 9°B), por lo que los
// selectores de "Clase" en Recomendaciones/Comunicaciones solo mostraban
// esos dos grados aunque la app soporte todos. 6° tiene además una segunda
// sección (6°A y 6°B) para dejar claro que un mismo grado puede tener más
// de un salón, distinguido por letra o número.
function seedClasses(teacherEmail) {
  const profesorCorreo = teacherEmail || "docente.tresesquinas@aula.demo";
  const colegioId = DEMO_SCHOOL_TEST_ID;
  const grados = ["1°","2°","3°","4°","5°","8°","9°","10°"];
  const materias = ["Matemáticas","Lenguaje","Ciencias Naturales","Sociales","Inglés"];
  const demoStudents = {
    "8°": [
      { id:"demo-a1", nombre:"Ana Torres", correo:"ana.torres.tresesquinas@aula.demo", progreso:0, estado:"sin_iniciar" },
      { id:"demo-a2", nombre:"Luis Ramírez", correo:"luis.ramirez.tresesquinas@aula.demo", progreso:0, estado:"sin_iniciar" },
      { id:"demo-a3", nombre:"Sofía Gómez", correo:"sofia.gomez.tresesquinas@aula.demo", progreso:0, estado:"sin_iniciar" },
      { id:"demo-a4", nombre:"Diego Pérez", correo:"diego.perez.tresesquinas@aula.demo", progreso:0, estado:"sin_iniciar" },
      { id:"demo-a5", nombre:"Valentina Ruiz", correo:"valentina.ruiz.tresesquinas@aula.demo", progreso:0, estado:"sin_iniciar" },
      { id:"demo-a6", nombre:"Mateo Demo", correo:"mateo.demo.tresesquinas@aula.demo", progreso:0, estado:"sin_iniciar" },
    ]
  };
  const fallbackNames = ["Camila López","Samuel Rojas","Laura Gómez"];
  const classes=[];
  let seq=1;
  for (const grado of grados) {
    for (const materia of materias) {
      const isDemoRoster = grado === "8°" && materia === "Matemáticas";
      const estudiantes = isDemoRoster
        ? demoStudents[grado].map(e=>({...e}))
        : [
            { id:`demo-${seq}-1`, nombre:fallbackNames[(seq-1)%fallbackNames.length], correo:`demo.${seq}.aula@aula.demo`, progreso:0, estado:"sin_iniciar" },
            { id:`demo-${seq}-2`, nombre:fallbackNames[seq%fallbackNames.length], correo:`demo.${seq}b.aula@aula.demo`, progreso:0, estado:"sin_iniciar" }
          ];
      classes.push({
        id:`demo-${String(seq).padStart(2,"0")}`,
        nombre:`${grado}A · ${materia}`,
        grado, seccion:"A", salon:"A", materia,
        materias:[materia], codigo:`${materia.slice(0,3).toUpperCase()}-${grado.replace(/[^0-9]/g,"") || "0"}A-${100+seq}`,
        colegioId, profesorCorreo, estudiantes, recomendaciones:[]
      });
      seq++;
    }
  }
  return classes;
}
function loadClasses() {
  try {
    const raw = localStorage.getItem(CLASSES_KEY);
    const existing = raw ? JSON.parse(raw) : [];
    const list = Array.isArray(existing) ? existing : [];
    const demoEmail = "docente.tresesquinas@aula.demo";
    const demo = seedClasses(demoEmail);
    const custom = list.filter(c => c && c.profesorCorreo !== demoEmail);
    const oldDemo = list.filter(c => c && c.profesorCorreo === demoEmail);
    let merged = oldDemo.length < demo.length ? custom.concat(demo) : list;
    // Nunca inventar rendimiento: los rosters demo sirven solo para probar
    // el flujo, pero su avance debe comenzar en 0 y solo cambiar cuando
    // existan sesiones reales guardadas para ese estudiante.
    merged = merged.map(c => ({
      ...c,
      estudiantes: (c.estudiantes || []).map(st => {
        const hasRealSessions = Array.isArray(st.sessionScores) && st.sessionScores.length > 0;
        if (c.profesorCorreo === demoEmail && !hasRealSessions) {
          return {...st, progreso:0, estado:"sin_iniciar", leccionesCompletadas:0, respuestas:0, aciertos:0};
        }
        return st;
      })
    }));
    saveClasses(merged);
    return merged;
  } catch (e) {
    const seeded = seedClasses("docente.tresesquinas@aula.demo");
    saveClasses(seeded);
    return seeded;
  }
}
function saveClasses(list) {
  try { localStorage.setItem(CLASSES_KEY, JSON.stringify(list)); } catch (e) {}
}

let CLASSES = loadClasses();

function estadoLabel(e) { return e === "al_dia" ? "Al día" : e === "riesgo" ? "En riesgo" : "Atrasado"; }
function estadoClass(e) { return e === "al_dia" ? "promover" : e === "riesgo" ? "revision" : "no"; }

// ---------------------------------------------------------------------
// Niko: variedad de saludos (sin ligarlo a si la respuesta fue
// correcta/incorrecta — solo formas distintas de saludar/acompañar)
// ---------------------------------------------------------------------
const NIKO_GREETING_POSES = [
  { mood: "saludo", anim: "" },
  { mood: "saludo2", anim: "" },
  { mood: "pensativoSentado", anim: "" },
  { mood: "concentradoTablet", anim: "" },
  { mood: "preguntaDuda", anim: "" },
  { mood: "leyendoLibro", anim: "" },
  { mood: "interMotiva", anim: "" },
  { mood: "determinado", anim: "" },
];

function nikoGreeting() {
  const idx = STATE.nikoGreetIdx || 0;
  const pose = NIKO_GREETING_POSES[idx % NIKO_GREETING_POSES.length];
  updateState({ nikoGreetIdx: idx + 1 });
  return pose;
}

// poses de celebración más grandes/enérgicas — solo para momentos de logro
// real (terminar un reto completo, una racha), nunca por acertar o fallar
// una sola pregunta.
const NIKO_CELEBRATION_POSES = [
  { mood: "pulgarArriba", anim: "" },
  { mood: "calificacionA", anim: "" },
  { mood: "interMotiva", anim: "" },
  { mood: "senalaArriba", anim: "" },
];

function nikoCelebration() {
  const idx = STATE.nikoCelebIdx || 0;
  const pose = NIKO_CELEBRATION_POSES[idx % NIKO_CELEBRATION_POSES.length];
  updateState({ nikoCelebIdx: idx + 1 });
  return pose;
}

// ---------------------------------------------------------------------
// Racha real: se actualiza según la actividad de verdad.
// Solo una lección completa (todas sus preguntas correctas) cuenta como
// actividad del día; ver únicamente el video no aumenta la racha.
// ---------------------------------------------------------------------
function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

function registerDailyActivity() {
  // Única regla: una lección corta completada = meta diaria cumplida.
  // AULA_STREAK guarda la racha por estudiante y usa la hora local.
  if (window.AULA_STREAK) {
    const r = window.AULA_STREAK.completeLesson({ source: "completed_lesson" });
    updateState({
      streak: r.state.count,
      lastActivityDate: r.state.last_completed_day
    });
    return { changed: r.increased, streak: r.state.count };
  }

  // Fallback para entornos donde streak.js no cargue.
  const today = todayStr();
  if (STATE.lastActivityDate === today) {
    return { changed:false, streak:STATE.streak };
  }
  const prev = STATE.lastActivityDate;
  const d = new Date();
  d.setDate(d.getDate()-1);
  const yesterday = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
  const newStreak = !prev ? 1 : (prev===yesterday ? STATE.streak+1 : 1);
  updateState({streak:newStreak,lastActivityDate:today});
  return {changed:true,streak:newStreak};
}

// cada respuesta trae un "mood" — así Niko reacciona con la pose correcta
// (estado/interacción/expresión) según lo que el estudiante le pregunta.
const NIKO_QUICK_REPLIES = {
  "¿Qué es una fracción equivalente?": {
    text: "Dos fracciones son equivalentes cuando representan la misma cantidad. Ejemplos: 1/2 = 2/4 = 3/6 y 2/3 = 4/6. Para comprobarlo, multiplica cruzado o multiplica/divide numerador y denominador por el mismo número.",
    mood: "explica",
  },
  "Dame un ejemplo": {
    text: "¡Claro! Mira varios: 1/2 = 2/4, 2/3 = 4/6, 3/5 = 6/10 y 4/7 = 8/14. En todos multiplicamos arriba y abajo por el mismo número.",
    mood: "motiva",
  },
  "No entendí esta parte": {
    text: "No pasa nada. Dime el nombre del tema que estás viendo —por ejemplo, fracciones, potencias, radicales, ecuaciones, porcentajes o geometría— y te lo explico paso a paso con varios ejemplos.",
    mood: "duda",
  },
};

function nikoNormalize(text) {
  return String(text || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function nikoDetectTopic(text, activeTopic) {
  const t = nikoNormalize(text);
  const a = nikoNormalize(activeTopic);
  const rules = [
    [/fraccion/, "fracciones"],
    [/radical|radicacion|raiz cuadrada|raiz cubica/, "radicales"],
    [/potenci/, "potencias"],
    [/porcentaj/, "porcentajes"],
    [/ecuacion|variable|algebra/, "ecuaciones"],
    [/perimetro/, "perímetro"],
    [/area/, "área"],
    [/regla de tres|proporcional/, "proporcionalidad"],
    [/decimal/, "decimales"],
    [/multiplicacion|multiplicar/, "multiplicación"],
    [/division|dividir/, "división"],
    [/suma|sumar|adicion/, "suma"],
    [/resta|restar|sustraccion/, "resta"],
    [/probabilidad/, "probabilidad"],
    [/estadistica|promedio|media aritmetica/, "estadística"],
    [/triangulo|cuadrado|rectangulo|geometr/, "geometría"],
    [/numeros naturales|conteo/, "números naturales"],
  ];
  const found = rules.find(([rx]) => rx.test(t));
  if (found) return found[1];
  if (a) {
    const active = rules.find(([rx]) => rx.test(a));
    if (active && /(este tema|esta parte|no entiendo|explica|ejemplo|ayuda|como se hace|cómo se hace)/i.test(text)) return active[1];
  }
  return null;
}

function nikoTopicHelp(topic, text) {
  const t = nikoNormalize(text);
  const wantsExamples = /ejemplo|ejemplos|otro|otra|varios|muchos|practica|practicar/.test(t);
  const packs = {
    "fracciones": {
      base: "Una fracción representa partes iguales de un todo. El numerador dice cuántas partes tomamos y el denominador en cuántas partes iguales se divide el todo.",
      steps: "Ejemplo 1: 3/4 significa 3 de 4 partes. Ejemplo 2: 1/2 = 2/4 porque multiplicamos numerador y denominador por 2. Ejemplo 3: 2/3 = 4/6 porque multiplicamos ambos por 2. Para sumar 2/5 + 1/5, mantenemos el denominador y sumamos arriba: 3/5.",
      extra: "También puedes comparar 3/4 y 2/4: como tienen el mismo denominador, 3/4 es mayor porque 3 partes son más que 2."
    },
    "radicales": {
      base: "Una raíz busca el número que, al multiplicarse por sí mismo (o varias veces), produce el número que está dentro del radical.",
      steps: "Ejemplo 1: √25 = 5 porque 5 × 5 = 25. Ejemplo 2: √49 = 7 porque 7 × 7 = 49. Ejemplo 3: √81 = 9 porque 9 × 9 = 81. En una raíz cúbica, por ejemplo ∛27 = 3 porque 3 × 3 × 3 = 27.",
      extra: "Si tienes un cuadrado de área 64 m², su lado mide √64 = 8 m. Así la raíz aparece en situaciones reales de áreas y medidas."
    },
    "potencias": {
      base: "Una potencia es una forma corta de escribir una multiplicación repetida. La base es el número que se repite y el exponente indica cuántas veces se multiplica.",
      steps: "Ejemplo 1: 2³ = 2 × 2 × 2 = 8. Ejemplo 2: 5² = 5 × 5 = 25. Ejemplo 3: 10² = 100. Ejemplo 4: 3⁴ = 3 × 3 × 3 × 3 = 81.",
      extra: "En una situación de crecimiento, si una cantidad se duplica tres veces partiendo de 1, obtienes 1 × 2³ = 8."
    },
    "porcentajes": {
      base: "Un porcentaje indica una cantidad de cada 100. Por eso 25% significa 25 de cada 100, o 1/4.",
      steps: "Ejemplo 1: 10% de 80 es 80 × 10 ÷ 100 = 8. Ejemplo 2: 25% de 200 es 50. Ejemplo 3: 50% de 60 es 30. Ejemplo 4: si una mochila vale $80.000 y tiene 10% de descuento, el descuento es $8.000.",
      extra: "Para comprobar un porcentaje, convierte primero a fracción sobre 100 y después calcula la parte correspondiente."
    },
    "ecuaciones": {
      base: "Una ecuación es una igualdad con una cantidad desconocida. La idea es dejar la variable sola usando operaciones inversas.",
      steps: "Ejemplo 1: x + 7 = 19 → restamos 7 en ambos lados → x = 12. Ejemplo 2: x − 5 = 9 → sumamos 5 → x = 14. Ejemplo 3: 3x = 18 → dividimos entre 3 → x = 6.",
      extra: "Siempre comprueba: sustituye tu valor en la ecuación original y verifica que los dos lados sean iguales."
    },
    "perímetro": {
      base: "El perímetro es la longitud de todo el borde de una figura. Para encontrarlo, sumamos sus lados.",
      steps: "Ejemplo 1: un rectángulo de 8 m por 5 m tiene perímetro 8 + 5 + 8 + 5 = 26 m. Ejemplo 2: un cuadrado de lado 6 cm tiene perímetro 6 × 4 = 24 cm.",
      extra: "Piensa en una cerca alrededor de una huerta: necesitas medir todo el borde, no el espacio de adentro."
    },
    "área": {
      base: "El área mide cuánto espacio ocupa una superficie. Se expresa en unidades cuadradas.",
      steps: "Ejemplo 1: un rectángulo de 6 m por 4 m tiene área 6 × 4 = 24 m². Ejemplo 2: un cuadrado de lado 5 cm tiene área 5 × 5 = 25 cm².",
      extra: "Si conoces el área de un cuadrado y quieres encontrar su lado, usas una raíz: área 64 m² → lado √64 = 8 m."
    },
    "proporcionalidad": {
      base: "Dos cantidades son proporcionales cuando mantienen una relación constante. La regla de tres ayuda a encontrar una cantidad desconocida cuando conocemos tres datos relacionados.",
      steps: "Ejemplo: 2 cuadernos cuestan $6.000. Si cada cuaderno cuesta lo mismo, 5 cuadernos cuestan 6.000 × 5 ÷ 2 = $15.000. Otro ejemplo: si 3 litros alcanzan para 6 personas, para 12 personas necesitas 6 litros.",
      extra: "Antes de calcular, pregunta: ¿si una cantidad aumenta, la otra también aumenta en la misma proporción?"
    },
    "decimales": {
      base: "Los números decimales permiten representar partes de una unidad. En 2,5, el 2 representa unidades y el 5 representa cinco décimas.",
      steps: "Ejemplo 1: 0,5 = 1/2. Ejemplo 2: 0,25 = 25/100 = 1/4. Ejemplo 3: 2,5 + 1,2 = 3,7. Ejemplo 4: 4,8 − 1,3 = 3,5.",
      extra: "Alinea siempre las comas decimales antes de sumar o restar."
    },
    "multiplicación": {
      base: "Multiplicar es sumar una misma cantidad varias veces y también sirve para organizar grupos iguales.",
      steps: "Ejemplo 1: 4 × 3 = 12 porque 3 + 3 + 3 + 3 = 12. Ejemplo 2: 6 × 5 = 30. Ejemplo 3: 12 cajas con 8 cuadernos cada una contienen 96 cuadernos.",
      extra: "Puedes comprobar una multiplicación usando la división: si 12 × 8 = 96, entonces 96 ÷ 8 = 12."
    },
    "división": {
      base: "Dividir es repartir una cantidad en partes iguales o averiguar cuántos grupos caben en una cantidad.",
      steps: "Ejemplo 1: 20 ÷ 5 = 4 porque 20 repartido en 5 grupos da 4 en cada uno. Ejemplo 2: 36 ÷ 6 = 6. Ejemplo 3: 48 ÷ 8 = 6.",
      extra: "Comprueba una división multiplicando cociente × divisor."
    },
    "suma": {
      base: "Sumar significa juntar cantidades para encontrar un total.",
      steps: "Ejemplo 1: 24 + 15 = 39. Ejemplo 2: si una finca tiene 18 gallinas y llegan 7 más, hay 25. Ejemplo 3: 2,5 + 1,2 = 3,7.",
      extra: "En un problema, busca palabras como juntar, agregar, aumentar o recibir para identificar una posible suma."
    },
    "resta": {
      base: "Restar permite quitar una cantidad, comparar dos cantidades o encontrar cuánto falta.",
      steps: "Ejemplo 1: 30 − 12 = 18. Ejemplo 2: si tienes 20 semillas y usas 7, quedan 13. Ejemplo 3: si necesitas 50 y tienes 32, faltan 18.",
      extra: "Comprueba una resta sumando diferencia + cantidad quitada."
    },
    "probabilidad": {
      base: "La probabilidad indica qué tan posible es que ocurra un evento. Cuando todos los resultados tienen la misma posibilidad, usamos casos favorables ÷ casos posibles.",
      steps: "Ejemplo 1: 3 semillas rojas entre 10 → 3/10 = 30%. Ejemplo 2: en un dado, sacar 6 tiene probabilidad 1/6. Ejemplo 3: sacar un número par en un dado tiene 3 casos favorables de 6 → 1/2.",
      extra: "Una probabilidad de 0 significa imposible y una de 1 (100%) significa seguro."
    },
    "estadística": {
      base: "La estadística ayuda a organizar e interpretar datos. El promedio se obtiene sumando los datos y dividiendo entre cuántos datos hay.",
      steps: "Ejemplo: 10, 14 y 12 litros → 10 + 14 + 12 = 36 → 36 ÷ 3 = 12 litros de promedio. Otro ejemplo: 4, 6, 8 → promedio 18 ÷ 3 = 6.",
      extra: "También puedes comparar datos con tablas y gráficos para encontrar cuál valor es mayor, menor o más frecuente."
    },
    "geometría": {
      base: "La geometría estudia figuras, formas, medidas, posiciones y relaciones entre sus partes.",
      steps: "Ejemplo 1: un cuadrado tiene 4 lados iguales. Ejemplo 2: un rectángulo tiene lados opuestos iguales. Ejemplo 3: un triángulo tiene 3 lados. Para un rectángulo de 6 × 4, el área es 24 y el perímetro es 20.",
      extra: "Cuando veas una figura, identifica primero qué te preguntan: lados, perímetro, área, ángulos o posición."
    },
    "números naturales": {
      base: "Los números naturales se usan para contar y ordenar cantidades: 1, 2, 3, 4… según el contexto escolar también puede incluirse el 0.",
      steps: "Ejemplo 1: 8 es mayor que 5. Ejemplo 2: después de 19 viene 20. Ejemplo 3: 24 puede descomponerse como 20 + 4.",
      extra: "Para comparar números, empieza por la cifra de mayor valor posicional."
    }
  };
  const pack = packs[topic];
  if (!pack) return null;
  return `${pack.base} ${pack.steps} ${pack.extra}${wantsExamples ? " Aquí tienes varios ejemplos para practicar: intenta inventar uno parecido cambiando los números y luego comprueba el procedimiento." : ""}`;
}

function nikoCurriculumTopicMatch(text) {
  try {
    const t = nikoNormalize(text);
    if (typeof MALLA_ACADEMICA === "undefined") return null;
    const gradosPermitidos = new Set([1,2,3,4,5,8,9,10]);
    const matches=[];
    for (const g of gradosPermitidos) {
      const areas=MALLA_ACADEMICA[g]?.areas||{};
      for (const [area,val] of Object.entries(areas)) {
        const topics=Array.isArray(val)?val:Object.values(val).flat();
        for (const tema of topics) {
          const nk=nikoNormalize(tema);
          if (nk && (t.includes(nk) || nk.includes(t)) && t.length>=4) matches.push({grado:g,area,tema});
        }
      }
    }
    return matches.sort((a,b)=>a.tema.length-b.tema.length)[0]||null;
  } catch(e){ return null; }
}

function nikoDynamicTopicHelp(text, activeTopic=null) {
  const clean=nikoNormalize(text);
  // Dentro de una lección, Niko queda bloqueado al tema asignado por el docente.
  const activeMatch=activeTopic ? (nikoCurriculumTopicMatch(activeTopic) || {grado:"",area:"tu clase",tema:String(activeTopic)}) : null;
  const match=activeMatch || nikoCurriculumTopicMatch(text);
  if (!match) return null;
  const topicName=activeMatch ? String(activeTopic) : match.tema;
  const subjectHint=match.area;
  const grade=match.grado;
  const topicNorm=nikoNormalize(topicName);
  const qbank=typeof AULA_QUESTION_BANK!=="undefined" && Array.isArray(AULA_QUESTION_BANK) ? AULA_QUESTION_BANK : [];
  const qs=qbank.filter(q=>nikoNormalize(q.tema)===topicNorm && (!q.grado || String(q.grado)===String(grade))).slice(0,4);
  const wantsExercises=/ejercicio|ejercicios|practica|practicar|problema|problemas|resuelve/.test(clean);
  const wantsExample=/ejemplo|ejemplos|peras|manzanas|otro|otra|varios/.test(clean);
  const wantsComplete=/explica|explicame|completo|completa|desde cero|todo|entender|no entiendo/.test(clean);
  const simple=`Imagina que ${topicName} es como una caja de herramientas. Primero aprendemos para qué sirve cada herramienta; después vemos cuándo usarla; por último la usamos en un problema real.`;
  const intro=qs[0]?.explanation ? qs[0].explanation : `En ${topicName}, primero identifica qué significa la idea principal y qué datos te da el ejercicio. Luego aplica la regla de ${topicName} paso a paso y comprueba el resultado.`;
  const examples=qs.slice(0,3).map((q,i)=>`Ejemplo ${i+1}: ${q.q} <b>Respuesta:</b> ${q.options?.[q.correct]||""}. <b>Por qué:</b> ${q.explanation||q.hint||`porque aplicamos ${topicName} paso a paso.`}`).join('<br><br>');
  const practice=qs.map((q,i)=>`${i+1}. ${q.q}`).join('<br>');
  let out=`Estamos trabajando únicamente <b>${topicName}</b> de ${subjectHint}, ${grade}°. ${simple}<br><br><b>Explicación:</b> ${intro}`;
  if (examples) out+=`<br><br><b>Vamos con ejemplos:</b><br>${examples}`;
  if (wantsExample && !examples) out+=`<br><br><b>Ejemplo con peras y manzanas:</b> piensa en 3 grupos de 2 objetos. No memorices la respuesta: cuenta los grupos, identifica qué representa cada número y escribe el procedimiento de ${topicName}.`;
  if (wantsExercises) out+=`<br><br><b>Ahora practica ${topicName}:</b><br>${practice || `Te voy a proponer un problema sencillo de ${topicName}. Lee los datos, di qué te preguntan, aplica la regla y comprueba el resultado.`}`;
  if (wantsComplete || (!wantsExercises && !wantsExample)) out+=`<br><br><b>Pasos para no perderte:</b> 1) ¿Qué me dan? 2) ¿Qué me preguntan? 3) ¿Qué regla de ${topicName} necesito? 4) Resuelvo despacio. 5) Compruebo. Si quieres, te hago otro ejemplo con números más fáciles.`;
  return out;
}

function nikoReply(text, activeTopic = null) {
  // Tutor engine v5: topic-locked, example-first and age-adapted offline layer.
  if (window.AULA_TUTOR_ENGINE) {
    const engineMeta = { grade: (window.STATE?.student?.grade || window.STATE?.auth?.grado || ""), subject: (window.STATE?.activeLessonSubject || "") };
    const engineReply = window.AULA_TUTOR_ENGINE.response(activeTopic || null, text, activeTopic || null, engineMeta);
    if (engineReply) return engineReply;
  }
  const key = Object.keys(NIKO_QUICK_REPLIES).find(k => k.toLowerCase() === String(text).toLowerCase());
  if (key) return NIKO_QUICK_REPLIES[key];
  if (/gracias/i.test(text)) return { text: "¡De nada! Cuando quieras, dime el nombre del tema y lo trabajamos paso a paso.", mood: "abrazoRobot" };
  if (/genial|bien|entendi|entendí|listo/i.test(text)) return { text: "¡Muy bien! Ahora intenta resolver un ejemplo tú solo y, si quieres, te ayudo a revisar el procedimiento.", mood: "celebracion" };

  if (activeTopic) {
    const locked = nikoDynamicTopicHelp(text, activeTopic);
    if (locked) return { text: locked, mood: "explica" };
  }
  const topic = nikoDetectTopic(text, activeTopic);
  if (topic) {
    const help = nikoTopicHelp(topic, text);
    if (help) return { text: help, mood: "explica" };
  }
  const curriculumHelp = nikoDynamicTopicHelp(text, null);
  if (curriculumHelp) return { text: curriculumHelp, mood: "explica" };

  return {
    text: "Quiero ayudarte a aprender, no darte una respuesta de cualquier tema. Escríbeme el nombre del tema que estás estudiando, por ejemplo: “explícame potencias”, “no entiendo radicales” o “dame ejemplos de fracciones”, y te lo explico paso a paso con varios ejemplos.",
    mood: "duda",
  };
}
