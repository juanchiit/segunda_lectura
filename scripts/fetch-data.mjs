import 'dotenv/config'
import { writeFile, readFile, mkdir, access } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  HEADERS,
  mapearValores,
  normalizarFilas,
} from '../shared/normalize.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const catalogoPath = path.join(root, 'src', 'data', 'catalogo.json')
const estadoPath = path.join(root, 'public', 'estado.json')

const sheetId = process.env.GOOGLE_SHEETS_ID?.trim()
const apiKey = process.env.GOOGLE_SHEETS_API_KEY?.trim()
const tab = process.env.GOOGLE_SHEETS_TAB?.trim() || 'Catálogo'
const requireSheets =
  process.env.REQUIRE_SHEETS === '1' ||
  process.env.NETLIFY === 'true' ||
  process.env.NETLIFY === '1'

function escribirEstado(estado) {
  return writeFile(estadoPath, `${JSON.stringify(estado, null, 2)}\n`, 'utf8')
}

async function existeSnapshot() {
  try {
    await access(catalogoPath)
    return true
  } catch {
    return false
  }
}

async function obtenerValores() {
  const url = new URL(
    `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(sheetId)}/values/${encodeURIComponent(tab)}`,
  )
  url.searchParams.set('key', apiKey)
  url.searchParams.set('majorDimension', 'ROWS')
  url.searchParams.set('valueRenderOption', 'UNFORMATTED_VALUE')

  const response = await fetch(url)
  const texto = await response.text()

  if (!response.ok) {
    let detalle = texto
    try {
      const json = JSON.parse(texto)
      detalle = json.error?.message || texto
    } catch {
      // conservar el texto original
    }
    throw new Error(`Google Sheets respondió ${response.status}: ${detalle}`)
  }

  const json = JSON.parse(texto)
  return json.values || []
}

async function main() {
  if (!sheetId || !apiKey) {
    if (requireSheets) {
      throw new Error(
        'Faltan GOOGLE_SHEETS_ID y/o GOOGLE_SHEETS_API_KEY. En Netlify deben estar configuradas.',
      )
    }

    if (await existeSnapshot()) {
      console.warn(
        'Sin GOOGLE_SHEETS_ID/GOOGLE_SHEETS_API_KEY: se usará src/data/catalogo.json.',
      )
      const snapshot = JSON.parse(await readFile(catalogoPath, 'utf8'))
      const librosPublicados = snapshot.libros.filter(
        (item) => item.publicacion === 'publicado',
      )
      const cuadernosPublicados = snapshot.cuadernos.filter(
        (item) => item.publicacion === 'publicado',
      )
      await escribirEstado({
        generatedAt: new Date().toISOString(),
        source: snapshot.source || 'Snapshot local',
        sheet: tab,
        ok: true,
        errors: [],
        warnings: [
          'No se consultó Google Sheets porque faltan credenciales. Se usó el snapshot local.',
        ],
        counts: {
          libros: snapshot.libros.length,
          cuadernos: snapshot.cuadernos.length,
          publicados: librosPublicados.length + cuadernosPublicados.length,
        },
      })
      return
    }

    throw new Error(
      'Faltan GOOGLE_SHEETS_ID/GOOGLE_SHEETS_API_KEY y no existe src/data/catalogo.json. Ejecuta npm run build:template.',
    )
  }

  const values = await obtenerValores()
  const { rows, headers, missing } = mapearValores(values)

  if (missing.length > 0) {
    const mensaje = `Faltan columnas en la hoja "${tab}": ${missing.join(', ')}. Columnas esperadas: ${HEADERS.join(', ')}.`
    await escribirEstado({
      generatedAt: new Date().toISOString(),
      source: 'Google Sheets',
      sheet: tab,
      ok: false,
      errors: [mensaje],
      warnings: [],
      counts: { libros: 0, cuadernos: 0, publicados: 0 },
    })
    throw new Error(mensaje)
  }

  const { libros, cuadernos, errors, warnings } = normalizarFilas(rows)

  const estado = {
    generatedAt: new Date().toISOString(),
    source: 'Google Sheets',
    sheet: tab,
    headers,
    ok: errors.length === 0,
    errors,
    warnings,
    counts: {
      libros: libros.length,
      cuadernos: cuadernos.length,
      publicados:
        libros.filter((item) => item.publicacion === 'publicado').length +
        cuadernos.filter((item) => item.publicacion === 'publicado').length,
    },
  }

  await escribirEstado(estado)

  for (const warning of warnings) console.warn(`Aviso: ${warning}`)

  if (errors.length > 0) {
    console.error('La hoja tiene errores en filas publicadas:')
    for (const error of errors) console.error(`- ${error}`)
    throw new Error(
      `Hay ${errors.length} error(es) en la hoja. Corrige las filas indicadas y vuelve a publicar.`,
    )
  }

  const snapshot = {
    generatedAt: estado.generatedAt,
    source: 'Google Sheets',
    libros,
    cuadernos,
  }

  await mkdir(path.dirname(catalogoPath), { recursive: true })
  await writeFile(catalogoPath, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8')

  const publicados = estado.counts.publicados
  console.log(
    `Catálogo actualizado desde Google Sheets: ${libros.length} libros, ${cuadernos.length} cuadernos, ${publicados} publicados.`,
  )
  if (warnings.length > 0) {
    console.warn(`Avisos: ${warnings.length}. Revisa /estado.`)
  }
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
