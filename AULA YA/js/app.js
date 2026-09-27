// AulaYa — lógica de la app (router + pantallas + interacciones)
"use strict";

const viewRoot = document.getElementById("view-root");
const teacherShell = document.getElementById("teacher-shell");
const studentShell = document.getElementById("student-shell");
const bottomNav = document.getElementById("bottom-nav");
const toastEl = document.getElementById("toast");
const feedbackBar = document.getElementById("feedback-bar");

// ---------------------------------------------------------------------
// Iconos de línea (SVG en línea) — reemplazan los emoji de color que
// hacían ver la interfaz "genérica de IA". Trazo simple, un solo color
// (currentColor) que hereda del texto, en vez de pictogramas a color.
// ---------------------------------------------------------------------

const ICON_PATHS = {
  flame: '<path d="M12 2c1 3-3 4-3 8a3 3 0 0 0 6 0c0-1-.5-2-1-2 1.5 1 2.5 3 2.5 5a5 5 0 0 1-10 0c0-4 2.5-5.5 3-8 .3 1 1 1.5 1.5 1.5.5 0 1-.7 1-1.5 0-1-.3-2-.7-3z"/>',
  coin: '<circle cx="12" cy="12" r="8"/><path d="M12 8v8M9.5 9.5c0-1 1-1.8 2.5-1.8s2.5.7 2.5 1.7c0 2.3-5 1.4-5 3.7 0 1 1.1 1.9 2.5 1.9s2.5-.8 2.5-1.8"/>',
  bell: '<path d="M6 10a6 6 0 0 1 12 0c0 4 1.5 5.5 1.5 5.5H4.5S6 14 6 10z"/><path d="M10 19a2 2 0 0 0 4 0"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="M20 20l-4.8-4.8"/>',
  target: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r=".6" fill="currentColor"/>',
  door: '<path d="M13 4H7a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h6"/><path d="M11 12h9M17 8l4 4-4 4"/>',
  chat: '<path d="M4 5h16v11H8l-4 4V5z"/>',
  book: '<path d="M4 5.5C4 4.7 4.7 4 5.5 4H12v16H5.5A1.5 1.5 0 0 1 4 18.5v-13z"/><path d="M20 5.5C20 4.7 19.3 4 18.5 4H12v16h6.5a1.5 1.5 0 0 0 1.5-1.5v-13z"/>',
  lightbulb: '<path d="M9 18h6M10 21h4M7 10a5 5 0 1 1 10 0c0 2-1 3-2 4.2-.4.5-.7 1-.7 1.8H9.7c0-.8-.3-1.3-.7-1.8C8 13 7 12 7 10z"/>',
  chart: '<path d="M4 20V10M10 20V4M16 20v-7M4 20h16"/>',
  clipboard: '<rect x="5" y="4" width="14" height="17" rx="1.5"/><rect x="9" y="2.5" width="6" height="3" rx="1"/><path d="M8.5 11h7M8.5 15h7"/>',
  megaphone: '<path d="M4 10v4h3l6 4V6l-6 4H4z"/><path d="M17 9.5a3.5 3.5 0 0 1 0 5"/>',
  house: '<path d="M4 11.5 12 4l8 7.5"/><path d="M6 10v9.5a.5.5 0 0 0 .5.5H10v-6h4v6h3.5a.5.5 0 0 0 .5-.5V10"/>',
  folder: '<path d="M4 7a1 1 0 0 1 1-1h4.5l1.7 2H19a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7z"/>',
  medal: '<circle cx="12" cy="15" r="5"/><path d="m8.5 11-3-7M15.5 11l3-7M9 4h6"/>',
  robot: '<rect x="5" y="8" width="14" height="10" rx="2"/><path d="M12 8V5M9 12v1M15 12v1M8 18v2M16 18v2"/>',
  cap: '<path d="m12 4 10 5-10 5L2 9z"/><path d="M6 11.5V16c0 1.4 2.7 3 6 3s6-1.6 6-3v-4.5"/>',
  cloud: '<path d="M7 18a4 4 0 0 1-.5-8 5 5 0 0 1 9.6-1.6A4 4 0 0 1 17 18H7z"/>',
  cloudOff: '<path d="M3 3l18 18"/><path d="M7 18a4 4 0 0 1-.5-8 5 5 0 0 1 9.6-1.6A4 4 0 0 1 17 18h-3"/>',
  hat: '<path d="M12 3c-4 0-7 2-7 4.5S8 12 12 12s7-2 7-4.5S16 3 12 3z"/><path d="M6 9v4c0 1.5 2.7 3 6 3s6-1.5 6-3V9"/>',
  sliders: '<line x1="4" y1="6" x2="20" y2="6"/><circle cx="9" cy="6" r="2" fill="currentColor"/><line x1="4" y1="12" x2="20" y2="12"/><circle cx="15" cy="12" r="2" fill="currentColor"/><line x1="4" y1="18" x2="20" y2="18"/><circle cx="7" cy="18" r="2" fill="currentColor"/>',
};

// Marcador de "en línea"/"sin conexión": un punto de color, no un emoji.
function connDot(on) {
  return `<span class="conn-dot ${on ? "on" : "off"}" aria-hidden="true"></span>`;
}

