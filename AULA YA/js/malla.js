// ---------------------------------------------------------------------
// Malla académica de referencia para Colombia (1.° a 11.°)
// ---------------------------------------------------------------------
// Colombia no tiene un temario nacional idéntico para cada colegio, así
// que esto NO es el currículo oficial de un colegio en particular: es
// una "malla de referencia" construida a partir de los aprendizajes y
// competencias que normalmente se trabajan en cada grado (incluida la
// progresión hacia Saber 11 en 10.° y 11.°). Sirve de base de
// conocimiento para que Niko ubique en qué parte del camino va cada
// estudiante y arme rutas personalizadas — no es solo "responder
// preguntas sueltas".
//
// Estructura: MALLA_ACADEMICA[grado] = { nivel, areas: { area: [temas] } }
// En 10.° y 11.° algunas áreas se dividen en sub-áreas:
//   areas: { "Ciencias Naturales": { "Biología": [...], "Química": [...] } }
// mallaAreaTemas() (más abajo) normaliza ambos casos.

const MALLA_ACADEMICA = {
  prejardin: {
    nivel: "Prejardín (3 años) — exploración y aprestamiento inicial",
    areas: {
      "Comunicación y lenguaje": [
        "Escucha de cuentos cortos", "Rimas y canciones", "Ampliación de vocabulario",
        "Expresión de necesidades y emociones", "Identificación de su nombre",
      ],
      "Pensamiento lógico-matemático": [
        "Noción de cantidad (mucho/poco)", "Clasificación por color", "Clasificación por tamaño",
        "Nociones espaciales básicas (arriba/abajo)", "Comparación de objetos",
      ],
      "Exploración del cuerpo y el entorno": [
        "Reconocimiento de su cuerpo", "Los sentidos", "Rutinas del día", "Animales y plantas cercanas",
        "El clima",
      ],
      "Expresión artística y motricidad": [
        "Garabateo y trazos libres", "Rasgado y armado", "Juego con plastilina", "Canciones y ritmo",
        "Juego simbólico",
      ],
      "Convivencia y autonomía": [
        "Normas básicas de convivencia", "Hábitos de higiene", "Autonomía para comer y vestirse",
        "Relación con otros niños", "Identidad y familia",
      ],
    },
  },

  jardin: {
    nivel: "Jardín (4 años) — aprestamiento",
    areas: {
      "Matemáticas": [
        "Conteo del 1 al 10", "Reconocimiento de números", "Nociones de cantidad (más/menos)",
        "Clasificación por color, forma y tamaño", "Seriación", "Nociones espaciales (arriba/abajo, dentro/fuera)",
        "Figuras geométricas básicas", "Comparación de tamaños",
      ],
      "Lenguaje": [
        "Reconocimiento de vocales", "Sonidos iniciales", "Ampliación de vocabulario", "Escucha de cuentos",
        "Expresión oral", "Rimas y canciones", "Pre-escritura (trazos)", "Identificación de su nombre escrito",
      ],
      "Ciencias Naturales": [
        "Los sentidos", "Mi cuerpo", "Animales y sus sonidos", "Plantas y su cuidado", "El clima",
        "Día y noche", "Cuidado del medio ambiente",
      ],
      "Sociales": [
        "Mi familia", "Mis compañeros y el colegio", "Normas de convivencia", "Identidad y autonomía",
        "Costumbres y tradiciones locales",
      ],
      "Inglés": [
        "Saludos en inglés", "Colores en inglés", "Números en inglés", "Canciones en inglés",
      ],
    },
  },

  transicion: {
    nivel: "Transición / grado cero (5 años) — aprestamiento formal, previo a 1.°",
    areas: {
      "Matemáticas": [
        "Conteo hasta 20", "Escritura de números", "Suma y resta con material concreto",
        "Seriación y patrones", "Nociones espaciales avanzadas", "Figuras geométricas",
        "Medición informal (más largo/más corto)",
      ],
      "Lenguaje": [
        "Conciencia fonológica", "Segmentación silábica", "Pre-lectura de palabras cortas",
        "Trazos y pre-escritura de letras", "Producción oral de cuentos", "Seguimiento de instrucciones",
      ],
      "Ciencias Naturales": [
        "Los seres vivos", "El ciclo del agua", "El clima y las estaciones", "Cuidado del cuerpo",
        "Cuidado del medio ambiente",
      ],
      "Sociales": [
        "Mi colegio y mi comunidad", "Normas y acuerdos de convivencia", "Símbolos patrios básicos",
        "Diversidad y respeto", "Autonomía y responsabilidad",
      ],
      "Inglés": [
        "Vocabulario básico ampliado", "Frases cortas de uso diario", "Canciones y juegos en inglés",
      ],
    },
  },

  1: {
    nivel: "Fundamentación",
    areas: {
      "Matemáticas": [
        "Conteo y números naturales", "Lectura y escritura de números", "Comparación de cantidades",
        "Orden de números", "Suma", "Resta", "Resolución de problemas sencillos", "Patrones y secuencias",
        "Figuras geométricas básicas", "Ubicación espacial", "Longitud", "Peso", "Tiempo",
        "Clasificación y organización de datos", "Lectura de pictogramas",
      ],
      "Lenguaje": [
        "Vocales y consonantes", "Lectura de palabras y oraciones", "Escritura de palabras",
        "Comprensión literal", "Identificación de personajes", "Secuencia de acontecimientos",
        "Textos narrativos", "Cuentos", "Fábulas", "Descripciones", "Expresión oral", "Escucha y comprensión",
      ],
      "Ciencias Naturales": [
        "El cuerpo humano", "Los sentidos", "Hábitos saludables", "Seres vivos y no vivos", "Animales",
        "Plantas", "Hábitats", "Agua", "Aire", "Tierra", "Cuidado del medio ambiente",
      ],
      "Sociales": [
        "Identidad", "Familia", "Comunidad", "Normas", "Convivencia", "Derechos y deberes básicos",
        "Mi colegio", "Mi barrio", "Ubicación espacial", "Símbolos de Colombia",
      ],
      "Inglés": [
        "Saludos", "Presentaciones", "Números", "Colores", "Familia", "Partes del cuerpo", "Animales",
        "Objetos del aula", "Instrucciones básicas",
      ],
    },
  },

  2: {
    nivel: "Fundamentación",
    areas: {
      "Matemáticas": [
        "Números hasta miles", "Valor posicional", "Suma y resta", "Multiplicación inicial",
        "División como reparto", "Problemas de operaciones", "Patrones numéricos",
        "Fracciones como parte de un todo", "Figuras planas", "Sólidos geométricos", "Perímetro intuitivo",
        "Medición", "Tiempo", "Dinero", "Tablas y gráficos sencillos",
      ],
      "Lenguaje": [
        "Comprensión lectora", "Idea principal", "Secuencia", "Personajes", "Espacio y tiempo", "Cuento",
        "Fábula", "Poema", "Descripción", "Instrucciones", "Producción de textos", "Ortografía básica",
        "Sustantivos", "Verbos", "Adjetivos",
      ],
      "Ciencias Naturales": [
        "Ciclos de vida", "Plantas", "Animales", "Alimentación", "Sistemas básicos del cuerpo",
        "Estados del agua", "Materia", "Fuerza y movimiento", "Luz", "Sonido", "Recursos naturales",
        "Reciclaje",
      ],
      "Sociales": [
        "Comunidad", "Oficios y profesiones", "Normas", "Autoridades", "Municipio", "Departamento",
        "Colombia", "Paisaje rural y urbano", "Recursos del territorio", "Diversidad cultural",
      ],
      "Inglés": [
        "Familia", "Casa", "Colegio", "Rutinas", "Días y meses", "Clima", "Comida", "Animales",
        "Presente simple inicial", "There is / There are",
      ],
    },
  },

  3: {
    nivel: "Fundamentación",
    areas: {
      "Matemáticas": [
        "Números naturales", "Multiplicación", "División", "Problemas de varias operaciones", "Fracciones",
        "Fracciones equivalentes básicas", "Decimales iniciales", "Patrones", "Igualdades", "Perímetro",
        "Área inicial", "Ángulos", "Simetría", "Medición", "Tablas", "Gráficos", "Promedio intuitivo",
      ],
      "Lenguaje": [
        "Comprensión literal", "Comprensión inferencial", "Idea principal", "Ideas secundarias",
        "Narración", "Descripción", "Textos informativos", "Poemas", "Mitos y leyendas", "Noticias",
        "Estructura textual", "Gramática", "Ortografía", "Producción escrita",
      ],
      "Ciencias Naturales": [
        "Célula como unidad básica", "Seres vivos", "Ecosistemas", "Cadenas alimentarias", "Plantas",
        "Animales", "Cuerpo humano", "Nutrición", "Materia", "Estados de la materia", "Cambios físicos",
        "Fuerza", "Movimiento", "Energía",
      ],
      "Sociales": [
        "Historia local", "Historia de Colombia inicial", "Regiones naturales", "Relieve", "Clima",
        "Recursos naturales", "Organización territorial", "Municipio", "Departamento", "Derechos",
        "Participación ciudadana", "Diversidad cultural",
      ],
      "Inglés": [
        "Rutinas", "Familia", "Escuela", "Lugares", "Presente simple", "Presente continuo",
        "Preguntas básicas", "Descripciones", "Gustos y preferencias", "Comprensión de textos cortos",
      ],
    },
  },

  4: {
    nivel: "Fundamentación",
    areas: {
      "Matemáticas": [
        "Números naturales", "Operaciones combinadas", "Múltiplos", "Divisores", "Números primos",
        "Fracciones", "Fracciones equivalentes", "Suma y resta de fracciones", "Decimales",
        "Porcentajes iniciales", "Razones", "Perímetro", "Área", "Volumen", "Ángulos", "Polígonos",
        "Coordenadas", "Estadística", "Media", "Moda", "Gráficos",
      ],
      "Lenguaje": [
        "Comprensión literal e inferencial", "Textos narrativos", "Textos descriptivos",
        "Textos informativos", "Textos expositivos", "Mito", "Leyenda", "Fábula", "Poesía", "Noticia",
        "Carta", "Párrafo", "Idea principal", "Conectores", "Sustantivos", "Verbos", "Adjetivos",
        "Pronombres", "Ortografía",
      ],
      "Ciencias Naturales": [
        "Célula", "Tejidos", "Órganos", "Sistemas del cuerpo", "Nutrición", "Respiración", "Circulación",
        "Reproducción", "Ecosistemas", "Relaciones ecológicas", "Materia", "Mezclas", "Energía",
        "Electricidad", "Magnetismo",
      ],
      "Sociales": [
        "Pueblos indígenas", "Conquista", "Colonia", "Independencia", "Formación de Colombia",
        "Regiones naturales", "Geografía colombiana", "Población", "Diversidad cultural", "Constitución",
        "Derechos", "Organización política",
      ],
    },
  },

  5: {
    nivel: "Fundamentación (cierre de primaria / diagnóstico general)",
    areas: {
      "Matemáticas": [
        "Operaciones con naturales", "Fracciones", "Decimales", "Porcentajes", "Razones y proporciones",
        "Regla de tres simple", "Múltiplos y divisores", "Potenciación", "Radicación inicial", "Perímetro",
        "Área", "Volumen", "Coordenadas", "Estadística", "Probabilidad básica",
        "Interpretación de gráficos", "Resolución de problemas",
      ],
      "Lenguaje": [
        "Comprensión literal", "Inferencias", "Idea principal", "Argumentos", "Textos narrativos",
        "Expositivos", "Informativos", "Argumentativos iniciales", "Literatura", "Poesía", "Teatro",
        "Noticias", "Publicidad", "Medios de comunicación", "Gramática", "Cohesión", "Coherencia",
      ],
      "Ciencias Naturales": [
        "Célula", "Sistemas del cuerpo", "Nutrición", "Reproducción", "Ecosistemas", "Biodiversidad",
        "Materia", "Mezclas", "Cambios físicos y químicos", "Energía", "Electricidad", "Movimiento",
        "Fuerzas", "Tierra", "Sistema solar", "Ambiente",
      ],
      "Sociales": [
        "Historia de Colombia", "Independencia", "República", "Regiones", "Población", "Economía",
        "Constitución", "Derechos fundamentales", "Democracia", "Gobierno", "Diversidad cultural",
        "Problemas ambientales",
      ],
    },
  },

  6: {
    nivel: "Transición hacia Saber 11",
    areas: {
      "Matemáticas": [
        "Números naturales", "Números enteros", "Operaciones con enteros", "Fracciones", "Decimales",
        "Razones", "Proporciones", "Porcentajes", "Potenciación", "Radicación",
        "Expresiones algebraicas iniciales", "Ecuaciones simples", "Variables", "Plano cartesiano",
        "Perímetro", "Área", "Volumen", "Ángulos", "Triángulos", "Estadística", "Media", "Mediana",
        "Moda", "Probabilidad",
      ],
      "Lenguaje": [
        "Comprensión literal", "Comprensión inferencial", "Comprensión crítica inicial",
        "Estructura de textos", "Narrativa", "Lírica", "Dramática", "Mito", "Leyenda", "Novela", "Cuento",
        "Textos informativos", "Argumentación", "Medios de comunicación", "Publicidad", "Gramática",
        "Sintaxis", "Cohesión", "Coherencia",
      ],
      "Ciencias Naturales": [
        "Método científico", "Célula", "Tejidos", "Sistemas", "Nutrición", "Reproducción",
        "Genética inicial", "Ecosistemas", "Biodiversidad", "Materia", "Átomos", "Elementos", "Mezclas",
        "Energía", "Fuerza", "Movimiento", "Sistema solar",
      ],
      "Sociales": [
        "Primeras civilizaciones", "Mesopotamia", "Egipto", "Grecia", "Roma", "Edad Media", "Geografía",
        "Población", "Territorio", "Cultura", "Economía", "Democracia", "Ciudadanía",
      ],
      "Inglés": [
        "Present simple", "Present continuous", "Past simple inicial", "Future", "Modal verbs",
        "Comparatives", "Superlatives", "Reading", "Vocabulary", "Descriptions", "Daily activities",
      ],
    },
  },

  7: {
    nivel: "Transición hacia Saber 11",
    areas: {
      "Matemáticas": [
        "Números racionales", "Operaciones con racionales", "Proporcionalidad", "Porcentajes", "Álgebra",
        "Expresiones algebraicas", "Ecuaciones", "Inecuaciones", "Polinomios iniciales", "Geometría",
        "Ángulos", "Triángulos", "Cuadriláteros", "Circunferencia", "Área", "Volumen", "Plano cartesiano",
        "Estadística", "Probabilidad",
      ],
      "Ciencias Naturales": [
        "Sistemas del cuerpo", "Reproducción", "Herencia", "Genética", "Ecosistemas",
        "Ciclos biogeoquímicos", "Cambio climático", "Materia", "Elementos y compuestos",
        "Reacciones químicas iniciales", "Fuerzas", "Movimiento", "Energía", "Ondas",
      ],
      "Sociales": [
        "Edad Media", "Renacimiento", "Reforma", "Descubrimiento y conquista", "Colonia", "Imperios",
        "Geografía física", "Geografía humana", "Economía", "Recursos naturales", "Derechos",
        "Democracia", "Ciudadanía",
      ],
      "Lenguaje": [
        "Argumentación", "Tesis", "Argumentos", "Textos expositivos", "Textos argumentativos",
        "Literatura medieval", "Renacimiento", "Poesía", "Teatro", "Novela", "Medios", "Publicidad",
        "Lectura crítica",
      ],
    },
  },

  8: {
    nivel: "Transición hacia Saber 11",
    areas: {
      "Matemáticas": [
        "Números reales iniciales", "Potenciación", "Radicación", "Expresiones algebraicas", "Monomios",
        "Polinomios", "Productos notables", "Factorización inicial", "Ecuaciones",
        "Sistemas de ecuaciones", "Funciones", "Función lineal", "Plano cartesiano",
        "Teorema de Pitágoras", "Semejanza", "Congruencia", "Estadística", "Probabilidad",
      ],
      "Ciencias Naturales": [
        "Genética", "ADN", "Herencia", "Evolución", "Selección natural", "Ecosistemas", "Poblaciones",
        "Comunidades", "Química", "Átomos", "Tabla periódica", "Enlaces", "Reacciones", "Física",
        "Movimiento", "Velocidad", "Fuerza", "Energía", "Trabajo",
      ],
      "Sociales": [
        "Renacimiento", "Revolución científica", "Ilustración", "Revolución Industrial",
        "Revolución Francesa", "Independencia de América", "Independencia de Colombia",
        "Formación de la República", "Economía", "Capitalismo", "Democracia", "Derechos humanos",
      ],
      "Lenguaje": [
        "Lectura crítica", "Argumentación", "Tesis", "Evidencias", "Inferencias",
        "Literatura latinoamericana", "Géneros literarios", "Ensayo", "Crónica", "Artículo de opinión",
        "Medios de comunicación", "Análisis de discursos",
      ],
    },
  },

  9: {
    nivel: "Transición hacia Saber 11",
    areas: {
      "Matemáticas": [
        "Números reales", "Potencias", "Radicales", "Polinomios", "Factorización", "Ecuaciones",
        "Sistemas de ecuaciones", "Funciones", "Función lineal", "Función cuadrática", "Sucesiones",
        "Geometría analítica", "Distancia entre puntos", "Pendiente", "Estadística", "Probabilidad",
        "Interpretación de datos",
      ],
      "Ciencias Naturales": [
        "Genética", "Evolución", "Biotecnología", "Ecosistemas", "Problemas ambientales", "Química",
        "Estructura atómica", "Tabla periódica", "Enlaces", "Reacciones", "Balanceo inicial", "Física",
        "Movimiento", "Fuerza", "Leyes de Newton", "Trabajo", "Energía", "Electricidad",
      ],
      "Sociales": [
        "Colombia siglo XIX", "Colombia siglo XX", "Partidos políticos", "Conflictos sociales",
        "Industrialización", "Economía", "Globalización inicial", "Constitución de 1991",
        "Derechos humanos", "Democracia", "Estado", "Ciudadanía",
      ],
      "Lenguaje": [
        "Lectura crítica", "Análisis textual", "Argumentación", "Ensayo", "Artículo de opinión",
        "Crónica", "Literatura colombiana", "Literatura latinoamericana", "Recursos retóricos",
        "Análisis de medios", "Discursos", "Publicidad", "Información vs. opinión",
      ],
    },
  },

  10: {
    nivel: "Preparación Saber 11",
    areas: {
      "Matemáticas": [
        "Números reales", "Álgebra", "Funciones", "Función lineal", "Función cuadrática",
        "Funciones exponenciales", "Funciones logarítmicas", "Trigonometría", "Razones trigonométricas",
        "Identidades trigonométricas", "Geometría analítica", "Circunferencia", "Estadística",
        "Medidas de tendencia central", "Medidas de dispersión", "Probabilidad", "Combinatoria",
        "Interpretación de gráficos",
      ],
      "Ciencias Naturales": {
        "Biología": ["Genética", "Evolución", "Ecología", "Biodiversidad", "Biotecnología", "Sistemas biológicos"],
        "Química": ["Estructura atómica", "Tabla periódica", "Enlaces", "Nomenclatura", "Reacciones químicas", "Balanceo", "Estequiometría", "Soluciones", "Ácidos y bases"],
        "Física": ["Cinemática", "Movimiento", "Dinámica", "Leyes de Newton", "Trabajo", "Energía", "Cantidad de movimiento", "Electricidad", "Ondas"],
      },
      "Sociales": [
        "Constitución Política", "Estado colombiano", "Democracia", "Derechos humanos", "Economía",
        "Mercado", "Globalización", "Conflictos sociales", "Historia contemporánea", "Guerra Fría",
        "Colombia contemporánea", "Problemas sociales", "Participación ciudadana",
        "Análisis de fuentes históricas",
      ],
      "Lenguaje": [
        "Lectura crítica", "Interpretación", "Inferencia", "Argumentación", "Tesis", "Evidencias",
        "Contraargumentos", "Ensayo", "Texto científico", "Texto periodístico", "Literatura colombiana",
        "Literatura latinoamericana", "Literatura universal", "Análisis de discursos",
        "Medios de comunicación",
      ],
      "Inglés": [
        "Comprensión lectora", "Present / Past / Future", "Perfect tenses", "Modal verbs",
        "Conditionals", "Passive voice", "Connectors", "Vocabulary", "Reading comprehension", "Inference",
      ],
    },
  },

  11: {
    nivel: "Preparación Saber 11",
    areas: {
      "Matemáticas": {
        "Álgebra y variación": ["Expresiones algebraicas", "Ecuaciones", "Inecuaciones", "Sistemas", "Funciones", "Función lineal", "Función cuadrática", "Función exponencial", "Función logarítmica", "Interpretación de gráficas", "Modelación"],
        "Geometría": ["Ángulos", "Triángulos", "Semejanza", "Congruencia", "Pitágoras", "Áreas", "Volúmenes", "Geometría analítica", "Coordenadas"],
        "Estadística": ["Tablas", "Gráficos", "Media", "Mediana", "Moda", "Rango", "Probabilidad", "Interpretación de datos", "Comparación de conjuntos de datos"],
        "Resolución de problemas": ["Proporcionalidad", "Porcentajes", "Tasas", "Interpretación de información", "Modelación matemática", "Razonamiento cuantitativo"],
      },
      "Lectura Crítica": [
        "Comprensión literal", "Inferencias", "Idea principal", "Relaciones entre ideas",
        "Propósito del autor", "Punto de vista", "Argumentos", "Evidencias", "Supuestos", "Tesis",
        "Contraargumentos", "Contexto", "Intención comunicativa", "Análisis de textos",
        "Textos científicos", "Textos periodísticos", "Textos filosóficos", "Textos literarios",
        "Textos discontinuos", "Gráficas", "Tablas", "Infografías", "Publicidad",
      ],
      "Sociales y Ciudadanas": {
        "Historia": ["Independencia", "Formación de Colombia", "Siglo XIX", "Siglo XX", "Violencia", "Frente Nacional", "Constitución de 1991", "Colombia contemporánea"],
        "Política": ["Estado", "Democracia", "Constitución", "Derechos", "Deberes", "Participación", "Instituciones", "Poder público", "Ciudadanía"],
        "Economía": ["Oferta", "Demanda", "Mercado", "Inflación", "Desempleo", "Globalización", "Desarrollo", "Recursos"],
        "Competencias": ["Interpretación de fuentes", "Análisis histórico", "Pensamiento social", "Pensamiento crítico", "Análisis de problemas", "Argumentación", "Toma de decisiones ciudadanas"],
      },
      "Ciencias Naturales": {
        "Biología": ["Célula", "Genética", "ADN", "Evolución", "Ecosistemas", "Biodiversidad", "Sistemas biológicos", "Reproducción", "Homeostasis"],
        "Química": ["Átomo", "Tabla periódica", "Enlaces", "Reacciones", "Estequiometría", "Soluciones", "Concentraciones", "Ácidos y bases", "Química orgánica básica"],
        "Física": ["Movimiento", "Fuerzas", "Leyes de Newton", "Trabajo", "Energía", "Cantidad de movimiento", "Electricidad", "Magnetismo", "Ondas", "Sonido", "Luz"],
        "Competencias científicas": ["Interpretación de datos", "Análisis de experimentos", "Formulación de hipótesis", "Explicación de fenómenos", "Diseño experimental", "Evaluación de resultados", "Argumentación científica"],
      },
      "Inglés": [
        "Comprensión de textos", "Vocabulario", "Contexto", "Inferencias", "Gramática", "Conectores",
        "Presente", "Pasado", "Futuro", "Perfect tenses", "Modales", "Condicionales", "Voz pasiva",
        "Comparativos", "Pronombres", "Preposiciones", "Reading comprehension",
      ],
    },
  },
};

