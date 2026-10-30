import { Notebook } from 'lucide-react'
import ExpandableText from './ExpandableText'
import { manejarErrorImagen, optimizarImagen } from '../utils/imagen'

const INSTAGRAM = 'https://instagram.com/segundalectura___'

export default function NotebookSection({ cuadernos = [] }) {
  if (cuadernos.length === 0) return null

  return (
    <section id="cuadernos" className="pb-20 scroll-mt-24">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-brand-blue/10 rounded-xl flex items-center justify-center">
          <Notebook className="w-5 h-5 text-brand-blue" />
        </div>
        <div>
          <h2 className="text-2xl md:text-3xl font-display font-bold text-brand-blue">
            Cuadernos
          </h2>
          <p className="text-brand-blue/50 text-sm">
            Papelería y accesorios de lectura
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6 items-start">
        {cuadernos.map((item) => {
          const precioPrincipal =
            item.precioTexto || item.precioNota || 'Consultar'
          const mostrarNota = Boolean(item.precioTexto && item.precioNota)

          return (
            <article
              key={item.slug || item.titulo}
              className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-brand-cream-dark/50 hover:border-brand-blue/10"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                <img
                  src={optimizarImagen(item.imagen)}
                  alt={item.titulo}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                  decoding="async"
                  onError={manejarErrorImagen}
                />
                {item.estado && (
                  <div className="absolute top-3 right-3">
                    <span className="px-2.5 py-1 bg-purple-600/90 text-white text-[11px] font-semibold rounded-full backdrop-blur-sm">
                      {item.estado}
                    </span>
                  </div>
                )}
              </div>

              <div className="p-4">
                <h3 className="font-display font-semibold text-brand-blue text-sm leading-tight line-clamp-2 mb-1">
                  {item.titulo}
                </h3>

                <ExpandableText
                  text={item.descripcion}
                  lines={2}
                  wrapperClassName="mb-3"
                  className="text-brand-blue/40 text-xs leading-relaxed"
                />

                <div className="flex items-end justify-between gap-3 pt-2 border-t border-brand-cream-dark/50">
                  <div className="min-w-0">
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      <span className="text-base font-bold text-brand-blue">
                        {precioPrincipal}
                      </span>
                      {mostrarNota && (
                        <span className="text-[11px] font-medium text-brand-blue/50">
                          {item.precioNota}
                        </span>
                      )}
                    </div>
                  </div>
                  <a
                    href={INSTAGRAM}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-medium text-brand-blue/60 hover:text-brand-blue transition-colors underline underline-offset-2 shrink-0"
                    aria-label={`Consultar ${item.titulo} por Instagram`}
                  >
                    Consultar
                  </a>
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
