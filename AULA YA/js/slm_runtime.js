/* AulaYa — SLM local runtime
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
  maxNewTokens: 64,
  defaultModel: 'onnx-community/SmolLM2-135M-Instruct-ONNX',
  installedModelKey: 'aula_slm_installed_model_v1',
  selectedModelKey: 'aula_slm_selected_model_v1'
};

let _pipe = null;
let _modelId = null;
let _loading = null;
let _loadingModelId = null;
let _status = 'idle';
let _error = '';
let _progress = null;
let _persistentStorage = null;
let _progressEmitTimer = null;

function isSupportedModel(modelId) {
  return modelId === AULA_SLM_CONFIG.primary || modelId === AULA_SLM_CONFIG.fallback;
}

function preferredModel() {
  try {
    const selected = localStorage.getItem(AULA_SLM_CONFIG.selectedModelKey);
    if (isSupportedModel(selected)) return selected;
  } catch (e) {
    console.warn('[AULA SLM] No se pudo leer el modelo seleccionado:', e);
  }
  return AULA_SLM_CONFIG.defaultModel;
}

function modelLabel(modelId) {
  if (modelId === AULA_SLM_CONFIG.primary) return 'Qwen 0.5B · avanzado';
  if (modelId === AULA_SLM_CONFIG.fallback) return 'SmolLM2 135M · ligero';
  return 'SLM local';
}

function modelSizeMB(modelId) {
  return modelId === AULA_SLM_CONFIG.primary
    ? AULA_SLM_CONFIG.primaryApproxMB
    : AULA_SLM_CONFIG.fallbackApproxMB;
}

function emitStatus(extra={}) {
  window.dispatchEvent(new CustomEvent('aula-slm-status', { detail: {
    status: _status, model: _modelId, error: _error, progress: _progress,
    persistentStorage: _persistentStorage, installedModel: getInstalledModel(), ...extra
  }}));
}

function getInstalledModel() {
  try {
    const model = localStorage.getItem(AULA_SLM_CONFIG.installedModelKey);
    return isSupportedModel(model) ? model : '';
  } catch (e) {
    console.warn('[AULA SLM] No se pudo leer el modelo instalado:', e);
    return '';
  }
}

function rememberInstalledModel(modelId) {
  try {
    localStorage.setItem(AULA_SLM_CONFIG.installedModelKey, modelId);
    localStorage.setItem(AULA_SLM_CONFIG.selectedModelKey, modelId);
  } catch (e) {
    console.warn('[AULA SLM] No se pudo guardar la preferencia del modelo:', e);
  }
}

function forgetInstalledModel(modelId) {
  try {
    if (localStorage.getItem(AULA_SLM_CONFIG.installedModelKey) === modelId) {
      localStorage.removeItem(AULA_SLM_CONFIG.installedModelKey);
    }
  } catch (e) {
    console.warn('[AULA SLM] No se pudo actualizar el estado del modelo instalado:', e);
  }
}

function selectModel(modelId) {
  if (!isSupportedModel(modelId)) throw new Error('El modelo seleccionado no está disponible.');
  try {
    localStorage.setItem(AULA_SLM_CONFIG.selectedModelKey, modelId);
  } catch (e) {
    console.warn('[AULA SLM] No se pudo guardar el modelo elegido:', e);
  }
  emitStatus({ selectedModel: modelId });
  return modelId;
}

async function requestPersistentStorage() {
  if (!navigator.storage?.persist) {
    _persistentStorage = false;
    return;
  }
  try {
    _persistentStorage = await navigator.storage.persist();
  } catch (e) {
    _persistentStorage = false;
    console.warn('[AULA SLM] El navegador no confirmó almacenamiento persistente:', e);
  }
}

async function checkStorageSpace(modelId) {
  if (!navigator.storage?.estimate) return;
  const estimate = await navigator.storage.estimate();
  if (!Number.isFinite(estimate.quota) || !Number.isFinite(estimate.usage)) return;
  const available = estimate.quota - estimate.usage;
  const required = modelSizeMB(modelId) * 1024 * 1024 * 1.15;
  if (available < required) {
    const availableMB = Math.max(0, Math.floor(available / (1024 * 1024)));
    throw new Error(`Hay ${availableMB} MB disponibles; libera espacio para descargar aproximadamente ${modelSizeMB(modelId)} MB.`);
  }
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
  const grounding = String(meta.grounding || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
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
  return { grade, subject, topic, evidence, grounding };
}

function systemPrompt(meta) {
  return `Eres Niko, tutor de AulaYa. Responde en español claro y breve, adecuado para estudiantes de ${meta.grade || 'primaria y secundaria'}.
Limítate al tema indicado y usa SOLO los datos de las fuentes aprobadas. No inventes operaciones ni resultados. Si piden un ejemplo, explica uno correctamente paso a paso. Si la fuente no alcanza, dilo.
Materia: ${meta.subject || 'no indicada'}. Tema: ${meta.topic || 'no indicado'}.
Fuente curricular aprobada: ${meta.evidence || 'Sin preguntas aprobadas disponibles.'}
Explicación validada: ${meta.grounding || 'Sin explicación adicional disponible.'}`;
}

function isUsableAnswer(answer, question, context) {
  const text = String(answer || '').trim();
  const words = text.match(/[\p{L}\p{N}]+/gu) || [];
  if (words.length < 8) return false;

  const normalize = word => word.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const normalizedWords = words.map(normalize);
  const phrases = new Set();
  for (let i = 0; i <= normalizedWords.length - 7; i++) {
    const phrase = normalizedWords.slice(i, i + 7).join(' ');
    if (phrases.has(phrase)) return false;
    phrases.add(phrase);
  }

  if (/\p{Ll}[\p{Lu}]{2,}|\p{Lu}{2,}\p{Ll}/u.test(text)) return false;

  const allowedNumbers = `${question} ${context.evidence} ${context.grounding}`.match(/\d+(?:\/\d+)?/g) || [];
  const allowed = new Set(allowedNumbers);
  const answerNumbers = text.match(/\d+(?:\/\d+)?/g) || [];
  if (answerNumbers.some(number => !allowed.has(number))) return false;

  const stopWords = new Set('a al algo algunas algunos ante asi aunque bajo bien cada como con contra cual cuando de del desde donde dos el ella ellas ellos en entre era es esa esas ese eso esos esta estas este esto estos fue ha hasta hay la las le les lo los mas me mi mis mucha muchas mucho muchos muy ni no nos o otra otras otro otros para pero poca pocas poco pocos por porque que se sin sobre son su sus te tiene todo todos tu un una unas uno unos y ya'.split(' '));
  const approvedWords = `${question} ${context.topic} ${context.evidence} ${context.grounding}`
    .match(/\p{L}{4,}/gu)
    ?.map(normalize) || [];
  const approved = new Set(approvedWords.flatMap(word => [word, word.slice(0, 6)]));
  const contentWords = [...new Set(normalizedWords.filter(word => word.length >= 4 && !stopWords.has(word)))];
  if (contentWords.length < 4) return false;
  const groundedCount = contentWords.filter(word => approved.has(word) || approved.has(word.slice(0, 6))).length;
  if (groundedCount / contentWords.length < 0.5) return false;

  return true;
}

async function load(modelId=preferredModel()) {
  if (!isSupportedModel(modelId)) throw new Error('El modelo seleccionado no está disponible.');
  if (_pipe && _modelId === modelId) return _pipe;
  if (_loading) {
    if (_loadingModelId === modelId) return _loading;
    try { await _loading; } catch (_) {}
    return load(modelId);
  }
  _loadingModelId = modelId;
  _loading = (async () => {
    _status = 'loading'; _error = ''; _modelId = modelId; _progress = null; emitStatus();
    try {
      const { pipeline } = await getTransformers();
      const useWebGPU = !!navigator.gpu;
      _pipe = await pipeline('text-generation', modelId, {
        dtype: 'q4',
        device: useWebGPU ? 'webgpu' : 'wasm',
        progress_callback: onModelProgress
      });
      rememberInstalledModel(modelId);
      _status = 'ready'; emitStatus();
      return _pipe;
    } catch (firstError) {
      // Retry on WASM only when the first attempt actually used WebGPU.
      if (!navigator.gpu) {
        _pipe = null;
        _status = 'error';
        _error = String(firstError?.message || 'No se pudo cargar el SLM');
        forgetInstalledModel(modelId);
        emitStatus();
        throw firstError;
      }
      try {
        const { pipeline } = await getTransformers();
        _pipe = await pipeline('text-generation', modelId, {
          dtype: 'q4', device: 'wasm', progress_callback: onModelProgress
        });
        rememberInstalledModel(modelId);
        _status = 'ready'; _error = ''; emitStatus();
        return _pipe;
      } catch (secondError) {
        _pipe = null;
        _status = 'error';
        _error = String(secondError?.message || firstError?.message || 'No se pudo cargar el SLM');
        forgetInstalledModel(modelId);
        emitStatus();
        throw secondError;
      }
    } finally {
      _loading = null;
      _loadingModelId = null;
    }
  })();
  return _loading;
}

function onModelProgress(event) {
  if (!event || typeof event !== 'object') return;
  if (event.status === 'progress_total') {
    _progress = {
      status: String(event.status),
      file: String(event.name || ''),
      loaded: Number(event.loaded || 0),
      total: Number(event.total || 0),
      percent: Number.isFinite(Number(event.progress)) ? Math.max(0, Math.min(100, Number(event.progress))) : null
    };
  } else if (event.status === 'progress' || event.status === 'download') {
    _progress = {
      status: String(event.status),
      file: String(event.file || event.name || ''),
      loaded: Number(event.loaded || 0),
      total: Number(event.total || 0),
      percent: Number(event.total) > 0 ? Math.max(0, Math.min(100, Number(event.loaded) / Number(event.total) * 100)) : null
    };
  } else {
    _progress = { status: String(event.status || ''), file: String(event.file || event.name || ''), percent: null };
  }
  if (_progressEmitTimer === null) {
    _progressEmitTimer = setTimeout(() => {
      _progressEmitTimer = null;
      emitStatus();
    }, 200);
  }
}

async function generate(question, meta={}) {
  const context = buildContext(meta);
  const installed = getInstalledModel();
  if (!installed) throw new Error('Descarga un modelo local desde el chat de Niko antes de usar la generación neuronal.');
  const pipe = await load(installed);
  _status = 'generating'; emitStatus();
  const messages = [
    { role: 'system', content: systemPrompt(context) },
    { role: 'user', content: question }
  ];
  try {
    const out = await pipe(messages, {
      max_new_tokens: AULA_SLM_CONFIG.maxNewTokens,
      repetition_penalty: 1.08,
      do_sample: false
    });
    const generated = out?.[0]?.generated_text;
    let text = '';
    if (Array.isArray(generated)) text = generated[generated.length - 1]?.content || '';
    else text = String(generated || '');
    _status = 'ready'; emitStatus();
    if (!isUsableAnswer(text, question, context)) {
      console.warn('[AULA SLM] Respuesta local descartada por repetición, formato o datos no validados.');
      return '';
    }
    return text.trim();
  } catch (e) {
    _status = 'ready'; emitStatus();
    throw e;
  }
}

async function install(modelId=preferredModel()) {
  if (!isSupportedModel(modelId)) throw new Error('Elige uno de los modelos disponibles.');
  try {
    if (!navigator.onLine) throw new Error('Conéctate a internet para descargar el modelo. Si ya lo descargaste, puedes cargarlo desde su caché.');
    await checkStorageSpace(modelId);
    await requestPersistentStorage();
    const pipe = await load(modelId);
    _error = '';
    _progress = null;
    emitStatus();
    return pipe;
  } catch (e) {
    _error = String(e?.message || 'No se pudo descargar el modelo.');
    _status = 'error';
    emitStatus();
    throw e;
  }
}

async function preload() {
  const installed = getInstalledModel();
  if (!installed || _status === 'loading' || _status === 'ready') return;
  try { await load(installed); }
  catch (e) { console.warn('[AULA SLM] No se pudo cargar el modelo guardado:', e); }
}

window.AULA_SLM = {
  config: AULA_SLM_CONFIG,
  load,
  generate,
  install,
  selectModel,
  preload,
  getStatus: () => ({
    status:_status, model:_modelId, modelLabel:modelLabel(_modelId),
    error:_error, progress:_progress, persistentStorage:_persistentStorage,
    installedModel:getInstalledModel(), selectedModel:preferredModel()
  }),
  isReady: () => _status === 'ready'
};
window.dispatchEvent(new CustomEvent('aula-slm-ready'));

// Only reload a model that the student explicitly installed before.
window.addEventListener('online', () => setTimeout(preload, 1500));
setTimeout(preload, 0);
