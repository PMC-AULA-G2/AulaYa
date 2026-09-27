# Catálogo de colegios/sedes rurales de AULA

## Fuente
El catálogo incluido en `data/colegios_rurales_2024.json` se generó a partir de `BDATOS-EDUC-2024.zip` del DANE, usando la información de sedes educativas de Educación Formal 2024.

## Alcance
- 37.310 sedes educativas con `AREA_NOMBRE = Rural`.
- Se conserva el `SEDE_CODIGO` como identificador DANE.
- Se incluyen nombre de sede, municipio, departamento, dirección, sector y estado.
- Cuando la sede es adscrita y la relación está disponible, se conserva el código y nombre de la sede principal.
- El catálogo diferencia `principal` y `adscrita`.

## Funcionamiento en AULA
El registro de estudiantes y docentes usa este catálogo local. La búsqueda acepta nombre, municipio, departamento, código DANE o nombre de la sede principal. La interfaz muestra resultados paginados visualmente para no cargar miles de elementos al DOM.

El archivo está incluido en el Service Worker, por lo que el catálogo está disponible offline después de instalar/cargar la app.

## Actualización futura
La APK/PWA no necesita una actualización cada vez que cambie el catálogo. La arquitectura deja preparado un punto de sincronización para que un backend de AULA publique una versión JSON transformada de los nuevos datos oficiales. Ese endpoint debe validarse y versionarse antes de activarlo en producción.

> Importante: los datos se presentan como catálogo institucional para selección dentro de AULA. Antes de usarlo como registro definitivo de identidad institucional en producción, se debe validar la versión vigente de la fuente oficial y las reglas de privacidad/seguridad del backend.