function icon(name, size = 18, extraClass = "") {
  const body = ICON_PATHS[name];
  if (!body) return "";
  return `<svg class="icon icon-${name} ${extraClass}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
}

// ---------------------------------------------------------------------
// Utilidades
// ---------------------------------------------------------------------

function parseHash() {
  const raw = (location.hash || "#/inicio").replace(/^#\/?/, "");
  const [route, ...rest] = raw.split("/");
  return { route: route || "inicio", param: rest.join("/") };
}

function go(route) {
  const target = "#/" + route;
  if (location.hash === target) {
    // el hash no cambia (ya estábamos en esa ruta): "hashchange" no se
    // dispara solo, así que forzamos el re-render para reflejar el nuevo
    // estado (p. ej. crear una clase y quedarse en #/docente/clases).
    render();
  } else {
    location.hash = target;
  }
}

function showToast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add("show");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toastEl.classList.remove("show"), 2600);
}

async function fetchJsonWithTimeout(resource, options = {}, timeoutMs = 12_000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(resource, { ...options, signal: controller.signal });
    const data = await response.json();
    return { response, data };
  } finally {
    clearTimeout(timeout);
  }
}

function initials(name) {
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

function avatarCircle(text, size, bg, color) {
  return `<div class="ic" style="width:${size}px;height:${size}px;border-radius:50%;background:${bg};color:${color};display:flex;align-items:center;justify-content:center;font-weight:800;font-family:var(--font-head);flex-shrink:0;font-size:${size * 0.36}px;">${text}</div>`;
}

// Sprites oficiales de Niko (hoja de referencia del proyecto): cada "mood"
// es una pose/expresión real que se muestra según lo que se le pide al
// estudiante — saluda, piensa, explica, celebra o se pone triste.
const NIKO_MOOD_FILE = {
  exito: "estado-exito",
  intro: "estado-intro",
  pensando: "estado-pensando",
  triste: "estado-triste",
  saludo: "estado-saludo",
  habla: "inter-habla",
  explica: "inter-explica",
  motiva: "inter-motiva",
  duda: "inter-duda",
  sorprendido: "inter-sorprendido",
  celebracion: "inter-celebracion",
  concentrado: "expr-concentrado",
  confundido: "expr-confundido",
  determinado: "expr-determinado",
  // segunda hoja de referencia oficial (18 poses nuevas, más expresivas)
  saludo2: "saludo2",
  pulgarArriba: "pulgar-arriba",
  celebracionPuno: "celebracion-puno",
  tabletPensando: "tablet-pensando",
  preguntaDuda: "pregunta-duda2",
  senalaEmocionado: "senala-emocionado",
  estudiaLaptop: "estudia-laptop",
  leyendoLibro: "leyendo-libro",
  calificacionA: "calificacion-a",
  escuchaMusica: "escucha-musica",
  corriendo: "corriendo",
  saltoCelebracion: "salto-celebracion",
  letreroGracias: "letrero-gracias",
  abrazoRobot: "abrazo-robot",
  senalaArriba: "senala-arriba",
  globoTerraqueo: "globo-terraqueo",
  pensativoSentado: "pensativo-sentado",
  concentradoTablet: "concentrado-tablet",
};

function nikoSrc(mood) {
  return `icons/niko/${NIKO_MOOD_FILE[mood] || "estado-saludo"}.png`;
}

function nikoImg(mood, extraClass, alt) {
  return `<img class="niko-sprite ${extraClass || ""}" src="${nikoSrc(mood)}" alt="${alt || "Niko"}" />`;
}

function nikoGreetImg(size, alt) {
  const g = nikoGreeting();
  return nikoImg(g.mood, `niko-avatar-${size} ${g.anim}`, alt);
}

// solo para momentos de logro real (terminar un reto, una racha) — nunca
// por acertar o fallar una sola pregunta.
function nikoCelebrationImg(size, alt) {
  const g = nikoCelebration();
  return nikoImg(g.mood, `niko-avatar-${size} ${g.anim}`, alt);
}

// ---------------------------------------------------------------------
// Base de datos compartida (capacidad "db" del artefacto) — opcional.
// Cuando la app corre publicada como Artifact con capabilities:{db:{}},
// sincroniza cuentas y clases entre dispositivos. Si no está disponible
// (PWA normal, o vista previa local) todo sigue funcionando igual, solo
// con localStorage en este dispositivo — ver loadClasses/loadUsers.
// ---------------------------------------------------------------------

let DB = null;
let isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;
let lastSyncAt = null;
let syncIntervalId = null;
let syncBusy = false;
let dbInitializing = null;

async function initDb() {
  if (DB) return;
  if (dbInitializing) return dbInitializing;
  dbInitializing = (async () => {
  try {
    if (!(window.claude && typeof window.claude.use === "function")) return;
    DB = await window.claude.use("db");
    if (!DB) return;
    // Sync is intentionally less frequent: local-first changes are saved
    // immediately; shared data refreshes in the background.
    if (!syncIntervalId) syncIntervalId = setInterval(() => { if (isOnline && !document.hidden) syncAll(); }, 60_000);
    void syncAll();
  } catch (e) {
    DB = null; // sin capacidad db disponible: seguimos solo en localStorage
  } finally {
    dbInitializing = null;
  }
  })();
  return dbInitializing;
}

async function syncAll() {
  if (!DB || !isOnline || syncBusy) return;
  syncBusy = true;
  try {
    await syncUsersFromDb();
    await syncClassesFromDb();
    lastSyncAt = Date.now();
  } catch (e) {
    /* si falla, seguimos con lo que ya está guardado localmente */
  } finally {
    updateConnStatusUI();
    syncBusy = false;
  }
}

async function syncUsersFromDb() {
  if (!DB) return;
  try {
    const snap = await DB.collection("usuarios").get();
    if (snap && snap.docs && snap.docs.length) {
      saveUsers(snap.docs.map((d) => d.data()));
    } else {
      // no hay nada en la nube todavía: sube lo que exista localmente
      const local = loadUsers();
      for (const u of local) await DB.doc("usuarios/" + u.correo.replace(/[^a-z0-9]/gi, "_")).set(u);
    }
  } catch (e) {}
}

async function syncClassesFromDb() {
  if (!DB) return;
  try {
    const snap = await DB.collection("clases").get();
    if (snap && snap.docs && snap.docs.length) {
      CLASSES = snap.docs.map((d) => d.data());
      saveClasses(CLASSES);
    } else {
      for (const c of CLASSES) await DB.doc("clases/" + c.id).set(c);
    }
  } catch (e) {}
}

function persistUser(user) {
  registerUserLocal(user);
  if (DB && isOnline) DB.doc("usuarios/" + user.correo.replace(/[^a-z0-9]/gi, "_")).set(user).catch(() => {});
}

function persistClass(cls) {
  saveClasses(CLASSES);
  if (DB && isOnline) DB.doc("clases/" + cls.id).set(cls).catch(() => {});
}

// ---------------------------------------------------------------------
// Indicador de conexión: "esto se actualiza cuando hay internet, y antes
// de quedarse sin internet ya se puede seguir usando" — mientras hay
// conexión sincroniza cada rato (arriba); al perderla, la app sigue
// funcionando con la última copia que quedó guardada en el dispositivo.
// ---------------------------------------------------------------------

function connStatusText() {
  if (!isOnline) return connDot(false) + "Sin conexión · usando tu copia guardada";
  if (!DB) return connDot(true) + "En línea"; // PWA plana: sin base de datos compartida en este contexto
  if (!lastSyncAt) return connDot(true) + "En línea · sincronizando…";
  const mins = Math.round((Date.now() - lastSyncAt) / 60000);
  return connDot(true) + "Sincronizado " + (mins < 1 ? "hace un momento" : `hace ${mins} min`);
}

function updateConnStatusUI() {
  const cls = isOnline ? "" : "offline";
  const el = document.getElementById("conn-status");
  if (el) { el.innerHTML = connStatusText(); el.className = "conn-status " + cls; }
  const tEl = document.getElementById("teacher-conn-status");
  if (tEl) { tEl.innerHTML = connStatusText(); tEl.className = "teacher-conn-status " + cls; }
}

window.addEventListener("online", () => {
  isOnline = true;
  updateConnStatusUI();
  if (!DB) initDb(); else syncAll();
  if (!AULA_QUESTION_BANK_LOADED) void loadAulaQuestionBank();
  if (parseHash().route === "bienvenida" && RURAL_SCHOOLS_ERROR) {
    RURAL_SCHOOLS_READY = false;
    RURAL_SCHOOLS_ERROR = false;
    loadRuralSchoolCatalog().then(() => renderSchoolPickerOnly());
  }
  navigator.serviceWorker?.ready?.then(reg => reg.active?.postMessage({type:"AULA_PREFETCH_CORE"})).catch(()=>{});
});
window.addEventListener("offline", () => {
  isOnline = false;
  updateConnStatusUI();
  showToast("Sin conexión: puedes seguir usando AulaYa con tu última copia guardada.");
});
setInterval(updateConnStatusUI, 15_000);

// ---------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------

const STUDENT_ROUTES = new Set(["inicio", "notificaciones", "clase", "tema", "video", "ejercicios", "gamificacion", "perfil", "ranking", "futuro", "niko-chat", "vestidor"]);
const TEACHER_SECTIONS = new Set(["inicio", "clases", "clase", "recomendaciones", "seguimiento", "orientacion", "evaluaciones", "comunicaciones"]);

function render() {
  const { route, param } = parseHash();

  // Sincronización visual: la racha mostrada siempre viene del perfil actual.
  if (STATE.auth && STATE.auth.role === "estudiante") syncCurrentStudentToClasses();

  if (STATE.auth && STATE.auth.role === "estudiante" && window.AULA_STREAK) {
    const ss = window.AULA_STREAK.get();
    if (STATE.streak !== ss.count || STATE.lastActivityDate !== ss.last_completed_day) {
      STATE = Object.assign({}, STATE, {
        streak: ss.count,
        lastActivityDate: ss.last_completed_day
      });
      saveState(STATE);
    }
  }

  // puerta de acceso: sin cuenta registrada/iniciada, se muestra la
  // bienvenida (registro / inicio de sesión) antes que cualquier otra cosa.
  if (!STATE.auth && route !== "bienvenida") {
    studentShell.style.display = "none";
    teacherShell.style.display = "none";
    bottomNav.style.display = "none";
    location.hash = "#/bienvenida";
    return;
  }

  if (route === "bienvenida") {
    studentShell.style.display = "flex";
    studentShell.classList.add("auth-view");
    teacherShell.style.display = "none";
    bottomNav.style.display = "none";
    viewRoot.innerHTML = renderBienvenida();
    if (!RURAL_SCHOOLS_READY && !RURAL_SCHOOLS_ERROR) {
      loadRuralSchoolCatalog().then(() => {
        if (parseHash().route === "bienvenida") renderSchoolPickerOnly();
      });
    }
    viewRoot.scrollTop = 0;
    feedbackBar.className = "feedback-bar";
    feedbackBar.innerHTML = "";
    return;
  }

  if (route === "docente") {
    studentShell.style.display = "none";
    studentShell.classList.remove("auth-view");
    teacherShell.style.display = "flex";
    bottomNav.style.display = "none";
    renderTeacher(param || "inicio");
    window.scrollTo(0, 0);
    return;
  }

  studentShell.style.display = "flex";
  studentShell.classList.remove("auth-view");
  teacherShell.style.display = "none";
  bottomNav.style.display = "flex";

  // La malla académica general no es una pantalla del estudiante. Sus temas
  // se habilitan únicamente cuando una clase docente lo vincula y recomienda.
  if (route === "explorar") { go("inicio"); return; }

  let html = "";
  switch (route) {
    case "notificaciones": html = renderNotificaciones(); break;
    case "clase": html = renderStudentClase(param); break;
    case "tema": html = renderTema(param || "fracciones"); break;
    case "video": html = renderVideo(param || "fracciones"); break;
    case "ejercicios": html = renderEjercicios(param || "fracciones"); break;
    case "gamificacion": html = renderGamificacion(); break;
    case "perfil": html = renderPerfil(); break;
    case "vestidor": html = renderNikoWardrobe(); break;
    case "ranking": html = renderRanking(); break;
    case "futuro": html = renderFuturo(); break;
    case "niko-chat": html = renderNikoChat(); break;
    default: html = renderInicio(); break;
  }
  viewRoot.innerHTML = html;
  viewRoot.scrollTop = 0;
  feedbackBar.className = "feedback-bar";
  feedbackBar.innerHTML = "";

  // resaltar nav inferior
  const navGroup = { inicio: "inicio", gamificacion: "gamificacion", "niko-chat": "niko-chat", perfil: "perfil", ranking: "ranking" }[route] || (route === "tema" || route === "video" || route === "ejercicios" ? "inicio" : "inicio");
  document.querySelectorAll(".nav-item").forEach((btn) => {
    const isActive = btn.dataset.route === navGroup;
    btn.classList.toggle("active", isActive);
    if (isActive) btn.setAttribute("aria-current", "page");
    else btn.removeAttribute("aria-current");
  });

  afterRender(route, param);
}

window.addEventListener("hashchange", render);

// ---------------------------------------------------------------------
// Pantalla 1 — Inicio
// ---------------------------------------------------------------------


// ---------------------------------------------------------------------
// Acceso académico del estudiante: NO se muestra la malla completa.
// El contenido del estudiante nace de las clases a las que un docente
// lo vinculó. Una cuenta recién creada no tiene clases ni materias.
// ---------------------------------------------------------------------
const AULA_SUBJECT_CATALOG = [
  { id:"mate", name:"Matemáticas", icon:"Σ", color:"#3b6fd6", bg:"#e7effe" },
  { id:"espanol", name:"Español", icon:"Es", color:"#c76b2c", bg:"#fbe7d8" },
  { id:"ciencias_naturales", name:"Ciencias Naturales", icon:"Cn", color:"#279a5b", bg:"#dcf3e3" },
  { id:"ciencias_sociales", name:"Ciencias Sociales", icon:"So", color:"#a6472f", bg:"#f6e2dd" },
  { id:"ingles", name:"Inglés", icon:"En", color:"#3b6fd6", bg:"#e7effe" },
];

function normalizeSubjectName(name){
  const s=String(name||"").trim().toLowerCase();
  const map={
    "mate":"Matemáticas","matemática":"Matemáticas","matemáticas":"Matemáticas",
    "lenguaje":"Español","español":"Español","espanol":"Español",
    "ciencias":"Ciencias Naturales","ciencias naturales":"Ciencias Naturales",
    "sociales":"Ciencias Sociales","ciencias sociales":"Ciencias Sociales","historia":"Ciencias Sociales",
    "inglés":"Inglés","ingles":"Inglés"
  };
  return map[s] || name;
}

function studentLinkedClasses(){
  const correo=STATE.auth && STATE.auth.role==="estudiante" ? STATE.auth.correo : "";
  if(!correo) return [];
  return CLASSES.filter(c=>(c.estudiantes||[]).some(e=>String(e.correo).toLowerCase()===String(correo).toLowerCase()));
}

function studentLinkedSubjects(){
  const classes=studentLinkedClasses();
  const names=[];
  classes.forEach(c=>{
    const list=Array.isArray(c.materias) && c.materias.length ? c.materias : [c.materia];
    list.forEach(m=>{ const n=normalizeSubjectName(m); if(n && !names.includes(n)) names.push(n); });
  });
  return AULA_SUBJECT_CATALOG.filter(s=>names.includes(s.name));
}

function studentHasClasses(){
  return studentLinkedClasses().length>0;
}

function topicIdFor(title, grade, subject, classId) {
  return "t_" + normalizeQuestionKey(`${title}_${grade || ""}_${subject || ""}_${classId || ""}`);
}
function topicAliasForQuestions(title) {
  // No cruzamos temas. Un tema asignado por el docente solo puede recuperar
  // preguntas del mismo nombre normalizado.
  return title;
}
function buildLessonTopic(rec, cls) {
  const title=String(rec.temaExacto || rec.tema || "").trim();
  const subject=normalizeSubjectName(rec.materiaExacta || rec.materia || cls?.materia || "");
  const grade=cls?.grado || rec.grado || "";
  const id=rec.topicId || topicIdFor(title,grade,subject,cls?.id);
  return { id, title, subject:`${subject}${grade ? " · " + grade : ""}`, recommendedBy:rec.recommendedBy || "Tu docente", quote:rec.message || "Este tema fue recomendado por tu docente.", classId:cls?.id || rec.classId, grade, resources:[
    {id:"video",label:"Lección",meta:"Aprende paso a paso",icon:"▶",color:"#e7effe",route:"video"},
    {id:"ejercicios",label:"Ejercicios guiados",meta:"Practica con Niko",icon:"Ej",color:"#dcf3e3",route:"ejercicios"},
    {id:"reto",label:"Reto",meta:"Gana monedas",icon:"Re",color:"#fff1de",route:"ejercicios"},
    {id:"evaluacion",label:"Evaluación",meta:"Demuestra lo aprendido",icon:"Ev",color:"#fdeaea",route:"ejercicios"}
  ], videoSrc:rec.videoSrc || rec.videoUrl || rec.video || null, videoDuration:rec.videoDuration || "" };
}
function syncStudentClassContent() {
  if (!STATE.auth || STATE.auth.role !== "estudiante") return;
  const correo=String(STATE.auth.correo||"").toLowerCase();
  const linked=studentLinkedClasses();
  const topics=Object.assign({}, STATE.lessonTopics || {});
  const notes=Array.isArray(STATE.notifications)?STATE.notifications.slice():[];
  const existing=new Set(notes.map(n=>n.id));
  linked.forEach(cls=>{
    const membership = (cls.estudiantes || []).find(st => String(st.correo || '').toLowerCase() === correo);
    if (membership && membership.joinedAt) {
      const joinId = `class-${cls.id}-joined-${correo}`;
      if (!existing.has(joinId)) {
        notes.unshift({
          id: joinId, unread: true, type: "profesor", category: "Clases", avatar: "teacher", time: "Ahora",
          title: "Te agregaron a una clase",
          body: `${membership.joinedByName || "Tu docente"} te agregó a ${cls.nombre}. Ya puedes ver sus temas y actividades.`,
          action: {type:"clase", id:cls.id},
          target: {type:"estudiante", estudianteCorreo:correo}
        });
        existing.add(joinId);
      }
    }
    (cls.recomendaciones||[]).forEach(rec=>{
      if (rec.targetEmail && rec.targetEmail.toLowerCase()!==correo) return;
      const topic=buildLessonTopic(rec,cls); topics[topic.id]=topic;
      const nid=rec.notificationId || `rec-${cls.id}-${rec.id}`;
      if (!existing.has(nid)) {
        const isActivity = rec.kind === "actividad";
        notes.unshift({id:nid,unread:true,type:"profesor",title:"Profe. "+(rec.recommendedBy||"tu docente"),avatar:"teacher",time:"Ahora",body:isActivity ? `Nueva actividad de tu docente: ${topic.title} · ${cls.nombre}` : `Tu docente te recomendó: ${topic.title} · ${cls.nombre}`,action:{type:"tema",id:topic.id},target:{type:"estudiante",estudianteCorreo:correo}});
        existing.add(nid);
      }
    });
  });
  updateState({lessonTopics:topics,notifications:notes});
}
function getLessonTopic(id) {
  if (STATE.lessonTopics && STATE.lessonTopics[id]) return STATE.lessonTopics[id];
  return TEMAS[id] || null;
}

// Estado visible de una clase para el estudiante. Nunca inventa avance:
// se calcula únicamente con recursos que realmente quedaron marcados como hechos.
function studentTopicStatus(topicId) {
  const video = isResourceDone(topicId, "video");
  const practice = isResourceDone(topicId, "ejercicios");
  const reto = isResourceDone(topicId, "reto");
  const evaluation = isResourceDone(topicId, "evaluacion");
  const done = practice || evaluation; // la práctica/evaluación finaliza la lección
  const started = video || practice || reto || evaluation;
  return { video, practice, reto, evaluation, done, started };
}

function studentClassProgress(cls) {
  const correo = String(STATE.auth?.correo || "").toLowerCase();
  const recs = (cls?.recomendaciones || []).filter(r => !r.targetEmail || String(r.targetEmail).toLowerCase() === correo);
  if (!recs.length) return { total:0, completed:0, percent:0, status:"sin_temas" };
  let completed=0, started=0;
  recs.forEach(rec => {
    const topic = buildLessonTopic(rec, cls);
    const st = studentTopicStatus(topic.id);
    if (st.done) completed++;
    if (st.started) started++;
  });
  const percent = Math.round((completed / recs.length) * 100);
  return { total:recs.length, completed, started, percent, status: completed===recs.length ? "hecha" : started ? "en_progreso" : "pendiente" };
}

function studentClassStatusLabel(progress) {
  if (!progress || progress.status === "sin_temas") return "Sin actividades";
  if (progress.status === "hecha") return "✓ Clase hecha";
  if (progress.status === "en_progreso") return `En progreso · ${progress.percent}%`;
  return "Pendiente · 0%";
}

function renderInicio() {
  syncStudentClassContent();
  const linkedClasses = studentLinkedClasses();
  const subjects = studentLinkedSubjects();

  const subjectTiles = subjects.map(s => `
    <button class="subject-tile" data-subject="${s.id}" data-nav="inicio">
      <div class="ic" style="background:${s.bg};color:${s.color};">${s.icon}</div>
      <span>${s.name}</span>
    </button>`).join("");

  const classInfo = linkedClasses.map(c => {
    const recs = (c.recomendaciones || []).filter(r => !r.targetEmail || String(r.targetEmail).toLowerCase() === String(STATE.auth?.correo || "").toLowerCase());
    const progress = studentClassProgress(c);
    return `
    <button class="recommend-card student-class-card" data-nav="clase/${c.id}">
      <div class="ic" style="background:var(--green-100);color:var(--green-700);">${icon("book",20)}</div>
      <div class="info">
        <b>${c.nombre}</b>
        <small>${c.grado || ""}${c.materia ? " · " + normalizeSubjectName(c.materia) : ""}</small>
        <small>${studentClassStatusLabel(progress)} · ${progress.total ? `${progress.completed}/${progress.total} actividades` : "0/0 actividades"}</small>
      </div>
      <span class="chev">›</span>
    </button>`;
  }).join("");

  const empty = `
    <div class="student-empty-state">
      <div class="empty-school-icon">${icon("book",30)}</div>
      <h2>Aún no tienes una clase</h2>
      <p>Tu cuenta ya está lista. Cuando un docente te agregue a una clase, aquí aparecerán tus materias, temas y actividades.</p>
      <div class="empty-step"><b>1.</b> Tu docente crea la clase.</div>
      <div class="empty-step"><b>2.</b> Te agrega con tu correo.</div>
      <div class="empty-step"><b>3.</b> AulaYa carga solo lo que necesitas.</div>
    </div>`;

  return `
  <div class="screen">
    <div class="top-header">
      <div class="brand">${leafSvg()}</div>
      <div class="header-pill">
        <div class="pill streak">${icon("flame", 16)} ${window.AULA_STREAK ? window.AULA_STREAK.get().count : STATE.streak}</div>
        <div class="pill coins">${icon("coin", 16)} ${STATE.coins}</div>
        <button class="icon-btn" data-nav="notificaciones" aria-label="Notificaciones">
          ${icon("bell", 19)}${getNotifications().length ? '<span class="dot"></span>' : ''}
        </button>
      </div>
    </div>

    <div class="hello-card hello-welcome">
      <div class="hello-character" aria-hidden="true">
        ${(() => { const g = nikoGreeting(); return nikoImg(g.mood, `hello-niko ${g.anim}`, "Niko"); })()}
      </div>
      <div class="hello-copy">
        <h1>¡Hola, ${STATE.student.name}!</h1>
        <p class="hello-question">¿Qué quieres aprender hoy?</p>
        <div class="hello-bubble">
          <span>Siempre puedes aprender algo nuevo.</span>
        </div>
      </div>
    </div>

    ${linkedClasses.length ? `
      <div class="section-title">Mis clases</div>
      ${classInfo}

      <div class="section-title">Recomendado por tus profes</div>
      <div class="empty-note">Entra a una clase para ver qué quieres practicar. Las recomendaciones también seguirán llegando como notificaciones.</div>
    ` : empty}
  </div>`;
}

function leafSvg() {
  return `<span class="aulaya-wordmark"><img src="icons/aula-leaf-oficial.png" alt="" /><strong>AulaYa</strong></span>`;
}

// ---------------------------------------------------------------------
// Pantalla 2 — Notificaciones
// ---------------------------------------------------------------------

let notifFilter = "Todas";

// Una notificación sin "target" es visible para cualquiera (así se
// comportaban todas antes de esta función — se mantiene por compatibilidad
// con las notificaciones semilla y con quien no inicie sesión con correo).
// Con "target", solo la ve el estudiante correspondiente (por correo) o
// quien pertenezca a la clase indicada — así "enviar a un curso o
// estudiante en específico" es real y no solo un mensaje genérico.
function notifTargetVisible(n) {
  if (!n.target) return true;
  const correo = STATE.auth && STATE.auth.correo;
  if (!correo) return false;
  if (n.target.type === "estudiante") return correo === n.target.estudianteCorreo;
  if (n.target.type === "clase") {
    const cls = classById(n.target.claseId);
    return !!(cls && cls.estudiantes.some((e) => e.correo === correo));
  }
  return true;
}

function renderNotificaciones() {
  syncStudentClassContent();
  const list = getNotifications().filter(notifTargetVisible);
  const tabs = ["Todas", "Profesores", "AulaYa", "Oportunidades"];
  const filtered = list.filter((n) => {
    if (notifFilter === "Todas") return true;
    if (notifFilter === "Profesores") return n.type === "profesor";
    if (notifFilter === "AulaYa") return n.type === "aula";
    if (notifFilter === "Oportunidades") return /oportunidad|beca/i.test(n.body);
    return true;
  });

  const items = filtered.map((n) => {
    const icon = n.avatar === "teacher"
      ? avatarCircle(initials(n.title), 40, "var(--blue-100)", "var(--blue-600)")
      : n.avatar === "niko"
        ? `<div class="ic">${nikoImg("saludo", "niko-avatar-sm")}</div>`
        : `<div class="ic">${n.icon || icon("bell", 20)}</div>`;
    return `
    <div class="notif-item ${n.unread ? "unread" : ""}" data-notif="${n.id}">
      <button class="close" data-dismiss="${n.id}">✕</button>
      ${icon}
      <div class="body">
        <b>${n.title}</b>
        <p>${n.body}</p>
        <small>${n.time}</small>
      </div>
    </div>`;
  }).join("") || `<div class="empty-note">No tienes notificaciones en esta categoría.</div>`;

  return `
  <div class="screen">
    <div class="back-row">
      <button class="icon-btn" data-nav="inicio">←</button>
      <h2>Notificaciones</h2>
    </div>
    <div class="tabs-row">
      ${tabs.map((t) => `<button class="tab-chip ${t === notifFilter ? "active" : ""}" data-notif-tab="${t}">${t}</button>`).join("")}
    </div>
    ${items}
  </div>`;
}

// ---------------------------------------------------------------------
// Pantalla — Clase del estudiante: contenidos asignados por su docente
// ---------------------------------------------------------------------

function renderStudentClase(classId) {
  syncStudentClassContent();
  const correo = String(STATE.auth?.correo || "").toLowerCase();
  const cls = studentLinkedClasses().find(c => String(c.id) === String(classId));
  if (!cls) {
    return `<div class="screen"><div class="back-row"><button class="icon-btn" data-nav="inicio">←</button><h2>Clase</h2></div><div class="student-empty-state"><h2>Clase no disponible</h2><p>Esta clase ya no está vinculada a tu cuenta.</p></div></div>`;
  }
  const recs = (cls.recomendaciones || []).filter(r => !r.targetEmail || String(r.targetEmail).toLowerCase() === correo);
  const classProgress = studentClassProgress(cls);
  const topicCards = recs.map(rec => {
    const topic = buildLessonTopic(rec, cls);
    const st = studentTopicStatus(topic.id);
    const label = st.done ? "✓ HECHO" : st.started ? "EN PROGRESO" : "PENDIENTE";
    const detail = st.done ? "Clase completada" : st.started ? "Ya empezaste esta clase" : "Todavía no la has hecho";
    return `
      <div class="practice-topic-card ${st.done ? "is-complete" : ""}">
        <div class="practice-topic-icon">${st.done ? "✓" : icon("book",20)}</div>
        <div class="practice-topic-info">
          <span class="practice-topic-tag">${rec.targetEmail ? "ASIGNADO PARA TI" : "RECOMENDADO POR TU PROFE"}</span>
          <h3>${topic.title}</h3>
          <p>${rec.message || "Practica este tema paso a paso."}</p>
          <small><b>${label}</b> · ${detail}</small>
        </div>
        <button class="btn btn-primary practice-topic-btn" data-nav="tema/${topic.id}">${st.done ? "Ver" : "Practicar"}</button>
      </div>`;
  }).join("");

  return `
  <div class="screen">
    <div class="back-row">
      <button class="icon-btn" data-nav="inicio">←</button>
      <h2>${cls.nombre}</h2>
    </div>
    <div class="class-student-head">
      <div class="ic" style="background:var(--green-100);color:var(--green-700);">${icon("book",24)}</div>
      <div><small>CLASE</small><b>${normalizeSubjectName(cls.materia || (cls.materias || [""])[0])} · ${cls.grado || ""}</b><span>Tu docente: ${cls.profesorNombre || cls.profesor || "tu docente"}</span></div>
    </div>
    <div class="student-class-progress">
      <div class="progress-row"><b>${studentClassStatusLabel(classProgress)}</b><span>${classProgress.completed}/${classProgress.total} clases</span></div>
      <div class="progress-track"><div class="progress-fill" style="width:${classProgress.percent}%"></div></div>
      <small>${classProgress.total ? `Has completado ${classProgress.percent}% de las actividades asignadas.` : "Tu docente todavía no te ha asignado actividades."}</small>
    </div>
    <div class="section-title">¿Qué quieres practicar?</div>
    ${topicCards || `<div class="student-empty-state compact"><h2>Aún no hay temas</h2><p>Cuando tu docente te recomiende un tema, aparecerá aquí. También recibirás una notificación.</p></div>`}
  </div>`;
}

// ---------------------------------------------------------------------
// Pantalla 3 — Tema recomendado
// ---------------------------------------------------------------------

function renderTema(id) {
  syncStudentClassContent();
  const tema = getLessonTopic(id) || TEMAS.fracciones;
  STATE.activeLessonSubject = String(tema.subject || "").split("·")[0].trim();
  STATE.activeLessonGrade = String(tema.grade || "").trim();
  const resources = tema.resources.map((r) => {
    const done = isResourceDone(tema.id, r.id);
    return `
    <button class="resource-item ${done ? "done" : ""}" data-nav="${r.route}/${tema.id}">
      <div class="ic" style="background:${r.color};">${r.icon}</div>
      <div>
        <b>${r.label}</b>
        <small>${r.meta}</small>
      </div>
      <span class="chev">›</span>
    </button>`;
  }).join("");

  return `
  <div class="screen">
    <div class="back-row">
      <button class="icon-btn" data-nav="inicio">←</button>
      <h2>${tema.title}</h2>
    </div>

    <div class="reco-by">
      ${avatarCircle(initials(tema.recommendedBy), 42, "var(--blue-100)", "var(--blue-600)")}
      <div>
        <small>RECOMENDADO POR</small>
        <b>${tema.recommendedBy}</b>
        <p>"${tema.quote}"</p>
      </div>
    </div>

    ${resources}

    <button class="btn btn-primary" style="margin-top:14px;" data-nav="video/${tema.id}">Comenzar</button>
  </div>`;
}

// ---------------------------------------------------------------------
// Pantalla 4 — Video con IA
// ---------------------------------------------------------------------

let videoTab = "resumen";
let nikoChatLog = [];
let NIKO_ACTIVE_TOPIC = null;

// burbuja de chat compartida (mini-chat del video y chat completo con Niko):
// mientras "piensa" muestra la pose pensando con animación de pulso;
// al responder, muestra la pose (mood) que corresponda a esa respuesta.
function renderChatBubble(m) {
  if (m.mine) {
    return `<div class="niko-bubble mine"><div class="msg">${m.text}</div></div>`;
  }
  if (m.thinking) {
    return `
    <div class="niko-bubble">
      ${nikoImg("pensando", "niko-avatar-md niko-anim-pulse")}
      <div class="niko-thinking-bubble">
        Niko está pensando
        <span class="dots"><span></span><span></span><span></span></span>
      </div>
    </div>`;
  }
  return `
    <div class="niko-bubble">
      ${nikoImg(m.mood || "habla", "niko-avatar-md niko-anim-bounce-in")}
      <div class="msg">${m.text}</div>
    </div>`;
}

// ---------------------------------------------------------------------
// Descarga de videos para verlos sin internet (Cache Storage del
// navegador). El botón de descarga guarda el archivo del video en una
// caché dedicada ("aula-videos-v1"); el service worker sirve desde esa
// misma caché cuando detecta una petición a media/videos/ (ver
// service-worker.js) — así el <video> reproduce igual con o sin conexión
// una vez descargado. Si el video ya viene incrustado como data: URI
// (versión Artifact de una sola página), no hace falta descargar nada:
// ya está disponible siempre, y el botón solo lo marca como tal.
const VIDEO_CACHE = "aula-videos-v1";

function isVideoDownloaded(temaId) {
  return !!(STATE.downloadedVideos && STATE.downloadedVideos[temaId]);
}

async function downloadVideo(tema, {silent=false} = {}) {
  if (!tema.videoSrc) return;
  if (tema.videoSrc.startsWith("data:")) {
    // ya viene incrustado en la página — no hay nada que descargar aparte.
    const marked = Object.assign({}, STATE.downloadedVideos, { [tema.id]: { sizeMB: null, at: Date.now() } });
    updateState({ downloadedVideos: marked });
    if (!silent) showToast("Este video ya viene incluido en la app — no necesitas descargarlo aparte.");
    if (!silent) render();
    return;
  }
  if (!("caches" in window)) {
    if (!silent) showToast("Tu navegador no permite guardar videos para verlos sin internet.");
    return;
  }
  if (!silent) showToast("Descargando video…");
  try {
    const resp = await fetch(tema.videoSrc);
    if (!resp.ok) throw new Error("network");
    const blob = await resp.clone().blob();
    const cache = await caches.open(VIDEO_CACHE);
    await cache.put(tema.videoSrc, resp);
    const sizeMB = (blob.size / (1024 * 1024)).toFixed(1);
    const marked = Object.assign({}, STATE.downloadedVideos, { [tema.id]: { sizeMB, at: Date.now() } });
    updateState({ downloadedVideos: marked });
    if (!silent) showToast(`Video descargado (${sizeMB} MB) — ya puedes verlo sin internet.`);
  } catch (e) {
    if (!silent) showToast("No se pudo descargar el video. Revisa tu conexión e intenta de nuevo.");
  }
  if (!silent) render();
}

async function removeDownloadedVideo(tema) {
  if ("caches" in window && tema.videoSrc && !tema.videoSrc.startsWith("data:")) {
    try {
      const cache = await caches.open(VIDEO_CACHE);
      await cache.delete(tema.videoSrc);
    } catch (e) { /* nada que hacer si ya no estaba */ }
  }
  const marked = Object.assign({}, STATE.downloadedVideos);
  delete marked[tema.id];
  updateState({ downloadedVideos: marked });
  showToast("Descarga eliminada.");
  render();
}

function videoDownloadRow(tema) {
  if (!tema.videoSrc) return "";
  const downloaded = isVideoDownloaded(tema.id);
  const info = STATE.downloadedVideos[tema.id];
  if (downloaded) {
    const sizeTxt = info && info.sizeMB ? ` (${info.sizeMB} MB)` : "";
    return `
    <div class="video-download-row">
      <span class="video-download-info">✓ Descargado${sizeTxt} — disponible sin internet</span>
      <button class="btn-ghost" id="video-remove-download">Eliminar</button>
    </div>`;
  }
  return `
    <div class="video-download-row">
      <span class="video-download-info">Video corto (${tema.videoDuration || ""})</span>
      <button class="btn-ghost" id="video-download-btn">↓ Descargar para ver sin internet</button>
    </div>`;
}

function lessonEvidenceForTopic(tema){
  const title=String(tema?.title||"este tema");
  const subject=String(tema?.subject||"").split("·")[0].trim();
  const grade=tema?.grade || String(tema?.subject||"").split("·")[1]?.trim() || "";
  const bankKey=normalizeQuestionKey(topicAliasForQuestions(title));
  const qs=(AULA_QUESTION_BANK||[]).filter(q=>normalizeQuestionKey(q.tema)===bankKey && (!subject || q.materia===subject) && (!grade || !q.grado || String(q.grado).trim()===String(grade).trim())).slice(0,4);
  return {title,subject,grade,qs};
}
function topicLessonCopy(tema){
  const e=lessonEvidenceForTopic(tema);
  if (window.AULA_TUTOR_ENGINE) {
    const r=window.AULA_TUTOR_ENGINE.response(tema.title, "explícame este tema paso a paso con un ejemplo", tema.title, {grade:e.grade, subject:e.subject});
    if (r && r.text) {
      const plain=r.text;
      return {intro:`Vamos a aprender <b>${tema.title}</b> desde cero. Primero entendemos la idea, después vemos ejemplos y luego practicamos.`,example:plain,example2:`Ahora intenta resolver un ejercicio de <b>${tema.title}</b>. Si te equivocas, revisamos cada paso juntos.`};
    }
  }
  const first=e.qs[0], second=e.qs[1];
  const intro=first?.explanation ? first.explanation : `Vamos a aprender ${e.title} paso a paso. Primero entendemos qué significa, luego vemos cómo se usa y al final practicamos con un ejemplo.`;
  const example=first ? `Ejemplo guiado: ${first.q}<br><b>Respuesta:</b> ${first.options?.[first.correct]||"revisa el procedimiento"}.<br><b>¿Por qué?</b> ${first.explanation||first.hint||"Porque aplicamos la idea del tema paso a paso."}` : `Ejemplo guiado: piensa en una situación cotidiana relacionada con ${e.title}. Identifica los datos, decide qué regla del tema usar y comprueba el resultado.`;
  const example2=second ? `Otro ejemplo: ${second.q}<br><b>Respuesta:</b> ${second.options?.[second.correct]||""}.<br><b>Pasito a pasito:</b> ${second.explanation||second.hint||"Lee los datos, aplica la idea de este tema y revisa si la respuesta tiene sentido."}` : `Ahora cambia un número y resuelve un ejercicio parecido. La idea es practicar ${e.title}, no memorizar una respuesta.`;
  return {intro,example,example2};
}

function renderVideo(temaId) {
  const tema = getLessonTopic(temaId) || TEMAS[temaId] || TEMAS.fracciones;
  NIKO_ACTIVE_TOPIC = tema?.title || null;
  const mv = window.AULA_MICROVIDEOS?.render ? window.AULA_MICROVIDEOS.render(tema) : {scenes:[],subject:'',grade:''};
  const first = mv.scenes?.[0] || {tag:'MICROVIDEO IA',title:tema.title,body:'Aprende paso a paso.',mood:'saludo'};
  const safe = x => String(x||'').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const sceneJson = JSON.stringify(mv.scenes||[]).replace(/</g,'\\u003c');
  const tabContent = videoTab === "resumen" ? `
    <div class="reel-info-card"><span class="reel-badge">✦ MICROLECCIÓN IA · 9:16</span><b>${safe(tema.title)}</b><span>${safe(mv.subject)} · ${safe(mv.grade)}°</span><small>Explicación adaptada a grado + materia + tema, con ejemplo, error frecuente y reto. Funciona sin internet.</small></div>
    <div class="niko-bubble">${nikoImg("tabletPensando", "niko-avatar-md niko-anim-sway")}<div class="msg">Puedes decirme “dame otro ejemplo”, “no entendí” o “dame ejercicios”. Seguimos en <b>${safe(tema.title)}</b>.</div></div>
  ` : videoTab === "transcripcion" ? `
    <div class="explain-card"><p><b>Guion del microvideo</b><br><br>${(mv.scenes||[]).map((s,i)=>`<b>Escena ${i+1}:</b> ${safe(s.title)} — ${safe(String(s.body).replace(/<[^>]+>/g,''))}`).join('<br><br>')}</p></div>
  ` : renderNikoMiniChat();
  return `<div class="screen reel-screen"><div class="back-row"><button class="icon-btn" data-nav="tema/${tema.id}">←</button><h2>${safe(tema.title)}</h2></div>
    <div class="reel-wrap" id="aula-reel" data-scenes='${sceneJson}' data-scene="0">
      <div class="reel-progress" id="reel-progress"></div>
      <div class="reel-top"><span>✦ AulaYa</span><span class="reel-ia">IA · OFFLINE</span></div>
      <div class="reel-scene" id="reel-scene"></div>
      <div class="reel-side"><button id="reel-like" aria-label="Me gusta">♡</button><span>♡</span><button id="reel-next" aria-label="Siguiente">↑</button></div>
      <div class="reel-caption"><span class="reel-topic">${safe(mv.subject)} · ${safe(mv.grade)}°</span><h3>${safe(first.title)}</h3><p>${safe(String(first.body).replace(/<[^>]+>/g,''))}</p><small>Desliza o toca ↑ para continuar · ${safe(tema.title)}</small></div>
      <div class="reel-controls"><button id="reel-prev">‹</button><button id="reel-play">Ⅱ</button><button id="reel-next-bottom">›</button></div>
    </div>
    <div class="pill-tabs"><button data-video-tab="resumen" class="${videoTab === "resumen" ? "active" : ""}">Resumen</button><button data-video-tab="transcripcion" class="${videoTab === "transcripcion" ? "active" : ""}">Guion</button><button data-video-tab="pregunta" class="${videoTab === "pregunta" ? "active" : ""}">Pregúntale a Niko</button></div>
    <div id="video-tab-content">${tabContent}</div>
    ${videoDownloadRow(tema)}
    <button class="btn btn-primary" style="margin-top:10px;" id="video-continue">Continuar con ejercicios de ${safe(tema.title)}</button></div>`;
}


function safeText(x){return String(x||'').replace(/</g,'&lt;').replace(/>/g,'&gt;');}

function initAulaReel(){
  const wrap=document.getElementById('aula-reel'); if(!wrap) return;
  let scenes=[]; try{ scenes=JSON.parse(wrap.dataset.scenes||'[]'); }catch(e){ scenes=[]; }
  if(!scenes.length) return;
  let i=0, playing=true, timer=null;
  const sceneEl=document.getElementById('reel-scene');
  const caption=wrap.querySelector('.reel-caption');
  const progress=wrap.querySelector('#reel-progress');
  const playBtn=wrap.querySelector('#reel-play');
  const renderScene=()=>{
    const s=scenes[i];
    sceneEl.innerHTML=`<div class="reel-glow"></div><div class="reel-visual reel-visual-${s.visual||'topic'}"><div class="reel-visual-icon">${({topic:'📚',target:'🎯',concept:'💡',example:'🧩',steps:'🪜',warning:'⚠️',challenge:'🎯'})[s.visual||'topic']||'📚'}</div><span>${safeText(s.visual||'')}</span></div><div class="reel-character">${nikoImg(s.mood||'saludo','reel-niko','Niko')}</div><div class="reel-card"><span class="reel-tag">${s.tag}</span><h4>${s.title}</h4><p>${String(s.body||'').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</p></div>`;
    caption.querySelector('h3').textContent=s.title;
    caption.querySelector('p').textContent=String(s.body||'').replace(/<[^>]+>/g,'');
    progress.innerHTML=scenes.map((_,k)=>`<span class="${k===i?'active':''}"></span>`).join('');
    wrap.dataset.scene=String(i);
  };
  const stop=()=>{if(timer){clearTimeout(timer);timer=null;}};
  const schedule=()=>{stop(); if(!playing)return; timer=setTimeout(()=>{ if(i<scenes.length-1){i++;renderScene();schedule();} else {playing=false;playBtn.textContent='▶';}},5000);};
  const go=d=>{i=Math.max(0,Math.min(scenes.length-1,i+d));renderScene();schedule();};
  wrap.querySelector('#reel-next')?.addEventListener('click',()=>go(1));
  wrap.querySelector('#reel-next-bottom')?.addEventListener('click',()=>go(1));
  wrap.querySelector('#reel-prev')?.addEventListener('click',()=>go(-1));
  playBtn?.addEventListener('click',()=>{playing=!playing;playBtn.textContent=playing?'Ⅱ':'▶';schedule();});
  wrap.querySelector('#reel-like')?.addEventListener('click',e=>{e.currentTarget.classList.toggle('liked');e.currentTarget.textContent=e.currentTarget.classList.contains('liked')?'♥':'♡';});
  let y0=0;
  wrap.addEventListener('touchstart',e=>{y0=e.touches[0].clientY;},{passive:true});
  wrap.addEventListener('touchend',e=>{const dy=e.changedTouches[0].clientY-y0;if(Math.abs(dy)>40)go(dy<0?1:-1);},{passive:true});
  renderScene(); schedule();
}

function renderNikoMiniChat() {
  const bubbles = nikoChatLog.map(renderChatBubble).join("");

  return `
    <div class="chat-scroll" id="mini-chat-scroll">${bubbles}</div>
    <div class="ask-box" style="margin-top:12px;">
      <input type="text" id="mini-chat-input" placeholder="Escribe tu duda…" />
      <button id="mini-chat-send">➤</button>
    </div>`;
}

// ---------------------------------------------------------------------
// Pantalla 5 — Ejercicios
// ---------------------------------------------------------------------


let AULA_QUESTION_BANK = [];
let AULA_QUESTION_BANK_READY = false;
let AULA_QUESTION_BANK_LOADED = false;
let questionBankRequest = null;

function normalizeQuestionKey(s) {
  return String(s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}
function normalizeGradeValue(s) {
  const m = String(s || "").match(/\d+/);
  return m ? m[0] : String(s || "").trim();
}

async function loadAulaQuestionBank() {
  if (AULA_QUESTION_BANK_LOADED) return true;
  if (questionBankRequest) return questionBankRequest;
  questionBankRequest = (async () => {
    try {
      const { response: r, data } = await fetchJsonWithTimeout("./data/aula_question_bank.json", { cache: "no-cache" });
      if (!r.ok) throw new Error("question bank");
      AULA_QUESTION_BANK = Array.isArray(data.questions) ? data.questions : [];
      AULA_QUESTION_BANK_READY = AULA_QUESTION_BANK.length === 2961;
      AULA_QUESTION_BANK_LOADED = true;
      return true;
    } catch (e) {
      AULA_QUESTION_BANK = [];
      AULA_QUESTION_BANK_READY = false;
      return false;
    } finally {
      questionBankRequest = null;
    }
  })();
  return questionBankRequest;
}

function practicalMathQuestionsForTema(tema) {
  const title = String(tema?.title || "").trim();
  const key = normalizeQuestionKey(title);
  const make = (i, q, options, correct, explanation, hint, level="medio") => ({
    id: `practical_${key}_${i}`, grado: tema?.grade || "", materia: "Matemáticas", tema: title,
    tema_id: key, type: "practico", level, q, options, correct, hint, explanation
  });
  const out = [];
  if (/radical|radicacion|potenciacion|potencias/.test(key)) {
    out.push(
      make(1, "En una parcela cuadrada hay 49 plantas, organizadas en filas y columnas iguales. ¿Cuántas plantas hay en cada lado?", ["7", "6", "8", "9"], 0, "Si el cuadrado tiene la misma cantidad de filas y columnas, buscamos el número que multiplicado por sí mismo da 49. 7 × 7 = 49, por eso la longitud de cada lado es 7.", "Busca qué número multiplicado por sí mismo produce 49.", "basico"),
      make(2, "Una caja tiene 144 baldosas formando un cuadrado perfecto. ¿Cuántas baldosas hay en cada lado?", ["10", "11", "12", "14"], 2, "La raíz cuadrada de 144 responde cuántas baldosas caben por lado. Como 12 × 12 = 144, cada lado tiene 12 baldosas.", "Piensa en una multiplicación de dos números iguales que dé 144.", "basico"),
      make(3, "Un depósito cúbico tiene 27 cubitos iguales. Si se acomodan formando un cubo perfecto, ¿cuántos cubitos hay a lo largo de cada arista?", ["2", "3", "6", "9"], 1, "En un cubo usamos una raíz cúbica. Necesitamos un número que multiplicado tres veces por sí mismo dé 27: 3 × 3 × 3 = 27. Por eso hay 3 cubitos por arista.", "Prueba 3 × 3 × 3.", "medio"),
      make(4, "Para calcular una distancia en un plano aparece √81. ¿Qué valor representa esa raíz?", ["8", "9", "18", "27"], 1, "La raíz cuadrada busca el número que, al elevarlo al cuadrado, produce 81. Como 9 × 9 = 81, √81 = 9.", "Busca el número cuyo cuadrado sea 81.", "basico"),
      make(5, "Una señal cuadrada tiene un área de 64 cm². Si todos sus lados son iguales, ¿cuánto mide cada lado?", ["4 cm", "6 cm", "8 cm", "16 cm"], 2, "El área de un cuadrado es lado × lado. Entonces necesitamos √64. Como 8 × 8 = 64, cada lado mide 8 cm.", "Para pasar de área a lado de un cuadrado usamos la raíz cuadrada.", "medio"),
      make(6, "En una granja se duplican unas semillas en cada etapa: 2, luego 4, luego 8, luego 16. ¿Qué potencia representa 16 usando base 2?", ["2²", "2³", "2⁴", "2⁵"], 2, "Una potencia indica cuántas veces multiplicamos la base por sí misma. 2 × 2 × 2 × 2 = 16, así que la potencia es 2⁴.", "Cuenta cuántas veces aparece el 2 en la multiplicación que produce 16.", "medio"),
      make(7, "Un estudiante compara dos longitudes: √64 metros y 7 metros. ¿Cuál es mayor?", ["√64 m", "7 m", "Son iguales", "No se puede saber"], 0, "Primero calculamos √64 = 8. Después comparamos 8 con 7. Como 8 es mayor que 7, √64 m representa la longitud mayor.", "Calcula primero √64 y después compara.", "medio"),
      make(8, "En una huerta cuadrada el área es 100 m². ¿Qué operación permite encontrar directamente la medida de un lado?", ["100 + 100", "100 ÷ 2", "√100", "100 × 100"], 2, "El área de un cuadrado se obtiene multiplicando lado × lado. Para recuperar el lado a partir del área usamos la operación inversa: la raíz cuadrada. Por eso corresponde √100.", "Si lado × lado = área, piensa en la operación inversa.", "medio")
    );
    return out;
  }
  if (/fraccion/.test(key)) {
    out.push(
      make(1, "Una receta necesita 3/4 de taza de agua. Si ya tienes 1/4 de taza, ¿cuánto falta?", ["1/4", "1/2", "2/3", "3/4"], 1, "Las partes tienen el mismo denominador. Restamos los numeradores: 3/4 − 1/4 = 2/4. Simplificamos 2/4 a 1/2. Por eso falta media taza.", "Resta los numeradores porque las dos fracciones tienen el mismo denominador.", "basico"),
      make(2, "En una finca se sembró 2/5 del terreno en maíz y 1/5 en fríjol. ¿Qué fracción del terreno ya está sembrada?", ["2/5", "3/5", "3/10", "1/5"], 1, "Como los denominadores son iguales, sumamos los numeradores: 2 + 1 = 3. Entonces 2/5 + 1/5 = 3/5 del terreno.", "Mantén el denominador y suma los numeradores.", "basico"),
      make(3, "Una familia repartió 1/2 de una torta entre 4 niños por partes iguales. ¿Qué fracción de la torta recibe cada niño?", ["1/8", "1/6", "1/4", "2/8"], 0, "Dividir 1/2 entre 4 equivale a repartir la mitad en cuatro partes iguales. 1/2 ÷ 4 = 1/8. Cada niño recibe una octava parte.", "Divide el numerador o multiplica el denominador por 4.", "medio")
    );
    return out;
  }
  if (/porcentaje|porcentaj/.test(key)) {
    out.push(
      make(1, "En una tienda escolar, una mochila cuesta $80.000 y tiene 10% de descuento. ¿Cuánto dinero se descuenta?", ["$800", "$8.000", "$10.000", "$72.000"], 1, "10% significa 10 de cada 100. Calculamos 80.000 × 10 ÷ 100 = 8.000. Ese es el valor del descuento.", "Calcula primero el 10% como 10/100 del precio.", "medio"),
      make(2, "En una encuesta de 200 estudiantes, el 25% eligió fútbol. ¿Cuántos estudiantes lo eligieron?", ["25", "40", "50", "75"], 2, "El 25% equivale a 25/100 = 1/4. La cuarta parte de 200 es 50. Por eso 50 estudiantes eligieron fútbol.", "25% es lo mismo que una cuarta parte.", "medio")
    );
    return out;
  }
  if (/ecuacion|ecuaciones|algebra|algebraica|variable|expresion/.test(key)) {
    out.push(
      make(1, "Una tienda rural cobra $5.000 de envío más $3.000 por cada cuaderno. Si pagaste $17.000, ¿cuántos cuadernos compraste?", ["3", "4", "5", "6"], 1, "Planteamos 5.000 + 3.000x = 17.000. Restamos 5.000 a ambos lados: 3.000x = 12.000. Dividimos entre 3.000 y obtenemos x = 4.", "Primero quita el costo fijo de $5.000.", "medio"),
      make(2, "Si x + 7 = 19, ¿cuánto vale x?", ["10", "11", "12", "13"], 2, "Para dejar sola la x, restamos 7 en ambos lados: x = 19 − 7 = 12.", "Haz la operación inversa de sumar 7.", "basico")
    );
    return out;
  }
  if (/perimetro|area|geometr|triangulo|cuadrado|rectangulo|circunferencia/.test(key)) {
    out.push(
      make(1, "Un huerto rectangular mide 8 m de largo y 5 m de ancho. ¿Cuántos metros de cerca se necesitan para rodearlo?", ["13 m", "26 m", "40 m", "80 m"], 1, "Rodear el huerto significa calcular el perímetro. Sumamos todos los lados: 8 + 5 + 8 + 5 = 26 m.", "El perímetro suma todos los lados, no el área.", "basico"),
      make(2, "Una mesa rectangular mide 6 m de largo y 4 m de ancho. ¿Cuál es su área?", ["10 m²", "20 m²", "24 m²", "28 m²"], 2, "El área del rectángulo se calcula largo × ancho. Entonces 6 × 4 = 24 m².", "Para el área de un rectángulo multiplica largo por ancho.", "basico")
    );
    return out;
  }
  if (/estadistica|promedio|media|datos|probabilidad/.test(key)) {
    out.push(
      make(1, "Las cantidades de litros de agua recogidos en 3 días fueron 10, 14 y 12. ¿Cuál fue el promedio diario?", ["10 L", "11 L", "12 L", "14 L"], 2, "Sumamos los datos: 10 + 14 + 12 = 36. Como son 3 días, dividimos 36 ÷ 3 = 12. El promedio fue 12 litros.", "Suma todos los datos y divide entre la cantidad de datos.", "basico"),
      make(2, "En una bolsa hay 3 semillas rojas y 7 verdes. Si eliges una sin mirar, ¿qué probabilidad hay de sacar una roja?", ["3%", "10%", "30%", "70%"], 2, "Hay 10 semillas en total y 3 son rojas. La probabilidad es 3/10, que equivale al 30%.", "Divide casos favorables entre casos posibles.", "medio")
    );
    return out;
  }
  return null;
}

function practicalGenericMathQuestions(tema) {
  const title = String(tema?.title || "este tema");
  const key = normalizeQuestionKey(title);
  const nums = [12, 18, 24, 36, 48];
  const n = nums[key.length % nums.length];
  return [
    { id:`generic_math_${key}_1`, grado:tema?.grade||"", materia:"Matemáticas", tema:title, tema_id:key, type:"practico", level:"medio", q:`En una actividad de ${title}, tienes ${n} unidades para organizar en partes iguales. ¿Qué debes hacer primero para resolver el ejercicio?`, options:["Identificar los datos y la operación que relaciona esos datos", "Elegir cualquier operación sin mirar el problema", "Cambiar de tema", "Memorizar la respuesta"], correct:0, hint:"Antes de calcular, identifica qué te están dando y qué te están preguntando.", explanation:`Primero lee la situación y separa los datos de la pregunta. Después identifica la operación o propiedad de ${title} que conecta esos datos. Solo entonces haces el cálculo.`},
    { id:`generic_math_${key}_2`, grado:tema?.grade||"", materia:"Matemáticas", tema:title, tema_id:key, type:"practico", level:"medio", q:`Una estudiante obtiene un resultado en un ejercicio de ${title}. ¿Cuál es la mejor forma de comprobar si su procedimiento tiene sentido?`, options:["Revisar cada paso y comprobar el resultado con los datos del problema", "Cambiar la respuesta porque sí", "Ignorar las unidades", "Elegir la opción más larga"], correct:0, hint:"Comprueba el procedimiento, no solo el número final.", explanation:`Una buena comprobación vuelve a recorrer los pasos, verifica las operaciones y revisa si el resultado responde exactamente a la situación planteada. Así detectas errores antes de dar por terminado el ejercicio.`}
  ];
}

function genericQuestionsForAnyTema(tema) {
  const title=String(tema?.title||"este tema");
  const subject=String(tema?.subject||"").split("·")[0].trim() || "la materia";
  const key=normalizeQuestionKey(title);
  return [
    {id:`generic_${key}_1`,grado:tema?.grade||"",materia:subject,tema:title,tema_id:key,type:"practico",level:"basico",q:`¿Cuál es la idea principal que debes comprender sobre ${title}?`,options:[`Identificar qué significa ${title} y cuándo se utiliza`,`Memorizar una respuesta sin entenderla`,`Cambiar de tema`,`Elegir siempre la opción más larga`],correct:0,hint:`Primero explica ${title} con tus propias palabras.`,explanation:`Para aprender ${title}, empieza por definirlo, reconoce sus elementos principales y luego observa cómo se aplica en una situación concreta. Después comprueba si tu explicación responde exactamente a lo que se pregunta.`},
    {id:`generic_${key}_2`,grado:tema?.grade||"",materia:subject,tema:title,tema_id:key,type:"practico",level:"medio",q:`En un ejercicio de ${title}, ¿qué conviene hacer antes de dar una respuesta?`,options:[`Identificar los datos, la pregunta y el procedimiento adecuado`,`Responder sin leer`,`Copiar cualquier resultado`,`Ignorar la información del problema`],correct:0,hint:`Separa datos, pregunta y procedimiento.`,explanation:`Una estrategia segura es leer el problema, subrayar los datos relevantes, decir qué te están preguntando, elegir la regla o procedimiento de ${title}, resolver y finalmente comprobar el resultado.`},
    {id:`generic_${key}_3`,grado:tema?.grade||"",materia:subject,tema:title,tema_id:key,type:"practico",level:"reto",q:`¿Cómo puedes comprobar una respuesta de ${title}?`,options:[`Revisando cada paso y verificando si el resultado tiene sentido`,`Cambiarla al azar`,`No revisar nada`,`Usar una operación que no corresponde`],correct:0,hint:`Comprueba el procedimiento y el resultado en el contexto.`,explanation:`La comprobación consiste en volver sobre los pasos, revisar las operaciones o reglas utilizadas y preguntar si el resultado tiene sentido para el problema. Esta rutina ayuda a detectar errores.`}
  ];
}

function questionsForTema(temaId) {
  const tema = getLessonTopic(temaId) || ((typeof TEMAS !== "undefined" && TEMAS[temaId]) ? TEMAS[temaId] : null);
  const title = tema ? tema.title : temaId;
  const subjectText = tema ? tema.subject : "";
  const titleKey = normalizeQuestionKey(title);
  const subject = String(subjectText).split("·")[0].trim();
  // Primero buscamos coincidencia EXACTA de tema + materia + grado. No mezclamos temas.
  const bankTitle = topicAliasForQuestions(title);
  const bankKey = normalizeQuestionKey(bankTitle);
  const grade = tema && (tema.grade || String(tema.subject || "").split("·")[1]?.trim());
  const gradeKey = normalizeGradeValue(grade);
  const subjectKey = normalizeSubjectName(subject);
  let qs = AULA_QUESTION_BANK.filter(q =>
    normalizeQuestionKey(q.tema) === bankKey &&
    (!subjectKey || normalizeSubjectName(q.materia) === subjectKey) &&
    (!gradeKey || normalizeGradeValue(q.grado) === gradeKey)
  );
  // The imported AulaYa bank has exactly 3 questions per topic.
  // Do not fall back to generic questions when the topic is present in the bank:
  // the activity must stay strictly tied to grade + subject + topic.
  if (qs.length) return qs.slice(0, 3);
  if (subject === "Matemáticas") {
    const practical = practicalMathQuestionsForTema(tema);
    if (practical && practical.length) return practical.slice(0, 3);
    return practicalGenericMathQuestions(tema).slice(0, 3);
  }
  // Explicit legacy/demo alias: "Fracciones equivalentes" remains tied to
  // the existing demo quiz until the complete grade-specific lesson is loaded.
  if (temaId === "fracciones") return QUIZ_FRACCIONES.map((q,i)=>({
    ...q, id:`legacy_fracciones_q${i+1}`, grado:tema?.grade||"demo", materia:"Matemáticas",
    tema:tema?.title||"Fracciones equivalentes", tema_id:"fracciones_equivalentes"
  }));
  return genericQuestionsForAnyTema(tema);
}

let quiz = null;

function formatQuizTime(ms) {
  const total = Math.max(0, Math.round(ms / 1000));
  const min = Math.floor(total / 60);
  const sec = String(total % 60).padStart(2, "0");
  return `${min}:${sec}`;
}

function startQuiz(temaId) {
  const pool = questionsForTema(temaId);
  // Contrato del banco AulaYa: cada tema aporta exactamente 3 preguntas.
  // Después del video se presentan las 3, sin mezclar otros temas.
  const questions = [...pool].slice(0, 3);
  quiz = {
    temaId, questionPool: pool, questions, idx: 0, selected: null, answered: false,
    correctCount: 0, coinsEarned: 0, xpEarned: 0, done: false,
    mistakes: [], mistakeCountTotal: 0, rewarded: new Set(), reviewMode: false, startedAt: Date.now(),
    lastAnswerCorrect: null, score: 100
  };
}

function currentQuizQuestion() {
  return quiz && quiz.questions ? quiz.questions[quiz.idx] : null;
}

function renderEjercicios(temaId) {
  const activeTema = getLessonTopic(temaId) || TEMAS[temaId] || null;
  NIKO_ACTIVE_TOPIC = activeTema?.title || null;
  if (!quiz || quiz.temaId !== temaId) startQuiz(temaId);

  if (quiz.done) return renderQuizDone();
  if (!quiz.reviewMode && quiz.idx >= (quiz.questions || []).length && quiz.mistakes.length) return renderQuizReviewIntro();
  if (quiz.reviewMode && quiz.mistakes.length === 0) {
    quiz.done = true;
    return renderQuizDone();
  }

  const questions = quiz.questions || [];
  if (!questions.length) return renderQuizUnavailable(temaId);

  const q = quiz.reviewMode ? quiz.mistakes[0]?.question : questions[quiz.idx];
  if (!q) { quiz.done = true; return renderQuizDone(); }
  const total = questions.length;
  const currentNumber = quiz.reviewMode ? questions.findIndex(x => x.id === q.id) + 1 : quiz.idx + 1;
  const pct = Math.round(((currentNumber - 1) / total) * 100);
  const options = q.options.map((opt, i) => {
    let cls = "";
    if (quiz.answered) {
      if (quiz.lastAnswerCorrect && i === q.correct) cls = "correct";
      else if (i === quiz.selected) cls = "wrong";
    } else if (i === quiz.selected) cls = "selected";
    return `<button class="option-btn ${cls}" data-opt="${i}" ${quiz.answered ? "disabled" : ""}><span class="radio"></span> ${opt}</button>`;
  }).join("");

  return `
  <div class="screen">
    <div class="back-row">
      <button class="icon-btn" data-nav="tema/${temaId}">✕</button>
      <h2>${quiz.reviewMode ? "Repaso" : "Pregunta"} ${currentNumber}/${total}</h2>
    </div>
    <div class="quiz-progress"><div class="bar"><span style="width:${pct}%;"></span></div></div>
    ${quiz.reviewMode ? `<div class="review-banner">🔁 Vamos a repetir una pregunta que antes te costó. No te preocupes: aprende el paso y vuelve a intentarlo.</div>` : ""}
    <div class="quiz-question">${q.q}</div>
    <div class="option-list">${options}</div>
    <div id="hint-slot"></div>
    <div class="helper-row"><button id="btn-pista">${icon("lightbulb", 16)} Pista</button><button id="btn-ayuda">Ayuda</button></div>
    <button class="ask-niko-inline" data-nav="niko-chat">${icon("chat", 16)} Pregúntale a Niko</button>
    <button class="btn btn-primary" id="btn-revisar" ${quiz.selected === null || quiz.answered ? "disabled" : ""}>Revisar</button>
  </div>`;
}

function renderQuizUnavailable(temaId) {
  const tema = getLessonTopic(temaId) || TEMAS[temaId];
  return `<div class="screen quiz-done">${nikoImg("explica", "niko-avatar")}<h2>Lección disponible</h2><p>AulaYa preparó ${tema?.title || "este tema"} para que puedas practicarlo. Intenta entrar de nuevo para cargar sus ejercicios.</p><button class="btn btn-primary" data-nav="tema/${temaId}">Volver al tema</button></div>`;
}

function renderQuizReviewIntro() {
  const remaining = quiz.mistakes.length;
  return `
  <div class="screen quiz-review-intro">
    ${nikoImg("determinado", "niko-final-niko", "Niko listo para ayudarte")}
    <div class="review-kicker">CASI TERMINAMOS</div>
    <h2>Repitamos lo que te quedó mal</h2>
    <p>Te faltan ${remaining} pregunta${remaining === 1 ? "" : "s"}. Vamos a volver a ellas hasta que las resuelvas correctamente.</p>
    <div class="review-score">${quiz.score}% <small>resultado actual</small></div>
    <button class="btn btn-primary" id="quiz-start-review">Repetir pregunta</button>
  </div>`;
}

function renderQuizDone() {
  const streak = (quiz.streakResult && quiz.streakResult.streak) || STATE.streak;
  const totalCoins = quiz.coinsEarned + (quiz.bonusCoins || 0);
  const score = quiz.score;
  const xp = quiz.xpEarned || 0;
  return `
  <div class="screen quiz-done aula-completion-screen">
    <div class="completion-niko-wrap">${nikoImg("estadoExito", "niko-final-niko", "Niko celebrando")}</div>
    <div class="completion-kicker">LECCIÓN COMPLETA</div>
    <h2>¡Excelente, ${STATE.student.name}!</h2>
    <p>Terminaste la práctica de ${quiz.questions.length ? quiz.questions[0].tema : "este tema"}. Todas las preguntas quedaron correctas.</p>
    <div class="completion-stats">
      <div class="completion-stat xp"><span>✦</span><b>+${xp}</b><small>XP TOTAL</small></div>
      <div class="completion-stat time"><span>◷</span><b>${formatQuizTime(Date.now() - quiz.startedAt)}</b><small>TIEMPO</small></div>
      <div class="completion-stat score"><span>◎</span><b>${score}%</b><small>RESULTADO</small></div>
    </div>
    <div class="completion-streak">${icon("flame", 18)} Racha: <b>${streak} día${streak === 1 ? "" : "s"}</b> · +${totalCoins} monedas</div>
    ${score < 100 ? `<div class="completion-note">Tuviste que corregir ${quiz.mistakeCountTotal} pregunta${quiz.mistakeCountTotal === 1 ? "" : "s"}. Lo importante es que terminaste entendiendo cada una. Tu resultado conserva el descuento de 4% por cada pregunta que fallaste al primer intento.</div>` : `<div class="completion-note">¡Todas correctas desde el primer intento! Niko está orgulloso de ti. 💪</div>`}
    <button class="btn btn-primary" id="quiz-finish-btn">Continuar</button>
  </div>`;
}

// ---------------------------------------------------------------------
// ---------------------------------------------------------------------
// Pantalla 6 — Gamificación
// ---------------------------------------------------------------------
function renderGamificacion() {
  const rank=buildStudentRanking().slice(0,3);
  return `<div class="screen">
    <div class="top-header"><h2>Gamificación</h2><div class="pill coins">${icon("coin",16)} ${STATE.coins}</div></div>
    <div class="streak-hero">${nikoCelebrationImg("lg")}<h2>¡Racha de ${STATE.streak} días!</h2><p>La constancia también se celebra.</p></div>
    <div class="rank-card">
      <div class="rank-card-head"><div><span class="rank-kicker">RANKING DE MI SALÓN</span><h3>${getStudentGroupLabel()}</h3></div><button class="btn btn-soft btn-sm" data-nav="ranking">Ver ranking</button></div>
      ${rank.length ? rank.map((s,i)=>`<div class="rank-row ${s.isCurrent?"current":""}"><span class="rank-pos">${i+1}</span>${renderAvatar(s.avatar,s.name,40)}<div class="rank-name"><b>${s.name}${s.isCurrent?" · Tú":""}</b><small>${s.xp} XP</small></div></div>`).join("") : `<div class="empty-note">Cuando haya estudiantes en tu salón, aparecerán aquí.</div>`}
    </div>
    <div class="card"><div class="section-title" style="margin-top:0;">Tus monedas</div><p class="hint">Gana monedas completando actividades y úsalas para personalizar a Niko en su vestidor.</p><button class="btn btn-outline" data-nav="vestidor">Abrir el vestidor de Niko</button></div>
  </div>`;
}
// ---------------------------------------------------------------------
// Pantalla 7 — Perfil y progreso
// ---------------------------------------------------------------------

const AVATAR_CATEGORY_KEYS = {
  genero: "gender",
  piel: "skin",
  cabello: "hair",
  ojos: "eyes",
  nariz: "nose",
  boca: "mouth",
  ropa: "outfit",
  accesorio: "accessory",
  fondo: "background",
};
const AVATAR_CATEGORY_LABELS = [
  ["genero", "Género"],
  ["piel", "Piel"],
  ["cabello", "Cabello"],
  ["ojos", "Ojos"],
  ["nariz", "Nariz"],
  ["boca", "Boca"],
  ["ropa", "Ropa"],
  ["accesorio", "Accesorios"],
  ["fondo", "Fondo"],
];
let selectedAvatarCategory = "genero";

function avatarOption(category,id){ return (AVATAR_SHOP[category]||[]).find(x=>x.id===id)||null; }
function focusAvatarCategoryTab(){
  const tab=document.querySelector(`[data-avatar-category="${selectedAvatarCategory}"]`);
  if(tab){tab.focus({preventScroll:true});tab.scrollIntoView({block:"nearest",inline:"nearest"});}
}
function avatarGenderFromConfig(a){
  const g=String(a.gender||"").toLowerCase();
  return g.includes("male") ? "male" : g.includes("neutral") ? "neutral" : "female";
}
function renderAvatar(config=STATE.avatar,name=STATE.student?.name||"Estudiante",size=68){
  const a=Object.assign({gender:"gender-female",skin:"skin-1",hair:"hair-f-1",eyes:"eyes-1",nose:"nose-1",mouth:"mouth-1",outfit:"outfit-1",accessory:"accessory-none",background:"bg-1"},config||{});
  const skin={"skin-1":"#f8d7bd","skin-2":"#efbd94","skin-3":"#c98f67","skin-4":"#9a6247","skin-5":"#68422f"}[a.skin]||"#f8d7bd";
  const hair={"hair-f-1":"#242424","hair-f-2":"#3a2419","hair-f-3":"#171717","hair-f-4":"#5a3925","hair-m-1":"#242424","hair-m-2":"#171717","hair-m-3":"#3b271e","hair-m-4":"#5a3925"}[a.hair]||"#242424";
  const outfit={"outfit-1":"#279a5b","outfit-2":"#3b6fd6","outfit-3":"#3f4853","outfit-4":"#fb8c00","outfit-5":"#6b5bd5","outfit-6":"#ffffff"}[a.outfit]||"#279a5b";
  const bg={"bg-1":"#dff3e8","bg-2":"#dcecff","bg-3":"#ffe4cf","bg-4":"#dcefd8","bg-5":"#e8dcff"}[a.background]||"#dff3e8";
  const accessory=a.accessory==="accessory-glasses"?'<span class="avatar-glasses"></span>':a.accessory==="accessory-cap"?'<span class="avatar-cap"></span>':a.accessory==="accessory-headphones"?'<span class="avatar-headphones"></span>':a.accessory==="accessory-bow"?'<span class="avatar-bow"></span>':"";
  const gender=avatarGenderFromConfig(a);
  return `<div class="custom-avatar gender-${gender} ${a.hair||"hair-f-1"} ${a.eyes||"eyes-1"} ${a.nose||"nose-1"} ${a.mouth||"mouth-1"}" style="--avatar-size:${size}px;--avatar-bg:${bg};--avatar-skin:${skin};--avatar-hair:${hair};--avatar-outfit:${outfit};" aria-label="Avatar de ${name}"><span class="avatar-body"></span><span class="avatar-neck"></span><span class="avatar-head"></span><span class="avatar-ear left"></span><span class="avatar-ear right"></span><span class="avatar-hair"></span><span class="avatar-eye left"></span><span class="avatar-eye right"></span><span class="avatar-nose"></span><span class="avatar-mouth"></span>${accessory}</div>`;
}

function getStudentGroup(){
  return {school:String(STATE.auth?.colegioId||""),grade:String(STATE.student?.grade||STATE.auth?.grado||"").trim().toLowerCase(),salon:String(STATE.student?.salon||STATE.auth?.salon||"").trim().toLowerCase()};
}
function getStudentGroupLabel(){
  const grade=STATE.student?.grade||STATE.auth?.grado||"Sin curso", salon=STATE.student?.salon||STATE.auth?.salon||"Sin salón";
  return `${grade} · Salón ${salon}`;
}
function buildStudentRanking(){
  const g=getStudentGroup(); if(!g.school||!g.grade||!g.salon||!STATE.auth?.correo) return [];
  const currentEmail=String(STATE.auth.correo).toLowerCase();
  const users=loadUsers().filter(u=>u.role==="estudiante"&&String(u.colegioId||"")===g.school&&String(u.grado||"").trim().toLowerCase()===g.grade&&String(u.salon||"").trim().toLowerCase()===g.salon);
  const rows=users.map(u=>{const st=loadUserState(u);return {name:u.nombre,correo:u.correo,xp:Number(st.xp||0),avatar:st.avatar||DEFAULT_STATE.avatar,isCurrent:String(u.correo).toLowerCase()===currentEmail};});
  rows.sort((a,b)=>b.xp-a.xp||a.name.localeCompare(b.name,"es")); return rows;
}
function renderRanking(){
  const rows=buildStudentRanking(),me=rows.findIndex(r=>r.isCurrent);
  return `<div class="screen"><div class="back-row"><button class="icon-btn" data-nav="perfil">←</button><h2>Ranking de mi salón</h2></div>
    <div class="rank-scope"><strong>${getStudentGroupLabel()}</strong><small>Solo estudiantes de tu mismo colegio, curso y salón.</small></div>
    <div class="ranking-list">${rows.length?rows.map((s,i)=>`<div class="rank-row ${s.isCurrent?"current":""}"><span class="rank-pos">${i+1}</span>${renderAvatar(s.avatar,s.name,44)}<div class="rank-name"><b>${s.name}${s.isCurrent?" · Tú":""}</b><small>${s.xp} XP de experiencia</small></div></div>`).join(""):`<div class="empty-note">Aún no hay estudiantes registrados en este salón.</div>`}</div>
    ${me>=0?`<div class="rank-me">Tu posición actual: <strong>#${me+1}</strong> · ${rows[me].xp} XP</div>`:""}</div>`;
}
function renderAvatarEditor(){
  const a=Object.assign({},DEFAULT_STATE.avatar,STATE.avatar||{});
  const selectedCategory=AVATAR_CATEGORY_LABELS.some(([key])=>key===selectedAvatarCategory)?selectedAvatarCategory:"genero";
  const selectedKey=AVATAR_CATEGORY_KEYS[selectedCategory];
  const owned=Array.isArray(STATE.avatarOwned)?STATE.avatarOwned:[];
  const allItems=Object.values(AVATAR_SHOP).flat();
  const unlockedCount=allItems.filter((item)=>owned.includes(item.id)).length;
  const activeItem=avatarOption(selectedCategory,a[selectedKey]);
  const items=AVATAR_SHOP[selectedCategory]||[];
  return `<div class="avatar-editor">
    <div class="avatar-editor-hero">
      <div class="avatar-editor-copy"><span class="avatar-editor-kicker">TU PERSONAJE</span><h3>¡Este avatar eres tú!</h3><p>Cámbialo cuando quieras. Tu estilo se guarda automáticamente.</p></div>
      <div class="avatar-editor-stage">
        <span class="avatar-stage-spark spark-one" aria-hidden="true">✦</span>
        <span class="avatar-stage-spark spark-two" aria-hidden="true">✧</span>
        ${renderAvatar(a,STATE.student.name,154)}
        <span class="avatar-stage-level">NIVEL ${STATE.level}</span>
      </div>
      <div class="avatar-editor-meta">
        <div class="avatar-editor-name"><strong>${STATE.student.name||"Mi avatar"}</strong><span>${activeItem?activeItem.label:"Tu estilo personalizado"}</span></div>
        <div class="avatar-editor-wallet">${icon("coin",16)}<strong>${STATE.coins}</strong><span>monedas</span></div>
      </div>
      <div class="avatar-editor-progress"><span><b>${unlockedCount}</b> de ${allItems.length} estilos desbloqueados</span><button type="button" data-avatar-reset>Restablecer</button></div>
    </div>
    <div class="avatar-builder-heading"><div><span class="avatar-editor-kicker">TALLER CREATIVO</span><h3>Elige qué personalizar</h3></div><span class="avatar-builder-step">${items.length} opciones</span></div>
    <div class="avatar-category-tabs" role="tablist" aria-label="Categorías del avatar">
      ${AVATAR_CATEGORY_LABELS.map(([key,label])=>`<button type="button" id="avatar-tab-${key}" role="tab" aria-controls="avatar-panel" aria-selected="${selectedCategory===key}" tabindex="${selectedCategory===key?"0":"-1"}" class="avatar-category-tab ${selectedCategory===key?"active":""}" data-avatar-category="${key}">${label}</button>`).join("")}
    </div>
    <section id="avatar-panel" class="avatar-category-panel" role="tabpanel" aria-labelledby="avatar-tab-${selectedCategory}" tabindex="0">
      <div class="avatar-category-intro"><strong>${activeItem?`Estás usando: ${activeItem.label}`:"Escoge tu favorito"}</strong><span>Las opciones nuevas se compran con tus monedas.</span></div>
      <div class="avatar-options">${items.map((item)=>{
        const isOwned=owned.includes(item.id);
        const isActive=a[selectedKey]===item.id;
        const missing=Math.max(0,item.price-STATE.coins);
        const action=isActive?"En uso":isOwned?"Equipar":missing?`Te faltan ${missing} monedas`:`Desbloquear · ${item.price}`;
        const description=isActive?`${item.label}, actualmente seleccionado`:isOwned?`Equipar ${item.label}, gratis`:missing?`${item.label}: te faltan ${missing} monedas`:`Desbloquear ${item.label} por ${item.price} monedas`;
        return `<button type="button" class="avatar-option ${isActive?"active":""} ${isOwned?"owned":"locked"}" data-avatar-option="${selectedCategory}:${item.id}" aria-label="${description}" aria-pressed="${isActive}" title="${description}">
          <span class="avatar-option-icon">${item.icon}</span><b>${item.label}</b>
          <small class="avatar-option-status">${isActive?`<span aria-hidden="true">✓</span> En uso`:isOwned?"Equipar":`${icon("coin",12)} ${item.price} ${missing?`· faltan ${missing}`:"· desbloquear"}`}</small>
        </button>`;
      }).join("")}</div>
    </section>
  </div>`;
}

function nikoWardrobeItem(category, id) {
  return (NIKO_WARDROBE_ITEMS[category] || []).find((item) => item.id === id) || null;
}

function nikoWardrobeItemState(item) {
  return (STATE.nikoWardrobe?.unlocked || []).includes(item.id) ? "desbloqueado" : "bloqueado";
}

function purchaseNikoItem(item) {
  const wardrobe = normalizeNikoWardrobe(STATE.nikoWardrobe);
  if (wardrobe.unlocked.includes(item.id)) return "unlocked";
  if (STATE.coins < item.precio) return "insufficient";
  updateState({
    coins: STATE.coins - item.precio,
    nikoWardrobe: {
      ...wardrobe,
      unlocked: wardrobe.unlocked.concat(item.id),
    },
  });
  return "purchased";
}

function equipNikoItem(item) {
  const wardrobe = normalizeNikoWardrobe(STATE.nikoWardrobe);
  if (!wardrobe.unlocked.includes(item.id)) return false;
  updateState({
    nikoWardrobe: {
      ...wardrobe,
      equipped: { ...wardrobe.equipped, [item.categoria]: item.id },
    },
  });
  return true;
}

function renderNikoWardrobeAvatar() {
  const wardrobe = normalizeNikoWardrobe(STATE.nikoWardrobe);
  const gesture = nikoWardrobeItem("gestos", wardrobe.equipped.gestos);
  const outfit = nikoWardrobeItem("ropa", wardrobe.equipped.ropa);
  const accessory = nikoWardrobeItem("accesorios", wardrobe.equipped.accesorios);
  return `<div class="niko-wardrobe-preview" aria-label="Vista previa de Niko personalizado">
    <span class="niko-wearable outfit" title="Ropa equipada: ${outfit.nombre}">${outfit.icono}</span>
    ${nikoImg(gesture.pose, "niko-avatar-xl", `Niko: ${gesture.nombre}`)}
    <span class="niko-wearable accessory" title="Accesorio equipado: ${accessory.nombre}">${accessory.icono}</span>
    <div class="niko-equipped-labels"><span>${outfit.icono} ${outfit.nombre}</span><span>${accessory.icono} ${accessory.nombre}</span></div>
  </div>`;
}

function renderNikoWardrobe() {
  const categories = [
    ["gestos", "Gestos", "¡Elige cómo se expresa Niko!"],
    ["ropa", "Ropa", "Prueba un nuevo look para la aventura."],
    ["accesorios", "Accesorios", "Un detalle especial para completar su estilo."],
  ];
  const wardrobe = normalizeNikoWardrobe(STATE.nikoWardrobe);
  return `<div class="screen niko-wardrobe-screen">
    <div class="back-row"><button class="icon-btn" data-nav="perfil" aria-label="Volver al perfil">←</button><h2>Vestidor de Niko</h2><div class="pill coins">${icon("coin",16)} ${STATE.coins}</div></div>
    <p class="hint">Completa retos para ganar monedas, desbloquea nuevos estilos y elige cómo acompañará Niko tus aventuras.</p>
    <section class="niko-wardrobe-stage card">${renderNikoWardrobeAvatar()}<div class="niko-stage-caption"><strong>¡Este es Niko!</strong><span>Tu estilo se guarda en tu cuenta.</span></div></section>
    ${categories.map(([category, title, description]) => `<section class="niko-shop-category">
      <div class="niko-shop-heading"><div><h3>${title}</h3><p>${description}</p></div></div>
      <div class="niko-shop-grid">${NIKO_WARDROBE_ITEMS[category].map((item) => {
        const unlocked = nikoWardrobeItemState(item) === "desbloqueado";
        const active = wardrobe.equipped[category] === item.id;
        const missing = Math.max(0, item.precio - STATE.coins);
        const action = unlocked ? (active ? "En uso" : "Equipar") : (missing ? `Te faltan ${missing} monedas` : `Comprar · ${item.precio}`);
        const accessibleAction = unlocked ? (active ? "Ya está equipado" : `Equipar ${item.nombre}`) : (missing ? `Te faltan ${missing} monedas para ${item.nombre}` : `Comprar ${item.nombre} por ${item.precio} monedas`);
        return `<button class="niko-shop-item ${unlocked ? "unlocked" : "locked"} ${active ? "active" : ""}" data-niko-item="${category}:${item.id}" title="${accessibleAction}" aria-label="${accessibleAction}" ${active ? 'aria-pressed="true"' : ""}>
          <span class="niko-shop-art">${category === "gestos" ? `<img src="${item.visualRef}" alt="" loading="lazy">` : item.visualRef}</span>
          <span class="niko-shop-name">${item.nombre}</span>
          <span class="niko-shop-action">${unlocked ? action : `${icon("coin",12)} ${item.precio} · ${missing ? `faltan ${missing}` : "Comprar"}`}</span>
        </button>`;
      }).join("")}</div>
    </section>`).join("")}
    <p class="niko-wardrobe-footnote">Las prendas y accesorios se muestran como insignias en la vista previa; podrás verlos con sus sprites propios cuando estén disponibles.</p>
  </div>`;
}

function renderPerfil() {
  const rows=SUBJECTS.map(s=>{const prog=Number((STATE.subjectProgress||{})[s.name]||0);return `<div class="subject-row"><div class="ic" style="background:${s.bg};color:${s.color};">${s.icon}</div><div class="name">${s.name}</div><div class="bar"><span style="width:${prog}%;background:${s.color};"></span></div><div class="pct">${prog}%</div></div>`;}).join("");
  const xpPct=Math.min(100,Math.round((STATE.xp/STATE.xpGoal)*100)),sessions=loadActiveSessions();
  return `<div class="screen"><div class="top-header"><h2>Mi perfil</h2><div class="pill coins">${icon("coin",16)} ${STATE.coins}</div></div>
    <div class="profile-head">${renderAvatar(STATE.avatar,STATE.student.name,76)}<div><h2>${STATE.student.name}</h2><small>Estudiante · ${STATE.student.grade} · Salón ${STATE.student.salon||"—"}</small></div></div>
    <button class="niko-wardrobe-entry" data-nav="vestidor"><span class="niko-entry-avatar">${renderNikoWardrobeAvatar()}</span><span class="niko-entry-copy"><strong>¡Personaliza a Niko!</strong><small>Desbloquea gestos, ropa y accesorios con tus monedas.</small><b>Ir al vestidor <span aria-hidden="true">→</span></b></span></button>
    <div class="card avatar-profile-card">${renderAvatarEditor()}</div>
    <div class="level-card"><div class="row"><span>Nivel ${STATE.level}</span><span>${STATE.xp} / ${STATE.xpGoal} XP</span></div><div class="xp-bar"><span style="width:${xpPct}%;"></span></div></div>
    <div class="stat-grid"><div class="stat-card"><div class="n">${icon("coin",16)} ${STATE.coins}</div><div class="l">MONEDAS</div></div><div class="stat-card"><div class="n">${icon("flame",16)} ${STATE.streak}</div><div class="l">RACHA</div></div><div class="stat-card"><div class="n">${icon("target",16)} ${STATE.retosCompletados}</div><div class="l">RETOS</div></div></div>
    <button class="rank-banner" data-nav="ranking"><span class="rank-banner-icon">#</span><span><b>Ranking de mi salón</b><small>${getStudentGroupLabel()}</small></span><span>›</span></button>
    <div class="section-title">Cuentas iniciadas</div><div class="sessions-card">
      <div class="sessions-head"><p class="hint">Puedes mantener hasta 5 cuentas iniciadas y cambiar entre ellas sin cerrar sesión.</p><button class="btn btn-primary btn-sm add-account-btn" id="add-account-btn">＋ Agregar cuenta</button></div>
      ${sessions.map(s=>`<div class="session-row ${String(s.correo).toLowerCase()===String(STATE.auth?.correo).toLowerCase()?"current":""}">${avatarCircle(initials(s.nombre),38,"var(--green-100)","var(--green-700)")}<div><b>${s.nombre}</b><small>${s.role==="profesor"?"Docente":"Estudiante"} · ${s.correo}</small></div>${String(s.correo).toLowerCase()===String(STATE.auth?.correo).toLowerCase()?'<span class="session-active">Activa</span>':`<div class="session-actions"><button class="btn btn-soft btn-sm" data-switch-session="${s.correo}">Cambiar</button><button class="session-close" data-remove-session="${s.correo}" title="Cerrar esta cuenta en este dispositivo" aria-label="Cerrar esta cuenta en este dispositivo">×</button></div>`}</div>`).join("")}
      ${sessions.length>=5?'<div class="sessions-limit">Ya tienes 5 cuentas iniciadas. Para agregar otra, cierra una de las cuentas que no esté activa y luego toca “Agregar cuenta”.</div>':''}
    </div><div class="link-footer"><button id="logout-link">${icon("door",15)} Cerrar esta sesión</button></div>
  </div>`;
}
// ---------------------------------------------------------------------
// Pantalla 8 — Explorar materias
// ---------------------------------------------------------------------

// grado de la malla académica que se está mostrando en Explorar — arranca
// en el grado real del estudiante (si se pudo leer del registro) y el
// estudiante puede cambiarlo con los chips de grado.
let exploreMallaGrado = null;
function exploreDefaultGrado() {
  const g = parseGradoNum(STATE.student && STATE.student.grade);
  return g === null ? 8 : g;
}

function renderExplorar() {
  const gradoActivo = exploreMallaGrado !== null ? exploreMallaGrado : exploreDefaultGrado();
  const gradoInfo = MALLA_ACADEMICA[gradoActivo];
  const gradoChips = GRADOS_LISTA.map((g) => `
    <button class="grado-chip ${g === gradoActivo ? "active" : ""}" data-malla-grado="${g}">${gradoLabel(g)}</button>
  `).join("");

  const areasNorm = mallaAreasNormalizadas(gradoActivo);
  const totalTemas = areasNorm.reduce((n, a) => n + a.subareas.reduce((m, sa) => m + sa.temas.length, 0), 0);

  const areasHtml = areasNorm.map(({ area, subareas }) => {
    const count = subareas.reduce((n, sa) => n + sa.temas.length, 0);
    const ai = mallaAreaIcon(area);
    const body = subareas.map((sa) => {
      const temas = sa.temas.map((t) => {
        const tieneLeccion = t === MALLA_TEMA_CON_LECCION;
        return `<button class="tema-chip ${tieneLeccion ? "tema-chip-lista" : ""}" data-tema="${encodeURIComponent(t)}">${t}${tieneLeccion ? " ▶" : ""}</button>`;
      }).join("");
      return sa.nombre
        ? `<div class="subarea-block"><b>${sa.nombre}</b><div class="tema-grid">${temas}</div></div>`
        : `<div class="tema-grid">${temas}</div>`;
    }).join("");
    return `<details class="malla-area">
      <summary>
        <span class="malla-area-ic" style="background:${ai.bg};color:${ai.color};">${ai.icon}</span>
        <span class="malla-area-name">${area}</span>
        <span class="count">${count} temas</span>
      </summary>
      ${body}
    </details>`;
  }).join("");

  return `
  <div class="screen">
    <div class="back-row">
      <button class="icon-btn" data-nav="inicio">←</button>
      <h2>Explorar</h2>
    </div>
    <div class="niko-bubble">
      ${nikoImg("estudiaLaptop", "niko-avatar-md niko-anim-sway")}
      <div class="msg">¿Qué te llama la atención hoy? Elige tu grado y una materia para ver sus temas.</div>
    </div>
    <div class="search-box">${icon("search", 16)} Buscar materias…</div>

    <div class="section-title">¿En qué grado estás?</div>
    <div class="grado-chip-row">${gradoChips}</div>

    <div class="section-title">Materias de ${gradoLabel(gradoActivo)} <span class="see-all">${areasNorm.length} materias · ${totalTemas} temas</span></div>
    <p class="hint">${gradoInfo ? gradoInfo.nivel : ""} — una referencia de lo que se suele ver en Colombia en este grado (no es el currículo oficial de un colegio en particular), para que Niko sepa en qué parte del camino vas. Toca un tema para verlo — hoy solo "${MALLA_TEMA_CON_LECCION}" ▶ tiene video y ejercicios listos, el resto llega pronto.</p>
    <div class="malla-areas">${areasHtml}</div>
  </div>`;
}

// ---------------------------------------------------------------------
// Pantalla 9 — Tu futuro (11°)
// ---------------------------------------------------------------------

let futuroTab = "becas";

function renderFuturo() {
  const careers = CAREERS.map((c, i) => `
    <div class="career-item">
      <div class="n">${i + 1}</div>
      <span>${c}</span>
      <span class="check">✓</span>
    </div>`).join("");

  const oppo = (OPPORTUNITIES[futuroTab] || []).map((o) => `
    <div class="oppo-card">
      <div class="ic">${o.icon}</div>
      <div>
        <b>${o.title}</b>
        <small>${o.org}</small>
        <span class="deadline">${o.deadline}</span>
      </div>
    </div>`).join("") || `<div class="empty-note">Próximamente más oportunidades aquí.</div>`;

  return `
  <div class="screen">
    <div class="back-row">
      <button class="icon-btn" data-nav="inicio">←</button>
      <h2>${icon("cap", 20)} Mi futuro</h2>
    </div>

    <div class="niko-bubble">
      ${nikoImg("globoTerraqueo", "niko-avatar-md niko-anim-float")}
      <div class="msg">Tu futuro puede llevarte lejos — sigamos explorando tus opciones juntos.</div>
    </div>

    <div class="steps-row">
      <div class="step"><div class="circle done">✓</div></div>
      <div class="line"></div>
      <div class="step"><div class="circle active">2</div></div>
      <div class="line"></div>
      <div class="step"><div class="circle">3</div></div>
    </div>

    <div class="section-title">Mis carreras de interés</div>
    ${careers}
    <button class="add-option">+ Agregar otra opción</button>

    <div class="section-title">Oportunidades para ti</div>
    <div class="oppo-tabs">
      <button class="${futuroTab === "becas" ? "active" : ""}" data-oppo-tab="becas">Becas</button>
      <button class="${futuroTab === "universidades" ? "active" : ""}" data-oppo-tab="universidades">Universidades</button>
      <button class="${futuroTab === "eventos" ? "active" : ""}" data-oppo-tab="eventos">Eventos</button>
    </div>
    ${oppo}
  </div>`;
}

// ---------------------------------------------------------------------
// Chat completo con Niko (acceso desde la barra inferior)
// ---------------------------------------------------------------------

let nikoFullChatLog = [
  { mine: false, mood: "saludo", text: "¡Hola! Soy Niko, tu tutor de AulaYa. ¿Qué te gustaría aprender hoy?" },
];
let nikoFullChatContext = null;

function renderNikoSlmCard() {
  const config=window.AULA_SLM?.config||{};
  const status=window.AULA_SLM?.getStatus?.()||{};
  const selectedModel=status.selectedModel||config.defaultModel||config.fallback||"";
  const installedModel=status.installedModel||"";
  const isLoading=status.status==="loading"||status.status==="generating";
  const isInstalledReady=status.status==="ready"&&status.model===selectedModel&&installedModel===selectedModel;
  const hasRuntime=!!window.AULA_SLM?.install;
  const modelNames={
    [config.fallback]:"SmolLM2 135M · ligero",
    [config.primary]:"Qwen 0.5B · avanzado",
  };
  let message="El tutor curricular de Niko funciona sin descargar nada. Instala un modelo si también quieres generación local.";
  if(!hasRuntime) message="Preparando el motor local. El tutor curricular sigue disponible.";
  else if(status.status==="loading") {
    const percent=status.progress?.percent;
    message=`Descargando y preparando ${modelNames[status.model]||"el modelo local"}${Number.isFinite(percent)?` · ${Math.round(percent)}%`:"…"} No cierres esta pestaña.`;
  } else if(status.status==="generating") message="Niko está pensando en este dispositivo. Tu pregunta no se envía a un servidor.";
  else if(status.status==="ready"&&isInstalledReady) message=`${modelNames[status.model]||"Modelo local"} listo y guardado en este navegador para intentar usarlo sin conexión.`;
  else if(status.status==="ready") message=`${modelNames[status.model]||"Modelo local"} está cargado. Selecciona ese modelo o instala el que prefieras.`;
  else if(status.status==="error") message=escapeAuthHtml(status.error||"No se pudo preparar el modelo.");
  else if(installedModel) message="Se encontró un modelo instalado; comprobando su caché local…";

  const percent=status.progress?.percent;
  const progressLabel=status.progress?.total>0
    ? `${(status.progress.loaded/(1024*1024)).toFixed(1)} de ${(status.progress.total/(1024*1024)).toFixed(1)} MB`
    : "Descarga en curso";
  const disabled=!hasRuntime||isLoading||!navigator.onLine||isInstalledReady;
  const buttonText=!navigator.onLine&&!isInstalledReady?"Conéctate para descargar"
    :isLoading?"Preparando modelo…":isInstalledReady?"Modelo listo offline":"Descargar para uso sin conexión";
  const storageNote=status.persistentStorage===false&&isInstalledReady
    ? "El navegador no garantizó conservar los archivos; su caché puede eliminarse si falta espacio."
    : "La primera descarga requiere internet y espacio libre. Después, la disponibilidad offline depende de que el navegador conserve su caché.";
  return `<section class="niko-slm-card" id="niko-slm-card" aria-label="Estado del modelo local">
    <div class="niko-slm-heading"><span class="niko-slm-icon" aria-hidden="true">✦</span><div><strong>IA local opcional</strong><small>Niko también tiene un tutor curricular que funciona sin modelo.</small></div></div>
    <label class="niko-slm-model-label" for="niko-slm-model">Modelo para este dispositivo</label>
    <div class="niko-slm-controls"><select id="niko-slm-model" ${isLoading?"disabled":""}>
      ${config.fallback?`<option value="${config.fallback}" ${selectedModel===config.fallback?"selected":""}>Ligero · unos ${config.fallbackApproxMB||181} MB</option>`:""}
      ${config.primary?`<option value="${config.primary}" ${selectedModel===config.primary?"selected":""}>Avanzado · unos ${config.primaryApproxMB||786} MB</option>`:""}
    </select><button type="button" id="niko-slm-install" ${disabled?"disabled":""}>${buttonText}</button></div>
    <p class="niko-slm-message" id="niko-slm-message" role="status" aria-live="polite">${message}</p>
    ${status.status==="loading"?`<div class="niko-slm-progress-wrap"><progress max="100" ${Number.isFinite(percent)?`value="${percent}"`:""} aria-label="Progreso de descarga del modelo"></progress><small>${progressLabel}</small></div>`:""}
    <small class="niko-slm-storage-note">${storageNote}</small>
  </section>`;
}

function refreshNikoSlmCard() {
  const current=document.getElementById("niko-slm-card");
  if(!current) return;
  const focusedId=document.activeElement?.id;
  const holder=document.createElement("div");
  holder.innerHTML=renderNikoSlmCard();
  const updated=holder.firstElementChild;
  if(updated) {
    current.replaceWith(updated);
    if(focusedId&&updated.querySelector(`#${focusedId}`)) updated.querySelector(`#${focusedId}`).focus({preventScroll:true});
  }
}

