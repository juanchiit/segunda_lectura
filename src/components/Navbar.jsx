import { useState } from 'react'
import { Menu, X, Search, Instagram } from 'lucide-react'

export default function Navbar({ busqueda, setBusqueda, mostrarCuadernos }) {
  const [menuOpen, setMenuOpen] = useState(false)

  const navLinks = [
    { label: 'Libros', href: '#libros' },
    ...(mostrarCuadernos
      ? [{ label: 'Cuadernos', href: '#cuadernos' }]
      : []),
    { label: 'Instagram', href: 'https://instagram.com/segundalectura___', external: true },
  ]

  return (
    <header className="sticky top-0 z-50 bg-brand-cream/95 backdrop-blur-md border-b border-brand-cream-dark shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Brand */}
          <a href="/" className="flex items-center group" aria-label="Segunda Lectura, inicio">
            <img
              src="/logo-sl.png"
              alt="Segunda Lectura"
              className="h-12 md:h-16 w-auto object-contain transition-transform group-hover:scale-[1.02]"
            />
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-blue/40" />
              <input
                type="text"
                aria-label="Buscar libro o autor"
                placeholder="Buscar libro o autor..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="pl-10 pr-4 py-2 w-64 bg-white/70 border border-brand-cream-dark rounded-full text-sm text-brand-blue placeholder:text-brand-blue/40 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:bg-white transition-all"
              />
            </div>

            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target={link.external ? '_blank' : undefined}
                rel={link.external ? 'noopener noreferrer' : undefined}
                className="text-brand-blue/70 hover:text-brand-blue font-medium text-sm transition-colors flex items-center gap-1.5"
              >
                {link.label === 'Instagram' && <Instagram className="w-4 h-4" />}
                {link.label}
              </a>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 text-brand-blue rounded-lg hover:bg-brand-blue/5 transition-colors"
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={menuOpen}
            aria-controls="menu-movil"
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div id="menu-movil" className="md:hidden pb-4 border-t border-brand-cream-dark animate-fade-in-up">
            {/* Mobile Search */}
            <div className="relative mt-3 mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-blue/40" />
              <input
                type="text"
                aria-label="Buscar libro o autor"
                placeholder="Buscar libro o autor..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="pl-10 pr-4 py-2.5 w-full bg-white/70 border border-brand-cream-dark rounded-full text-sm text-brand-blue placeholder:text-brand-blue/40 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:bg-white transition-all"
              />
            </div>

            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target={link.external ? '_blank' : undefined}
                rel={link.external ? 'noopener noreferrer' : undefined}
                onClick={() => setMenuOpen(false)}
                className="block py-2.5 px-2 text-brand-blue/70 hover:text-brand-blue hover:bg-brand-blue/5 font-medium text-sm rounded-lg transition-colors flex items-center gap-2"
              >
                {link.label === 'Instagram' && <Instagram className="w-4 h-4" />}
                {link.label}
              </a>
            ))}
          </div>
        )}
      </div>
    </header>
  )
}
