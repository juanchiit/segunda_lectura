export const HEADERS = [
  'tipo',
  'titulo',
  'autor',
  'generos',
  'anio',
  'sinopsis',
  'descripcion',
  'condicion',
  'precio',
  'precio_nota',
  'imagen',
  'publicacion',
]

const CORRECCIONES_GENERO = {
  fantasia: 'fantasía',
  ficcion: 'ficción',
  romantica: 'romántica',
  romantico: 'romántico',
  contemporanea: 'contemporánea',
  contemporaneo: 'contemporáneo',
  historica: 'histórica',
  historico: 'histórico',
  gotica: 'gótica',
  gotico: 'gótico',
  mitologia: 'mitología',
  clasica: 'clásica',
  clasico: 'clásico',
  policial: 'policial',
}

const PUBLICACIONES = {
  '': 'publicado',
  publicado: 'publicado',
  publicada: 'publicado',
  disponible: 'publicado',
  activo: 'publicado',
  activa: 'publicado',
  vendido: 'vendido',
  vendida: 'vendido',
  agotado: 'vendido',
  agotada: 'vendido',
  borrador: 'borrador',
  oculto: 'borrador',
  oculta: 'borrador',
  pausado: 'borrador',
  pausada: 'borrador',
}

export function sinAcentos(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

export function limpiar(value) {
  return String(value ?? '').replace(/\s+/g, ' ').trim()
}

export function slugify(value) {
  return sinAcentos(limpiar(value))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function normalizarGenero(value) {
  const limpio = limpiar(value)
  if (!limpio) return ''

  const palabras = limpio
    .toLowerCase()
    .split(' ')
    .map((palabra) => CORRECCIONES_GENERO[palabra] || palabra)

  const normalizado = palabras.join(' ')
  return normalizado.charAt(0).toUpperCase() + normalizado.slice(1)
}

export function normalizarGeneros(value) {
  const vistos = new Set()
  const generos = []
  const partes = Array.isArray(value) ? value : String(value ?? '').split(/[|;]/)

  for (const parte of partes) {
    const genero = normalizarGenero(parte)
    if (!genero) continue
    const clave = sinAcentos(genero).toLowerCase()
    if (vistos.has(clave)) continue
    vistos.add(clave)
    generos.push(genero)
  }

  return generos
}

export function parsePrecio(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return Math.round(value)
  const texto = limpiar(value)
  if (!texto) return null
  const digitos = texto.replace(/[^\d]/g, '')
  if (!digitos) return null
  const numero = Number(digitos)
  return Number.isFinite(numero) ? numero : null
}

export function formatearPrecio(precio) {
  if (typeof precio !== 'number' || !Number.isFinite(precio)) return ''
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
  }).format(precio)
}

export function normalizarPublicacion(value) {
  const clave = sinAcentos(limpiar(value)).toLowerCase()
  return PUBLICACIONES[clave] || null
}

export function normalizarTipo(value) {
  const clave = sinAcentos(limpiar(value)).toLowerCase()
  if (['libro', 'libros'].includes(clave)) return 'libro'
  if (['cuaderno', 'cuadernos', 'papeleria', 'papelería'].includes(clave)) return 'cuaderno'
  return null
}

export function etiquetaTipo(value) {
  return normalizarTipo(value) === 'cuaderno' ? 'Cuaderno' : 'Libro'
}

export function etiquetaPublicacion(value) {
  const publicacion = normalizarPublicacion(value)
  if (publicacion === 'vendido') return 'Vendido'
  if (publicacion === 'borrador') return 'Borrador'
  return 'Publicado'
}

export function mapearValores(values) {
  if (!Array.isArray(values) || values.length === 0) {
    return { rows: [], headers: [], missing: [...HEADERS] }
  }

  const headers = values[0].map((valor) => limpiar(valor))
  const indice = new Map(
    headers.map((header, posicion) => [sinAcentos(header).toLowerCase(), posicion]),
  )

  const missing = HEADERS.filter(
    (header) => !indice.has(sinAcentos(header).toLowerCase()),
  )

  const rows = values.slice(1).map((fila, posicion) => {
    const row = { __fila: posicion + 2 }

    for (const header of HEADERS) {
      const columna = indice.get(sinAcentos(header).toLowerCase())
      row[header] = columna === undefined ? '' : fila[columna] ?? ''
    }

    return row
  })

  return { rows, headers, missing }
}