window.addEventListener("aula-slm-status", refreshNikoSlmCard);
window.addEventListener("aula-slm-ready", refreshNikoSlmCard);
window.addEventListener("online", refreshNikoSlmCard);
window.addEventListener("offline", refreshNikoSlmCard);

function renderNikoChat() {
  // Si el estudiante llegó desde una lección, conservamos ese tema como
  // contexto. Si entró directamente desde la barra de Niko, puede escribir
  // el nombre del tema y el tutor lo detectará.
  const bubbles = nikoFullChatLog.map(renderChatBubble).join("");

  const chips = Object.keys(NIKO_QUICK_REPLIES).map((q) => `<button data-quick="${q}">${q}</button>`).join("");

  return `
  <div class="screen">
    <div class="niko-chat-head">
      ${nikoImg("explica", "niko-avatar-md")}
      <div>
        <b>Niko</b>
        <small>Tutor curricular offline · generación local opcional</small>
      </div>
    </div>
    ${renderNikoSlmCard()}
    <div class="chat-scroll" id="niko-full-scroll">${bubbles}</div>
    <div class="chip-row">${chips}</div>
    <div class="ask-box">
      <input type="text" id="niko-full-input" placeholder="Escribe tu duda…" />
      <button id="niko-full-send">➤</button>
    </div>
  </div>`;
}