// Tema demo con video real. El resto de temas también tienen explicación y
// ejercicios generados por el motor curricular offline; los videos reales se
// incorporan por paquete de contenido cuando el docente los publica.
const MALLA_TEMA_CON_LECCION = "Fracciones equivalentes";

// Normaliza un texto de grado libre ("9°", "Grado 9", "9°A", "noveno",
// "Prejardín", "Jardín", "Transición", "Grado 0") a la clave que usa
// MALLA_ACADEMICA: "prejardin" | "jardin" | "transicion" | 1-11, o null
// si no se reconoce. El orden de los checks importa: "prejardín"
// contiene "jardín", así que se revisa primero.
function parseGradoNum(texto) {
  if (!texto) return null;
  const t = String(texto).toLowerCase();
  if (/prejard[ií]n/.test(t)) return "prejardin";
  if (/transici[oó]n|grado\s*0\b|grado\s*cero/.test(t)) return "transicion";
  if (/jard[ií]n|preescolar/.test(t)) return "jardin";
  const m = t.match(/(\d{1,2})/);
  if (!m) return null;
  const n = parseInt(m[1], 10);
  return n >= 1 && n <= 11 ? n : null;
}

// Lista ordenada de todos los grados (para chips, selects y datalists) y
// su etiqueta legible.
const GRADOS_LISTA = [1, 2, 3, 4, 5, 8, 9, 10];
function gradoLabel(g) {
  if (g === "prejardin") return "Prejardín";
  if (g === "jardin") return "Jardín";
  if (g === "transicion") return "Transición";
  return `${g}°`;
}