function filaVacia(row) {
  return HEADERS.every((header) => limpiar(row[header]) === '')
}

export function normalizarFilas(rows) {
  const libros = []
  const cuadernos = []
  const errors = []
  const warnings = []
  const slugsLibros = new Set()
  const slugsCuadernos = new Set()

  for (const row of rows) {
    if (!row || filaVacia(row)) continue

    const fila = row.__fila || 0
    const tipo = normalizarTipo(row.tipo)
    const publicacion = normalizarPublicacion(row.publicacion)
    const titulo = limpiar(row.titulo)
    const autor = limpiar(row.autor)
    const generos = normalizarGeneros(row.generos)
    const anio = limpiar(row.anio)
    const sinopsis = limpiar(row.sinopsis)
    const descripcion = limpiar(row.descripcion)
    const condicion = limpiar(row.condicion)
    const precio = parsePrecio(row.precio)
    const precioNota = limpiar(row.precio_nota)
    const imagen = limpiar(row.imagen)

    const erroresFila = []

    if (!tipo) erroresFila.push('"tipo" debe ser Libro o Cuaderno.')
    if (!publicacion) {
      erroresFila.push('"publicacion" debe ser Publicado, Vendido o Borrador.')
    }
    if (!titulo) erroresFila.push('Falta "titulo".')
    if (!imagen) erroresFila.push('Falta "imagen".')
    if (precio === null && !precioNota) {
      erroresFila.push('Falta "precio" (o "precio_nota").')
    }

    if (tipo === 'libro') {
      if (!autor) erroresFila.push('Falta "autor".')
      if (generos.length === 0) erroresFila.push('Falta al menos un "genero".')
    }

    if (tipo === 'cuaderno' && !descripcion) {
      erroresFila.push('Falta "descripcion".')
    }

    const esPublicado = publicacion === 'publicado'
    if (erroresFila.length > 0) {
      const mensaje = `Fila ${fila}: ${erroresFila.join(' ')}`
      if (esPublicado) {
        errors.push(mensaje)
      } else {
        warnings.push(mensaje)
      }
      continue
    }

    if (esPublicado && tipo === 'libro' && !sinopsis) {
      warnings.push(`Fila ${fila}: el libro no tiene "sinopsis".`)
    }
    if (esPublicado && tipo === 'libro' && !condicion) {
      warnings.push(`Fila ${fila}: no tiene "condicion".`)
    }

    let slug = slugify(titulo)
    if (tipo === 'libro' && autor) slug = slugify(`${titulo} ${autor}`)
    if (!slug) slug = `${tipo}-${fila}`

    const slugs = tipo === 'libro' ? slugsLibros : slugsCuadernos
    if (slugs.has(slug)) {
      let sufijo = 2
      while (slugs.has(`${slug}-${sufijo}`)) sufijo += 1
      slug = `${slug}-${sufijo}`
    }
    slugs.add(slug)

    const registro = {
      tipo,
      slug,
      titulo,
      autor: tipo === 'libro' ? autor : '',
      generos: tipo === 'libro' ? generos : [],
      anio: tipo === 'libro' ? anio : '',
      sinopsis: tipo === 'libro' ? sinopsis : '',
      descripcion: tipo === 'cuaderno' ? descripcion : '',
      estado: condicion,
      precio,
      precioTexto: formatearPrecio(precio),
      precioNota,
      imagen,
      publicacion,
      fila,
    }

    if (tipo === 'libro') libros.push(registro)
    if (tipo === 'cuaderno') cuadernos.push(registro)
  }

  return { libros, cuadernos, errors, warnings }
}

export function extraerNotaPrecio(value) {
  const texto = limpiar(value)
  const match = texto.match(/^\s*\$?\s*([\d.,]+)\s*(.*)$/)
  if (!match) return { precio: null, nota: texto }
  const precio = parsePrecio(match[1])
  const nota = limpiar(match[2]).replace(/^\(|\)$/g, '').trim()
  return { precio, nota }
}