// ---------------------------------------------------------------------
// Catálogo de colegios rurales — DANE 2024
// ---------------------------------------------------------------------
let authSelectedSchoolId = "";
let authSelectedDepartment = "";
let authSelectedMunicipality = "";
let authSchoolSearch = "";
let schoolCatalogRequest = null;
let schoolSearchTimer = null;

function normalizeSchoolText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function getSchoolById(id) {
  return RURAL_SCHOOLS.find((s) => String(s.id) === String(id)) || null;
}

function schoolSearchMatches() {
  const q = normalizeSchoolText(authSchoolSearch || document.getElementById("bv-colegio-busqueda")?.value);
  const dept = authSelectedDepartment || document.getElementById("bv-colegio-depto")?.value || "";
  const muni = authSelectedMunicipality || document.getElementById("bv-colegio-muni")?.value || "";
  let list = RURAL_SCHOOLS.filter((s) =>
    (!dept || s.departamento === dept) &&
    (!muni || s.municipio === muni)
  );

  if (q) {
    list = list.filter((s) => {
      const hay = normalizeSchoolText(
        `${s.nombre} ${s.municipio} ${s.departamento} ${s.id} ${s.principal_nombre}`
      );
      return hay.includes(q);
    });
  }
  return list;
}

function schoolSearchResults(matches = schoolSearchMatches()) {
  const q = normalizeSchoolText(authSchoolSearch || document.getElementById("bv-colegio-busqueda")?.value);
  const dept = authSelectedDepartment || document.getElementById("bv-colegio-depto")?.value || "";
  const muni = authSelectedMunicipality || document.getElementById("bv-colegio-muni")?.value || "";
  // En una búsqueda vacía mostramos pocas opciones; nunca pintamos miles de nodos.
  return matches.slice(0, q || dept || muni ? 30 : 8);
}

