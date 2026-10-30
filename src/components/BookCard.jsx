import { Star, ShoppingBag } from 'lucide-react'
import ExpandableText from './ExpandableText'
import { manejarErrorImagen, optimizarImagen } from '../utils/imagen'

const INSTAGRAM = 'https://instagram.com/segundalectura___'

const getEstadoColor = (estado) => {
  const normalizado = String(estado ?? '').toLowerCase()

  if (normalizado.includes('nuevo') || normalizado.includes('sin leer')) {
    return 'bg-purple-100 text-purple-700'
  }
  if (
    normalizado.includes('impecable') ||
    normalizado.includes('como nuevo') ||
    normalizado.includes('excelente')
  ) {
    return 'bg-emerald-100 text-emerald-700'
  }
  if (normalizado.includes('muy bueno')) {
    return 'bg-blue-100 text-blue-700'
  }

  return 'bg-amber-100 text-amber-700'
}

export default function BookCard({ libro }) {
  const generoPrincipal = libro.generos?.[0]
  const precioPrincipal =
    libro.precioTexto || libro.precioNota || 'Consultar'
  const mostrarNota = Boolean(libro.precioTexto && libro.precioNota)
  const autorAnio = [
    libro.autor ? `Por ${libro.autor}` : '',
    libro.anio,
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <article className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-brand-cream-dark/50 hover:border-brand-blue/10 hover:-translate-y-1">
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
        <img
          src={optimizarImagen(libro.imagen)}
          alt={`Portada de ${libro.titulo}${libro.autor ? ` de ${libro.autor}` : ''}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          decoding="async"
          onError={manejarErrorImagen}
        />

        {generoPrincipal && (
          <div className="absolute top-3 left-3 max-w-[calc(100%-1.5rem)]">
            <span
              className="inline-block px-2.5 py-1 bg-brand-blue/90 text-brand-cream text-[11px] font-semibold rounded-full backdrop-blur-sm truncate"
              title={libro.generos.join(' · ')}
            >
              {generoPrincipal}
            </span>
          </div>
        )}

        <div className="absolute inset-0 bg-brand-blue/0 group-hover:bg-brand-blue/10 transition-colors duration-300 pointer-events-none" />
      </div>

      <div className="p-4">
        <h3 className="font-display font-semibold text-brand-blue text-base leading-tight line-clamp-2 mb-1 group-hover:text-brand-blue/80 transition-colors">
          {libro.titulo}
        </h3>

        {autorAnio && (
          <p className="text-brand-blue/50 text-sm mb-3">{autorAnio}</p>
        )}

        {libro.estado && (
          <div className="flex items-center gap-2 mb-3">
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getEstadoColor(libro.estado)}`}
            >
              <Star className="w-3 h-3 shrink-0" />
              {libro.estado}
            </span>
          </div>
        )}

        <ExpandableText
          text={libro.sinopsis}
          lines={2}
          wrapperClassName="mb-3"
          className="text-brand-blue/60 text-xs leading-relaxed"
        />

        <div className="flex items-end justify-between gap-3 pt-3 border-t border-brand-cream-dark/50">
          <div className="min-w-0">
            <span className="text-xs text-brand-blue/40 block">Precio</span>
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-lg font-bold text-brand-blue">
                {precioPrincipal}
              </span>
              {mostrarNota && (
                <span className="text-[11px] font-medium text-brand-blue/50">
                  {libro.precioNota}
                </span>
              )}
            </div>
          </div>
          <a
            href={INSTAGRAM}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 rounded-xl bg-brand-blue/5 text-brand-blue hover:bg-brand-blue hover:text-brand-cream transition-all duration-200 shrink-0"
            title="Consultar disponibilidad por Instagram"
            aria-label={`Consultar ${libro.titulo} por Instagram`}
          >
            <ShoppingBag className="w-5 h-5" />
          </a>
        </div>
      </div>
    </article>
  )
}