// Devuelve las áreas de un grado como [{ area, subareas: [{nombre, temas}] }]
// — normaliza el caso plano (10./11. con sub-áreas) y el caso simple
// (1.-9., un solo arreglo de temas por área) bajo una sola forma.
function mallaAreasNormalizadas(gradoNum) {
  const grado = MALLA_ACADEMICA[gradoNum];
  if (!grado) return [];
  return Object.keys(grado.areas).map((area) => {
    const val = grado.areas[area];
    if (Array.isArray(val)) {
      return { area, subareas: [{ nombre: null, temas: val }] };
    }
    return { area, subareas: Object.keys(val).map((sub) => ({ nombre: sub, temas: val[sub] })) };
  });
}

// Construye <optgroup> por área (agrupando sub-áreas como "Área — Sub-área")
// para el selector de tema del panel docente, a partir del grado de la
// clase. Si el grado no se pudo identificar, devuelve null y quien llama
// debe usar una lista de respaldo (ver renderTeacherRecomendaciones()).
// `areaFilter`, si se pasa, es (area) => boolean — se usa para mostrar solo
// las materias que el profesor dicta (ver TEACHER_MATERIAS más abajo).
function mallaTemaOptionsHtml(gradoNum, areaFilter) {
  let normalizadas = mallaAreasNormalizadas(gradoNum);
  if (areaFilter) normalizadas = normalizadas.filter((a) => areaFilter(a.area));
  if (!normalizadas.length) return null;
  return normalizadas.map(({ area, subareas }) =>
    subareas.map((sa) => {
      const label = sa.nombre ? `${area} — ${sa.nombre}` : area;
      const options = sa.temas.map((t) => `<option value="${t}">${t}</option>`).join("");
      return `<optgroup label="${label}">${options}</optgroup>`;
    }).join("")
  ).join("");
}