function schoolSearchSummary(matchCount = schoolSearchMatches().length) {
  const q = normalizeSchoolText(authSchoolSearch || document.getElementById("bv-colegio-busqueda")?.value);
  const dept = authSelectedDepartment || document.getElementById("bv-colegio-depto")?.value || "";
  const muni = authSelectedMunicipality || document.getElementById("bv-colegio-muni")?.value || "";

  if (!q && !dept && !muni) {
    return `Mostrando 8 sedes para explorar · busca por nombre, municipio o código DANE`;
  }
  if (!matchCount) return "No hay coincidencias · prueba otro nombre o cambia los filtros";
  if (matchCount > 30) return `${matchCount.toLocaleString("es-CO")} coincidencias · mostrando 30, afina tu búsqueda`;
  return `${matchCount.toLocaleString("es-CO")} ${matchCount === 1 ? "coincidencia" : "coincidencias"}`;
}

function schoolResultHtml(s) {
  const isSelected = String(s.id) === String(authSelectedSchoolId);
  const place = `${s.municipio}, ${s.departamento}`;
  return `
    <button type="button" class="school-result ${isSelected ? "selected" : ""}"
      data-school-id="${s.id}" aria-pressed="${isSelected}">
      <span class="school-result-icon" aria-hidden="true">🏫</span>
      <span class="school-result-info">
        <strong>${s.nombre}</strong>
        <small>${place} · ${s.tipo === "adscrita" ? "Sede adscrita" : "Sede principal"} · DANE ${s.id}</small>
      </span>
      <span class="school-result-check" aria-hidden="true">${isSelected ? "✓" : "›"}</span>
    </button>`;
}

function schoolPickerHtml() {
  if (RURAL_SCHOOLS_ERROR) {
    return `<div class="school-picker"><div class="school-picker-loading" role="status">No pudimos cargar la lista de colegios. Revisa tu conexión e inténtalo de nuevo.<br><button type="button" class="btn btn-soft btn-sm" id="retry-school-catalog">Reintentar</button></div></div>`;
  }
  if (!RURAL_SCHOOLS_READY) {
    return `<div class="school-picker"><div class="school-picker-loading" role="status">Cargando catálogo oficial de sedes rurales…</div></div>`;
  }
  const departments = [...new Set(RURAL_SCHOOLS.map(s => s.departamento))].sort((a,b) => a.localeCompare(b));
  const selected = getSchoolById(authSelectedSchoolId);
  const municipalities = [...new Set(RURAL_SCHOOLS
    .filter(s => !authSelectedDepartment || s.departamento === authSelectedDepartment)
    .map(s => s.municipio))].sort((a,b) => a.localeCompare(b));
  const matches = schoolSearchMatches();
  const results = schoolSearchResults(matches);

  const resultHtml = results.length
    ? results.map(schoolResultHtml).join("")
    : `<div class="school-empty">No encontramos coincidencias. Prueba otro nombre o cambia los filtros.</div>`;

  return `
    <div class="school-picker">
      <label for="bv-colegio-busqueda">Colegio o sede educativa</label>
      <div class="school-search-wrap">
        ${icon("search", 18)}
        <input id="bv-colegio-busqueda" type="search" autocomplete="off"
          aria-label="Buscar colegio por nombre, municipio o código DANE"
          aria-controls="bv-colegio-resultados" aria-describedby="bv-colegio-resumen"
          placeholder="Nombre, municipio o código DANE…" value="${authSchoolSearch || (selected ? selected.nombre : "")}" />
      </div>
      <div class="school-filter-row">
        <select id="bv-colegio-depto" aria-label="Filtrar por departamento"><option value="">Todos los departamentos</option>
          ${departments.map(d => `<option value="${d}" ${d === authSelectedDepartment ? "selected" : ""}>${d}</option>`).join("")}
        </select>
        <select id="bv-colegio-muni" aria-label="Filtrar por municipio"><option value="">Todos los municipios</option>
          ${municipalities.map(m => `<option value="${m}" ${m === authSelectedMunicipality ? "selected" : ""}>${m}</option>`).join("")}
        </select>
      </div>
      <div class="school-catalog-note">${RURAL_SCHOOLS.length.toLocaleString("es-CO")} sedes rurales · DANE Educación Formal 2024 · disponible sin conexión</div>
      <div class="school-results-summary" id="bv-colegio-resumen" role="status" aria-live="polite">${schoolSearchSummary(matches.length)}</div>
      <div class="school-results" id="bv-colegio-resultados" aria-label="Resultados de colegios">${resultHtml}</div>
      <input type="hidden" id="bv-colegio" value="${authSelectedSchoolId}" />
      ${selected ? `<div class="school-selected" role="status"><b>✓ Colegio elegido:</b> ${selected.nombre} · ${selected.municipio}, ${selected.departamento}</div>` : ""}
    </div>`;
}

async function loadRuralSchoolCatalog() {
  if (RURAL_SCHOOLS_READY && !RURAL_SCHOOLS_ERROR) return true;
  if (schoolCatalogRequest) return schoolCatalogRequest;
  schoolCatalogRequest = (async () => {
    try {
      const { response, data: payload } = await fetchJsonWithTimeout("./data/colegios_rurales_2024.json", { cache: "default" }, 12_000);
      if (!response.ok) throw new Error("catalogo");
      RURAL_SCHOOLS = Array.isArray(payload.records) ? payload.records : [];
      RURAL_SCHOOLS_READY = true;
      RURAL_SCHOOLS_ERROR = false;
      return true;
    } catch (e) {
      RURAL_SCHOOLS = [];
      RURAL_SCHOOLS_READY = true;
      RURAL_SCHOOLS_ERROR = true;
      return false;
    } finally {
      schoolCatalogRequest = null;
    }
  })();
  return schoolCatalogRequest;
}

function renderSchoolPickerOnly() {
  const picker = document.querySelector(".school-picker");
  if (!picker) return;
  const wrapper = document.createElement("div");
  wrapper.innerHTML = schoolPickerHtml();
  picker.replaceWith(wrapper.firstElementChild);
}

// ---------------------------------------------------------------------
// Bienvenida — registro e inicio de sesión (estudiante o profesor)
// ---------------------------------------------------------------------
// Credentials are validated by the account API; local profiles are kept
// only to support the existing offline-first learning state.

let authRole = "estudiante";
let authTab = "registro";
let authMode = "account";
let recoveryEmail = "";
let recoveryToken = "";

function authApiUrl(path) {
  const base = String(window.AULA_API_BASE_URL || "").replace(/\/+$/, "");
  if (!base) throw new Error("Configura la URL del API de autenticación antes de iniciar sesión.");
  return `${base}${path}`;
}

async function authApiRequest(path, payload) {
  let response;
  let data;
  try {
    ({ response, data } = await fetchJsonWithTimeout(authApiUrl(path), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }, 15_000));
  } catch (error) {
    if (error instanceof SyntaxError) throw new Error("El servidor de AulaYa devolvió una respuesta inválida.");
    throw new Error("No se pudo conectar con AulaYa. Revisa tu conexión e inténtalo de nuevo.");
  }
  if (!response.ok) {
    const detail = Array.isArray(data.detail) ? data.detail[0]?.msg : data.detail;
    const error = new Error(detail || "No se pudo completar la solicitud.");
    error.status = response.status;
    throw error;
  }
  return data;
}

function setAuthBusy(buttonId, busy) {
  const button = document.getElementById(buttonId);
  if (!button) return;
  button.disabled = busy;
  if (busy) {
    button.dataset.idleLabel = button.textContent;
    button.textContent = "Un momento…";
  } else if (button.dataset.idleLabel) {
    button.textContent = button.dataset.idleLabel;
    delete button.dataset.idleLabel;
  }
}

function escapeAuthHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[character]);
}

// Registro docente: "Todas" es una opción, no bloquea las materias.
function toggleMateriasTodas(masterCheckbox) {
  if (masterCheckbox.checked) {
    document.querySelectorAll(".bv-materia-check").forEach((c) => { c.checked = false; });
  }
}

function toggleMateriaIndividual(checkbox) {
  if (checkbox.checked) {
    const master = document.getElementById("bv-materias-todas");
    if (master) master.checked = false;
  }
}

// Opciones de grado del alcance actual: 1° a 5° y 8° a 10°.
// El estudiante o docente puede escribir variaciones como "9°A"; el
// catálogo se mantiene deliberadamente acotado al alcance de esta versión.
function gradosDatalistHtml(id) {
  return `<datalist id="${id}">${GRADOS_LISTA.map((g) => `<option value="${gradoLabel(g)}"></option>`).join("")}</datalist>`;
}

function renderBienvenida() {
  const registroFields = authRole === "estudiante" ? `
      <div class="field"><label>Nombre completo</label><input id="bv-nombre" type="text" placeholder="Tu nombre" /></div>
      <div class="field"><label>Correo</label><input id="bv-correo" type="email" placeholder="tucorreo@ejemplo.com" /></div>
      <div class="field">
        <label>Curso / grado al que perteneces</label>
        <input id="bv-grado" type="text" list="grados-datalist-estudiante" placeholder="Ej. 4°" />
        ${gradosDatalistHtml("grados-datalist-estudiante")}
      </div>
      <div class="field">
        <label>Salón / grupo</label>
        <input id="bv-salon" type="text" maxlength="10" placeholder="Ej. 1, A o 4-1" />
      </div>
      <p class="hint">El curso y el salón se usan para mostrarte únicamente el ranking de tu propio salón.</p>
      ${schoolPickerHtml()}
      <div class="field"><label>PIN de 4 dígitos</label><input id="bv-pin" type="password" inputmode="numeric" maxlength="4" placeholder="••••" /></div>
      <button class="btn btn-primary" id="bv-registro-btn">Crear cuenta de estudiante</button>
  ` : `
      <div class="field"><label>Nombre completo</label><input id="bv-nombre" type="text" placeholder="Tu nombre" /></div>
      <div class="field"><label>Correo</label><input id="bv-correo" type="email" placeholder="tucorreo@ejemplo.com" /></div>
      ${schoolPickerHtml()}
      <div class="field">
        <label>Materias que dictas</label>
        <div class="check-list">
          <label class="materia-todas-row"><input type="checkbox" id="bv-materias-todas" checked onclick="toggleMateriasTodas(this)" /> <strong>Todas las materias</strong> <span class="materia-recomendada">recomendado en zonas rurales</span></label>
          ${TEACHER_MATERIAS.map((m) => `<label class="materia-option"><input type="checkbox" class="bv-materia-check" value="${m}" onchange="toggleMateriaIndividual(this)" /> ${m}</label>`).join("")}
        </div>
        <p class="hint">Si dictas de todo, deja "Todas las materias" marcado. Si dictas solo algunas, desmárcala y elige cuáles — así en tu panel solo verás los temas de esas materias.</p>
      </div>
      <div class="field"><label>PIN de 4 dígitos</label><input id="bv-pin" type="password" inputmode="numeric" maxlength="4" placeholder="••••" /></div>
      <button class="btn btn-primary" id="bv-registro-btn">Crear cuenta de profesor</button>
  `;

  const loginFields = `
      <div class="field"><label>Correo</label><input id="bv-login-correo" type="email" placeholder="tucorreo@ejemplo.com" /></div>
      <div class="field"><label>PIN</label><input id="bv-login-pin" type="password" inputmode="numeric" maxlength="4" placeholder="••••" /></div>
      <button class="btn btn-primary" id="bv-login-btn">Iniciar sesión</button>
      <button class="auth-text-button" id="bv-recuperar-inicio" type="button">¿Olvidaste tu PIN? Recupera tu cuenta</button>
  `;
  const recoveryFields = authMode === "recovery-request" ? `
      <h2>Recupera tu cuenta</h2>
      <p class="auth-recovery-copy">Te enviaremos un código de 6 dígitos al correo de tu cuenta. También podrás migrar una cuenta guardada en este dispositivo.</p>
      <div class="field"><label for="bv-recuperar-correo">Correo de tu cuenta</label><input id="bv-recuperar-correo" type="email" autocomplete="email" value="${escapeAuthHtml(recoveryEmail)}" placeholder="tucorreo@ejemplo.com" /></div>
      <button class="btn btn-primary" id="bv-recuperar-enviar">Enviar código</button>
      <button class="auth-text-button" data-auth-recovery-back type="button">Volver a iniciar sesión</button>
  ` : authMode === "recovery-code" ? `
      <h2>Revisa tu correo</h2>
      <p class="auth-recovery-copy">Si el correo corresponde a una cuenta, te enviaremos un código. Escríbelo aquí; vence en 10 minutos.</p>
      <div class="field"><label for="bv-recuperar-codigo">Código de 6 dígitos</label><input id="bv-recuperar-codigo" type="text" inputmode="numeric" autocomplete="one-time-code" maxlength="6" placeholder="000000" /></div>
      <button class="btn btn-primary" id="bv-recuperar-verificar">Verificar código</button>
      <button class="auth-text-button" data-auth-recovery-back type="button">Volver a iniciar sesión</button>
  ` : `
      <h2>Crea un PIN nuevo</h2>
      <p class="auth-recovery-copy">Elige un PIN nuevo de 4 dígitos y confírmalo para recuperar tu cuenta.</p>
      <div class="field"><label for="bv-recuperar-pin">PIN nuevo</label><input id="bv-recuperar-pin" type="password" inputmode="numeric" autocomplete="new-password" maxlength="4" placeholder="••••" /></div>
      <div class="field"><label for="bv-recuperar-confirmar">Confirma el PIN nuevo</label><input id="bv-recuperar-confirmar" type="password" inputmode="numeric" autocomplete="new-password" maxlength="4" placeholder="••••" /></div>
      <button class="btn btn-primary" id="bv-recuperar-guardar">Guardar PIN nuevo</button>
      <button class="auth-text-button" data-auth-recovery-back type="button">Volver a iniciar sesión</button>
  `;
  const isRecovery = authMode !== "account";

  return `
  <div class="screen bienvenida-screen">
    <div class="bv-brand">${leafSvg()}</div>
    ${nikoGreetImg("lg")}
    <h1 style="text-align:center;">Aprende hoy, llega más lejos</h1>

    ${isRecovery ? "" : `<div class="role-toggle">
      <button class="${authRole === "estudiante" ? "active" : ""}" data-auth-role="estudiante">${icon("cap", 16)} Soy estudiante</button>
      <button class="${authRole === "profesor" ? "active" : ""}" data-auth-role="profesor">${icon("book", 16)} Soy profesor</button>
    </div>`}

    ${isRecovery ? "" : `<div class="pill-tabs" style="margin-top:14px;">
      <button data-auth-tab="registro" class="${authTab === "registro" ? "active" : ""}">Crear cuenta</button>
      <button data-auth-tab="login" class="${authTab === "login" ? "active" : ""}">Ya tengo cuenta</button>
    </div>`}

    <div class="form-card" style="margin-top:14px;">
      ${isRecovery ? recoveryFields : (authTab === "registro" ? registroFields : loginFields)}
      ${isRecovery ? "" : `<p class="hint" style="margin-top:10px;">El PIN tiene 4 dígitos. La cuenta y su recuperación requieren conexión a internet.</p>`}
    </div>
  </div>`;
}

async function doRegistro() {
  const nombre = (document.getElementById("bv-nombre") || {}).value || "";
  const correo = (document.getElementById("bv-correo") || {}).value || "";
  const colegioId = authSelectedSchoolId || (document.getElementById("bv-colegio") || {}).value || "";
  const pin = (document.getElementById("bv-pin") || {}).value || "";
  const grado = (document.getElementById("bv-grado") || {}).value || "";
  const salon = ((document.getElementById("bv-salon") || {}).value || "").trim();
  const materiasTodas = (document.getElementById("bv-materias-todas") || {}).checked;
  const materiasElegidas = Array.from(document.querySelectorAll(".bv-materia-check:checked")).map((el) => el.value);
  const materias = materiasTodas ? "todas" : materiasElegidas;

  if (!nombre.trim() || !correo.trim() || pin.length !== 4 || (authRole === "estudiante" && (!grado.trim() || !salon)) || (authRole === "profesor" && !materiasTodas && !materiasElegidas.length)) {
    showToast(authRole === "profesor" && !materiasTodas && !materiasElegidas.length
      ? "Elige al menos una materia o deja “Todas las materias” marcada."
      : "Completa nombre, correo y un PIN de 4 dígitos.");
    return;
  }
  if (!colegioId || !getSchoolById(colegioId)) {
    showToast("Selecciona tu colegio o sede educativa del catálogo.");
    return;
  }
  const previousLocalUser = findUserByEmail(correo);
  if (previousLocalUser?.pin && !previousLocalUser.correo.endsWith("@aula.demo")) {
    showToast("Ya hay un perfil local con ese correo. Ve a “Ya tengo cuenta” y recupera el PIN para migrarlo.");
    return;
  }

  const user = { role: authRole, nombre: nombre.trim(), correo: correo.trim(), colegioId, grado: grado || "", salon: salon || "", pin };
  if (authRole === "profesor") user.materias = materias;
  if (!isActiveSession(user.correo) && loadActiveSessions().length >= 5) { showToast("Ya tienes 5 cuentas iniciadas. Cierra una sesión antes de agregar otra."); return; }
  setAuthBusy("bv-registro-btn", true);
  try {
    const { user: account } = await authApiRequest("/auth/register", user);
    persistUser(account);
    addActiveSession(account);

  if (account.role === "estudiante") {
    // Cuenta nueva = estado nuevo por correo: cero progreso, cero monedas, cero racha.
    STATE = freshUserState(account);
    STATE.auth = { role:"estudiante", nombre:account.nombre, correo:account.correo, colegioId:account.colegioId, grado:account.grado || "", salon:account.salon || "" };
    STATE.student = { name:account.nombre, grade:account.grado || "", salon:account.salon || "" };
    STATE.notifications = [{
      id: "welcome-niko-" + Date.now(), type:"aula", category:"AULA", avatar:"niko", unread:true, time:"Ahora",
      title:"¡Bienvenido a AulaYa! 👋",
      body:`¡Hola, ${account.nombre.trim()}! Soy Niko. Cuando un docente te vincule a una clase, aquí recibirás tus temas y actividades.`
    }];
    updateState(STATE);
    if (window.AULA_STREAK) window.AULA_STREAK.initializeForNewStudent(account.correo);
    void loadAulaQuestionBank();
    go("inicio");
  } else {
    STATE = freshUserState(account);
    STATE.auth = { role:"profesor", nombre:account.nombre, correo:account.correo, colegioId:account.colegioId, materias:account.materias || "todas" };
    STATE.notifications = [{
      id:"welcome-teacher-" + Date.now(), type:"aula", category:"AULA", avatar:"niko", unread:true, time:"Ahora",
      title:"¡Bienvenido a AulaYa, profe! 👋",
      body:`¡Hola, ${account.nombre.trim()}! Soy Niko. Tu espacio docente ya está listo. Crea tu primera clase y comienza a acompañar a tus estudiantes.`
    }];
    updateState(STATE);
    go("docente");
  }
  } catch (error) {
    showToast(error.message);
  } finally {
    setAuthBusy("bv-registro-btn", false);
  }
}

function normalizeAvatarState(state){
  const a=Object.assign({gender:"gender-female",skin:"skin-1",hair:"hair-f-1",eyes:"eyes-1",nose:"nose-1",mouth:"mouth-1",outfit:"outfit-1",accessory:"accessory-none",background:"bg-1"}, state.avatar||{});
  if(a.shirt && !a.outfit) a.outfit=a.shirt;
  if(!String(a.hair||"").match(/^hair-/)) a.hair="hair-f-1";
  state.avatar=a;
  return state;
}

function applyDemoAccountSeed(user, state) {
  if (user?.correo !== "mateo.demo.tresesquinas@aula.demo" || user?.role !== "estudiante") return state;
  state.coins = Math.max(Number(state.coins || 0), 5000);
  state.xp = Math.max(Number(state.xp || 0), 4200);
  state.xpGoal = Math.max(Number(state.xpGoal || 0), 5000);
  state.level = Math.max(Number(state.level || 1), 12);
  state.avatarOwned = ["skin-1","skin-2","skin-3","hair-1","hair-2","hair-3","shirt-1","shirt-2","shirt-3","accessory-none","accessory-glasses","accessory-cap","bg-1","bg-2","bg-3"];
  state.avatar = Object.assign({skin:"skin-2",hair:"hair-3",shirt:"shirt-2",accessory:"accessory-glasses",background:"bg-2"}, state.avatar || {});
  return state;
}

function completeLogin(user) {
  if (!isActiveSession(user.correo) && loadActiveSessions().length >= 5) { showToast("Ya tienes 5 cuentas iniciadas. Cierra una sesión antes de agregar otra."); return; }
  registerUserLocal(user);
  const saved = loadUserState(user);
  STATE = applyDemoAccountSeed(user, Object.assign(freshUserState(user), saved));
  STATE.auth = { role:user.role, nombre:user.nombre, correo:user.correo, colegioId:user.colegioId, grado:user.grado || "", salon:user.salon || "", materias:user.materias || "todas" };
  addActiveSession(user);
  if (user.role === "estudiante") {
    localStorage.setItem("aula_current_student_id", String(user.correo));
    if (window.AULA_STREAK) { const ss=window.AULA_STREAK.get(user.correo); STATE.streak=ss.count; STATE.lastActivityDate=ss.last_completed_day; }
    if (!Array.isArray(STATE.notifications)) STATE.notifications=[];
    const accountState=loadUserState(user);
    if (Array.isArray(accountState.notifications) && accountState.notifications.length) STATE.notifications=accountState.notifications;
    syncStudentClassContent();
    updateState(STATE);
    go("inicio");
    void loadAulaQuestionBank();
  } else {
    if (!Array.isArray(STATE.notifications) || !STATE.notifications.length) {
      STATE.notifications=[{id:"welcome-teacher-"+Date.now(),type:"aula",category:"AULA",avatar:"niko",unread:true,time:"Ahora",title:"¡Bienvenido de nuevo a AulaYa! 👋",body:`¡Hola, ${user.nombre}! Soy Niko. Tu espacio docente está listo.`}];
    }
    updateState(STATE);
    go("docente");
  }
}

async function doLogin() {
  const correo = ((document.getElementById("bv-login-correo") || {}).value || "").trim();
  const pin = (document.getElementById("bv-login-pin") || {}).value || "";
  if (!correo || !pin) { showToast("Escribe tu correo y PIN."); return; }
  setAuthBusy("bv-login-btn", true);
  try {
    const { user } = await authApiRequest("/auth/login", { correo, pin });
    completeLogin(user);
  } catch (error) {
    const localUser = findUserByEmail(correo);
    if (error.status === 401 && localUser?.correo.endsWith("@aula.demo") && localUser.pin === pin) {
      completeLogin(localUser);
      return;
    }
    if (error.status === 401 && localUser && localUser.pin === pin) {
      recoveryEmail = localUser.correo;
      authMode = "recovery-request";
      render();
      showToast("Verifica tu correo para migrar esta cuenta guardada en el dispositivo.");
      return;
    }
    if (!error.status && localUser?.pin === pin) {
      completeLogin(localUser);
      showToast("Sesión local iniciada. La recuperación por correo requiere conexión.");
      return;
    }
    showToast(error.message);
  } finally {
    setAuthBusy("bv-login-btn", false);
  }
}

async function requestAccountRecovery() {
  recoveryEmail = (document.getElementById("bv-recuperar-correo")?.value || "").trim();
  if (!recoveryEmail) { showToast("Escribe el correo de tu cuenta."); return; }
  setAuthBusy("bv-recuperar-enviar", true);
  try {
    await authApiRequest("/auth/recovery/request", { correo: recoveryEmail });
    authMode = "recovery-code";
    render();
    document.getElementById("bv-recuperar-codigo")?.focus();
    showToast("Si el correo corresponde a una cuenta, recibirás un código.");
  } catch (error) {
    showToast(error.message);
  } finally {
    setAuthBusy("bv-recuperar-enviar", false);
  }
}

async function verifyAccountRecovery() {
  const codigo = (document.getElementById("bv-recuperar-codigo")?.value || "").trim();
  if (!/^\d{6}$/.test(codigo)) { showToast("Escribe el código de 6 dígitos."); return; }
  setAuthBusy("bv-recuperar-verificar", true);
  try {
    const result = await authApiRequest("/auth/recovery/verify", { correo: recoveryEmail, codigo });
    recoveryToken = result.token;
    authMode = "recovery-pin";
    render();
    document.getElementById("bv-recuperar-pin")?.focus();
  } catch (error) {
    showToast(error.message);
  } finally {
    setAuthBusy("bv-recuperar-verificar", false);
  }
}

