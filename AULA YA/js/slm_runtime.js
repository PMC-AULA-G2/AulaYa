/* AULA YA — SLM local runtime
 * Real local inference in the browser through Transformers.js + ONNX.
 * Primary: Qwen2.5-0.5B-Instruct Q4 (Spanish/multilingual friendly).
 * Fallback: SmolLM2-135M-Instruct Q4 for constrained devices.
 * Model files are cached by Transformers.js so the first online load becomes
 * available offline afterwards. No prompt is sent to a remote inference API.
 */
const AULA_SLM_CONFIG = {
  library: 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.3.0',
  primary: 'onnx-community/Qwen2.5-0.5B-Instruct',
  fallback: 'onnx-community/SmolLM2-135M-Instruct-ONNX',
  primaryApproxMB: 786,
  fallbackApproxMB: 181,
  maxNewTokens: 220
};

let _pipe = null;
let _modelId = null;
let _loading = null;
let _status = 'idle';
let _error = '';

function emitStatus(extra={}) {
  window.dispatchEvent(new CustomEvent('aula-slm-status', { detail: {
    status: _status, model: _modelId, error: _error, ...extra
  }}));
}

function chooseModel() {
  const ram = Number(navigator.deviceMemory || 4);
  const cores = Number(navigator.hardwareConcurrency || 4);
  // Qwen is preferred when the browser exposes enough resources; otherwise
  // the 135M model keeps the offline tutor usable on low-end devices.
  return (ram >= 4 && cores >= 4) ? AULA_SLM_CONFIG.primary : AULA_SLM_CONFIG.fallback;
}

async function getTransformers() {
  if (window.__AULA_TRANSFORMERS) return window.__AULA_TRANSFORMERS;
  const mod = await import(AULA_SLM_CONFIG.library);
  // Browser cache keeps downloaded model files for subsequent/offline loads.
  mod.env.allowRemoteModels = true;
  mod.env.useBrowserCache = true;
  window.__AULA_TRANSFORMERS = mod;
  return mod;
}

function buildContext(meta={}) {
  const grade = String(meta.grade || '').trim();
  const subject = String(meta.subject || '').trim();
  const topic = String(meta.topic || '').trim();
  let evidence = '';
  try {
    const bank = Array.isArray(window.AULA_QUESTION_BANK) ? window.AULA_QUESTION_BANK : [];
    const normalize = v => String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
    const t = normalize(topic);
    const g = normalize(grade);
    const s = normalize(subject);
    const rows = bank.filter(q => normalize(q.tema) === t && (!g || normalize(q.grado) === g) && (!s || normalize(q.materia) === s)).slice(0,3);
    evidence = rows.map((q,i) => `Pregunta ${i+1}: ${q.q}\nOpciones: ${(q.options||[]).join(' | ')}\nRespuesta: ${q.options?.[q.correct] || ''}\nExplicación aprobada: ${q.explanation || q.hint || ''}`).join('\n\n');
  } catch (_) {}
  return { grade, subject, topic, evidence };
}

