/* AULA Tutor Engine v7 — offline curricular tutor
 * Uses the complete AULA curriculum catalog for grades 1-5 and 8-10.
 * Topic-locked: when a teacher assigns a topic, explanations/examples/exercises
 * stay on that exact topic. This is a deterministic offline tutor layer; it is
 * not presented as a trained neural SLM.
 */
(function(){
  const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
  const esc=s=>String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const clean=s=>norm(s).replace(/[^a-z0-9]+/g,' ');
  const catalog=window.AULA_SLM_CURRICULUM||{};
  const PROFILES=[
    {rx:/fraccion/,def:'Una fracción representa partes iguales de un todo. El número de arriba (numerador) dice cuántas partes tomamos y el de abajo (denominador) dice en cuántas partes iguales dividimos.',ex:['Una pizza se divide en 4 partes iguales y comes 3: has 3/4 de la pizza.','1/2 y 2/4 representan la misma cantidad.','2/5 + 1/5 = 3/5 porque los denominadores son iguales.'],rule:'Piensa: denominador = en cuántas partes iguales; numerador = cuántas partes tomamos.'},
    {rx:/polinom|expresiones algebraicas/,def:'Un polinomio es una expresión formada por términos con números, letras y exponentes enteros no negativos. Los términos se separan con + o −.',ex:['3x + 2 tiene dos términos.','2x + 3x = 5x porque son términos semejantes.','x² + 3x + 2 tiene tres términos.'],rule:'Solo sumamos o restamos directamente términos semejantes.'},
    {rx:/potenci/,def:'Una potencia es una multiplicación repetida. La base es el número que se repite y el exponente dice cuántas veces se repite.',ex:['2³ = 2×2×2 = 8.','5² = 5×5 = 25.','3⁴ = 3×3×3×3 = 81.'],rule:'El exponente indica repeticiones; no significa multiplicar la base por el exponente.'},
    {rx:/radic|raiz/,def:'Una raíz busca el número que, al elevarse a la potencia indicada, produce el número que está dentro del radical.',ex:['√25 = 5 porque 5×5=25.','√64 = 8 porque 8×8=64.','∛27 = 3 porque 3×3×3=27.'],rule:'Comprueba una raíz cuadrada elevando tu respuesta al cuadrado.'},
    {rx:/porcent/,def:'Un porcentaje significa una cantidad de cada 100. Por ejemplo, 25% significa 25 de cada 100.',ex:['10% de 80 = 8.','25% de 200 = 50.','10% de $80.000 = $8.000.'],rule:'p% de una cantidad = cantidad × p ÷ 100.'},
    {rx:/ecuacion|variable|inecuacion/,def:'Una ecuación es como una balanza: ambos lados deben tener el mismo valor. Una variable representa una cantidad que todavía no conocemos. Una inecuación compara cantidades usando <, >, ≤ o ≥.',ex:['x+7=19 → x=12.','3x=18 → x=6.','x+2<7 → x<5.'],rule:'Haz la misma operación en ambos lados de una ecuación para conservar la igualdad.'},
    {rx:/factoriz/,def:'Factorizar significa convertir una suma o resta en una multiplicación de factores que producen la expresión original.',ex:['6 = 2×3.','x²+3x = x(x+3).','x²−9 = (x−3)(x+3).'],rule:'Busca primero un factor común y luego identifica el tipo de expresión.'},
    {rx:/decimal/,def:'Un decimal representa partes de una unidad. Después de la coma encontramos décimas, centésimas, milésimas y más.',ex:['0,5 = 5 décimas = 1/2.','0,25 = 25 centésimas = 1/4.','2,5+1,2=3,7.'],rule:'Para sumar o restar, alinea las comas decimales.'},
    {rx:/perimetro/,def:'El perímetro es la medida de todo el borde de una figura. Se obtiene sumando sus lados.',ex:['Rectángulo de 8 m por 5 m: 8+5+8+5=26 m.','Cuadrado de lado 6 cm: 4×6=24 cm.'],rule:'Perímetro = borde de afuera.'},
    {rx:/area/,def:'El área mide cuánto espacio ocupa una superficie. Se expresa en unidades cuadradas.',ex:['Rectángulo de 6 m por 4 m: 6×4=24 m².','Cuadrado de lado 5 cm: 5×5=25 cm².'],rule:'Área = espacio de adentro; perímetro = borde.'},
    {rx:/probabilidad/,def:'La probabilidad indica qué tan posible es que ocurra un evento. Si los resultados son igual de posibles, usamos casos favorables dividido entre casos posibles.',ex:['En un dado, sacar 6 tiene probabilidad 1/6.','Sacar un número par: 3/6 = 1/2.'],rule:'0 es imposible y 1 (100%) es seguro.'},
    {rx:/estadistica|media|promedio|mediana|moda/,def:'La estadística organiza datos para entenderlos. La media o promedio se obtiene sumando los valores y dividiendo entre cuántos datos hay. La mediana es el dato central ordenado y la moda es el que más se repite.',ex:['10, 14 y 12 → 36÷3=12: media 12.','2, 3, 3, 7, 9 → mediana 3 y moda 3.'],rule:'Primero identifica qué medida te están pidiendo.'},
    {rx:/angulo/,def:'Un ángulo es la abertura formada por dos rayos que parten de un mismo punto.',ex:['90° es recto.','Menos de 90° es agudo.','Entre 90° y 180° es obtuso.'],rule:'Imagina una puerta: cuanto más se abre, mayor es el ángulo.'},
    {rx:/triangulo/,def:'Un triángulo tiene tres lados y tres ángulos. La suma de sus ángulos interiores siempre es 180°.',ex:['Si dos ángulos son 50° y 60°, el tercero es 70°.','Un equilátero tiene tres lados iguales.'],rule:'Recuerda: los tres ángulos interiores suman 180°.'},
    {rx:/suma|adicion/,def:'Sumar significa juntar cantidades para saber cuánto hay en total.',ex:['24+15=39.','18 semillas + 7 semillas = 25 semillas.'],rule:'Pregunta: ¿qué cantidades se están juntando?'},
    {rx:/resta|sustraccion/,def:'Restar sirve para quitar, comparar o encontrar cuánto falta.',ex:['30−12=18.','Si tienes 32 y necesitas 50, faltan 18.'],rule:'Pregunta: ¿estoy quitando, comparando o buscando lo que falta?'},
    {rx:/multiplic/,def:'Multiplicar permite juntar grupos iguales. Es una forma rápida de sumar la misma cantidad varias veces.',ex:['4×3 = 3+3+3+3 = 12.','12×8=96.'],rule:'Piensa en grupos iguales.'},
    {rx:/divisi/,def:'Dividir significa repartir en partes iguales o descubrir cuántos grupos caben en una cantidad.',ex:['20÷5=4 porque 20 repartido en 5 grupos deja 4 en cada uno.','36÷6=6.'],rule:'Comprueba una división multiplicando cociente por divisor.'},
    {rx:/proporcional|regla de tres/,def:'Dos cantidades son proporcionales cuando mantienen una relación constante. Si una cambia, la otra cambia siguiendo esa relación.',ex:['2 cuadernos cuestan $6.000; 5 cuestan $15.000.','3 litros para 6 personas; 12 personas necesitan 6 litros.'],rule:'Primero identifica qué cantidad corresponde a qué otra.'},
    {rx:/sustantiv/,def:'Un sustantivo nombra personas, animales, lugares, objetos o ideas.',ex:['profesora, perro, escuela y libro son sustantivos.'],rule:'Pregunta: ¿qué persona, animal, lugar, objeto o idea se está nombrando?'},
    {rx:/verb/,def:'Un verbo expresa una acción, un estado o algo que sucede.',ex:['correr, leer y saltar son acciones. En “Mateo estudia”, estudia es el verbo.'],rule:'Busca qué hace o qué le ocurre al sujeto.'},
    {rx:/adjetiv/,def:'Un adjetivo describe o caracteriza un sustantivo.',ex:['En “casa grande”, grande describe a casa.'],rule:'Pregunta: ¿cómo es el sustantivo?'},
    {rx:/idea principal|comprension lectora|comprension inferencial|comprension critica|lectura critica/,def:'La idea principal es lo más importante que el texto quiere comunicar. Las demás ideas ayudan a explicar, demostrar o ampliar esa idea.',ex:['Si un texto habla de ahorrar agua y presenta varias formas de hacerlo, la idea principal puede ser que debemos usar el agua responsablemente.'],rule:'Busca la idea que abarque la mayor parte del texto, no un detalle aislado.'},
    {rx:/celula/,def:'La célula es la unidad básica de los seres vivos. Puedes imaginarla como una pequeña fábrica donde ocurren procesos necesarios para vivir.',ex:['Las células animales y vegetales tienen membrana y material genético. Las plantas además tienen cloroplastos.'],rule:'Primero identifica qué estructura estás estudiando y qué función cumple.'},
    {rx:/ecosistema/,def:'Un ecosistema reúne seres vivos y elementos no vivos que interactúan en un lugar.',ex:['En una laguna hay peces, plantas, microorganismos, agua, luz, temperatura y suelo.'],rule:'Incluye tanto los seres vivos como el ambiente físico.'},
    {rx:/cadena alimentaria/,def:'Una cadena alimentaria muestra cómo pasa la energía de un organismo a otro cuando se alimentan.',ex:['Pasto → saltamontes → rana → serpiente.'],rule:'Empieza por el productor y sigue quién se alimenta de quién.'},
    {rx:/genetica|herencia/,def:'La genética estudia cómo se transmite información biológica entre generaciones y cómo aparecen variaciones.',ex:['Los hijos reciben información genética de sus progenitores; muchos rasgos también dependen del ambiente.'],rule:'Genética explica herencia y variación, no solo “parecerse a los padres”.'},
    {rx:/atomo|tabla periodica|elemento/,def:'Un átomo es una unidad básica de la materia. Tiene un núcleo con protones y neutrones y electrones alrededor. La tabla periódica organiza los elementos por sus propiedades y número atómico.',ex:['Un átomo neutro de carbono tiene 6 protones y 6 electrones.'],rule:'El número atómico indica cuántos protones tiene el elemento.'},
    {rx:/reaccion quimica|balanceo/,def:'Una reacción química reorganiza átomos para formar sustancias nuevas. Balancear una ecuación significa ajustar coeficientes para que haya la misma cantidad de cada tipo de átomo a ambos lados.',ex:['2H₂ + O₂ → 2H₂O tiene 4 H y 2 O en ambos lados.'],rule:'Nunca cambies los subíndices de las fórmulas para balancear; ajusta coeficientes.'},
    {rx:/independencia de colombia/,def:'La Independencia de Colombia fue un proceso de ruptura del dominio español que se desarrolló durante varios años y tuvo diferentes actores y conflictos.',ex:['1810 es una fecha simbólica de inicio del proceso y 1819 fue clave por las campañas militares que consolidaron la independencia.'],rule:'No la reduzcas a un solo día: estudia causas, etapas, actores y consecuencias.'},
    {rx:/constitucion de 1991|constitucion politica/,def:'La Constitución es la norma fundamental del Estado colombiano. Organiza el poder público, reconoce derechos y establece mecanismos de participación.',ex:['La acción de tutela protege derechos fundamentales en determinadas situaciones.'],rule:'Estudia por separado derechos, organización del Estado y participación.'},
    {rx:/democracia/,def:'La democracia es una forma de organización política en la que la ciudadanía participa en decisiones públicas, directamente o mediante representantes.',ex:['Elegir representantes mediante el voto es una forma de participación democrática.'],rule:'Democracia incluye participación, derechos, reglas e instituciones; no es solo votar.'},
    {rx:/present simple/,def:'El presente simple en inglés se usa para hábitos, rutinas y hechos generales.',ex:['I play football every Saturday. = Juego fútbol cada sábado.','She studies at night. Con he, she e it normalmente cambia la forma del verbo.'],rule:'Con he, she o it revisa la terminación del verbo.'},
    {rx:/past simple/,def:'El pasado simple se usa para acciones terminadas en el pasado.',ex:['I visited my grandmother yesterday.','She went to school last Monday.'],rule:'Revisa si el verbo es regular o irregular y busca marcadores como yesterday o last week.'},
    {rx:/there is|there are/,def:'There is se usa para una cosa y there are para varias.',ex:['There is a book on the table.','There are three books on the table.'],rule:'Una cosa → there is. Varias → there are.'},
    {rx:/future|going to|will/,def:'Las formas de futuro en inglés permiten hablar de acciones que ocurrirán después. La elección depende del contexto y la intención.',ex:['I am going to study tonight. = Voy a estudiar esta noche.','I will help you. = Te ayudaré.'],rule:'Mira el contexto: plan previsto y decisión espontánea no siempre usan la misma forma.'},
    {rx:/passive voice|voz pasiva/,def:'La voz pasiva pone el foco en la acción o en quien la recibe, no necesariamente en quien la realiza.',ex:['Active: The teacher explains the lesson. Passive: The lesson is explained by the teacher.'],rule:'En la pasiva importa la forma de “be” más el participio del verbo.'},
    {rx:/revolucion industrial/,def:'La Revolución Industrial fue un proceso de transformación económica y social asociado con nuevas máquinas, fábricas, fuentes de energía y formas de trabajo.',ex:['La mecanización textil permitió producir más rápido y transformó ciudades y condiciones laborales.'],rule:'Estudia causas, cambios tecnológicos, cambios sociales y consecuencias.'},
    {rx:/guerra fria/,def:'La Guerra Fría fue una etapa de rivalidad política, económica, militar e ideológica principalmente entre Estados Unidos y la Unión Soviética, sin una guerra directa general entre ambas potencias.',ex:['La competencia tecnológica y espacial fue una de sus expresiones.'],rule:'No fue una sola batalla: fue una rivalidad global con conflictos indirectos.'},
  ];
  function findCatalogTopic(topic,grade,subject){
    const t=norm(topic), g=String(grade||'').replace(/[^0-9]/g,'');
    const grades=g?[g]:Object.keys(catalog.grades||{});
    for(const gr of grades){
      const data=catalog.grades?.[gr]; if(!data) continue;
      for(const s of data.subjects||[]){
        if(subject && norm(s.subject)!==norm(subject)) continue;
        const hit=(s.topics||[]).find(x=>norm(x)===t);
        if(hit) return {grade:gr,subject:s.subject,topic:hit};
      }
    }
    // fuzzy exact-word fallback only when the topic is not teacher-locked to another catalog item
    for(const gr of grades){ const data=catalog.grades?.[gr]; if(!data) continue; for(const s of data.subjects||[]){ if(subject&&norm(s.subject)!==norm(subject)) continue; const hit=(s.topics||[]).find(x=>clean(x)===clean(topic)); if(hit) return {grade:gr,subject:s.subject,topic:hit}; }}
    return null;
  }
  function profile(topic){const t=clean(topic); return PROFILES.find(p=>p.rx.test(t));}
  function qbank(topic,grade,subject){
    const bank=window.AULA_QUESTION_BANK; if(!Array.isArray(bank)) return [];
    const k=norm(topic);
    return bank.filter(q=>norm(q.tema)===k && (!grade||!q.grado||String(q.grado)===String(grade)) && (!subject||!q.materia||norm(q.materia)===norm(subject)) && !/estas practicando|tu profe te recomendo|si fallas una pregunta|que estrategia te ayuda|como demostrar que estas avanzando/i.test(String(q.q||''))).slice(0,12);
  }
  function rotation(topic, max){
    const n=Math.max(1,Number(max||1));
    try{
      const key='aula_tutor_rotation_'+clean(topic);
      const current=Number(localStorage.getItem(key)||0);
      const next=(current+1)%n; localStorage.setItem(key,String(next)); return next;
    }catch(e){ return 0; }
  }
  function ageLevel(grade){return /^(1|2|3|4|5)$/.test(String(grade))?'primaria':'secundaria';}
  function genericDefinition(topic,subject,grade){
    const young=ageLevel(grade)==='primaria';
    return young
      ? `Vamos a entender <b>${esc(topic)}</b> sin palabras difíciles. Piensa que estamos aprendiendo una idea nueva paso a paso: primero qué significa, luego para qué sirve y después un ejemplo de la vida diaria.`
      : `Vamos a entender <b>${esc(topic)}</b> de forma clara. Primero definimos la idea, después vemos para qué sirve, hacemos un ejemplo y finalmente comprobamos lo aprendido.`;
  }
  function exampleFor(topic,subject,grade){
    const p=profile(topic); if(p){ const i=rotation(topic,p.ex.length); return p.ex[i]||p.ex[0]; }
    const t=clean(topic), s=norm(subject), young=ageLevel(grade)==='primaria';
    if(/matematic/.test(s)){
      if(/mcm/.test(t)) return 'Ejemplo: para 4 y 6, sus múltiplos comunes empiezan en 12. Por eso el MCM de 4 y 6 es 12.';
      if(/mcd/.test(t)) return 'Ejemplo: los divisores comunes de 12 y 18 son 1, 2, 3 y 6. El mayor es 6, así que el MCD es 6.';
      if(/fraccion/.test(t)) return 'Ejemplo: si una torta tiene 8 partes iguales y comes 3, has comido 3/8. El 3 cuenta las partes y el 8 dice en cuántas se dividió.';
      if(/suma|resta|multiplic|divisi/.test(t)) return `Ejemplo: piensa en 3 grupos de 4 objetos. Si ${esc(topic)} es la idea que estamos practicando, primero identifica los grupos, los datos y la operación que representa la situación.`;
      if(/funcion/.test(t)) return 'Ejemplo: si una máquina recibe 2 y siempre suma 3, sale 5; si recibe 4, sale 7. La regla conecta una entrada con una salida.';
      if(/area/.test(t)) return 'Ejemplo: un rectángulo de 5 m por 3 m ocupa 15 m² porque 5 × 3 = 15.';
      if(/perimetro/.test(t)) return 'Ejemplo: un cuadrado de lado 4 cm tiene un borde total de 16 cm porque 4 + 4 + 4 + 4 = 16.';
      return young ? `Ejemplo sencillo: piensa en ${esc(topic)} como algo que puedes representar con números, dibujos o grupos. Usa un caso pequeño y explica qué cambia cuando cambias un dato.` : `Ejemplo: toma un caso pequeño relacionado con ${esc(topic)}. Escribe los datos, identifica la regla que corresponde y comprueba el resultado con una segunda forma.`;
    }
    if(/ciencias/.test(s)){
      if(/ecosistema/.test(t)) return 'Ejemplo: en una huerta hay plantas, insectos, pájaros, agua, suelo y luz. Todos interactúan y forman un pequeño ecosistema.';
      if(/celula/.test(t)) return 'Ejemplo: imagina una célula como una mini ciudad: la membrana controla entradas y salidas y el material genético contiene instrucciones.';
      if(/fuerza|movimiento/.test(t)) return 'Ejemplo: empujar una caja cambia su movimiento. Observa qué pasa si empujas más fuerte o en otra dirección.';
      if(/materia|estado/.test(t)) return 'Ejemplo: el hielo es sólido, el agua es líquida y el vapor es gas. Es la misma sustancia, pero en estados diferentes.';
      if(/genet|herencia/.test(t)) return 'Ejemplo: dos hermanos pueden compartir rasgos familiares y al mismo tiempo tener diferencias. La herencia explica parte de esas semejanzas y variaciones.';
      return `Ejemplo de ${esc(topic)}: observa una situación de la vida diaria relacionada con el tema, identifica qué ocurre y explica qué concepto científico permite entenderlo.`;
    }
    if(/social/.test(s)) return `Ejemplo: piensa en ${esc(topic)} como una situación concreta. Pregunta: ¿quiénes participan?, ¿qué ocurrió?, ¿por qué ocurrió? y ¿qué consecuencias tuvo?`;
    if(/espanol|lengua/.test(s)) return `Ejemplo: toma una oración o texto corto relacionado con ${esc(topic)}. Señala la parte que demuestra el concepto y explica con tus palabras por qué pertenece a ${esc(topic)}.`;
    if(/ingles/.test(s)) return `Ejemplo en inglés: crea una oración corta relacionada con ${esc(topic)} y después explica en español qué significa y qué palabra o estructura demuestra el tema.`;
    return `Ejemplo guiado de ${esc(topic)}: usa una situación pequeña y concreta, identifica los datos o ideas importantes, aplica el concepto y explica por qué tu respuesta tiene sentido.`;
  }
  function exerciseFor(topic,subject,grade){
    const q=qbank(topic,grade,subject);
    if(q.length){
      const start=rotation(topic,q.length); const picked=[0,1,2].map(k=>q[(start+k)%q.length]).filter(Boolean);
      return picked.map((x,i)=>`${i+1}. ${esc(x.q)}<br><small>💡 Pista: ${esc(x.hint||'Identifica primero qué parte de '+topic+' necesitas usar.')}</small>`).join('<br><br>');
    }
    const t=clean(topic), s=norm(subject);
    if(/matematic/.test(s)) return `1. Resuelve un caso sencillo de <b>${esc(topic)}</b> con números pequeños.<br><small>💡 Pista: escribe los datos antes de calcular.</small><br><br>2. Cambia uno de los datos y vuelve a resolverlo.<br><small>💡 Pista: compara qué cambió.</small><br><br>3. Explica con una frase por qué tu respuesta tiene sentido.`;
    if(/ciencias/.test(s)) return `1. Describe un ejemplo real de <b>${esc(topic)}</b>.<br><small>💡 Pista: piensa en algo que puedas observar.</small><br><br>2. Explica qué causa o evidencia demuestra el fenómeno.<br><small>💡 Pista: separa lo que observas de lo que concluyes.</small><br><br>3. Predice qué pasaría si cambiaras una condición.`;
    if(/social/.test(s)) return `1. Explica con tus palabras qué significa <b>${esc(topic)}</b>.<br><small>💡 Pista: menciona personas, lugar y tiempo cuando corresponda.</small><br><br>2. Da un ejemplo concreto relacionado con el tema.<br><small>💡 Pista: conecta causa y consecuencia.</small><br><br>3. Explica por qué ese ejemplo demuestra que entendiste el concepto.`;
    if(/espanol|lengua/.test(s)) return `1. Lee un texto corto y encuentra un ejemplo de <b>${esc(topic)}</b>.<br><small>💡 Pista: subraya la parte que lo demuestra.</small><br><br>2. Explica con tus palabras por qué pertenece al tema.<br><br>3. Crea tu propio ejemplo.`;
    if(/ingles/.test(s)) return `1. Escribe una oración usando <b>${esc(topic)}</b>.<br><small>💡 Pista: empieza con una idea sencilla.</small><br><br>2. Cambia la persona, el tiempo o el contexto según el tema.<br><br>3. Traduce la oración y explica qué estructura utilizaste.`;
    return `1. Explica <b>${esc(topic)}</b> con tus palabras.<br><br>2. Da un ejemplo propio.<br><br>3. Explica cómo comprobarías que tu respuesta es correcta.`;
  }
  function context(topic,activeTopic,grade,subject){
    const locked=String(activeTopic||topic||'').trim();
    const chosen=locked||String(topic||'').trim();
    const hit=findCatalogTopic(chosen,grade,subject);
    return hit||{topic:chosen,grade:String(grade||''),subject:subject||''};
  }
  function response(topic,userText,activeTopic,meta={}){
    const ctx=context(topic,activeTopic,meta.grade||'',meta.subject||'');
    if(!ctx.topic) return null;
    const p=profile(ctx.topic), q=qbank(ctx.topic,ctx.grade,ctx.subject), t=norm(userText);
    const wantExample=/ejemplo|ejemplos|peras|manzanas|otro ejemplo|otra vez/.test(t);
    const wantExercise=/ejercicio|ejercicios|practica|practicar|problema|problemas|quiz|pregunta/.test(t);
    const wantSimple=/no entiendo|facil|fácil|simple|peras|manzanas|desde cero/.test(t);
    const wantComplete=/completo|completa|todo|paso a paso|explicame|explícame|que es|qué es|como se hace|cómo se hace/.test(t);
    let h=`<b>Estamos trabajando solo este tema:</b> ${esc(ctx.topic)}${ctx.grade?` · ${esc(ctx.grade)}°`:''}${ctx.subject?` · ${esc(ctx.subject)}`:''}.<br><br>`;
    h+=`<b>1. ¿Qué significa?</b><br>${p?esc(p.def):genericDefinition(ctx.topic,ctx.subject,ctx.grade)}<br><br>`;
    h+=`<b>2. Ejemplo explicado</b><br>${p?esc(p.ex[0]):exampleFor(ctx.topic,ctx.subject,ctx.grade)}<br><br>`;
    if(p) h+=`<b>3. Otro ejemplo</b><br>${esc(p.ex[1]||p.ex[0])}<br><br>`;
    else h+=`<b>3. ¿Cómo lo pienso?</b><br>Primero identifica qué te están preguntando. Después busca la idea de <b>${esc(ctx.topic)}</b> que necesitas. Haz un paso a la vez y comprueba si el resultado tiene sentido.<br><br>`;
    if(wantExample) h+=`<b>4. Un ejemplo más</b><br>${p?esc(p.ex[Math.min(2,p.ex.length-1)]||p.ex[0]):exampleFor(ctx.topic,ctx.subject,ctx.grade)}<br><br>`;
    if(wantExercise || wantComplete) h+=`<b>5. Ahora tú</b><br>${exerciseFor(ctx.topic,ctx.subject,ctx.grade)}<br><br>`;
    h+=`<b>${wantSimple?'6. En palabras muy sencillas':'6. Para recordarlo'}</b><br>${p?esc(p.rule):`Quédate con esta idea: <b>${esc(ctx.topic)}</b> se entiende mejor si primero sabes qué significa, luego ves un ejemplo y finalmente haces uno tú mismo.`}`;
    return {text:h,mood:'explica',topic:ctx.topic,grade:ctx.grade,subject:ctx.subject};
  }
  window.AULA_TUTOR_ENGINE={response,findProfile:profile,curriculumContext:(topic,active)=>context(topic,active,'',''),version:'7.0'};
})();