async function resetAccountPin() {
  const pin = document.getElementById("bv-recuperar-pin")?.value || "";
  const confirmation = document.getElementById("bv-recuperar-confirmar")?.value || "";
  if (!/^\d{4}$/.test(pin)) { showToast("El PIN nuevo debe tener 4 dígitos."); return; }
  if (pin !== confirmation) { showToast("Los PIN no coinciden."); return; }
  const localUser = findUserByEmail(recoveryEmail);
  const legacyProfile = localUser ? {
    correo: localUser.correo,
    role: localUser.role,
    nombre: localUser.nombre,
    colegioId: localUser.colegioId,
    grado: localUser.grado || "",
    salon: localUser.salon || "",
    materias: localUser.materias || "todas",
  } : undefined;
  setAuthBusy("bv-recuperar-guardar", true);
  try {
    await authApiRequest("/auth/recovery/reset", {
      correo: recoveryEmail,
      token: recoveryToken,
      nuevo_pin: pin,
      legacy_profile: legacyProfile,
    });
    recoveryToken = "";
    if (localUser) {
      const migratedUser = { ...localUser };
      delete migratedUser.pin;
      registerUserLocal(migratedUser);
    }
    authMode = "account";
    authTab = "login";
    render();
    showToast("PIN actualizado. Ya puedes iniciar sesión.");
  } catch (error) {
    showToast(error.message);
  } finally {
    setAuthBusy("bv-recuperar-guardar", false);
  }
}

function doLogout() {
  removeActiveSession(STATE.auth?.correo || "");
  updateState({ auth: null });
  authTab = "registro";
  authMode = "account";
  recoveryToken = "";
  location.hash = "#/bienvenida";
  render();
}

// ---------------------------------------------------------------------
// Panel docente
// ---------------------------------------------------------------------

function currentTeacherName() {
  return (STATE.auth && STATE.auth.role === "profesor" && STATE.auth.nombre) || "Mariana Ruiz";
}
// Materias que dicta el profesor conectado — "todas" (incluidas cuentas
// creadas antes de que existiera este campo, como las cuentas demo) por
// defecto, típico de profes de zonas rurales que dictan de todo.
function currentTeacherMaterias() {
  const m = STATE.auth && STATE.auth.materias;
  return m && m !== "todas" && Array.isArray(m) && m.length ? m : "todas";
}
function currentTeacherEmail() {
  return (STATE.auth && STATE.auth.correo) || "mariana.ruiz@aula.demo";
}
function getStudentSessionScores(userOrEmail) {
  const email = typeof userOrEmail === "string" ? userOrEmail : userOrEmail?.correo;
  if (!email) return [];
  try {
    const user = findUserByEmail(email);
    const state = user ? loadUserState(user) : (STATE.auth?.correo?.toLowerCase() === String(email).toLowerCase() ? STATE : null);
    const sessions = Array.isArray(state?.sessionScores) ? state.sessionScores : [];
    return sessions
      .map(x => ({ score: Math.max(0, Math.min(100, Number(x.score))), completedAt: x.completedAt || null, temaId: x.temaId || "" }))
      .filter(x => Number.isFinite(x.score));
  } catch (_) { return []; }
}

function calculateSessionProgress(sessions) {
  if (!Array.isArray(sessions) || !sessions.length) return 0;
  return Math.round(sessions.reduce((sum, s) => sum + Number(s.score || 0), 0) / sessions.length);
}

function syncCurrentStudentToClasses() {
  if (!STATE.auth || STATE.auth.role !== "estudiante") return;
  const email = String(STATE.auth.correo || "").toLowerCase();
  if (!email) return;
  const sessions = Array.isArray(STATE.sessionScores) ? STATE.sessionScores : [];
  const overall = calculateSessionProgress(sessions);
  const last = sessions.length ? sessions.reduce((a,b) => (new Date(a.completedAt || 0) > new Date(b.completedAt || 0) ? a : b)).completedAt : null;
  let changed = false;
  CLASSES.forEach(cls => {
    (cls.estudiantes || []).forEach(st => {
      if (String(st.correo || "").toLowerCase() === email) {
        st.progreso = overall;
        st.estado = overall <= 0 ? "sin_iniciar" : (studentDerivedStatus(st) === "al_dia" ? "al_dia" : "necesita_ayuda");
        st.ultimaActividad = last;
        st.sessionScores = sessions.map(x => ({...x}));
        st.leccionesCompletadas = sessions.length;
        st.respuestas = Number(st.respuestas || 0);
        st.aciertos = Number(st.aciertos || 0);
        changed = true;
      }
    });
  });
  if (changed) persistAllClassesForStudent();
}

function recordCompletedSession(score, temaId) {
  if (!STATE.auth || STATE.auth.role !== "estudiante") return;
  const normalizedScore = Math.max(0, Math.min(100, Math.round(Number(score) || 0)));
  const sessions = Array.isArray(STATE.sessionScores) ? STATE.sessionScores.slice() : [];
  const session = { id: `session-${Date.now()}-${Math.random().toString(36).slice(2,7)}`, score: normalizedScore, temaId: temaId || "", completedAt: new Date().toISOString() };
  sessions.push(session);
  updateState({ sessionScores: sessions });
  syncCurrentStudentToClasses();
}

function persistAllClassesForStudent() {
  saveClasses(CLASSES);
  if (typeof DB !== "undefined" && DB && isOnline) {
    CLASSES.forEach(c => DB.doc("clases/" + c.id).set(c).catch(() => {}));
  }
}
function myClasses() {
  const email = currentTeacherEmail();
  // Cada docente ve únicamente las clases que creó. Un docente nuevo empieza
  // con 0 clases y 0 estudiantes, sin datos de demostración mezclados.
  return CLASSES.filter((c) => c.profesorCorreo === email);
}
function studentDerivedStatus(e) {
  const p = Math.max(0, Math.min(100, Number(e?.progreso || 0)));
  const last = e?.ultimaActividad || e?.lastActivityDate || null;
  if (p <= 0) return "sin_iniciar";
  if (last) {
    const t = new Date(last + (last.length === 10 ? "T23:59:59" : ""));
    if (!Number.isNaN(t.getTime())) {
      const days = Math.floor((Date.now() - t.getTime()) / 86400000);
      if (days >= 7) return "necesita_ayuda";
      if (days >= 3 && p < 70) return "necesita_ayuda";
    }
  }
  return p >= 70 ? "al_dia" : "necesita_ayuda";
}
function statusClass(s) {
  return s === "al_dia" ? "promover" : s === "necesita_ayuda" ? "revision" : "no";
}
function statusLabel(s) {
  return s === "al_dia" ? "Va bien" : s === "necesita_ayuda" ? "Necesita ayuda" : "No ha iniciado";
}
function nextEstado(s) { return s; }

let activeClassId = null;
function classById(id) { return CLASSES.find((c) => c.id === id); }

function progressRing(pct, size, label) {
  const deg = Math.max(0, Math.min(100, pct)) * 3.6;
  return `
  <div class="progress-ring" style="--pct:${deg}deg;width:${size}px;height:${size}px;">
    <div class="progress-ring-inner">
      <b>${Math.round(pct)}%</b>
      ${label ? `<small>${label}</small>` : ""}
    </div>
  </div>`;
}

function donutChart(segments, size) {
  // segments: [{label, value, color}]
  const total = segments.reduce((a, s) => a + s.value, 0) || 1;
  let acc = 0;
  const stops = segments.map((s) => {
    const start = (acc / total) * 360;
    acc += s.value;
    const end = (acc / total) * 360;
    return `${s.color} ${start}deg ${end}deg`;
  }).join(", ");
  const legend = segments.map((s) => `
    <div class="donut-legend-item"><span class="dot" style="background:${s.color};"></span>${s.label} · ${s.value}</div>`).join("");
  return `
  <div class="donut-wrap">
    <div class="donut-chart" style="width:${size}px;height:${size}px;background:conic-gradient(${stops});"></div>
    <div class="donut-legend">${legend}</div>
  </div>`;
}

function barRow(label, pct, color) {
  return `
  <div class="bar-row">
    <span class="bl">${label}</span>
    <div class="bar-track"><span style="width:${pct}%;background:${color};"></span></div>
    <span class="bv">${pct}%</span>
  </div>`;
}

const TEACHER_NIKO_CONTEXT = {
  inicio: { mood: "saludo", text: "¡Hola, Profe! Tu espacio está listo para comenzar." },
  clases: { mood: "saludo2", text: "Aquí crearás tus clases y organizarás a tus estudiantes." },
  clase: { mood: "explica", text: "Aquí puedes acompañar el progreso de esta clase." },
  recomendaciones: { mood: "senalaEmocionado", text: "Elige un tema de las materias que dictas y envíalo a tu clase." },
  seguimiento: { mood: "pensativoSentado", text: "Revisemos juntos quién va bien y quién necesita apoyo." },
  orientacion: { mood: "globoTerraqueo", text: "Acompañemos los sueños y próximos pasos de tus estudiantes." },
  evaluaciones: { mood: "calificacionA", text: "Cada resultado nos ayuda a saber cómo acompañar mejor." },
  comunicaciones: { mood: "motiva", text: "Un mensaje claro puede hacer la diferencia." },
};
function renderTeacherNikoPanel(section, compact=false) {
  const c = TEACHER_NIKO_CONTEXT[section] || TEACHER_NIKO_CONTEXT.inicio;
  return `<div class="teacher-niko-context ${compact ? 'compact' : ''}">
    ${nikoImg(c.mood, "niko-sprite teacher-niko-sprite", "Niko acompañando al docente")}
    <div><strong>Niko</strong><p>${c.text}</p></div>
  </div>`;
}

const TEACHER_SIDEBAR = [
  { id: "inicio", label: "Inicio", iconName: "house" },
  { id: "clases", label: "Mis clases", iconName: "folder" },
  { id: "recomendaciones", label: "Recomendaciones y contenido", iconName: "lightbulb" },
  { id: "seguimiento", label: "Seguimiento y reportes", iconName: "chart" },
    { id: "evaluaciones", label: "Evaluaciones", iconName: "clipboard" },
  { id: "comunicaciones", label: "Comunicaciones", iconName: "megaphone" },
];

function renderTeacher(param) {
  const parts = (param || "inicio").split("/");
  const section = parts[0] || "inicio";
  if (section === "clase" && parts[1]) activeClassId = parts[1];

  const activeSidebar = section === "clase" ? "clases" : section;

  const sidebarHtml = TEACHER_SIDEBAR.map((it) => `
    <button class="tnav ${it.id === activeSidebar ? "active" : ""}" data-tnav="${it.id}">
      ${icon(it.iconName, 17)} ${it.label}
    </button>`).join("");

  let mainHtml;
  if (section === "clases") mainHtml = renderTeacherClases();
  else if (section === "clase" && parts[2] === "estudiante" && parts[3] !== undefined) mainHtml = renderTeacherEstudianteDetalle(activeClassId, Number(parts[3]));
  else if (section === "clase") mainHtml = renderTeacherClaseDetalle(activeClassId);
  else if (section === "recomendaciones") mainHtml = renderTeacherRecomendaciones();
  else if (section === "seguimiento") mainHtml = renderTeacherSeguimiento();
  else if (section === "orientacion") mainHtml = renderTeacherOrientacion();
  else if (section === "evaluaciones") mainHtml = renderTeacherEvaluaciones();
  else if (section === "comunicaciones") mainHtml = renderTeacherComunicaciones();
  else mainHtml = renderTeacherInicio();

  teacherShell.innerHTML = `
    <aside class="teacher-sidebar">
      <div class="brand">${leafSvg()} <small style="font-size:11px;color:var(--ink-500);font-weight:700;">· Docente</small></div>
      <span id="teacher-conn-status" class="teacher-conn-status"></span>
      ${sidebarHtml}
      <button class="tnav" id="teacher-switch-account">${icon("users", 15)} Cambiar cuenta</button>
      <button class="tnav back-student" id="teacher-logout">${icon("door", 15)} Cerrar sesión</button>
      <button class="tnav" data-nav="inicio">← Vista de estudiante (demo)</button>
    </aside>
    <main class="teacher-main">${mainHtml}</main>`;
  updateConnStatusUI();
}

// -- Inicio: resumen general --------------------------------------------
function renderTeacherInicio() {
  const mine = myClasses();
  const totalStudents = mine.reduce((a, c) => a + c.estudiantes.length, 0);
  const avgProgress = totalStudents
    ? Math.round(mine.reduce((a, c) => a + c.estudiantes.reduce((s, e) => s + e.progreso, 0), 0) / totalStudents)
    : 0;

  const classCards = mine.map((c) => `
    <button class="class-mini-card" data-nav="docente/clase/${c.id}">
      ${progressRing(c.estudiantes.length ? c.estudiantes.reduce((s, e) => s + e.progreso, 0) / c.estudiantes.length : 0, 64)}
      <div>
        <b>${c.nombre}</b>
        <small>${c.estudiantes.length} estudiantes</small>
      </div>
    </button>`).join("");

  return `
    <div class="teacher-topbar">
      <h1>Hola, Profe. ${currentTeacherName()}</h1>
      <div class="search-box">${icon("search", 16)} Buscar clase, estudiante…</div>
    </div>
    ${renderTeacherNikoPanel("inicio", true)}

    <div class="teacher-stat-grid">
      <div class="stat-card"><div class="n">${mine.length}</div><div class="l">CLASES ACTIVAS</div></div>
      <div class="stat-card"><div class="n">${totalStudents}</div><div class="l">ESTUDIANTES</div></div>
      <div class="stat-card"><div class="n">${avgProgress}%</div><div class="l">PROGRESO PROMEDIO</div></div>
    </div>

    <div class="teacher-grid">
      <div>
        <div class="section-title" style="margin-top:0;">Tus clases</div>
        <div class="class-mini-grid">${classCards || `<div class="empty-state-teacher"><h3>Aún no tienes clases</h3><p>Crea tu primera clase para empezar a vincular estudiantes.</p></div>`}</div>
        <button class="btn btn-primary teacher-create-class-cta" data-nav="docente/clases">+ Crear una clase</button>
      </div>

    </div>`;
}

// -- Mis clases: lista + crear nueva clase -------------------------------
function renderTeacherClases() {
  const mine = myClasses();
  const cards = mine.map((c) => {
    const school = RURAL_SCHOOLS.find((s) => s.id === c.colegioId);
    const avg = c.estudiantes.length ? Math.round(c.estudiantes.reduce((s, e) => s + e.progreso, 0) / c.estudiantes.length) : 0;
    return `
    <div class="class-card">
      <button class="class-card-main" data-nav="docente/clase/${c.id}">
        ${progressRing(avg, 58)}
        <div>
          <b>${c.nombre}</b>
          <small>${school ? school.municipio + ", " + school.departamento : "Colegio sin asignar"}</small>
          <small>Código de clase: <b>${c.codigo}</b> · ${c.estudiantes.length} estudiantes</small>
        </div>
      </button>
    </div>`;
  }).join("") || `<div class="empty-note">Aún no tienes clases. Crea la primera abajo.</div>`;

  return `
    <div class="teacher-topbar">
      <h1>Mis clases</h1>
    </div>
    ${renderTeacherNikoPanel("clases", true)}
    <div class="class-mini-grid" style="margin-bottom:24px;">${cards}</div>

    <div class="form-card">
      <h3>+ Nueva clase</h3>
      <p class="hint">Los estudiantes se unen con el código de clase, o los agregas tú por nombre y correo. Esta versión trabaja con 1° a 5° y 8° a 10°. Si dictas más de un salón del mismo grado, distínguelos con la sección (letra o número).</p>
      <div class="field-row">
        <div class="field">
          <label>Grado</label>
          <input id="nc-grado" type="text" list="grados-datalist-clase" placeholder="1°, 5°, 8°, 10°…" />
          ${gradosDatalistHtml("grados-datalist-clase")}
        </div>
        <div class="field"><label>Sección (si hay más de un salón)</label><input id="nc-seccion" type="text" maxlength="3" placeholder="Ej. A, B, 1, 2" /></div>
      </div>
      <div class="field-row">
        <div class="field"><label>Nombre de la clase (opcional)</label><input id="nc-nombre" type="text" placeholder="Se arma solo con grado, sección y materia" /></div>
        <div class="field"><label>Materia</label><select id="nc-materia">${teacherSubjectOptionsHtml()}</select></div>
      </div>
      <div class="field">
        <label>Institución</label>
        <div class="school-selected"><strong>${schoolLabel(getSchoolById(STATE.auth?.colegioId) || {nombre:"Institución de tu cuenta", municipio:"", departamento:""})}</strong></div>
        <p class="hint">Las clases quedan asociadas automáticamente a la institución con la que te registraste.</p>
      </div>
      <button class="btn btn-primary" id="crear-clase-btn">Crear clase</button>
    </div>`;
}

// -- Detalle de una clase: roster real de estudiantes --------------------
function renderTeacherClaseDetalle(classId) {
  const c = classById(classId) || myClasses()[0];
  if (!c) return `<div class="empty-note">No se encontró la clase.</div>`;
  const rows = c.estudiantes.map((e, i) => {
    const st = studentDerivedStatus(e);
    return `
    <tr>
      <td><div class="stu"><div class="av">${initials(e.nombre)}</div>${e.nombre}<small style="display:block;color:var(--ink-500);font-weight:600;">${e.correo}</small></div></td>
      <td><div class="bar-track" style="width:110px;"><span style="width:${Math.max(0,Math.min(100,Number(e.progreso||0)))}%;background:var(--green-600,#279a5b);"></span></div><small>${Math.round(Number(e.progreso||0))}%${Number(e.progreso||0)===0 ? " · Sin sesiones" : ""}</small></td>
      <td><button class="status-badge ${statusClass(st)}" data-student-stats="${c.id}:${i}">${statusLabel(st)}</button></td>
      <td><button class="link-btn" data-quitar-estudiante="${c.id}:${i}">Quitar</button></td>
    </tr>`;
  }).join("");

  return `
    <div class="teacher-topbar">
      <h1>${c.nombre}</h1>
      <div class="search-box">${icon("search", 16)} Buscar estudiante…</div>
    </div>
    ${renderTeacherNikoPanel("clase", true)}
    <p class="hint" style="margin-bottom:16px;">Código de clase para que se unan tus estudiantes: <b>${c.codigo}</b></p>
    ${(() => {
      const es = c.estudiantes || [];
      const avg = es.length ? Math.round(es.reduce((a,e)=>a+Number(e.progreso||0),0)/es.length) : 0;
      const al = es.filter(e=>studentDerivedStatus(e)==="al_dia").length;
      const ri = es.filter(e=>studentDerivedStatus(e)==="necesita_ayuda").length;
      const at = es.filter(e=>studentDerivedStatus(e)==="sin_iniciar").length;
      return `<div class="teacher-stat-grid class-stat-grid">
        <div class="stat-card"><div class="n">${es.length}</div><div class="l">ESTUDIANTES</div></div>
        <div class="stat-card"><div class="n">${avg}%</div><div class="l">PROGRESO DE ESTA CLASE</div></div>
        <div class="stat-card"><div class="n">${al}</div><div class="l">VAN BIEN</div></div>
        <div class="stat-card"><div class="n">${ri+at}</div><div class="l">NECESITAN REVISIÓN</div></div>
      </div>`;
    })()}

    <table class="students-table" style="margin-bottom:22px;">
      <thead><tr><th>Estudiante</th><th>Progreso</th><th>Estado</th><th></th></tr></thead>
      <tbody>${rows || `<tr><td colspan="4">Aún no hay estudiantes en esta clase.</td></tr>`}</tbody>
    </table>

    <div class="form-card">
      <h3>Agregar estudiante</h3>
      <div class="field-row">
        <div class="field"><label>Nombre</label><input id="ae-nombre" type="text" placeholder="Nombre completo" /></div>
        <div class="field"><label>Correo</label><input id="ae-correo" type="email" placeholder="correo@ejemplo.com" /></div>
      </div>
      <button class="btn btn-primary" id="agregar-estudiante-btn" data-class="${c.id}">Agregar a la clase</button>
    </div>`;
}

// -- Estadísticas individuales del estudiante ----------------------------
function renderTeacherEstudianteDetalle(classId, idx) {
  const c = classById(classId);
  const e = c?.estudiantes?.[idx];
  if (!c || !e) return `<div class="empty-note">No se encontró el estudiante.</div>`;
  const sessions = Array.isArray(e.sessionScores) ? e.sessionScores : getStudentSessionScores(e.correo);
  const p = calculateSessionProgress(sessions);
  const st = studentDerivedStatus({...e, progreso:p, ultimaActividad:sessions.length ? sessions[sessions.length-1].completedAt : null});
  const respuestas = Number(e.respuestas || e.preguntasRespondidas || 0);
  const aciertos = Number(e.aciertos || 0);
  const lecciones = sessions.length;
  const errores = Math.max(0, respuestas - aciertos);
  return `
    <div class="teacher-topbar">
      <button class="link-btn" data-nav="docente/clase/${c.id}">← Volver a ${c.nombre}</button>
      <h1>Estadísticas de ${e.nombre}</h1>
    </div>
    ${renderTeacherNikoPanel("clase", true)}
    <div class="student-detail-head form-card">
      <div><h2>${e.nombre}</h2><p class="hint">${e.correo} · ${c.nombre}</p></div>
      <span class="status-badge ${statusClass(st)}">${statusLabel(st)}</span>
    </div>
    <div class="teacher-stat-grid">
      <div class="stat-card"><div class="n">${p}%</div><div class="l">PROGRESO REAL</div></div>
      <div class="stat-card"><div class="n">${lecciones}</div><div class="l">SESIONES COMPLETADAS</div></div>
      <div class="stat-card"><div class="n">${aciertos}</div><div class="l">ACIERTOS</div></div>
      <div class="stat-card"><div class="n">${errores}</div><div class="l">ERRORES</div></div>
    </div>
    <div class="form-card">
      <h3>¿Cómo va?</h3>
      <p>${st === "al_dia" ? "Va bien: su promedio se calcula únicamente con sesiones que realmente completó." : st === "sin_iniciar" ? "Todavía no ha completado ninguna sesión. Su progreso aparece en 0% hasta que exista un resultado real." : "Su promedio actual se calcula únicamente con las sesiones que realmente completó."}</p>
      <p class="hint">Fórmula: ${sessions.length ? sessions.map(s => Math.round(Number(s.score||0)) + "%").join(" + ") + " ÷ " + sessions.length + " = " + p + "%" : "sin sesiones = 0%"}.</p>
      <p class="hint">Este estado lo calcula AulaYa a partir de la actividad del estudiante. El docente no lo cambia manualmente.</p>
    </div>`;
}

// -- Recomendaciones y contenido -----------------------------------------
// Opciones del selector de tema de una recomendación: si se puede leer el
// grado de la clase, se agrupan por área usando la malla académica de
// referencia (así el profesor recomienda algo que sí corresponde al grado
// del curso); si no, se usa la lista corta de respaldo de siempre.
function temaSelectOptionsHtml(cls) {
  const gradoNum = cls ? parseGradoNum(cls.grado) : null;
  const materias = currentTeacherMaterias();
  const desdeMalla = gradoNum ? mallaTemaOptionsHtml(gradoNum, (area) => areaPerteneceAMaterias(area, materias)) : null;
  if (gradoNum && !desdeMalla) {
    // el grado existe en la malla, pero ninguna de sus áreas coincide con
    // las materias que dicta este profesor.
    return `<option disabled selected>No dictas ninguna materia de este grado — revisa "Materias que dictas" en tu cuenta</option>`;
  }
  return desdeMalla || `
    <option>Fracciones equivalentes</option>
    <option>Ecuaciones de primer grado</option>
    <option>Geometría básica</option>`;
}

// Selector "para quién": toda la clase, o un estudiante puntual de esa
// clase — reutilizado por "Asignar ejercicios" y por "Enviar mensaje" en
// Comunicaciones, para que ambas funciones lleguen de verdad a un curso
// completo o a un estudiante específico (no solo a "quien esté mirando").
function teacherSubjectOptionsHtml() {
  const m = currentTeacherMaterias();
  if (m === "todas") return TEACHER_MATERIAS.map(x => `<option value="${x}">${x}</option>`).join("");
  return m.map(x => `<option value="${x}">${x}</option>`).join("");
}

function destinatarioSelectHtml(cls) {
  const estudiantes = cls ? cls.estudiantes : [];
  const opts = estudiantes.map((e) => `<option value="${e.id}">${e.nombre}</option>`).join("");
  return `<option value="">Toda la clase</option>${opts}`;
}

function renderTeacherRecomendaciones() {
  const mine = myClasses();
  const classOptions = mine.map((c) => `<option value="${c.id}">${c.nombre}</option>`).join("");
  return `
    <div class="teacher-topbar"><h1>Recomendaciones y contenido</h1></div>
    ${renderTeacherNikoPanel("recomendaciones", true)}
    <div class="teacher-grid">
      <div class="form-card">
        <h3>Crear recomendación</h3>
        <p class="hint">Selecciona clase, tema y recursos. El tema se sugiere según el grado de la clase y las materias que dictas, tomando como referencia la malla académica de AulaYa.</p>

        <div class="field">
          <label>Clase</label>
          <select id="rec-clase">${classOptions}</select>
        </div>

        <div class="field">
          <label>Tema</label>
          <select id="tema-select">${temaSelectOptionsHtml(mine[0])}</select>
        </div>

        <div class="field">
          <label>Recursos</label>
          <div class="check-list">
            <label><input type="checkbox" checked disabled /> Video (IA)</label>
            <label><input type="checkbox" checked disabled /> Ejercicios</label>
            <label><input type="checkbox" checked disabled /> Reto</label>
            <label><input type="checkbox" checked disabled /> Evaluación</label>
          </div>
        </div>

        <div class="field">
          <label>Mensaje (opcional)</label>
          <textarea id="msg-recomendacion" rows="2">Este tema es importante para la próxima evaluación. ¡Ustedes pueden!</textarea>
        </div>

        <div class="field-row">
          <button class="btn btn-primary" id="send-recomendacion">Enviar recomendación</button>
          <button class="btn btn-ghost" id="generar-ia-btn">${icon("robot", 16)} Generar contenido con IA</button>
        </div>
      </div>

      <div class="form-card">
        <h3>Publicar actividad</h3>
        <p class="hint">Refuerza un tema puntual con ejercicios guiados — a toda una clase o a un estudiante específico que lo necesite.</p>

        <div class="field">
          <label>Clase</label>
          <select id="ej-clase">${classOptions}</select>
        </div>

        <div class="field">
          <label>Para</label>
          <select id="ej-destinatario">${destinatarioSelectHtml(mine[0])}</select>
        </div>

        <div class="field">
          <label>Tema</label>
          <select id="ej-tema">${temaSelectOptionsHtml(mine[0])}</select>
        </div>

        <button class="btn btn-primary" id="send-ejercicios">Publicar actividad</button>
      </div>

      <div class="teacher-side-card">
        ${nikoImg("motiva", "niko-avatar-lg niko-anim-float")}
        <div class="quote">Tu progreso nos inspira. Seguimos aprendiendo juntos. ¡Ustedes pueden!</div>
      </div>
    </div>`;
}

