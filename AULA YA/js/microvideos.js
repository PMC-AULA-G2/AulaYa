/* AULA YA — Microlecciones V2
 * Generación determinista de microlecciones por GRADO + MATERIA + TEMA.
 * Diseñadas para 9:16, 35–45 s, con explicación concreta, ejemplo guiado,
 * error frecuente y reto. El contenido se apoya en el catálogo curricular y
 * en las 3 preguntas exactas del tema.
 */
(function(){
  const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
  const esc=s=>String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const key=s=>norm(s).replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,'');
  const gradeOf=t=>String(t?.grade||String(t?.subject||'').match(/\d+/)?.[0]||'');
  const subjectOf=t=>String(t?.subject||'').split('·')[0].trim();
  const levelOf=g=>Number(g)<=5?'primaria':'secundaria';
  const simple=g=>Number(g)<=3;

  const PROFILES=[
    {rx:/fraccion/,def:'Una fracción representa una parte de un todo dividido en partes iguales. El denominador dice en cuántas partes iguales se dividió el todo y el numerador dice cuántas de esas partes tomamos.',ex:'Si una pizza se divide en 8 partes iguales y comes 3, has comido 3/8. El 8 es el total de partes y el 3 las partes que tomaste.',rule:'Primero mira el denominador: te dice el tamaño de las partes. Luego mira el numerador: te dice cuántas partes tienes.',error:'No confundas numerador y denominador: el de abajo indica en cuántas partes se divide el todo.'},
    {rx:/polinom|expresiones algebraicas/,def:'Un polinomio es una expresión algebraica formada por uno o varios términos. Un término puede tener un número, una variable y una potencia. Los términos se separan por signos más o menos.',ex:'En 3x² + 2x - 5 hay tres términos: 3x², 2x y -5. En 2x + 3x sí podemos sumar porque son términos semejantes: 5x.',rule:'Antes de operar, identifica los términos semejantes: deben tener las mismas variables con los mismos exponentes.',error:'No sumes términos que no son semejantes. Por ejemplo, 2x + 3x² no es 5x³.'},
    {rx:/potenci/,def:'Una potencia es una multiplicación repetida. La base es el número que se repite y el exponente indica cuántas veces aparece como factor.',ex:'2³ significa 2 × 2 × 2 = 8. El 2 es la base y el 3 es el exponente.',rule:'El exponente no se multiplica por la base: indica cuántas veces debes usar la base como factor.',error:'No hagas 2³ = 2×3. La operación correcta es 2×2×2.'},
    {rx:/radic|raiz/,def:'Una raíz cuadrada busca el número que, multiplicado por sí mismo, produce el número que está dentro de la raíz.',ex:'√49 = 7 porque 7 × 7 = 49. Para comprobar una raíz, eleva tu respuesta al cuadrado.',rule:'Raíz cuadrada y potencia al cuadrado son operaciones inversas.',error:'√49 no es 49÷2. Busca el número cuyo cuadrado sea 49.'},
    {rx:/porcent/,def:'Un porcentaje expresa una cantidad de cada 100. Por eso 25% significa 25 de cada 100, o una cuarta parte.',ex:'25% de 200 = 200 × 25 ÷ 100 = 50.',rule:'Para calcular p% de una cantidad: cantidad × p ÷ 100.',error:'No olvides dividir entre 100 cuando conviertes un porcentaje en una parte de una cantidad.'},
    {rx:/ecuacion|inecuacion/,def:'Una ecuación dice que dos expresiones tienen el mismo valor. La letra representa una cantidad desconocida. En una inecuación, en cambio, comparamos cantidades usando <, >, ≤ o ≥.',ex:'x + 7 = 19. Restamos 7 a ambos lados: x = 12.',rule:'En una ecuación puedes hacer la misma operación a ambos lados sin cambiar la igualdad.',error:'No cambies un número de lado sin cambiar correctamente la operación.'},
    {rx:/factoriz/,def:'Factorizar es escribir una expresión como una multiplicación de factores que produce exactamente la expresión original.',ex:'x² + 3x = x(x + 3). Sacamos x porque aparece en los dos términos.',rule:'Busca primero un factor común; después revisa si queda algún caso notable.',error:'Factorizar no significa simplemente separar términos: al multiplicar los factores debes recuperar la expresión original.'},
    {rx:/decimal/,def:'Un número decimal representa unidades y partes de una unidad. Después de la coma aparecen décimas, centésimas, milésimas y así sucesivamente.',ex:'0,25 significa 25 centésimas y equivale a 25/100 = 1/4.',rule:'Al sumar o restar decimales, alinea las comas.',error:'No alinees los números solo por el último dígito; alinea las posiciones decimales.'},
    {rx:/perimetro/,def:'El perímetro es la longitud de todo el borde de una figura. Para hallarlo sumamos las longitudes de sus lados.',ex:'Un rectángulo de 8 m por 5 m tiene perímetro 8+5+8+5 = 26 m.',rule:'Perímetro significa recorrer todo el borde.',error:'El perímetro usa unidades normales como cm o m; el área usa unidades cuadradas.'},
    {rx:/area/,def:'El área mide cuánto espacio ocupa una superficie. Por eso se expresa en unidades cuadradas.',ex:'Un rectángulo de 6 m por 4 m tiene área 6 × 4 = 24 m².',rule:'Área es espacio de adentro; perímetro es el borde.',error:'No confundas 24 m con 24 m²: el área necesita unidades cuadradas.'},
    {rx:/probabilidad/,def:'La probabilidad mide qué tan posible es que ocurra un evento. Cuando todos los resultados son igualmente posibles, usamos casos favorables dividido entre casos posibles.',ex:'En un dado hay 6 resultados posibles. La probabilidad de sacar un 6 es 1/6.',rule:'0 significa imposible y 1, o 100%, significa seguro.',error:'No cuentes solo los resultados favorables: también necesitas saber cuántos resultados posibles existen.'},
    {rx:/media|promedio|mediana|moda|estadistica/,def:'La estadística nos ayuda a organizar e interpretar datos. La media es el promedio, la mediana es el dato central cuando ordenamos los valores y la moda es el valor que más se repite.',ex:'En 2, 3, 3, 7 y 9, la mediana es 3 y la moda también es 3. La media es 24 ÷ 5 = 4,8.',rule:'Ordena los datos antes de buscar la mediana.',error:'La media, mediana y moda no significan lo mismo; identifica cuál te están pidiendo.'},
    {rx:/angulo/,def:'Un ángulo es la abertura formada por dos rayos que parten del mismo punto. Se mide en grados.',ex:'90° es un ángulo recto. Menos de 90° es agudo y entre 90° y 180° es obtuso.',rule:'Imagina una puerta: cuanto más se abre, mayor es el ángulo.',error:'No confundas la longitud de los lados con la medida del ángulo.'},
    {rx:/multiplic/,def:'Multiplicar permite juntar grupos iguales de una forma rápida.',ex:'4 × 3 significa cuatro grupos de 3: 3 + 3 + 3 + 3 = 12.',rule:'Piensa en grupos iguales.',error:'No confundas multiplicación con suma de cantidades diferentes sin una relación de grupos.'},
    {rx:/divisi/,def:'Dividir significa repartir una cantidad en partes iguales o descubrir cuántos grupos de un tamaño caben en una cantidad.',ex:'20 ÷ 5 = 4 porque 20 se puede repartir en 5 grupos de 4.',rule:'Comprueba una división multiplicando cociente por divisor.',error:'El residuo debe tener sentido y ser menor que el divisor.'},
    {rx:/suma|adicion/,def:'Sumar significa juntar cantidades para saber cuánto hay en total.',ex:'24 + 15 = 39. Puedes imaginar 24 objetos y agregar otros 15.',rule:'Pregunta: ¿qué cantidades se están juntando?',error:'Alinea correctamente unidades, decenas y centenas.'},
    {rx:/resta|sustraccion/,def:'Restar sirve para quitar una cantidad, comparar dos cantidades o encontrar cuánto falta.',ex:'Si tienes 50 y gastas 18, quedan 32: 50 - 18 = 32.',rule:'Primero identifica qué representa cada cantidad.',error:'No restes automáticamente: primero decide cuál cantidad es el total y cuál es la que se quita o compara.'},
    {rx:/sustantiv/,def:'Un sustantivo es una palabra que nombra una persona, animal, lugar, objeto o idea.',ex:'En “La niña lee un libro”, niña y libro son sustantivos.',rule:'Pregunta: ¿qué persona, animal, lugar, objeto o idea estamos nombrando?',error:'No todo lo que aparece en una oración es un sustantivo.'},
    {rx:/verb/,def:'Un verbo expresa una acción, un estado o algo que sucede.',ex:'En “Mateo estudia matemáticas”, estudia indica la acción.',rule:'Busca qué hace o qué le ocurre al sujeto.',error:'El verbo puede cambiar según quién realiza la acción y cuándo ocurre.'},
    {rx:/adjetiv/,def:'Un adjetivo describe o caracteriza a un sustantivo.',ex:'En “La mochila azul”, azul describe a mochila.',rule:'Pregunta: ¿cómo es o cómo está el sustantivo?',error:'El adjetivo acompaña al sustantivo; no es el nombre del objeto.'},
    {rx:/idea principal|comprension|lectura critica|inferencia/,def:'Comprender un texto no es solo leer palabras. Primero identifica qué dice directamente, luego relaciona pistas y finalmente interpreta qué quiere comunicar.',ex:'Si un texto cuenta que una comunidad recoge basura de un río y explica sus consecuencias, una idea central puede ser la importancia de cuidar el río.',rule:'Busca primero el tema, luego qué se afirma sobre ese tema y qué pistas lo apoyan.',error:'No confundas un detalle del texto con su idea principal.'},
    {rx:/ecosistema|biodiversidad|cadena alimentaria|redes alimentarias/,def:'Un ecosistema reúne seres vivos y elementos no vivos que interactúan en un lugar. Las relaciones entre ellos permiten que la energía y la materia circulen.',ex:'En un bosque, las plantas producen alimento, los insectos pueden alimentarse de ellas y otros animales pueden alimentarse de esos insectos.',rule:'Para estudiar un ecosistema pregunta: ¿quiénes viven allí y cómo se relacionan?',error:'Un ecosistema no está formado solo por animales; también incluye plantas, microorganismos y factores no vivos.'},
    {rx:/celula|organel/,def:'La célula es la unidad básica de los seres vivos. Algunas estructuras celulares cumplen funciones específicas para mantenerla funcionando.',ex:'La membrana controla qué entra y qué sale. El núcleo, en las células que lo poseen, contiene la mayor parte del material genético.',rule:'Relaciona cada estructura con su función.',error:'No todas las células tienen exactamente las mismas estructuras ni cumplen la misma función.'},
    {rx:/mitosis/,def:'La mitosis es una división celular en la que una célula produce dos células hijas con la misma información genética, en condiciones normales.',ex:'Una célula de la piel puede dividirse por mitosis para ayudar al crecimiento y la reparación de tejidos.',rule:'Mitosis: una célula se divide y forma dos células hijas similares.',error:'No confundas mitosis con meiosis: sus resultados y funciones son diferentes.'},
    {rx:/meiosis/,def:'La meiosis es una división celular que reduce a la mitad el número de cromosomas y participa en la formación de células sexuales.',ex:'En humanos, las células sexuales tienen 23 cromosomas, mientras que las células corporales normalmente tienen 46.',rule:'Meiosis reduce el número de cromosomas y genera diversidad genética.',error:'No es simplemente una mitosis que ocurre dos veces: sus resultados biológicos son diferentes.'},
    {rx:/adn|genetica|herencia/,def:'El ADN contiene información genética. Los genes son segmentos de ADN que participan en la determinación de características y en el funcionamiento de los organismos.',ex:'Una característica heredable puede depender de variantes de genes recibidas de los progenitores.',rule:'Piensa en ADN como el material que contiene instrucciones biológicas.',error:'Un gen no es lo mismo que una característica completa: los rasgos pueden depender de varios genes y del ambiente.'},
    {rx:/fuerza|newton|movimiento|velocidad|aceleracion/,def:'En física describimos cómo se mueven los objetos y qué puede cambiar ese movimiento. La velocidad relaciona distancia y tiempo; una fuerza puede cambiar el movimiento.',ex:'Si una bicicleta recorre 20 metros en 4 segundos, su velocidad media es 20 ÷ 4 = 5 m/s.',rule:'Antes de calcular, identifica qué magnitudes tienes y qué magnitud buscas.',error:'Velocidad y aceleración no son lo mismo: la aceleración describe cómo cambia la velocidad.'},
    {rx:/electricidad|circuitos/,def:'Un circuito eléctrico permite que las cargas se desplacen por un camino cerrado. Una fuente proporciona energía y los componentes utilizan o controlan esa energía.',ex:'En un circuito sencillo, una pila conectada correctamente a una bombilla puede hacerla encender porque existe un camino cerrado.',rule:'Para que un circuito simple funcione, debe existir un camino conductor cerrado.',error:'Una bombilla no se enciende solo por estar cerca de una pila; debe existir una conexión adecuada.'},
    {rx:/reaccion.*quim|balanceo|estequiometr/,def:'Una reacción química transforma unas sustancias en otras. Al balancearla, debemos conservar el número de átomos de cada elemento a ambos lados de la ecuación.',ex:'En 2H₂ + O₂ → 2H₂O hay 4 átomos de H y 2 de O en ambos lados.',rule:'Cuenta los átomos de cada elemento antes y después.',error:'Para balancear una ecuación cambia coeficientes, no los subíndices de las fórmulas.'},
    {rx:/tabla periodica|elementos/,def:'La tabla periódica organiza los elementos químicos según su número atómico y sus propiedades. La posición de un elemento aporta información sobre su estructura y comportamiento.',ex:'El oxígeno tiene número atómico 8: todos los átomos de oxígeno tienen 8 protones.',rule:'Número atómico = número de protones del elemento.',error:'No confundas número atómico con masa atómica.'},
    {rx:/present simple/,def:'El present simple se usa para hábitos, rutinas, hechos y situaciones que consideramos habituales o generales.',ex:'I study every day. She studies every day. Con he, she e it normalmente añadimos -s al verbo.',rule:'Primero identifica el sujeto; luego revisa la forma del verbo.',error:'No olvides la -s en tercera persona singular en afirmaciones regulares.'},
    {rx:/past simple/,def:'El past simple se usa para acciones terminadas en el pasado. Los verbos regulares suelen formar el pasado con -ed; los irregulares tienen formas propias.',ex:'I played yesterday. She went to school yesterday. “Went” es el pasado de “go”.',rule:'Busca una referencia de tiempo pasada y revisa si el verbo es regular o irregular.',error:'No formes todos los pasados añadiendo -ed; muchos verbos son irregulares.'},
    {rx:/comparative/,def:'Los comparativos sirven para comparar dos personas, objetos o situaciones.',ex:'“A car is faster than a bicycle” compara dos medios de transporte.',rule:'Identifica qué dos elementos estás comparando y usa la estructura apropiada.',error:'No uses superlativo cuando solo comparas dos elementos.'},
    {rx:/revolucion industrial/,def:'La Revolución Industrial fue un proceso de transformación económica y social impulsado por nuevas máquinas, fuentes de energía, fábricas y formas de producción.',ex:'La mecanización permitió producir muchos bienes en fábricas y cambió el trabajo y el crecimiento de las ciudades.',rule:'Relaciona tecnología, producción, trabajo y cambios sociales.',error:'No fue un único invento ni ocurrió en un solo día; fue un proceso histórico de largo plazo.'},
    {rx:/revolucion francesa/,def:'La Revolución Francesa comenzó en 1789 y transformó la organización política y social de Francia. Estuvo relacionada con desigualdades, crisis fiscal e ideas políticas nuevas.',ex:'La Declaración de los Derechos del Hombre y del Ciudadano expresó principios de libertad e igualdad ante la ley.',rule:'Estudia causas, acontecimientos y consecuencias por separado.',error:'No reduzcas la revolución a una sola causa o a un solo personaje.'},
    {rx:/constitucion de 1991|constitucion politica/,def:'La Constitución establece principios, derechos, deberes e instituciones que organizan el Estado. En Colombia, la Constitución de 1991 amplió mecanismos de participación y protección de derechos.',ex:'La acción de tutela es un mecanismo constitucional para proteger derechos fundamentales en determinadas situaciones.',rule:'Distingue derechos, deberes, instituciones y mecanismos de participación.',error:'La Constitución no es solo una lista de derechos; también organiza el Estado y establece deberes.'}
  ];

  function findProfile(title){ const n=norm(title); return PROFILES.find(p=>p.rx.test(n))||null; }
  function findQuestions(t){
    const bank=window.AULA_QUESTION_BANK;
    if(!Array.isArray(bank)) return [];
    const g=String(t?.grade||''); const s=norm(subjectOf(t)); const topic=norm(t?.title);
    return bank.filter(q=>String(q.grado||'')===g && norm(q.materia)===s && norm(q.tema)===topic).slice(0,3);
  }
  function fallback(subject,grade,title,q){
    const g=Number(grade); const child=g<=5;
    if(subject==='Matemáticas') return {
      def:`${title} es un concepto de Matemáticas que necesitamos entender antes de usar una fórmula o resolver un problema. Primero identifica qué significa ${title}, qué datos aparecen y qué te están preguntando.`,
      ex:q?.explanation||`Ejemplo guiado: toma una situación sencilla relacionada con ${title}. Identifica los datos, decide qué operación o relación representa el tema y comprueba si la respuesta tiene sentido.`,
      rule:`No empieces calculando: primero identifica qué representa ${title} en el problema.`,
      error:`No elijas una operación solo porque aparecen números. Primero pregunta qué relación representa ${title}.`
    };
    if(subject==='Ciencias Naturales') return {
      def:`${title} es un concepto de Ciencias Naturales. Para entenderlo, identifica qué fenómeno estudia, qué elementos intervienen y qué relación existe entre ellos.`,
      ex:q?.explanation||`Ejemplo guiado: observa una situación de la vida diaria relacionada con ${title} y describe qué ocurre, qué lo causa y qué evidencia podrías observar.`,
      rule:`Fenómeno → elementos → relación → evidencia.`,
      error:`No memorices solo una definición: relaciona ${title} con un fenómeno observable.`
    };
    if(subject==='Sociales') return {
      def:`${title} es un tema de Ciencias Sociales. Para comprenderlo, ubica quiénes participaron, dónde y cuándo ocurrió o se aplica, cuáles fueron sus causas y qué consecuencias tuvo.`,
      ex:q?.explanation||`Ejemplo guiado: ubica ${title} en un contexto concreto y separa causas, hechos y consecuencias.`,
      rule:`Contexto → causas → hechos → consecuencias.`,
      error:`No confundas una causa con una consecuencia ni un hecho con una opinión.`
    };
    if(subject==='Inglés') return {
      def:`${title} es un recurso del inglés que usamos en contextos concretos. Primero identifica para qué se usa y después observa la estructura en una oración.`,
      ex:q?.explanation||`Ejemplo: construye una oración corta relacionada con ${title}, identifica sujeto y verbo y comprueba si la estructura corresponde al contexto.`,
      rule:`Uso → estructura → ejemplo → comprobación.`,
      error:`No memorices una traducción aislada; fíjate en la situación en la que se usa ${title}.`
    };
    return {
      def:`${title} es un concepto de ${subject}. Vamos a entender qué significa, para qué sirve y cómo reconocerlo en un ejemplo.`,
      ex:q?.explanation||`Ejemplo guiado: identifica ${title} en una situación concreta y explica por qué corresponde al concepto.`,
      rule:`Definición → ejemplo → comprobación.`,
      error:`No te quedes solo con la definición; comprueba el concepto en un caso concreto.`
    };
  }
  function build(t){
    const subject=subjectOf(t), grade=gradeOf(t), title=String(t?.title||'Este tema');
    const p=findProfile(title), qs=findQuestions(t), q=qs[0];
    const c=p||fallback(subject,grade,title,q); const child=simple(grade);
    const objective=child?`Al terminar podrás explicar ${title} con tus propias palabras y reconocerlo en un ejemplo.`:`Al terminar podrás definir ${title}, aplicarlo a un caso y explicar por qué tu respuesta es correcta.`;
    const guided=q ? `Compruébalo con este caso: ${q.q} ${q.options?.[q.correct] ? `Respuesta: ${q.options[q.correct]}.` : ''}` : c.ex;
    const scenes=[
      {tag:'HOOK',title:`Hoy: ${title}`,body:`${subject} · ${grade}°`,visual:'topic'},
      {tag:'OBJETIVO',title:'¿Qué vas a aprender?',body:objective,visual:'target'},
      {tag:'EXPLICA',title:'Primero entiende la idea',body:c.def,visual:'concept'},
      {tag:'EJEMPLO',title:'Míralo con un ejemplo',body:c.ex,visual:'example'},
      {tag:'PASO A PASO',title:'¿Cómo lo reconoces o resuelves?',body:c.rule,visual:'steps'},
      {tag:'OJO',title:'Un error que debes evitar',body:c.error,visual:'warning'},
      {tag:'RETO',title:'Ahora inténtalo tú',body:guided,visual:'challenge'}
    ];
    return {id:`g${grade}_${key(subject)}_${key(title)}`,grade,subject,title,scenes,questions:qs,profile:!!p,durationSec:Math.round(scenes.length*5),version:'2.0'};
  }
  function render(tema){ return build(tema); }
  window.AULA_MICROVIDEOS={render,build,findProfile,findQuestions,version:'2.0'};
})();
