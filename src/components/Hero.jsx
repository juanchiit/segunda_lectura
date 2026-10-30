import { BookOpen, ArrowDown } from 'lucide-react'

export default function Hero({ totalLibros, totalGeneros }) {
  return (
    <section className="relative overflow-hidden bg-brand-blue text-brand-cream">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16">
          {/* Text Content */}
          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-brand-cream/80 text-xs font-medium mb-6 backdrop-blur-sm">
              <BookOpen className="w-3.5 h-3.5" />
              Librería de libros usados
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold leading-[1.1] mb-4">
              <span className="block">Read.</span>
              <span className="block italic font-semibold">Repeat.</span>
              <span className="block underline decoration-4 underline-offset-8 decoration-cream-400">Repeat.</span>
            </h1>

            <p className="text-brand-cream/70 text-base md:text-lg max-w-md mt-6 leading-relaxed mx-auto md:mx-0">
              Dale una segunda vida a cada historia. Libros usados en excelente estado, a precios que invitan a leer sin parar.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mt-8 justify-center md:justify-start">
              <a
                href="#libros"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand-cream text-brand-blue font-semibold rounded-full hover:bg-white transition-colors shadow-lg hover:shadow-xl"
              >
                Explorar catálogo
                <ArrowDown className="w-4 h-4" />
              </a>
              <a
                href="https://instagram.com/segundalectura___"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-brand-cream/30 text-brand-cream font-semibold rounded-full hover:bg-white/10 transition-colors"
              >
                Síguenos en Instagram
              </a>
            </div>
          </div>

          {/* Decorative Books Stack */}
          <div className="flex-shrink-0 hidden md:flex items-end gap-3">
            <div className="w-24 h-36 bg-cream-300/20 rounded-lg shadow-2xl transform -rotate-6 border border-white/10"></div>
            <div className="w-28 h-40 bg-cream-200/20 rounded-lg shadow-2xl transform rotate-3 border border-white/10"></div>
            <div className="w-24 h-36 bg-cream-400/20 rounded-lg shadow-2xl transform -rotate-3 border border-white/10"></div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-12 md:mt-16 pt-8 border-t border-white/10 max-w-lg mx-auto md:mx-0">
          <div>
            <div className="text-2xl md:text-3xl font-bold">{totalLibros}</div>
            <div className="text-brand-cream/50 text-xs md:text-sm">Libros disponibles</div>
          </div>
          <div>
            <div className="text-2xl md:text-3xl font-bold">{totalGeneros}</div>
            <div className="text-brand-cream/50 text-xs md:text-sm">Géneros</div>
          </div>
          <div>
            <div className="text-2xl md:text-3xl font-bold">50%</div>
            <div className="text-brand-cream/50 text-xs md:text-sm">Menos que nuevo</div>
          </div>
        </div>
      </div>
    </section>
  )
}
