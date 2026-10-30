const CLOUDINARY_MARKER = '/image/upload/'
const TRANSFORMACION = 'f_auto,q_auto,w_800'

export function optimizarImagen(url) {
  const valor = String(url ?? '').trim()
  if (!valor) return '/placeholder.svg'
  if (!valor.includes('res.cloudinary.com')) return valor

  const indice = valor.indexOf(CLOUDINARY_MARKER)
  if (indice === -1) return valor

  const inicio = indice + CLOUDINARY_MARKER.length
  const resto = valor.slice(inicio)

  if (/^(f_auto|q_auto|w_\d+|c_|h_\d+)/.test(resto)) return valor

  return `${valor.slice(0, inicio)}${TRANSFORMACION}/${resto}`
}

export function manejarErrorImagen(event) {
  const imagen = event.currentTarget
  if (imagen.dataset.fallback === '1') return
  imagen.dataset.fallback = '1'
  imagen.src = '/placeholder.svg'
}
