import { useMemo } from 'react'
import BookCard from './BookCard'
import { BookX } from 'lucide-react'

const normalizar = (texto) =>
  String(texto ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()

export default function BookGrid({ libros, generoActivo, busqueda }) {
  const librosFiltrados = useMemo(() => {
    const query = normalizar(busqueda.trim())

    return libros.filter((libro) => {
      const matchGenero =
        generoActivo === 'Todos los Géneros' ||
        libro.generos.includes(generoActivo)

      if (!matchGenero) return false
      if (!query) return true

      const contenido = normalizar(
        [
          libro.titulo,
          libro.autor,
          libro.anio,
          ...libro.generos,
          libro.sinopsis,
        ].join(' '),
      )

      return contenido.includes(query)
    })
  }, [libros, generoActivo, busqueda])

  return (
    <section className="pb-16">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-display font-bold text-brand-blue">
            Disponibles
          </h2>
          <p className="text-brand-blue/50 text-sm mt-1">
            {librosFiltrados.length}{' '}
            {librosFiltrados.length === 1
              ? 'libro encontrado'
              : 'libros encontrados'}
          </p>
        </div>
      </div>

      {librosFiltrados.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6 items-start stagger-children">
          {librosFiltrados.map((libro) => (
            <BookCard key={libro.slug || libro.titulo} libro={libro} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <BookX className="w-16 h-16 text-brand-blue/20 mx-auto mb-4" />
          <h3 className="text-xl font-display font-semibold text-brand-blue/60 mb-2">
            No se encontraron libros
          </h3>
          <p className="text-brand-blue/40 text-sm max-w-md mx-auto">
            Intenta con otro género o término de búsqueda. ¡Nuestro catálogo se
            actualiza frecuentemente!
          </p>
        </div>
      )}
    </section>
  )
}
