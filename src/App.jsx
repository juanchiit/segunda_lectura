import { useState } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import CategoryFilter from './components/CategoryFilter'
import BookGrid from './components/BookGrid'
import NotebookSection from './components/NotebookSection'
import Footer from './components/Footer'
import {
  cuadernos,
  estadisticas,
  generos,
  libros,
  tieneCuadernos,
} from './data/catalogo'

function App() {
  const [generoActivo, setGeneroActivo] = useState('Todos los Géneros')
  const [busqueda, setBusqueda] = useState('')

  return (
    <div className="min-h-screen bg-brand-cream">
      <Navbar
        busqueda={busqueda}
        setBusqueda={setBusqueda}
        mostrarCuadernos={tieneCuadernos}
      />
      <Hero
        totalLibros={estadisticas.libros}
        totalGeneros={estadisticas.generos}
      />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <section id="libros" className="pt-8 pb-4 scroll-mt-24">
          <CategoryFilter
            generos={generos}
            generoActivo={generoActivo}
            setGeneroActivo={setGeneroActivo}
          />
        </section>
        <BookGrid
          libros={libros}
          generoActivo={generoActivo}
          busqueda={busqueda}
        />
        <NotebookSection cuadernos={cuadernos} />
      </main>
      <Footer mostrarCuadernos={tieneCuadernos} />
    </div>
  )
}

export default App
