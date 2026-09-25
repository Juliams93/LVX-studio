import { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync, readdirSync, cpSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
const root=dirname(fileURLToPath(import.meta.url));
const read=f=>readFileSync(join(root,f),'utf8');
const out=join(root,'dist');
rmSync(out,{recursive:true,force:true});
mkdirSync(out,{recursive:true});
for (const f of readdirSync(root)) {
 if (/\.(css|js|png|webp|jpg|svg|ico)$/.test(f)||f==='index.html'||f==='projects'||f==='demos') cpSync(join(root,f),join(out,f),{recursive:true});
}
const write=(f,s)=>{mkdirSync(dirname(join(out,f)),{recursive:true});writeFileSync(join(out,f),s);};
const base='https://www.lvx-studio.com';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const json=s=>JSON.stringify(s).replace(/</g,'\\u003c');
const data=JSON.parse(read('blog-posts.json'));
const slugs=new Set();
for(const p of data){
 if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(p.slug)||slugs.has(p.slug)) throw Error('Slug inválido o repetido');
 slugs.add(p.slug);
 for(const k of ['title','description','category','author','imageAlt']) if(!p[k]?.trim()) throw Error(`Falta ${k}`);
 for(const k of ['date','modified']) if(!/^\d{4}-\d{2}-\d{2}$/.test(p[k])||!Number.isFinite(Date.parse(p[k]))||new Date(p[k]).toISOString().slice(0,10)!==p[k]) throw Error('Fecha inválida');
 if(p.modified<p.date||!['published','draft'].includes(p.status)) throw Error('Estado o fechas inválidos');
 if(!/^\/[\w.-]+$/.test(p.image)||!existsSync(join(root,p.image.slice(1)))) throw Error('Imagen inexistente');
 if(!Array.isArray(p.blocks)||!p.blocks.length) throw Error('Artículo vacío');
}
const posts=data.filter(p=>p.status==='published').sort((a,b)=>b.date.localeCompare(a.date));
const home=read('index.html');
const header=home.match(/<header>[\s\S]*?<\/header>/)[0].replaceAll('href="#','href="/#').replace('href="/blog"','href="/blog" aria-current="page"');
const footer=home.match(/<footer[\s\S]*?<\/footer>/)[0].replaceAll('href="#','href="/#');
const date=s=>new Intl.DateTimeFormat('es-ES',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(s+'T12:00:00Z'));
const minutes=p=>Math.max(1,Math.ceil(p.blocks.map(b=>Array.isArray(b[1])?b[1].join(' '):b[1]).join(' ').split(/\s+/).length/200));
function block([type,value,url],i){
 if(['p','h2'].includes(type)) return `<${type}${type==='h2'?` id="seccion-${i}"`:''}>${esc(value)}</${type}>`;
 if(['ul','ol'].includes(type)) return `<${type}>${value.map(x=>`<li>${esc(x)}</li>`).join('')}</${type}>`;
 if(type==='code') return `<pre tabindex="0" aria-label="Ejemplo de código Python"><code>${esc(value)}</code></pre>`;
 if(type==='link') {if(!url.startsWith('/')&&!url.startsWith('https://')) throw Error('Enlace no permitido');return `<p><a href="${esc(url)}">${esc(value)} <span aria-hidden="true">↗</span></a></p>`;}
 throw Error('Bloque desconocido: '+type);
}
function page(title,description,path,body,schema,image='/logo.png',extra=''){
 return `<!doctype html>\n<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)} | LVX Studio</title><meta name="description" content="${esc(description)}"><meta name="theme-color" content="#070b14"><link rel="canonical" href="${base+path}"><meta property="og:type" content="${path==='/blog'?'website':'article'}"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${base+path}"><meta property="og:site_name" content="LVX Studio"><meta property="og:locale" content="es_ES"><meta property="og:image" content="${base+image}"><meta name="twitter:card" content="summary_large_image">${extra}<link rel="icon" href="/logo.png" type="image/png"><link rel="stylesheet" href="/styles.css"><link rel="stylesheet" href="/blog.css"><link rel="alternate" type="application/rss+xml" title="Blog de LVX Studio" href="/feed.xml"><script type="application/ld+json">${json(schema)}</script></head><body class="blog-page"><a class="skip-blog" href="#contenido">Saltar al contenido</a>${header}<main id="contenido">${body}</main>${footer}<script src="/site.js" defer></script></body></html>\n`;
}
const card=(p,i)=>`<article class="journal-card"><a class="journal-cover" href="/blog/${p.slug}" tabindex="-1" aria-hidden="true"><img src="${esc(p.image)}" alt="" width="1200" height="630" ${i?'loading="lazy"':'fetchpriority="high"'}></a><div class="journal-copy"><div class="journal-meta"><span>${esc(p.category)}</span><time datetime="${p.date}">${date(p.date)}</time></div><h2><a href="/blog/${p.slug}">${esc(p.title)}</a></h2><p>${esc(p.description)}</p><div class="journal-bottom"><span>${minutes(p)} min de lectura</span><a href="/blog/${p.slug}" aria-label="Leer: ${esc(p.title)}">Leer artículo <span aria-hidden="true">↗</span></a></div></div></article>`;
write('blog/index.html',page('Blog: ideas, código y creación','Diseño de producto, automatización y código explicado paso a paso. El blog de LVX Studio.','/blog',`<section class="journal-intro wrap"><p class="eyebrow">El cuaderno de LVX</p><h1>Ideas que se piensan.<br><span>Conocimiento que se comparte.</span></h1><p class="journal-lead">Diseño, automatización y código. Un espacio para entender cómo nacen las cosas y animarte a construir las tuyas.</p><div class="journal-edition"><span>01 / Diseño · IA · Código</span><span>${posts.length} artículos para empezar</span></div></section><section class="wrap journal-grid" aria-label="Artículos del blog">${posts.map(card).join('')}</section><section class="wrap journal-note"><p class="eyebrow">De la lectura a la idea</p><h2>¿Qué te gustaría construir?</h2><p>A veces una buena pregunta es el primer paso de un proyecto.</p><a class="button" href="/#contacto">Hablemos de tu idea ↗</a><a class="rss-link" href="/feed.xml">Seguir el blog por RSS</a></section>`,{'@context':'https://schema.org','@type':'Blog',name:'El cuaderno de LVX',url:base+'/blog',inLanguage:'es',blogPost:posts.map(p=>({'@type':'BlogPosting',headline:p.title,url:base+'/blog/'+p.slug,datePublished:p.date}))}));
for(const p of posts){
 const url=base+'/blog/'+p.slug;
 const schema={'@context':'https://schema.org','@graph':[{'@type':'BlogPosting',headline:p.title,description:p.description,image:[base+p.image],datePublished:p.date+'T12:00:00+02:00',dateModified:p.modified+'T12:00:00+02:00',author:{'@type':'Organization',name:p.author,url:base},publisher:{'@type':'Organization',name:'LVX Studio',logo:{'@type':'ImageObject',url:base+'/logo.png'}},mainEntityOfPage:{'@type':'WebPage','@id':url},articleSection:p.category,inLanguage:'es',url},{'@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Inicio',item:base+'/'},{'@type':'ListItem',position:2,name:'Blog',item:base+'/blog'},{'@type':'ListItem',position:3,name:p.title,item:url}]}]};
 const toc=p.blocks.map((b,i)=>b[0]==='h2'?`<li><a href="#seccion-${i}">${esc(b[1])}</a></li>`:'').join('');
 write(`blog/${p.slug}/index.html`,page(p.title,p.description,'/blog/'+p.slug,`<div class="wrap"><nav class="journal-breadcrumb" aria-label="Ruta de navegación"><a href="/">Inicio</a><span aria-hidden="true">/</span><a href="/blog">Blog</a></nav><article class="journal-article"><div class="article-intro"><p class="eyebrow">${esc(p.category)}</p><h1>${esc(p.title)}</h1><p class="journal-lead">${esc(p.description)}</p><div class="article-byline"><span>${esc(p.author)}</span><time datetime="${p.date}">${date(p.date)}</time><span>${minutes(p)} min de lectura</span></div></div><img class="article-cover" src="${esc(p.image)}" alt="${esc(p.imageAlt)}" width="1200" height="630"><div class="article-layout"><aside class="article-index"><p class="eyebrow">En este artículo</p><ol>${toc}</ol></aside><div class="article-body">${p.blocks.map(block).join('')}<div class="article-end"><span>LVX Studio · Tecnología y creación</span><a href="/blog">← Volver al blog</a></div></div></div></article><section class="journal-related" aria-label="Más artículos"><p class="eyebrow">Sigue explorando</p>${posts.filter(x=>x.slug!==p.slug).map(x=>`<a href="/blog/${x.slug}"><span>${esc(x.category)}</span><strong>${esc(x.title)} ↗</strong></a>`).join('')}</section></div>`,schema,'/logo.png',`<meta property="article:published_time" content="${p.date}T12:00:00+02:00"><meta property="article:modified_time" content="${p.modified}T12:00:00+02:00">`));
}
const urls=[{path:'/'},{path:'/blog'},{path:'/demos/citas'},{path:'/demos/correo'},{path:'/demos/smerald'},...posts.map(p=>({path:'/blog/'+p.slug,modified:p.modified}))];
write('sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(u=>`<url><loc>${base+u.path}</loc>${u.modified?`<lastmod>${u.modified}</lastmod>`:''}</url>`).join('')}</urlset>\n`);
write('robots.txt',`User-agent: *\nAllow: /\nSitemap: ${base}/sitemap.xml\n`);
write('feed.xml',`<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>El cuaderno de LVX</title><link>${base}/blog</link><description>Diseño, automatización y código en LVX Studio.</description><language>es</language>${posts.map(p=>`<item><title>${esc(p.title)}</title><link>${base}/blog/${p.slug}</link><guid isPermaLink="true">${base}/blog/${p.slug}</guid><pubDate>${new Date(p.date+'T12:00:00+02:00').toUTCString()}</pubDate><category>${esc(p.category)}</category><description>${esc(p.description)}</description></item>`).join('')}</channel></rss>\n`);
console.log(`Blog generado: ${posts.length} artículos publicados; ${data.length-posts.length} borradores excluidos.`);
