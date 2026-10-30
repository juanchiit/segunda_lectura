import { useState } from 'react'
import { ChevronDown, ChevronUp, Filter } from 'lucide-react'

const TODOS = 'Todos los Géneros'
const LIMITE = 12

export default function CategoryFilter({
  generos,
  generoActivo,
  setGeneroActivo,
}) {
  const [mostrarTodos, setMostrarTodos] = useState(false)

  if (generos.length === 0) return null

  const visibles = mostrarTodos ? generos : generos.slice(0, LIMITE)
  const activoOculto =
    !mostrarTodos && generoActivo !== TODOS && !visibles.includes(generoActivo)
  const chips = activoOculto ? [...visibles, generoActivo] : visibles
  const hayMas = generos.length > LIMITE

  const claseBoton = (activo) =>
    `px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
      activo
        ? 'bg-brand-blue text-brand-cream shadow-md shadow-brand-blue/25 scale-105'
        : 'bg-white text-brand-blue/70 hover:bg-brand-blue/5 hover:text-brand-blue border border-brand-cream-dark'
    }`

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-4 h-4 text-brand-blue/50" />
        <h3 className="text-sm font-semibold text-brand-blue/60 uppercase tracking-wider">
          Filtrar por género
        </h3>
      </div>

      <div id="filtros-generos" className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setGeneroActivo(TODOS)}
          aria-pressed={generoActivo === TODOS}
          className={claseBoton(generoActivo === TODOS)}
        >
          {TODOS}
        </button>

        {chips.map((genero) => {
          const activo = generoActivo === genero
          return (
            <button
              key={genero}
              type="button"
              onClick={() => setGeneroActivo(genero)}
              aria-pressed={activo}
              className={claseBoton(activo)}
            >
              {genero}
            </button>
          )
        })}

        {hayMas && (
          <button
            type="button"
            onClick={() => setMostrarTodos((valor) => !valor)}
            aria-expanded={mostrarTodos}
            aria-controls="filtros-generos"
            className="inline-flex items-center gap-1 px-4 py-2 rounded-full text-sm font-semibold text-brand-blue/70 hover:text-brand-blue bg-brand-blue/5 hover:bg-brand-blue/10 transition-colors"
          >
            {mostrarTodos ? 'Ver menos' : 'Ver más'}
            {mostrarTodos ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        )}
      </div>
    </div>
  )
}
