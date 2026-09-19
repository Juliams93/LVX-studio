# LVX Studio

Web de Julia Marín. Producción: https://www.lvx-studio.com

## Generar la web

Con Node.js 22 o posterior: `node build-blog.mjs`.
No requiere dependencias. `dist/` contiene únicamente los archivos públicos.
Vercel ejecuta la generación al publicar en main y sirve ese directorio.

## Añadir un artículo

Editar `blog-posts.json`: slug estable, title, description, category, date,
modified, author, image, imageAlt, status y blocks.
Bloques disponibles: p, h2, ul, ol, code y link. El generador escapa el texto.
Los enlaces deben usar HTTPS o una ruta local. Las fechas usan AAAA-MM-DD.

1. Crear el artículo con `status: "draft"`.
2. Revisar el texto, hechos, fuentes, derechos de imágenes y ejemplos de código.
3. Para publicarlo, cambiar a `published` y poner su fecha real de publicación.
4. Ejecutar el generador, comprobar la web y publicar el cambio en GitHub.

Los borradores no se incluyen en la web, el sitemap ni el RSS. El generador
reconstruye dist/ desde cero para que tampoco queden páginas antiguas si un
artículo deja de estar publicado. No cambiar un slug publicado sin redirección.

Las páginas /blog y /blog/slug, metadatos SEO, datos BlogPosting y BreadcrumbList,
sitemap.xml y feed.xml se generan desde los mismos datos. El JSON de contenido
y el generador no se sirven al público. Los datos estructurados no garantizan
indexación ni resultados enriquecidos en buscadores.

No hay IA ni tareas programadas conectadas. Una integración futura puede crear
entradas draft en este formato; la revisión editorial sigue siendo un paso previo
a la publicación. No se necesitan claves ni servicios de pago para este blog.

## Contacto

hola@lvx-studio.com. Portfolio: https://jm-tech.es/.
La automatización de la portada es una simulación y el robot una guía local.
