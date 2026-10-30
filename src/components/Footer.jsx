import { BookOpen, Instagram, Mail, Heart } from 'lucide-react'

export default function Footer({ mostrarCuadernos }) {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-brand-blue text-brand-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer */}
        <div className="py-12 md:py-16 grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand Column */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 bg-brand-cream/15 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-brand-cream" strokeWidth={1.8} />
              </div>
              <div>
                <span className="font-display font-bold text-lg">Segunda Lectura</span>
              </div>
            </div>
            <p className="text-brand-cream/50 text-sm leading-relaxed max-w-xs">
              Dale una segunda vida a cada historia. Libros usados cuidadosamente seleccionados, a precios accesibles.
            </p>
          </div>

          {/* Links Column */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-brand-cream/70 mb-4">
              Navegación
            </h4>
            <ul className="space-y-2.5">
              <li>
                <a href="#libros" className="text-brand-cream/50 hover:text-brand-cream text-sm transition-colors">
                  Catálogo de libros
                </a>
              </li>
              {mostrarCuadernos && (
                <li>
                  <a href="#cuadernos" className="text-brand-cream/50 hover:text-brand-cream text-sm transition-colors">
                    Cuadernos y papelería
                  </a>
                </li>
              )}
              <li>
                <a
                  href="https://instagram.com/segundalectura___"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-cream/50 hover:text-brand-cream text-sm transition-colors"
                >
                  Instagram
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-brand-cream/70 mb-4">
              Contacto
            </h4>
            <div className="space-y-3">
              <a
                href="https://instagram.com/segundalectura___"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-brand-cream/50 hover:text-brand-cream text-sm transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-brand-cream/10 flex items-center justify-center group-hover:bg-brand-cream/20 transition-colors">
                  <Instagram className="w-4 h-4" />
                </div>
                @segundalectura___
              </a>
              <a
                href="mailto:hola@segundalectura.cl"
                className="flex items-center gap-3 text-brand-cream/50 hover:text-brand-cream text-sm transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-brand-cream/10 flex items-center justify-center group-hover:bg-brand-cream/20 transition-colors">
                  <Mail className="w-4 h-4" />
                </div>
                hola@segundalectura.cl
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-5 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-brand-cream/30 text-xs" suppressHydrationWarning>
            © {currentYear} Segunda Lectura. Todos los derechos reservados.
          </p>
          <p className="text-brand-cream/30 text-xs flex items-center gap-1">
            Hecho con <Heart className="w-3 h-3 text-red-400 fill-red-400" /> para los amantes de los libros
          </p>
        </div>
      </div>
    </footer>
  )
}