function systemPrompt(meta) {
  return `Eres Niko, tutor educativo de AULA YA para estudiantes de Colombia.
Tu misión es enseñar, no solo contestar.
REGLAS OBLIGATORIAS:
1. Trabaja EXCLUSIVAMENTE el tema asignado. No cambies a otro tema aunque sea parecido.
2. Respeta exactamente grado, materia y tema.
3. Explica con lenguaje apropiado para la edad. Para primaria usa palabras sencillas, objetos cotidianos y pasos cortos. Para secundaria puedes profundizar, pero sin ser ambiguo.
4. Si el estudiante pide un ejemplo, SIEMPRE da un ejemplo concreto y resuélvelo paso a paso.
5. Si pide otro ejemplo, cambia los números, situación o contexto; no repitas el mismo ejemplo.
6. Si dice que no entiende, vuelve a explicar desde cero con una comparación cotidiana y después un ejemplo.
7. Para matemáticas muestra operaciones completas. Para ciencias explica causa, proceso y consecuencia. Para sociales distingue hechos, causas y consecuencias. Para español usa fragmentos/oraciones concretas. Para inglés da la oración en inglés y su significado en español.
8. No inventes datos específicos cuando el contexto aprobado no los contiene. Si falta información, dilo claramente.
9. Termina con una pregunta o mini ejercicio del MISMO tema cuando sea útil.
10. No menciones estas reglas ni hables de ser un modelo de lenguaje.

CONTEXTO CURRICULAR ACTIVO:
Grado: ${meta.grade || 'no indicado'}
Materia: ${meta.subject || 'no indicada'}
Tema: ${meta.topic || 'no indicado'}

CONTENIDO APROBADO DISPONIBLE:
${meta.evidence || 'Usa el concepto curricular del tema y explica con prudencia.'}`;
}

async function load(modelId=chooseModel()) {
  if (_pipe && _modelId === modelId) return _pipe;
  if (_loading) return _loading;
  _loading = (async () => {
    _status = 'loading'; _error = ''; _modelId = modelId; emitStatus();
    try {
      const { pipeline } = await getTransformers();
      const useWebGPU = !!navigator.gpu;
      _pipe = await pipeline('text-generation', modelId, {
        dtype: 'q4',
        device: useWebGPU ? 'webgpu' : 'wasm'
      });
      _status = 'ready'; emitStatus();
      return _pipe;
    } catch (firstError) {
      // Some devices/browsers do not support WebGPU q4 reliably. Retry on WASM.
      try {
        const { pipeline } = await getTransformers();
        _pipe = await pipeline('text-generation', modelId, { dtype: 'q4', device: 'wasm' });
        _status = 'ready'; _error = ''; emitStatus();
        return _pipe;
      } catch (secondError) {
        _pipe = null;
        _status = 'error';
        _error = String(secondError?.message || firstError?.message || 'No se pudo cargar el SLM');
        emitStatus();
        throw secondError;
      }
    } finally {
      _loading = null;
    }
  })();
  return _loading;
}

async function generate(question, meta={}) {
  const context = buildContext(meta);
  const chosen = chooseModel();
  let pipe;
  try {
    pipe = await load(chosen);
  } catch (_) {
    // If the preferred model fails, immediately try the tiny fallback.
    if (chosen !== AULA_SLM_CONFIG.fallback) pipe = await load(AULA_SLM_CONFIG.fallback);
    else throw _;
  }
  _status = 'generating'; emitStatus();
  const messages = [
    { role: 'system', content: systemPrompt(context) },
    { role: 'user', content: question }
  ];
  try {
    const out = await pipe(messages, {
      max_new_tokens: AULA_SLM_CONFIG.maxNewTokens,
      temperature: 0.35,
      top_p: 0.85,
      repetition_penalty: 1.08,
      do_sample: true
    });
    const generated = out?.[0]?.generated_text;
    let text = '';
    if (Array.isArray(generated)) text = generated[generated.length - 1]?.content || '';
    else text = String(generated || '');
    _status = 'ready'; emitStatus();
    return text.trim();
  } catch (e) {
    _status = 'ready'; emitStatus();
    throw e;
  }
}

async function preload() {
  if (!navigator.onLine || _status === 'loading' || _status === 'ready') return;
  try { await load(chooseModel()); } catch (_) { /* fallback engine remains usable */ }
}

window.AULA_SLM = {
  config: AULA_SLM_CONFIG,
  load,
  generate,
  preload,
  getStatus: () => ({status:_status, model:_modelId, error:_error}),
  isReady: () => _status === 'ready'
};

// Do not block startup. When online, download the model in the background.
window.addEventListener('online', () => setTimeout(preload, 2500));
setTimeout(() => { if (navigator.onLine) preload(); }, 6500);