// -- Seguimiento y reportes ------------------------------------------------
function renderTeacherSeguimiento() {
  const mine = myClasses();
  if (!mine.length) return `<div class="teacher-topbar"><h1>Seguimiento y reportes</h1></div>
    ${renderTeacherNikoPanel("seguimiento", true)}
    <div class="empty-state-teacher"><h3>Aún no tienes clases</h3><p>Cuando crees una clase y agregues estudiantes, aquí aparecerán sus estadísticas por separado.</p></div>`;
  const cards = mine.map(c => {
    const es=c.estudiantes||[];
    const avg=es.length?Math.round(es.reduce((a,e)=>a+Number(e.progreso||0),0)/es.length):0;
    const al=es.filter(e=>studentDerivedStatus(e)==="al_dia").length, ri=es.filter(e=>studentDerivedStatus(e)==="necesita_ayuda").length, at=es.filter(e=>studentDerivedStatus(e)==="sin_iniciar").length;
    return `<div class="form-card class-report-card">
      <div class="report-head"><div><h3>${c.nombre}</h3><p class="hint">${c.materia || (c.materias||[]).join(', ') || 'Sin materia'}</p></div><b>${avg}%</b></div>
      <div class="mini-report-grid"><span>👥 ${es.length} estudiantes</span><span>✓ ${al} al día</span><span>⚠ ${ri} en riesgo</span><span>• ${at} sin iniciar</span></div>
      <button class="link-btn" data-nav="docente/clase/${c.id}">Ver clase y estudiantes →</button>
    </div>`;
  }).join('');
  return `<div class="teacher-topbar"><h1>Seguimiento y reportes</h1></div>
    ${renderTeacherNikoPanel("seguimiento", true)}
    <div class="teacher-class-reports">${cards}</div>`;
}

// -- Orientación 11° -------------------------------------------------------
function renderTeacherOrientacion() {
  const mine = myClasses().filter(c=>String(c.grado).includes('11'));
  if (!mine.length) return `<div class="teacher-topbar"><h1>Orientación vocacional · 11°</h1></div>${renderTeacherNikoPanel("orientacion", true)}<div class="empty-state-teacher"><h3>Aún no tienes cursos de 11°</h3><p>Cuando tengas una clase de 11°, aquí podrás acompañar sus intereses de carrera.</p></div>`;
  return `<div class="teacher-topbar"><h1>Orientación vocacional · 11°</h1></div>${renderTeacherNikoPanel("orientacion", true)}<div class="teacher-class-reports">${mine.map(c=>`<div class="form-card"><h3>${c.nombre}</h3><p class="hint">${c.estudiantes.length} estudiantes · los intereses aparecerán cuando ellos los registren.</p></div>`).join('')}</div>`;
}

const EVALUACIONES = [
  { tema: "Fracciones equivalentes", fecha: "10 sep 2026", promedio: 78 },
  { tema: "Ecuaciones de primer grado", fecha: "24 sep 2026", promedio: 65 },
  { tema: "Geometría básica", fecha: "8 oct 2026", promedio: 71 },
];

function renderTeacherEvaluaciones() {
  const mine = myClasses();
  const students = mine.flatMap(c=>c.estudiantes||[]);
  if (!mine.length) return `<div class="teacher-topbar"><h1>Evaluaciones</h1></div>${renderTeacherNikoPanel("evaluaciones", true)}<div class="empty-state-teacher"><h3>Aún no hay evaluaciones</h3><p>Las evaluaciones aparecerán cuando tengas una clase y actividades asignadas.</p></div>`;
  return `<div class="teacher-topbar"><h1>Evaluaciones</h1></div>${renderTeacherNikoPanel("evaluaciones", true)}
    <div class="teacher-class-reports">${mine.map(c=>`<div class="form-card"><h3>${c.nombre}</h3><p class="hint">${c.estudiantes.length ? c.estudiantes.length+' estudiantes · sin evaluaciones registradas todavía.' : 'Aún no hay estudiantes en esta clase.'}</p></div>`).join('')}</div>`;
}

// -- Comunicaciones ----------------------------------------------------------
let comTab = "curso";

function renderTeacherComunicaciones() {
  const mine = myClasses();
  const classOptions = mine.map(c=>`<option value="${c.id}">${c.nombre}</option>`).join("");
  const first = mine[0];
  return `<div class="teacher-topbar"><h1>Comunicaciones</h1></div>
    ${renderTeacherNikoPanel("comunicaciones", true)}
    <div class="form-card communication-card">
      <h3>Enviar comunicación</h3>
      <p class="hint">Elige un curso y después decide si el mensaje es para todo el curso o para un estudiante específico.</p>
      <div class="field"><label>Curso</label><select id="msg-clase" ${mine.length?'':'disabled'}>${classOptions || '<option value="">Aún no tienes cursos</option>'}</select></div>
      <div class="field"><label>Enviar a</label><select id="msg-destinatario" ${mine.length?'':'disabled'}>${destinatarioSelectHtml(first)}</select></div>
      <div class="field"><label>Mensaje</label><textarea id="msg-directo" rows="4" placeholder="Escribe tu mensaje…" ${mine.length?'':'disabled'}></textarea></div>
      <button class="btn btn-primary" id="send-msg-directo" ${mine.length?'':'disabled'}>Enviar comunicación</button>
    </div>`;
}

// ---------------------------------------------------------------------
// Interacción: chats (mini video-chat y chat completo con Niko)
// ---------------------------------------------------------------------

// simula que Niko "piensa" un instante antes de responder: muestra una
// burbuja con la pose pensando (animada) y la reemplaza por la respuesta
// real —con la pose que corresponda— cuando el tiempo se cumple.
async function sendToNikoChat(log, text) {
  log.push({ mine: true, text });
  const thinkingBubble = { mine: false, thinking: true };
  log.push(thinkingBubble);
  render();
  let curatedReply=null;

  // El SLM real corre localmente en el navegador cuando ya fue descargado.
  // Si todavía no está disponible (por primera carga, dispositivo limitado
  // o falta de internet), se usa inmediatamente el tutor curricular offline.
  try {
    const explicitTopic = typeof nikoCurriculumTopicMatch === "function"
      ? nikoCurriculumTopicMatch(NIKO_ACTIVE_TOPIC || text) : null;
    const inferred = !NIKO_ACTIVE_TOPIC && typeof nikoCurriculumTopicMatch === 'function'
      ? nikoCurriculumTopicMatch(text) : null;
    const detectedTopic = !NIKO_ACTIVE_TOPIC&&!inferred&&typeof nikoDetectTopic==="function"
      ? nikoDetectTopic(text,nikoFullChatContext?.topic||null) : null;
    const topic = NIKO_ACTIVE_TOPIC || inferred?.tema || explicitTopic?.tema || detectedTopic || nikoFullChatContext?.topic || '';
    const grade = inferred?.grado || explicitTopic?.grado || nikoFullChatContext?.grade || window.STATE?.student?.grade || window.STATE?.auth?.grado || '';
    const subject = inferred?.area || explicitTopic?.area || nikoFullChatContext?.subject || window.STATE?.activeLessonSubject || '';
    if(topic) nikoFullChatContext={topic,grade,subject};
    curatedReply=nikoReply(text,topic||null);

    if (window.AULA_SLM?.isReady?.() && topic) {
      const grounding=document.createElement("div");
      grounding.innerHTML=curatedReply.text;
      const answer = await window.AULA_SLM.generate(text, {
        grade, subject, topic, grounding:grounding.textContent||""
      });
      if (answer) {
        const safe = String(answer).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>');
        const idx = log.indexOf(thinkingBubble);
        if (idx !== -1) log.splice(idx, 1, { mine: false, text: safe, mood: 'explica' });
        render();
        return;
      }
    }
  } catch (e) {
    console.warn('[AULA SLM] fallback curricular:', e);
  }

  const reply = curatedReply || nikoReply(text, NIKO_ACTIVE_TOPIC || nikoFullChatContext?.topic || null);
  const idx = log.indexOf(thinkingBubble);
  if (idx !== -1) log.splice(idx, 1, { mine: false, text: reply.text, mood: reply.mood });
  render();
}

function doMiniChatSend() {
  const input = document.getElementById("mini-chat-input");
  if (!input || !input.value.trim()) return;
  sendToNikoChat(nikoChatLog, input.value.trim());
}

function doNikoFullSend() {
  const input = document.getElementById("niko-full-input");
  if (!input || !input.value.trim()) return;
  sendToNikoChat(nikoFullChatLog, input.value.trim());
}

// ---------------------------------------------------------------------
// Feedback bar de ejercicios (correcto / incorrecto)
// ---------------------------------------------------------------------

function showFeedback(correct, q) {
  feedbackBar.className = "feedback-bar " + (correct ? "correct" : "wrong") + " show";

  if (correct) {
    const reviewText = quiz && quiz.reviewMode ? "¡Muy bien! Esta pregunta ya quedó aprendida." : "+20 monedas";
    feedbackBar.innerHTML = `
      <div class="fb-head">${nikoGreetImg("sm")} ¡Eso es!</div>
      <div class="fb-coins">${reviewText}</div>
      <button class="btn btn-primary" id="btn-feedback-continue">Continuar</button>
    `;
    return;
  }

  // Retroalimentación pedagógica: Niko no solo muestra la respuesta correcta;
  // explica el procedimiento y da una pista para que el estudiante pueda
  // volver a intentarlo. La explicación viene enlazada a esta pregunta.
  const topic = q.tema || "este tema";
  const explanation = q.explanation || `Revisa el procedimiento paso a paso y fíjate en qué propiedad de ${topic} debes aplicar.`;
  const hint = q.hint || `Busca primero el dato que conoces y después aplica la regla de ${topic}.`;

  feedbackBar.innerHTML = `
    <div class="fb-niko-explanation">
      <div class="fb-head">${nikoImg("confundido", "niko-avatar-sm", "Niko explicando")} 🫤 ¡Casi! Vamos a entender el porqué.</div>
      <div class="fb-main-text"><strong>Pasito a pasito:</strong> ${explanation}</div>
      <div class="fb-hint"><strong>💡 Pista:</strong> ${hint}</div>
      <div class="fb-coins">No te muestro la respuesta correcta todavía. Primero entiende el procedimiento; al final volveremos a esta pregunta. 💪</div>
    </div>
    <div class="fb-actions">
      <button class="btn btn-primary" id="btn-feedback-continue">Siguiente pregunta</button>
    </div>
  `;
}

// ---------------------------------------------------------------------
// Dispatcher global de "change" (delegación de eventos) — hoy solo se usa
// para refrescar las opciones de tema cuando el profesor cambia de clase
// en "Recomendaciones y contenido" (cada clase puede ser de un grado
// distinto, y el tema sugerido depende del grado).
// ---------------------------------------------------------------------

document.addEventListener("change", (e) => {
  if (e.target && e.target.id === "rec-clase") {
    const cls = classById(e.target.value);
    const temaSelect = document.getElementById("tema-select");
    if (temaSelect) temaSelect.innerHTML = temaSelectOptionsHtml(cls);
  }
  if (e.target && e.target.id === "ej-clase") {
    const cls = classById(e.target.value);
    const temaSelect = document.getElementById("ej-tema");
    const destSelect = document.getElementById("ej-destinatario");
    if (temaSelect) temaSelect.innerHTML = temaSelectOptionsHtml(cls);
    if (destSelect) destSelect.innerHTML = destinatarioSelectHtml(cls);
  }
  if (e.target && e.target.id === "msg-clase") {
    const cls = classById(e.target.value);
    const destSelect = document.getElementById("msg-destinatario");
    if (destSelect) destSelect.innerHTML = destinatarioSelectHtml(cls);
  }
  if (e.target && e.target.id === "niko-slm-model" && window.AULA_SLM?.selectModel) {
    try { window.AULA_SLM.selectModel(e.target.value); }
    catch (error) { showToast(error.message || "No se pudo seleccionar ese modelo."); }
  }
});

// ---------------------------------------------------------------------
// Dispatcher global de clicks (delegación de eventos)
// ---------------------------------------------------------------------

