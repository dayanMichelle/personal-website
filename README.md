# Blog

Blog personal con editor de texto enriquecido. Escribes las entradas desde `/admin`,
se guardan en SQLite y se publican al instante.

## Stack

- **Next.js 16** (App Router) + TypeScript + Tailwind v4
- **Tiptap** como editor WYSIWYG
- **Archivos Markdown** en `content/`, sin base de datos

## Arrancar

```bash
npm install
npm run dev
```

El sitio queda en http://localhost:3001.

## Rutas

| Ruta | Qué es |
| --- | --- |
| `/` | Portada: destacadas, últimas entradas e historias |
| `/articles` | Todo menos historias |
| `/stories` | Solo entradas con categoría `Story` |
| `/cursos` | Todos los cursos publicados |
| `/curso/[slug]` | Índice de un curso, clase a clase |
| `/tag/[slug]` | Entradas con un tag |
| `/post/[slug]` | La entrada publicada |
| `/admin` | Lista de entradas, incluidos borradores |
| `/admin/new` | Escribir una entrada nueva |
| `/admin/[id]` | Editar o eliminar una existente |
| `/login` | Solo hace falta si defines `ADMIN_PASSWORD` |

## Escribir una entrada

1. `/admin` → **Nueva entrada**.
2. Título arriba, contenido en el editor (negrita, títulos, listas, citas, código,
   enlaces e imágenes por URL). También funcionan los atajos de markdown: escribe
   `## ` para un H2 o `- ` para una lista.
3. En la barra lateral eliges categoría, resumen (opcional: se genera solo del
   contenido) e imagen de portada.
4. **Publicar** o **Guardar como borrador**. Los borradores no se ven en el sitio.

## Tags y cursos

En la barra lateral del editor hay dos cosas más:

**Tags** — escribe y pulsa Enter o coma. Se reutilizan los que ya existen (el
autocompletado los sugiere) y los nuevos se crean solos. Cada uno tiene su página
en `/tag/[slug]`. Al editar una entrada, los tags que quites desaparecen de ella.

**Curso** — escribe el nombre del curso (ej. `OAuth 2.0`) y esa entrada pasa a ser
una de sus clases. El curso se crea la primera vez que lo nombras; después aparece
en el autocompletado. El campo de al lado es el número de clase; si lo dejas vacío,
la entrada se añade al final. Si pones un número que ya ocupa otra clase, esa otra
se mueve al final en vez de fallar.

Una entrada dentro de un curso muestra "Clase N de M", el índice completo del
curso y enlaces a la clase anterior y siguiente. Los borradores no cuentan como
clases hasta que los publicas.

El slug se genera del título y solo cambia si cambias el título, para no romper
enlaces ya compartidos (al cambiarlo se renombra el archivo). El tiempo de
lectura se calcula solo.

El editor trabaja en HTML y los archivos guardan Markdown, así que cada guardado
cruza esa frontera. Está verificado que la ida y vuelta es estable: guardar la
misma entrada varias veces produce un archivo idéntico. Lo que sí se perdería es
cualquier nodo que Markdown no sepa expresar, si algún día añades tablas o
extensiones propias a Tiptap.

## Contraseña

En local, con `ADMIN_PASSWORD` vacía, `/admin` está abierto. Si la defines
(imprescindible al desplegar), `/admin` y la API de escritura piden iniciar sesión
en `/login`.

## Dónde vive el contenido

Cada entrada es un archivo en `content/posts/<slug>.md`. El nombre del archivo
**es** la URL. El frontmatter lleva los metadatos y el cuerpo es Markdown normal:

```markdown
---
title: Introducción a OAuth 2.0
excerpt: Qué problema resuelve y por qué la redirección es la clave.
category: Guide
published: true
publishedAt: '2026-08-25T14:48:39.555Z'
tags:
  - oauth
  - seguridad
series: OAuth 2.0
seriesOrder: 1
featured: true
---

OAuth es un protocolo...
```

Solo `title` es imprescindible; el resto tiene valores por defecto sensatos y
`excerpt` se genera del primer párrafo si lo omites.

Puedes editar estos archivos a mano con cualquier editor y el sitio los recoge.
El editor de `/admin` y los archivos son intercambiables: escribas por donde
escribas, la fuente de verdad es el `.md`.

Los cursos se derivan del campo `series`: no hay que darlos de alta en ningún
sitio. Si quieres añadirle descripción a un curso, crea
`content/series/<slug>.md` con `title` y `description` en el frontmatter.

### Versiona el contenido

`content/` **sí** entra en git, a propósito: te da historial, diffs y vuelta
atrás en cada clase que escribas. Es el motivo principal para no usar una base
de datos.

```bash
git add content && git commit -m "Clase 2: PKCE"
```

## Un aviso sobre desplegar

En Vercel (y en cualquier serverless) el sistema de archivos es de solo lectura,
así que **`/admin` solo escribe en local**. El flujo es: escribes en tu máquina,
commiteas el `.md`, y el deploy publica. No puedes publicar desde el móvil.

Todo el sitio público se genera en el build (`○`/`●` en la salida de
`npm run build`), así que despliegas gratis en cualquier hosting estático sin
provisionar nada.
