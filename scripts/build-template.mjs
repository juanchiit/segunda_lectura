import { readFile, writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import Papa from 'papaparse'
import {
  HEADERS,
  etiquetaPublicacion,
  etiquetaTipo,
  extraerNotaPrecio,
  limpiar,
  normalizarFilas,
  sinAcentos,
} from '../shared/normalize.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const sourcePath = path.join(root, 'Libros', 'Catalogo_de_libros.txt')
const dataDir = path.join(root, 'data')
const catalogoPath = path.join(root, 'src', 'data', 'catalogo.json')

const CLAVES = {
  titulo: 'titulo',
  autor: 'autor',
  genero: 'genero',
  'ano de publicacion': 'anio',
  'breve resumen o sinopsis': 'sinopsis',
  'estado del libro': 'condicion',
  precio: 'precio',
  imagen: 'imagen',
}

function parsearBloque(bloque) {
  const datos = {
    titulo: '',
    autor: '',
    genero: '',
    anio: '',
    sinopsis: '',
    condicion: '',
    precio: '',
    imagen: '',
  }

  let claveActual = null

  for (const lineaCruda of bloque.split(/\r?\n/)) {
    const linea = lineaCruda.trim()
    if (!linea) continue

    const match = linea.match(/^([^:]+):\s*(.*)$/)
    const clave = match
      ? CLAVES[sinAcentos(match[1]).toLowerCase().trim()]
      : null

    if (clave) {
      claveActual = clave
      datos[clave] = match[2].trim()
    } else if (claveActual) {
      datos[claveActual] = limpiar(`${datos[claveActual]} ${linea}`)
    }
  }

  return datos
}

function normalizarImagen(imagen) {
  const valor = limpiar(imagen)
  if (!valor) return ''
  if (/^(https?:)?\/\//i.test(valor) || valor.startsWith('/')) return valor
  return `/libros/${valor}`
}

function filaDesdeFuente(datos, posicion) {
  const { precio, nota } = extraerNotaPrecio(datos.precio)
  const generos = datos.genero
    .split(/[|;]/)
    .map((genero) => limpiar(genero))
    .filter(Boolean)

  return {
    __fila: posicion + 2,
    tipo: 'Libro',
    titulo: datos.titulo,
    autor: datos.autor,
    generos: generos.join(' | '),
    anio: datos.anio,
    sinopsis: datos.sinopsis,
    descripcion: '',
    condicion: datos.condicion,
    precio: precio ?? '',
    precio_nota: nota,
    imagen: normalizarImagen(datos.imagen),
    publicacion: 'Publicado',
  }
}

function filaParaCsv(libro) {
  return {
    tipo: etiquetaTipo(libro.tipo),
    titulo: libro.titulo,
    autor: libro.autor,
    generos: libro.generos.join(' | '),
    anio: libro.anio,
    sinopsis: libro.sinopsis,
    descripcion: libro.descripcion,
    condicion: libro.estado,
    precio: libro.precio ?? '',
    precio_nota: libro.precioNota,
    imagen: libro.imagen,
    publicacion: etiquetaPublicacion(libro.publicacion),
  }
}

const texto = await readFile(sourcePath, 'utf8')
const bloques = texto
  .split(/^=+$/m)
  .map((bloque) => bloque.trim())
  .filter(Boolean)

const filasFuente = bloques.map((bloque, posicion) =>
  filaDesdeFuente(parsearBloque(bloque), posicion),
)

const { libros, cuadernos, errors, warnings } = normalizarFilas(filasFuente)

if (errors.length > 0) {
  console.error('No se pudo generar la plantilla:')
  for (const error of errors) console.error(`- ${error}`)
  process.exit(1)
}

if (libros.length !== bloques.length) {
  console.error(
    `Se esperaban ${bloques.length} libros y se normalizaron ${libros.length}.`,
  )
  process.exit(1)
}

for (const warning of warnings) console.warn(`Aviso: ${warning}`)

await mkdir(dataDir, { recursive: true })
await mkdir(path.dirname(catalogoPath), { recursive: true })

const filasCsv = libros.map(filaParaCsv)
const csv = Papa.unparse(filasCsv, {
  columns: HEADERS,
  newline: '\r\n',
  quotes: false,
})
await writeFile(
  path.join(dataDir, 'plantilla-catalogo.csv'),
  `\uFEFF${csv}\r\n`,
  'utf8',
)

const leeme = [
  ['Paso', 'Instrucción'],
  [
    '1',
    'En Google Sheets crea una hoja nueva y asígnale el nombre Catálogo.',
  ],
  [
    '2',
    'Importa data/plantilla-catalogo.csv en la pestaña Catálogo: Archivo > Importar > Subir > Reemplazar hoja actual.',
  ],
  [
    '3',
    'Mantén las 12 columnas y sus nombres. No cambies el orden de los libros salvo que quieras cambiar el orden de la web.',
  ],
  [
    '4',
    'tipo: escribe Libro o Cuaderno. Los libros van primero y los cuadernos al final.',
  ],
  [
    '5',
    'generos: sepáralos con | (por ejemplo: Fantasía juvenil | Romance | Misterio).',
  ],
  [
    '6',
    'precio: escribe solo el número (por ejemplo 18000). Si el precio es especial, agrega la aclaración en precio_nota (por ejemplo c/u o los 3).',
  ],
  [
    '7',
    'imagen: pega la URL de Cloudinary o la ruta local /libros/archivo.jpg. No uses enlaces de Google Drive.',
  ],
  [
    '8',
    'publicacion: Publicado para mostrarlo, Vendido para ocultarlo sin borrar la fila, Borrador para ocultarlo mientras lo preparas.',
  ],
  [
    '9',
    'Para cuadernos solo son obligatorios tipo, titulo, descripcion, precio e imagen. autor, generos, anio, sinopsis y condicion pueden quedar vacíos.',
  ],
  [
    '10',
    'Comparte la hoja con "Cualquier persona con el enlace" como Lector. No hace falta compartirla públicamente en la web.',
  ],
  [
    '11',
    'Los cambios se publican solos en la web unos minutos después de guardar. Si algo tiene un error, la web mantiene la última versión buena.',
  ],
]
const csvLeeme = Papa.unparse(leeme, { newline: '\r\n', quotes: false })
await writeFile(path.join(dataDir, 'LEEME.csv'), `\uFEFF${csvLeeme}\r\n`, 'utf8')

const snapshot = {
  generatedAt: new Date().toISOString(),
  source: 'Libros/Catalogo_de_libros.txt',
  libros,
  cuadernos,
}
await writeFile(catalogoPath, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8')

const generos = [...new Set(libros.flatMap((libro) => libro.generos))].sort(
  (a, b) => a.localeCompare(b, 'es'),
)

console.log(`Plantilla generada: ${libros.length} libros, ${cuadernos.length} cuadernos.`)
console.log(`Géneros únicos: ${generos.length}`)
console.log(`- ${path.relative(root, path.join(dataDir, 'plantilla-catalogo.csv'))}`)
console.log(`- ${path.relative(root, path.join(dataDir, 'LEEME.csv'))}`)
console.log(`- ${path.relative(root, catalogoPath)}`)
