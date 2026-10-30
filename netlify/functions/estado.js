import {
  HEADERS,
  mapearValores,
  normalizarFilas,
} from '../../shared/normalize.js'

const cabeceras = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store',
}

function respuesta(statusCode, cuerpo) {
  return {
    statusCode,
    headers: cabeceras,
    body: JSON.stringify(cuerpo),
  }
}

export async function handler(event) {
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: { ...cabeceras, Allow: 'GET' },
      body: JSON.stringify({ error: 'Método no permitido.' }),
    }
  }

  const sheetId = process.env.GOOGLE_SHEETS_ID?.trim()
  const apiKey = process.env.GOOGLE_SHEETS_API_KEY?.trim()
  const tab = process.env.GOOGLE_SHEETS_TAB?.trim() || 'Catálogo'

  if (!sheetId || !apiKey) {
    return respuesta(500, {
      ok: false,
      error:
        'Faltan GOOGLE_SHEETS_ID y/o GOOGLE_SHEETS_API_KEY en las variables de entorno.',
    })
  }

  try {
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
      return respuesta(502, {
        ok: false,
        error: `Google Sheets respondió ${response.status}: ${detalle}`,
      })
    }

    const values = JSON.parse(texto).values || []
    const { rows, headers, missing } = mapearValores(values)

    if (missing.length > 0) {
      return respuesta(200, {
        generatedAt: new Date().toISOString(),
        source: 'Google Sheets',
        sheet: tab,
        headers,
        ok: false,
        errors: [
          `Faltan columnas: ${missing.join(', ')}. Columnas esperadas: ${HEADERS.join(', ')}.`,
        ],
        warnings: [],
        counts: { libros: 0, cuadernos: 0, publicados: 0 },
      })
    }

    const { libros, cuadernos, errors, warnings } = normalizarFilas(rows)

    return respuesta(200, {
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
    })
  } catch (error) {
    return respuesta(502, {
      ok: false,
      error: `No se pudo consultar Google Sheets: ${error.message}`,
    })
  }
}