// Ícono/color por área (mismo lenguaje visual que las tarjetas de materia
// de siempre) para que "Explorar" se vea como una sola lista ordenada por
// materia — en vez de una grilla genérica de materias y, aparte, un bloque
// de texto suelto con la malla.
const MALLA_AREA_ICON = {
  "Matemáticas": { icon: "Σ", color: "#3b6fd6", bg: "#e7effe" },
  "Lenguaje": { icon: "Le", color: "#c76b2c", bg: "#fbe7d8" },
  "Ciencias Naturales": { icon: "Cn", color: "#279a5b", bg: "#dcf3e3" },
  "Sociales": { icon: "So", color: "#a6472f", bg: "#f6e2dd" },
  "Sociales y Ciudadanas": { icon: "SC", color: "#a6472f", bg: "#f6e2dd" },
  "Inglés": { icon: "En", color: "#3b6fd6", bg: "#e7effe" },
  "Lectura Crítica": { icon: "LC", color: "#7a5bd0", bg: "#eae4fb" },
};
function mallaAreaIcon(area) {
  return MALLA_AREA_ICON[area] || { icon: "Ma", color: "#279a5b", bg: "#dcf3e3" };
}

// ---------------------------------------------------------------------
// Materias que dicta un profesor — para que en Recomendaciones y en
// Asignar ejercicios solo aparezcan los temas de las materias que
// realmente dicta (y no toda la malla del grado), salvo que marque
// "todas las materias" al registrarse (lo normal en zonas rurales, donde
// un mismo profesor suele dictar de todo).
// ---------------------------------------------------------------------

const TEACHER_MATERIAS = ["Matemáticas", "Lenguaje", "Ciencias Naturales", "Sociales", "Inglés"];

// En 10.°/11.° la malla usa nombres más específicos (estilo Saber 11) para
// lo que en los demás grados es Lenguaje/Sociales — se homologan aquí para
// que "dicto Lenguaje" también cubra "Lectura Crítica", por ejemplo.
const AREA_MATERIA_ALIAS = {
  "Lectura Crítica": "Lenguaje",
  "Sociales y Ciudadanas": "Sociales",
};

// materias: "todas" (o vacío/no definido) muestra todo; si es un arreglo,
// solo las áreas incluidas (usando el alias de arriba para 10.°/11.°).
function areaPerteneceAMaterias(area, materias) {
  if (!materias || materias === "todas" || !Array.isArray(materias) || !materias.length) return true;
  const canon = AREA_MATERIA_ALIAS[area] || area;
  return materias.includes(canon);
}
