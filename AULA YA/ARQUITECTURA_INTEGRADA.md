# AULA — arquitectura integrada final (PWA → APK)

## Objetivo

AULA es una plataforma educativa para contextos rurales que conecta:
- estudiante;
- docente;
- contenidos;
- progreso;
- gamificación;
- Niko;
- IA educativa.

El docente sigue siendo quien orienta el aprendizaje. El SLM es un apoyo.

## 1. Core educativo

Debe funcionar aunque no haya IA o internet:
- perfil del estudiante;
- materias: Español, Matemáticas, Ciencias Naturales, Ciencias Sociales e Inglés;
- grados: 1.º, 2.º, 3.º, 4.º, 5.º, 9.º y 10.º;
- lecciones, videos, juegos y ejercicios;
- progreso;
- XP, monedas y rachas;
- avatar personalizable del estudiante con monedas;
- recomendaciones del docente;
- almacenamiento local.

## 2. Docente ↔ estudiante

Flujo:
1. Docente crea una clase.
2. Le asigna nombre.
3. Invita estudiantes por correo.
4. El correo debe corresponder a una cuenta AULA.
5. El estudiante acepta la invitación.
6. El docente consulta progreso.
7. El docente recomienda contenido.
8. El estudiante recibe notificación y trabaja el tema.
9. El progreso se sincroniza.

Un estudiante puede pertenecer a varias clases.

## 3. Contenido del docente

No reentrenar el SLM cada vez que un docente suba contenido.

Cuando se sube una guía, PDF, actividad u otro material:
- guardar el contenido;
- asociar grado/materia/tema/clase;
- indexarlo para RAG;
- sincronizarlo al estudiante cuando sea necesario;
- usarlo como contexto del SLM.

Si el docente actualiza el material, se actualiza el índice.

## 4. SLM + RAG

### SLM
Entrenarlo por versiones para mejorar:
- explicación;
- pistas;
- feedback;
- adaptación al nivel;
- motivación;
- recomendaciones.

### RAG
Contiene el conocimiento y materiales actuales:
- currículo base;
- contenidos validados;
- materiales de docentes;
- actividades.

Así se puede cambiar el conocimiento sin cambiar los pesos del modelo.

## 5. Adaptación al celular

### Alto
SLM local pequeño cuantizado o IA online.

### Medio
SLM pequeño cuantizado si el dispositivo lo soporta; si no, IA online cuando haya internet.

### Bajo
No cargar SLM local. Usar contenido curado, ejercicios, gamificación, Niko y progreso.

La app nunca debe quedar inutilizable por no poder ejecutar IA.

## 6. Offline-first

En local:
- contenido;
- actividades;
- progreso;
- XP/monedas/racha;
- recomendaciones;
- estado de Niko;
- cola de sincronización.

Al regresar internet:
- enviar cambios pendientes;
- recibir contenido/recomendaciones nuevas;
- actualizar índice RAG;
- resolver conflictos de forma controlada.

Enviar eventos/deltas, no todo el estado.

## 7. Niko

Niko es la capa visual y emocional, no el modelo.

El SLM puede devolver estados:
- pensar;
- motivar;
- celebrar;
- confundido;
- recompensa.

La app decide qué animación/pose mostrar.

## 8. Orientación de grado 11 (evolución futura)

Aunque el alcance curricular actual de esta versión llega a 10.º, AULA puede preparar:
- intereses profesionales;
- hasta tres carreras de interés;
- información de universidades;
- becas en Colombia.

El estudiante recibe esta información; el docente puede consultar tendencias agregadas de interés de su clase.

## 9. SLM: estado real

Esta entrega incluye:
- dataset curricular;
- ejemplos de entrenamiento;
- estructura RAG;
- API;
- script de LoRA/QLoRA.

El modelo final todavía debe entrenarse, evaluarse y cuantizarse. No se debe presentar como un SLM ya entrenado.

## 10. Ruta hacia APK

La PWA actual debe conservar:
- manifest;
- service worker;
- almacenamiento local;
- assets.

Para una distribución Android se puede envolver/proyectar posteriormente con una capa Android (por ejemplo Capacitor) y añadir el runtime local del SLM solo donde sea viable.

Primero validar la PWA offline y el backend; después empaquetar APK.

## 11. Métricas

Validar en teléfonos reales:
- RAM;
- almacenamiento;
- tiempo de inicio;
- consumo de datos;
- batería;
- tiempo de respuesta;
- temperatura;
- porcentaje de funciones offline;
- éxito de sincronización;
- calidad pedagógica del SLM.

No afirmar compatibilidad universal sin pruebas.