document.addEventListener("click", (e) => {
  const el = e.target;

  if (el.closest("#retry-school-catalog")) {
    RURAL_SCHOOLS_READY = false;
    RURAL_SCHOOLS_ERROR = false;
    renderSchoolPickerOnly();
    loadRuralSchoolCatalog().then(() => renderSchoolPickerOnly());
    return;
  }

  const installSlmBtn=el.closest("#niko-slm-install");
  if(installSlmBtn){
    const model=document.getElementById("niko-slm-model")?.value;
    if(!window.AULA_SLM?.install||!model){showToast("El motor local todavía no está disponible. El tutor curricular sigue funcionando.");return;}
    try {
      window.AULA_SLM.selectModel(model);
      window.AULA_SLM.install(model)
        .then(()=>showToast("Modelo listo. Niko podrá usarlo en este dispositivo, incluso sin conexión mientras el navegador conserve los archivos."))
        .catch((error)=>showToast(error.message||"No se pudo descargar el modelo local."));
    } catch(error) {
      showToast(error.message||"No se pudo iniciar la descarga.");
    }
    return;
  }

  // navegación simple
  const navBtn = el.closest("[data-nav]");
  if (navBtn) { go(navBtn.dataset.nav); return; }

  const avatarCategoryBtn = el.closest("[data-avatar-category]");
  if (avatarCategoryBtn) {
    selectedAvatarCategory = avatarCategoryBtn.dataset.avatarCategory;
    render();
    focusAvatarCategoryTab();
    return;
  }

  const avatarResetBtn = el.closest("[data-avatar-reset]");
  if (avatarResetBtn) {
    updateState({ avatar: structuredClone(DEFAULT_STATE.avatar) });
    showToast("Avatar restablecido. Tus artículos desbloqueados siguen siendo tuyos.");
    render();
    return;
  }

  // barra de navegación inferior (Inicio / Explorar / Retos / Niko / Perfil)
  const navItem = el.closest(".nav-item[data-route]");
  if (navItem) { go(navItem.dataset.route); return; }

  const nikoItemButton = el.closest("[data-niko-item]");
  if (nikoItemButton) {
    const [category, itemId] = nikoItemButton.dataset.nikoItem.split(":");
    const item = nikoWardrobeItem(category, itemId);
    if (!item) return;
    const wardrobe = normalizeNikoWardrobe(STATE.nikoWardrobe);
    if (wardrobe.unlocked.includes(item.id)) {
      if (wardrobe.equipped[category] === item.id) {
        showToast(`${item.nombre} ya está en uso.`);
        return;
      }
      if (equipNikoItem(item)) {
        showToast(`¡Niko ya lleva ${item.nombre}!`);
        render();
      }
      return;
    }
    const result = purchaseNikoItem(item);
    if (result === "insufficient") {
      showToast(`Te faltan ${item.precio - STATE.coins} monedas para desbloquear ${item.nombre}.`);
      return;
    }
    if (result === "purchased") {
      showToast(`¡${item.nombre} desbloqueado! Tócalo otra vez para equiparlo.`);
      render();
    }
    return;
  }

  // notificaciones: cerrar
  const dismissBtn = el.closest("[data-dismiss]");
  if (dismissBtn) {
    e.stopPropagation();
    const id = dismissBtn.dataset.dismiss;
    const list = getNotifications().filter((n) => n.id !== id);
    updateState({ notifications: list });
    render();
    return;
  }

  // notificaciones: abrir (navegar según su acción)
  const notifItem = el.closest("[data-notif]");
  if (notifItem) {
    const id = notifItem.dataset.notif;
    const list = getNotifications();
    const n = list.find((x) => x.id === id);
    if (n) {
      n.unread = false;
      updateState({ notifications: list });
      const a = n.action || {};
      if (a.type === "tema") go("tema/" + (a.id || "fracciones"));
      else if (a.type === "futuro") go("futuro");
      else if (a.type === "gamificacion") go("gamificacion");
      else if (a.type === "niko-chat") go("niko-chat");
      else if (a.type === "clase") go("clase/" + (a.id || ""));
      else render();
    }
    return;
  }

  // tabs de notificaciones
  const notifTab = el.closest("[data-notif-tab]");
  if (notifTab) { notifFilter = notifTab.dataset.notifTab; render(); return; }

  // tabs del video
  const videoTab_ = el.closest("[data-video-tab]");
  if (videoTab_) { videoTab = videoTab_.dataset.videoTab; render(); return; }

  // play button decorativo del video
  if (el.closest("#video-play-btn")) {
    el.closest("#video-play-btn").style.opacity = "0";
    setTimeout(() => { el.closest("#video-play-btn") && (el.closest("#video-play-btn").style.opacity = "1"); }, 1200);
    return;
  }

  // descargar / eliminar video para verlo sin internet
  if (el.closest("#video-download-btn")) {
    const { param } = parseHash();
    const tema = TEMAS[param] || TEMAS.fracciones;
    downloadVideo(tema);
    return;
  }
  if (el.closest("#video-remove-download")) {
    const { param } = parseHash();
    const tema = TEMAS[param] || TEMAS.fracciones;
    removeDownloadedVideo(tema);
    return;
  }

  // continuar tras video
  if (el.closest("#video-continue")) {
    const { param } = parseHash();
    const temaId = param || "fracciones";
    const yaHecho = isResourceDone(temaId, "video");
    markResourceDone(temaId, "video");
    if (!yaHecho) {
      // El video es solo una parte de la lección. La racha NO sube aquí:
      // se registra únicamente cuando el estudiante termina toda la práctica.
      updateState({ coins: STATE.coins + 15 });
      showToast("¡Lección en progreso! +15 monedas");
    } else {
      showToast("Video completado. Sigue con la práctica.");
    }
    go("tema/" + temaId);
    return;
  }

  // mini chat (dentro del video)
  if (el.closest("#mini-chat-send")) { doMiniChatSend(); return; }

  // chat completo con Niko
  if (el.closest("#niko-full-send")) { doNikoFullSend(); return; }
  const quick = el.closest("[data-quick]");
  if (quick) {
    sendToNikoChat(nikoFullChatLog, quick.dataset.quick);
    return;
  }

  // quiz: elegir opción
  const optBtn = el.closest("[data-opt]");
  if (optBtn && quiz && !quiz.answered) {
    quiz.selected = parseInt(optBtn.dataset.opt, 10);
    render();
    return;
  }

  // quiz: pista / ayuda
  if (el.closest("#btn-pista") || el.closest("#btn-ayuda")) {
    if (!quiz) return;
    const q = quiz.questions[quiz.idx];
    const slot = document.getElementById("hint-slot");
    if (slot) slot.innerHTML = `<div class="hint-box">${nikoImg("preguntaDuda", "niko-avatar-sm niko-anim-tilt-think")} ${icon("lightbulb", 16)} ${q.hint}</div>`;
    return;
  }

  // quiz: revisar respuesta
  if (el.closest("#btn-revisar")) {
    if (!quiz || quiz.selected === null || quiz.answered) return;
    const q = quiz.reviewMode ? quiz.mistakes[0]?.question : quiz.questions[quiz.idx];
    if (!q) return;
    const correct = quiz.selected === q.correct;
    quiz.answered = true;
    quiz.lastAnswerCorrect = correct;

    if (correct) {
      const wasMistake = quiz.mistakes.some(m => m.question.id === q.id);
      if (wasMistake) {
        quiz.mistakes = quiz.mistakes.filter(m => m.question.id !== q.id);
        quiz.correctCount = Math.min(quiz.questions.length, quiz.correctCount + 1);
      } else {
        quiz.correctCount++;
        quiz.xpEarned += 20;
        if (!quiz.rewarded.has(q.id)) {
          quiz.rewarded.add(q.id);
          quiz.coinsEarned += 20;
          updateState({ coins: STATE.coins + 20 });
        }
      }

      if (quiz.reviewMode && quiz.mistakes.length === 0) {
        quiz.done = true;
        quiz.reviewMode = false;
        quiz.bonusCoins = 30;
        // Una lección completa marca todos sus bloques como realizados.
        markResourceDone(quiz.temaId, "video");
        markResourceDone(quiz.temaId, "ejercicios");
        markResourceDone(quiz.temaId, "reto");
        markResourceDone(quiz.temaId, "evaluacion");
        updateState({ retosCompletados: STATE.retosCompletados + 1, coins: STATE.coins + quiz.bonusCoins, xp: STATE.xp + quiz.xpEarned });
        recordCompletedSession(quiz.score, quiz.temaId);
        quiz.streakResult = registerDailyActivity();
      }
    } else {
      if (!quiz.mistakes.some(m => m.question.id === q.id)) {
        quiz.mistakes.push({ question: q, selected: quiz.selected });
        quiz.mistakeCountTotal++;
        quiz.score = Math.max(0, 100 - quiz.mistakeCountTotal * 4);
      } else if (quiz.reviewMode) {
        // No se repite inmediatamente: pasa al final de la cola de repaso.
        const current = quiz.mistakes.shift();
        quiz.mistakes.push(current);
      }
      if (typeof window.AULA_registerQuestionError === "function") window.AULA_registerQuestionError(q, q.options?.[quiz.selected]);
    }
    render();
    showFeedback(correct, q);
    return;
  }

  // quiz: continuar tras feedback
  if (el.closest("#btn-feedback-continue")) {
    feedbackBar.className = "feedback-bar";
    feedbackBar.innerHTML = "";
    if (!quiz) return;
    quiz.selected = null;
    quiz.answered = false;
    quiz.lastAnswerCorrect = null;

    if (quiz.reviewMode) {
      // La pregunta que falló en repaso ya fue movida al final de la cola;
      // así el estudiante puede continuar con otra antes de verla de nuevo.
      if (quiz.mistakes.length === 0) {
        quiz.done = true;
        quiz.reviewMode = false;
        quiz.bonusCoins = 30;
        markResourceDone(quiz.temaId, "video");
        markResourceDone(quiz.temaId, "ejercicios");
        markResourceDone(quiz.temaId, "reto");
        markResourceDone(quiz.temaId, "evaluacion");
        updateState({ retosCompletados: STATE.retosCompletados + 1, coins: STATE.coins + quiz.bonusCoins, xp: STATE.xp + quiz.xpEarned });
        recordCompletedSession(quiz.score, quiz.temaId);
        quiz.streakResult = registerDailyActivity();
      }
      render();
      return;
    }

    quiz.idx++;
    if (quiz.idx >= quiz.questions.length) {
      if (quiz.mistakes.length) {
        quiz.score = Math.max(0, 100 - (quiz.mistakeCountTotal * 4));
        render();
        return;
      }
      quiz.done = true;
      quiz.score = 100;
      quiz.bonusCoins = 30;
      // Primera pasada perfecta: también cuenta como lección completa.
      markResourceDone(quiz.temaId, "video");
      markResourceDone(quiz.temaId, "ejercicios");
      markResourceDone(quiz.temaId, "reto");
      markResourceDone(quiz.temaId, "evaluacion");
      updateState({ retosCompletados: STATE.retosCompletados + 1, coins: STATE.coins + quiz.bonusCoins, xp: STATE.xp + quiz.xpEarned });
      recordCompletedSession(quiz.score, quiz.temaId);
      quiz.streakResult = registerDailyActivity();
    }
    render();
    return;
  }

  // quiz: comenzar el repaso de las preguntas que fallaron
  if (el.closest("#quiz-start-review")) {
    if (!quiz) return;
    quiz.reviewMode = true;
    quiz.selected = null;
    quiz.answered = false;
    render();
    return;
  }

  // quiz: terminar y volver al tema
  if (el.closest("#quiz-finish-btn")) {
    const temaId = quiz ? quiz.temaId : "fracciones";
    markResourceDone(temaId, "ejercicios");
    markResourceDone(temaId, "reto");
    markResourceDone(temaId, "evaluacion");
    quiz = null;
    go("tema/" + temaId);
    return;
  }

  // Avatar del estudiante: comprar/equipar desde Perfil.
  const avatarBtn=el.closest("[data-avatar-option]");
  if(avatarBtn){
    const [category,itemId]=avatarBtn.dataset.avatarOption.split(":");
    const item=avatarOption(category,itemId); if(!item) return;
    const key=AVATAR_CATEGORY_KEYS[category]; if(!key) return;
    const current=Object.assign({},DEFAULT_STATE.avatar,STATE.avatar||{});
    const owned=Array.isArray(STATE.avatarOwned)?STATE.avatarOwned:[];
    if(current[key]===item.id){ showToast(`${item.label} ya está seleccionado.`); return; }
    if(!owned.includes(item.id)){
      if(STATE.coins<item.price){showToast("Te faltan "+(item.price-STATE.coins)+" monedas.");return;}
      updateState({avatarOwned:owned.concat(item.id),coins:STATE.coins-item.price});
    }
    current[key]=item.id; updateState({avatar:current});
    showToast(owned.includes(item.id)?"✓ Avatar actualizado.":"¡Compraste "+item.label+"! Tu avatar fue actualizado.");
    render(); return;
  }
  if (el.closest("#add-account-btn")) {
    if (loadActiveSessions().length >= 5) {
      showToast("Ya tienes 5 cuentas iniciadas. Cierra una cuenta y luego agrega la nueva.");
      return;
    }
    authTab = "login";
    location.hash = "#/bienvenida";
    render();
    return;
  }
  const removeSessionBtn=el.closest("[data-remove-session]");
  if(removeSessionBtn){
    const email=removeSessionBtn.dataset.removeSession;
    if(String(email).toLowerCase()===String(STATE.auth?.correo||"").toLowerCase()) { showToast("No puedes cerrar la cuenta que estás usando. Cambia de cuenta primero."); return; }
    removeActiveSession(email);
    showToast("Cuenta quitada de las cuentas iniciadas en este dispositivo.");
    render();
    return;
  }
  const switchBtn=el.closest("[data-switch-session]");
  if(switchBtn){switchToStoredSession(switchBtn.dataset.switchSession);return;}

  // explorar: cambiar de grado en la malla académica
  const gradoChip = el.closest("[data-malla-grado]");
  if (gradoChip) {
    const raw = gradoChip.dataset.mallaGrado;
    exploreMallaGrado = /^\d+$/.test(raw) ? parseInt(raw, 10) : raw;
    render();
    return;
  }

  // explorar: abrir un tema de la malla académica
  const temaChip = el.closest("[data-tema]");
  if (temaChip) {
    const tema = decodeURIComponent(temaChip.dataset.tema);
    if (tema === MALLA_TEMA_CON_LECCION) go("tema/fracciones");
    else showToast(`"${tema}" llega pronto a AulaYa; mientras tanto, sigue practicando con ${MALLA_TEMA_CON_LECCION}.`);
    return;
  }

  // futuro: tabs de oportunidades
  const oppoTab = el.closest("[data-oppo-tab]");
  if (oppoTab) { futuroTab = oppoTab.dataset.oppoTab; render(); return; }

  // modo docente desde el perfil (demo)
  if (el.closest("#teacher-mode-link")) { go("docente"); return; }

  // cambiar de cuenta sin cerrar las sesiones guardadas
  if (el.closest("#teacher-switch-account")) {
    authTab = "login";
    location.hash = "#/bienvenida";
    render();
    return;
  }

  // cerrar sesión (perfil de estudiante o barra docente)
  if (el.closest("#logout-link") || el.closest("#teacher-logout")) { doLogout(); return; }

  // bienvenida: elegir rol / tab
  const authRoleBtn = el.closest("[data-auth-role]");
  if (authRoleBtn) { authMode = "account"; authRole = authRoleBtn.dataset.authRole; render(); return; }
  const authTabBtn = el.closest("[data-auth-tab]");
  if (authTabBtn) { authMode = "account"; authTab = authTabBtn.dataset.authTab; render(); return; }
  if (el.closest("#bv-recuperar-inicio")) {
    recoveryEmail = (document.getElementById("bv-login-correo")?.value || "").trim();
    authMode = "recovery-request";
    render();
    document.getElementById("bv-recuperar-correo")?.focus();
    return;
  }
  if (el.closest("[data-auth-recovery-back]")) {
    authMode = "account";
    authTab = "login";
    recoveryToken = "";
    render();
    return;
  }
  if (el.closest("#bv-recuperar-enviar")) { requestAccountRecovery(); return; }
  if (el.closest("#bv-recuperar-verificar")) { verifyAccountRecovery(); return; }
  if (el.closest("#bv-recuperar-guardar")) { resetAccountPin(); return; }
  const schoolBtn = el.closest("[data-school-id]");
  if (schoolBtn) {
    authSelectedSchoolId = schoolBtn.dataset.schoolId;
    const selected = getSchoolById(authSelectedSchoolId);
    if (selected) {
      authSelectedDepartment = selected.departamento;
      authSelectedMunicipality = selected.municipio;
      authSchoolSearch = selected.nombre;
    }
    const hidden = document.getElementById("bv-colegio");
    if (hidden) hidden.value = authSelectedSchoolId;
    renderSchoolPickerOnly();
    return;
  }
  if (el.closest("#bv-registro-btn")) { doRegistro(); return; }
  if (el.closest("#bv-login-btn")) { doLogin(); return; }

  // docente: navegación del sidebar
  const tnav = el.closest("[data-tnav]");
  if (tnav) { go("docente/" + tnav.dataset.tnav); return; }

  // docente: crear clase nueva
  if (el.closest("#crear-clase-btn")) {
    const nombreInput = (document.getElementById("nc-nombre") || {}).value || "";
    const gradoTexto = (document.getElementById("nc-grado") || {}).value || "";
    const seccion = ((document.getElementById("nc-seccion") || {}).value || "").trim();
    const materia = (document.getElementById("nc-materia") || {}).value || "";
    const colegioId = STATE.auth?.colegioId || "";
    if (!gradoTexto.trim()) { showToast("Escribe un grado del alcance actual: 1° a 5° u 8° a 10°."); return; }
    const gradoNum = parseGradoNum(gradoTexto);
    const gradoEtiqueta = gradoNum !== null ? gradoLabel(gradoNum) : gradoTexto.trim();
    const materiaFinal = materia.trim();
    if (!materiaFinal) { showToast("Elige la materia de la clase."); return; }
    const permitidas = currentTeacherMaterias();
    if (permitidas !== "todas" && !permitidas.includes(materiaFinal)) { showToast("Esa materia no está entre las que dictas."); return; }
    // Si no escribió un nombre, se arma solo con grado + sección (letra o
    // número, para distinguir varios salones del mismo grado) + materia.
    const nombreAuto = `${gradoEtiqueta}${seccion} · ${materiaFinal}`;
    const nombre = nombreInput.trim() || nombreAuto;
    const cls = {
      id: "c" + Date.now(),
      nombre,
      grado: gradoTexto.trim(),
      seccion,
      materia: normalizeSubjectName(materiaFinal),
      materias: [normalizeSubjectName(materiaFinal)],
      codigo: (materiaFinal.slice(0, 3) || "CLS").toUpperCase() + Math.floor(100 + Math.random() * 900),
      colegioId,
      profesorCorreo: currentTeacherEmail(),
      estudiantes: [],
    };
    CLASSES.push(cls);
    persistClass(cls);
    showToast("Clase creada. Código: " + cls.codigo);
    go("docente/clases");
    return;
  }

  // docente: agregar estudiante a una clase
  if (el.closest("#agregar-estudiante-btn")) {
    const btn = el.closest("#agregar-estudiante-btn");
    const classId = btn.dataset.class;
    const nombre = (document.getElementById("ae-nombre") || {}).value || "";
    const correo = (document.getElementById("ae-correo") || {}).value || "";
    if (!nombre.trim() || !correo.trim()) { showToast("Escribe nombre y correo del estudiante."); return; }
    const cls = classById(classId);
    const user = findUserByEmail(correo);
    if (!user || user.role !== "estudiante") {
      showToast("Primero el estudiante debe tener una cuenta de AulaYa con ese correo.");
      return;
    }
    if (!cls) { showToast("No se encontró la clase."); return; }
    if (String(user.colegioId) !== String(cls.colegioId)) {
      showToast("No puedes agregarlo: debe estar registrado en la misma institución.");
      return;
    }
    if (cls) {
      if ((cls.estudiantes||[]).some(e=>String(e.correo).toLowerCase()===correo.trim().toLowerCase())) {
        showToast("Ese estudiante ya está en la clase.");
        return;
      }
      // La clase hereda la materia que el docente eligió para esa clase.
      if (!Array.isArray(cls.materias) || !cls.materias.length) cls.materias = cls.materia ? [normalizeSubjectName(cls.materia)] : [];
      cls.estudiantes.push({
        id: "e" + Date.now(),
        nombre: user.nombre,
        correo: user.correo,
        joinedAt: Date.now(),
        joinedBy: currentTeacherEmail(),
        joinedByName: currentTeacherName(),
        progreso: 0,
        estado: "al_dia"
      });
      persistClass(cls);
      const studentState = loadUserState(user);
      const studentNotes = Array.isArray(studentState.notifications) ? studentState.notifications.slice() : [];
      const joinNotificationId = `class-${cls.id}-joined-${String(user.correo).toLowerCase()}`;
      if (!studentNotes.some(n => n.id === joinNotificationId)) {
        studentNotes.unshift({id:joinNotificationId,type:"profesor",category:"Clases",avatar:"teacher",unread:true,time:"Ahora",title:"Te agregaron a una clase",body:`${currentTeacherName()} te agregó a ${cls.nombre}. Ya puedes ver sus temas y actividades.`,action:{type:"clase",id:cls.id},target:{type:"estudiante",estudianteCorreo:user.correo}});
        studentState.notifications = studentNotes;
        saveUserState(studentState);
        user.notificationFeed = Array.isArray(user.notificationFeed) ? user.notificationFeed : [];
        if (!user.notificationFeed.some(n => n.id === joinNotificationId)) user.notificationFeed.unshift(studentNotes.find(n => n.id === joinNotificationId));
        persistUser(user);
      }
      showToast("✓ " + nombre.trim() + " ahora pertenece a " + cls.nombre + ". Le enviamos una notificación.");
    }
    render();
    return;
  }

  // docente: quitar estudiante de una clase
  const quitarBtn = el.closest("[data-quitar-estudiante]");
  if (quitarBtn) {
    const [classId, idx] = quitarBtn.dataset.quitarEstudiante.split(":");
    const cls = classById(classId);
    if (cls) {
      cls.estudiantes.splice(parseInt(idx, 10), 1);
      persistClass(cls);
    }
    render();
    return;
  }

  // El estado del estudiante NO es editable por el docente.
  // AULA lo calcula a partir del progreso/actividad real. Al pulsarlo,
  // se abre la ficha de estadísticas individuales.
  const statsBtn = el.closest("[data-student-stats]");
  if (statsBtn) {
    const [classId, idx] = statsBtn.dataset.studentStats.split(":");
    go("docente/clase/" + classId + "/estudiante/" + idx);
    return;
  }

  // docente: generar contenido con IA (demo)
  if (el.closest("#generar-ia-btn")) {
    showToast("Contenido generado con IA (demo) — listo para revisar y enviar.");
    return;
  }

  // docente: enviar recomendación
  if (el.closest("#send-recomendacion")) {
    const temaSelect = document.getElementById("tema-select");
    const claseSelect = document.getElementById("rec-clase");
    const msg = document.getElementById("msg-recomendacion");
    const temaText = temaSelect ? temaSelect.value : "Fracciones equivalentes";
    const clase = claseSelect ? classById(claseSelect.value) : myClasses()[0];
    const claseNombre = clase ? clase.nombre : "tu clase";
    if (!clase) { showToast("Primero crea una clase."); return; }
    const recId = "rec-" + Date.now();
    const topicId = topicIdFor(temaText, clase.grado, clase.materia, clase.id);
    clase.recomendaciones = Array.isArray(clase.recomendaciones) ? clase.recomendaciones : [];
    const rec = { id:recId, topicId, tema:temaText, temaExacto:temaText, materia:clase.materia, materiaExacta:clase.materia, grado:clase.grado, classId:clase.id, className:clase.nombre, recommendedBy:currentTeacherName(), message:msg && msg.value ? msg.value : "Este tema fue recomendado por tu docente.", createdAt:Date.now(), notificationId:"rec-"+clase.id+"-"+recId, version:2 };
    clase.recomendaciones.unshift(rec);
    persistClass(clase);
    document.dispatchEvent(new CustomEvent("aula:recommendation-added", {detail:{...rec, className:clase.nombre}}));
    refreshStudentNotificationsLive();
    showToast("✓ Tema enviado a " + claseNombre + ". Se cargará en la cuenta de cada estudiante de la clase.");
    render();
    return;
  }

  // docente: asignar ejercicios de práctica a una clase o a un estudiante
  if (el.closest("#send-ejercicios")) {
    const claseSelect = document.getElementById("ej-clase");
    const destSelect = document.getElementById("ej-destinatario");
    const temaSelect = document.getElementById("ej-tema");
    const clase = claseSelect ? classById(claseSelect.value) : myClasses()[0];
    const claseNombre = clase ? clase.nombre : "tu clase";
    const temaText = temaSelect ? temaSelect.value : "Fracciones equivalentes";
    const estudianteId = destSelect ? destSelect.value : "";
    const estudiante = estudianteId && clase ? clase.estudiantes.find((e) => e.id === estudianteId) : null;
    const destinoTexto = estudiante ? estudiante.nombre : claseNombre;
    // honestidad: hoy solo "Fracciones equivalentes" tiene ejercicios reales
    // (ver MALLA_TEMA_CON_LECCION) — si se asigna otro tema, se avisa en vez
    // de fingir que ya existe, igual que al tocar un tema sin lección en Explorar.
    const esReal = temaText === MALLA_TEMA_CON_LECCION;
    if (!clase) { showToast("Primero crea una clase."); return; }
    clase.recomendaciones = Array.isArray(clase.recomendaciones) ? clase.recomendaciones : [];
    const topicId = topicIdFor(temaText, clase.grado, clase.materia, clase.id);
    const recEjId = "ej-" + Date.now();
    const recEj = { id:recEjId, kind:"actividad", topicId, tema:temaText, temaExacto:temaText, materia:clase.materia, materiaExacta:clase.materia, grado:clase.grado, classId:clase.id, className:clase.nombre, recommendedBy:currentTeacherName(), message:"Tu docente te asignó ejercicios para practicar.", targetEmail:estudiante ? estudiante.correo : "", createdAt:Date.now(), notificationId:"ej-"+clase.id+"-"+recEjId, version:2 };
    clase.recomendaciones.unshift(recEj);
    persistClass(clase);
    document.dispatchEvent(new CustomEvent("aula:recommendation-added", {detail:{...recEj, className:clase.nombre}}));
    refreshStudentNotificationsLive();
    showToast("✓ Actividad publicada para " + destinoTexto + " · " + temaText);
    render();
    return;
  }

  // docente: comunicaciones (tabs + enviar mensaje directo + anotar demo)
  const comTabBtn = el.closest("[data-com-tab]");
  if (comTabBtn) { comTab = comTabBtn.dataset.comTab; render(); return; }
  if (el.closest("#send-msg-directo")) {
    const claseSelect = document.getElementById("msg-clase");
    const destSelect = document.getElementById("msg-destinatario");
    const texto = document.getElementById("msg-directo");
    if (!texto || !texto.value.trim()) { showToast("Escribe un mensaje antes de enviarlo."); return; }
    const clase = claseSelect ? classById(claseSelect.value) : myClasses()[0];
    const claseNombre = clase ? clase.nombre : "tu clase";
    const estudianteId = destSelect ? destSelect.value : "";
    const estudiante = estudianteId && clase ? clase.estudiantes.find((e) => e.id === estudianteId) : null;
    const destinoTexto = estudiante ? estudiante.nombre : claseNombre;
    const list = getNotifications();
    list.unshift({
      id: "n" + Date.now(),
      unread: true,
      type: "profesor",
      title: "Profe. " + currentTeacherName(),
      body: texto.value.trim(),
      time: "Hace un momento",
      avatar: "teacher",
      target: estudiante
        ? { type: "estudiante", claseId: clase.id, estudianteCorreo: estudiante.correo }
        : (clase ? { type: "clase", claseId: clase.id } : null),
    });
    updateState({ notifications: list });
    COM_SEED.mensajes = COM_SEED.mensajes || [];
    COM_SEED.mensajes.unshift({ from: "Tú → " + destinoTexto, text: texto.value.trim(), time: "Ahora" });
    showToast("Mensaje enviado a " + destinoTexto);
    texto.value = "";
    render();
    return;
  }
  if (el.closest("#com-send")) {
    const input = document.getElementById("com-input");
    if (input && input.value.trim()) {
      COM_SEED[comTab] = COM_SEED[comTab] || [];
      COM_SEED[comTab].unshift({ from: "Tú", text: input.value.trim(), time: "Ahora" });
      render();
    }
    return;
  }
});

// Búsqueda del catálogo de colegios: actualiza resultados sin recargar toda la vista.
document.addEventListener("input", (e) => {
  if (e.target.id === "bv-colegio-busqueda") {
    authSchoolSearch = e.target.value || "";
    authSelectedSchoolId = "";
    const hidden = document.getElementById("bv-colegio");
    if (hidden) hidden.value = "";
    clearTimeout(schoolSearchTimer);
    schoolSearchTimer = setTimeout(() => {
      const results = document.getElementById("bv-colegio-resultados");
      if (!results) return;
      const matches = schoolSearchMatches();
      const rows = schoolSearchResults(matches);
      results.innerHTML = rows.map(schoolResultHtml).join("") ||
        `<div class="school-empty">No encontramos coincidencias. Prueba otro nombre o cambia los filtros.</div>`;
      const summary = document.getElementById("bv-colegio-resumen");
      if (summary) summary.textContent = schoolSearchSummary(matches.length);
    }, 120);
  }
});
document.addEventListener("change", (e) => {
  if (e.target.id === "bv-colegio-depto") {
    authSelectedDepartment = e.target.value || "";
    authSelectedMunicipality = "";
    authSelectedSchoolId = "";
    authSchoolSearch = "";
    const hidden = document.getElementById("bv-colegio");
    if (hidden) hidden.value = "";
    renderSchoolPickerOnly();
    return;
  }
  if (e.target.id === "bv-colegio-muni") {
    authSelectedMunicipality = e.target.value || "";
    authSelectedSchoolId = "";
    authSchoolSearch = "";
    const hidden = document.getElementById("bv-colegio");
    if (hidden) hidden.value = "";
    renderSchoolPickerOnly();
  }
});

// Enter para enviar mensajes de chat
document.addEventListener("keydown", (e) => {
  if (e.target instanceof Element && ["ArrowRight","ArrowLeft","Home","End"].includes(e.key)) {
    const currentTab=e.target.closest("[data-avatar-category]");
    if(currentTab){
      const index=AVATAR_CATEGORY_LABELS.findIndex(([key])=>key===currentTab.dataset.avatarCategory);
      const nextIndex=e.key==="Home"?0:e.key==="End"?AVATAR_CATEGORY_LABELS.length-1:
        (index+(e.key==="ArrowRight"?1:-1)+AVATAR_CATEGORY_LABELS.length)%AVATAR_CATEGORY_LABELS.length;
      e.preventDefault();
      selectedAvatarCategory=AVATAR_CATEGORY_LABELS[nextIndex][0];
      render();
      focusAvatarCategoryTab();
      return;
    }
  }
  if (e.key !== "Enter") return;
  if (e.target.id === "bv-recuperar-correo") { e.preventDefault(); requestAccountRecovery(); return; }
  if (e.target.id === "bv-recuperar-codigo") { e.preventDefault(); verifyAccountRecovery(); return; }
  if (e.target.id === "bv-recuperar-confirmar") { e.preventDefault(); resetAccountPin(); return; }
  if (e.target.id === "bv-login-correo" || e.target.id === "bv-login-pin") { e.preventDefault(); doLogin(); return; }
  if (e.target.id === "mini-chat-input") { e.preventDefault(); doMiniChatSend(); }
  if (e.target.id === "niko-full-input") { e.preventDefault(); doNikoFullSend(); }
});

// ---------------------------------------------------------------------
// afterRender: ajustes puntuales tras insertar el HTML de la vista
// ---------------------------------------------------------------------

function afterRender(route, param) {
  if (route === "video" && typeof initAulaReel === "function") initAulaReel();
}

// ---------------------------------------------------------------------
// Notificaciones en tiempo casi real: las recomendaciones/actividades del
// docente se derivan de las clases compartidas y se revisan periódicamente
// segundos mientras la app está abierta. Si no hay internet, sigue usando
// la última copia local.
// ---------------------------------------------------------------------
let studentNotificationPollId = null;
async function refreshStudentNotificationsLive() {
  if (!STATE.auth || STATE.auth.role !== "estudiante") return;
  const before = JSON.stringify((STATE.notifications||[]).map(n=>n.id));
  if (DB && isOnline) await syncAll();
  const me=findUserByEmail(STATE.auth.correo);
  if (me) {
    const accountState=loadUserState(me);
    const feed=Array.isArray(me.notificationFeed) ? me.notificationFeed : [];
    const incoming=[...(Array.isArray(accountState.notifications)?accountState.notifications:[]), ...feed];
    const merged=new Map((STATE.notifications||[]).map(n=>[n.id,n]));
    incoming.forEach(n=>{ if(n && n.id) merged.set(n.id, {...merged.get(n.id), ...n}); });
    STATE.notifications=Array.from(merged.values()).sort((a,b)=>Number(b.createdAt||0)-Number(a.createdAt||0));
  }
  syncStudentClassContent();
  if (STATE.auth?.role === "estudiante") {
    // Si la clase llegó por sincronización pero la notificación no llegó por el feed,
    // la pertenencia misma genera una notificación local inmediatamente.
    const beforeJoin=JSON.stringify(STATE.notifications||[]);
    syncStudentClassContent();
    if (beforeJoin !== JSON.stringify(STATE.notifications||[])) updateState({notifications:STATE.notifications});
  }
  const after = JSON.stringify((STATE.notifications||[]).map(n=>n.id));
  if (before !== after && location.hash.startsWith("#/")) render();
}
function startStudentNotificationPolling() {
  if (studentNotificationPollId) return;
  studentNotificationPollId = setInterval(() => { if (isOnline && !document.hidden) refreshStudentNotificationsLive().catch(()=>{}); }, 30_000);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) refreshStudentNotificationsLive(); });
  window.addEventListener("online", refreshStudentNotificationsLive);
  window.addEventListener("storage", (e) => {
    if (["aula_user_state_v1","aula_usuarios_v1","aula_clases_v1"].includes(e.key)) refreshStudentNotificationsLive().catch(()=>{});
  });
}

// ---------------------------------------------------------------------
// Reloj falso de la barra de estado + registro del service worker
// ---------------------------------------------------------------------

function startClock() {
  const clockEl = document.getElementById("clock");
  if (!clockEl) return;
  const tick = () => {
    const now = new Date();
    let h = now.getHours();
    const m = now.getMinutes().toString().padStart(2, "0");
    const ampm = h >= 12 ? "" : "";
    clockEl.textContent = `${h % 12 === 0 ? 12 : h % 12}:${m}`;
  };
  tick();
  setInterval(tick, 30000);
}

function registerSW() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("service-worker.js").then((reg) => {
      if (isOnline) {
        const send = () => {
          try { reg.active?.postMessage({type:"AULA_PREFETCH_CORE"}); } catch(e) {}
        };
        if (navigator.serviceWorker.controller) send();
        navigator.serviceWorker.ready.then(() => send()).catch(()=>{});
      }
    }).catch(() => {});
  }
}

// ---------------------------------------------------------------------
// Arranque
// ---------------------------------------------------------------------

if (!location.hash) location.hash = "#/inicio";
if (STATE.auth && STATE.auth.correo) {
  const activeUser = findUserByEmail(STATE.auth.correo);
  if (activeUser) addActiveSession(activeUser);
}
startClock();
registerSW();
updateConnStatusUI();
initDb();
startStudentNotificationPolling();

// Render immediately; the question bank loads in the background.
render();
if (STATE.auth?.role === "estudiante") void loadAulaQuestionBank();

window.AULA_getStreak=()=>window.AULA_STREAK.get();window.AULA_completeLesson=(m)=>window.AULA_STREAK.completeLesson(m);window.AULA_markLessonCompleted=window.AULA_completeLesson;

window.AULA_getStreak=()=>window.AULA_STREAK.get();window.AULA_completeLesson=(m)=>window.AULA_STREAK.completeLesson(m);window.AULA_markLessonCompleted=window.AULA_completeLesson;

// AULA_STREAK_SYNC_RENDER: la interfaz se actualiza inmediatamente al completar la primera lección del día.
document.addEventListener("aula:streak-increased", function(e) {
  const s = e.detail || {};
  updateState({ streak: Number(s.count || 0), lastActivityDate: s.last_completed_day || null });
  render();
});

/* AulaYa — sincronización incremental de contenidos de clase.
   La PWA revisa cada 60 s mientras está abierta/activa. Solo materializa
   recomendaciones nuevas o cuya versión haya cambiado. */
(function(){
  const DB_NAME="AULA_OFFLINE_CONTENT_V1", STORE="lessons", POLL_MS=60_000;
  function openDB(){
    return new Promise((resolve,reject)=>{
      if(!window.indexedDB){ reject(new Error("IndexedDB no disponible")); return; }
      const r=indexedDB.open(DB_NAME,1);
      r.onupgradeneeded=()=>{ if(!r.result.objectStoreNames.contains(STORE)) r.result.createObjectStore(STORE,{keyPath:"content_id"}); };
      r.onsuccess=()=>resolve(r.result); r.onerror=()=>reject(r.error);
    });
  }
  async function get(id){ const db=await openDB(); return new Promise((res,rej)=>{ const r=db.transaction(STORE,"readonly").objectStore(STORE).get(id); r.onsuccess=()=>res(r.result||null); r.onerror=()=>rej(r.error); }); }
  async function put(item){ const db=await openDB(); return new Promise((res,rej)=>{ const r=db.transaction(STORE,"readwrite").objectStore(STORE).put(item); r.onsuccess=()=>res(); r.onerror=()=>rej(r.error); }); }
  function studentRecommendations(){
    try {
      if (!(STATE.auth && STATE.auth.role === "estudiante")) return [];
      const correo=String(STATE.auth.correo||"").toLowerCase();
      return studentLinkedClasses().flatMap(cls => (cls.recomendaciones||[])
        .filter(r=>!r.targetEmail || String(r.targetEmail).toLowerCase()===correo)
        .map(r=>({ ...r, classId:cls.id, className:cls.nombre, version:Number(r.version||1) })));
    } catch(e){ return []; }
  }
  function contentId(r){ return r.content_id || `aula-${r.classId}-${r.id||r.topicId||r.tema}`; }
  async function materialize(r){
    const id=contentId(r), version=Number(r.version||1), old=await get(id);
    if(old && Number(old.version||1)>=version) return false;
    await put({
      content_id:id, version, class_id:r.classId||"", subject:r.materia||"", grade:r.grado||"",
      topic:r.tema||"", recommendation_id:r.id||id, recommended_by:r.recommendedBy||"Tu docente",
      message:r.message||"", resources:["leccion","ejercicios","reto","evaluacion"], downloaded_at:new Date().toISOString()
    });
    document.dispatchEvent(new CustomEvent("aula:content-downloaded",{detail:{...r,content_id:id,version}}));
    return true;
  }
  async function check(){
    const recs=studentRecommendations();
    let downloaded=0;
    for(const r of recs) if(await materialize(r)) downloaded++;
    try{ localStorage.setItem("aula_last_content_sync_v1", new Date().toISOString()); }catch(e){}
    return {downloaded};
  }
  window.AULA_OFFLINE={check,get,materialize,lastSync:()=>localStorage.getItem("aula_last_content_sync_v1")||null};
  function start(){
    check().catch(()=>{});
    setInterval(()=>{ if(isOnline && !document.hidden) check().catch(()=>{}); },POLL_MS);
    window.addEventListener("online",()=>check().catch(()=>{}));
    window.addEventListener("storage",(e)=>{ if(e.key === "aula_clases_v1" || e.key === "aula_user_state_v1") check().catch(()=>{}); });
  }
  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded",start); else start();
})();
