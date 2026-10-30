import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const distDir = path.join(root, 'dist')
const serverEntryPath = path.join(root, 'dist-server', 'entry-server.js')
const catalogoPath = path.join(root, 'src', 'data', 'catalogo.json')

const siteUrl = (
  process.env.SITE_URL?.trim() || 'https://segundalectura.netlify.app'
).replace(/\/+$/, '')

function urlAbsoluta(valor) {
  const url = String(valor ?? '').trim()
  if (!url) return `${siteUrl}/placeholder.svg`
  if (/^https?:\/\//i.test(url)) return url
  return `${siteUrl}${url.startsWith('/') ? '' : '/'}${url}`
}

function jsonLdScript(datos) {
  return `<script type="application/ld+json">${JSON.stringify(datos).replace(/</g, '\\u003c')}</script>`
}

const snapshot = JSON.parse(await readFile(catalogoPath, 'utf8'))
const libros = snapshot.libros.filter(
  (libro) => libro.publicacion === 'publicado',
)
const cuadernos = snapshot.cuadernos.filter(
  (cuaderno) => cuaderno.publicacion === 'publicado',
)

const servidor = await import(
  `${pathToFileURL(serverEntryPath).href}?t=${Date.now()}`
)

if (typeof servidor.render !== 'function') {
  throw new Error('dist-server/entry-server.js no exporta render().')
}

const appHtml = servidor.render()
let html = await readFile(path.join(distDir, 'index.html'), 'utf8')

const marcadorRoot = '<div id="root"></div>'
if (!html.includes(marcadorRoot)) {
  throw new Error('No se encontró <div id="root"></div> en dist/index.html.')
}

html = html.replace(marcadorRoot, `<div id="root">${appHtml}</div>`)
html = html.replaceAll('__SITE_URL__', siteUrl)

const descripcion = `Librería de libros usados en Chile con ${libros.length} títulos disponibles${cuadernos.length > 0 ? ` y ${cuadernos.length} cuadernos` : ''}. Fantasía, romance, suspense y más.`

const libreria = {
  '@context': 'https://schema.org',
  '@type': 'BookStore',
  '@id': `${siteUrl}/#libreria`,
  name: 'Segunda Lectura',
  url: `${siteUrl}/`,
  image: `${siteUrl}/logo-sl.png`,
  logo: `${siteUrl}/logo-sl.png`,
  description: descripcion,
  sameAs: ['https://instagram.com/segundalectura___'],
  priceRange: '$$',
  currenciesAccepted: 'CLP',
  paymentAccepted: 'Efectivo, transferencia bancaria',
  areaServed: {
    '@type': 'Country',
    name: 'Chile',
  },
}

const itemList = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Libros usados disponibles',
  numberOfItems: libros.length,
  itemListElement: libros.map((libro, indice) => ({
    '@type': 'ListItem',
    position: indice + 1,
    item: {
      '@type': 'Book',
      name: libro.titulo,
      ...(libro.autor
        ? { author: { '@type': 'Person', name: libro.autor } }
        : {}),
      ...(libro.generos.length > 0 ? { genre: libro.generos } : {}),
      ...(libro.anio ? { datePublished: libro.anio } : {}),
      ...(libro.sinopsis ? { description: libro.sinopsis } : {}),
      image: urlAbsoluta(libro.imagen),
      inLanguage: 'es',
      ...(typeof libro.precio === 'number'
        ? {
            offers: {
              '@type': 'Offer',
              price: String(libro.precio),
              priceCurrency: 'CLP',
              availability: 'https://schema.org/InStock',
              url: `${siteUrl}/#libros`,
            },
          }
        : {}),
    },
  })),
}

const jsonLd = [libreria, itemList].map(jsonLdScript).join('\n    ')
html = html.replace('<!--app-json-ld-->', jsonLd)

await writeFile(path.join(distDir, 'index.html'), html, 'utf8')

const fecha = new Date().toISOString().slice(0, 10)
await writeFile(
  path.join(distDir, 'robots.txt'),
  `User-agent: *\nAllow: /\nDisallow: /estado.html\nDisallow: /estado.json\nSitemap: ${siteUrl}/sitemap.xml\n`,
  'utf8',
)

await writeFile(
  path.join(distDir, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>${siteUrl}/</loc>\n    <lastmod>${fecha}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>1.0</priority>\n  </url>\n</urlset>\n`,
  'utf8',
)

console.log(`Prerender listo: ${libros.length} libros, ${cuadernos.length} cuadernos.`)
console.log(`- dist/index.html`)
console.log(`- dist/robots.txt`)
console.log(`- dist/sitemap.xml`)
