# Recomendaciones del docente + paquete offline

Cuando una recomendación de tema es recibida por el estudiante dentro de AULA, la app: 
1. muestra la notificación dirigida a su clase;
2. prepara un paquete offline del tema;
3. guarda metadatos de video, ejercicios, reto y evaluación en Cache Storage;
4. descarga el video disponible del tema a la caché de videos;
5. registra el paquete en `STATE.downloadedTopics`;
6. permite abrir el tema y practicar sin internet después de la sincronización.

La PWA puede solicitar permiso para mostrar una notificación del sistema. La entrega entre dispositivos requiere el backend/sincronización de AULA; este prototipo conserva la lógica local y los destinatarios por clase.

Importante: actualmente el prototipo tiene una lección completa con video y cuestionario real (`Fracciones equivalentes`). La infraestructura de paquetes funciona para las demás lecciones cuando sus recursos estén disponibles.
