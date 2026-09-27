# Videos offline de AULA YA

AULA YA puede cachear automáticamente archivos de video **MP4/WebM alojados por la propia aplicación** y servirlos sin conexión.

## Sobre YouTube

Un video de YouTube no es un archivo MP4 público que la PWA pueda descargar y guardar legalmente por su cuenta. La aplicación no debe convertir arbitrariamente videos de terceros de YouTube en archivos locales.

Para videos de terceros, AULA YA puede conservar un enlace de YouTube para reproducirlo cuando haya internet.

Para que un video quede realmente offline dentro de AULA YA, usar una de estas opciones:

1. Video creado por AULA YA o por el equipo del proyecto.
2. Video con permiso/licencia que permita descargarlo y redistribuirlo.
3. Video educativo propio exportado a MP4/WebM.

Cuando esos archivos estén disponibles, se colocan en `media/videos/` y se registran en el catálogo del tema. El Service Worker los puede cachear para uso offline.

La arquitectura recomendada es:

Tema del docente
→ video local/licenciado
→ descarga automática mientras hay internet
→ caché local
→ reproducción offline.
