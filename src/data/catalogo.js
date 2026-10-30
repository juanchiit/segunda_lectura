import snapshot from './catalogo.json'

const PUBLICADO = 'publicado'

export const libros = snapshot.libros.filter(
  (libro) => libro.publicacion === PUBLICADO,
)

export const cuadernos = snapshot.cuadernos.filter(
  (cuaderno) => cuaderno.publicacion === PUBLICADO,
)

const generosVistos = new Set()
export const generos = []

for (const libro of libros) {
  for (const genero of libro.generos) {
    if (generosVistos.has(genero)) continue
    generosVistos.add(genero)
    generos.push(genero)
  }
}

export const estadisticas = {
  libros: libros.length,
  cuadernos: cuadernos.length,
  generos: generos.length,
}

export const tieneCuadernos = cuadernos.length > 0

export const catalogoMeta = {
  generatedAt: snapshot.generatedAt,
  source: snapshot.source,
}
