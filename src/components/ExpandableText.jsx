import { useEffect, useRef, useState } from 'react'

const CLASES_LINEAS = {
  2: 'line-clamp-2',
  3: 'line-clamp-3',
  4: 'line-clamp-4',
}

export default function ExpandableText({
  text,
  lines = 2,
  className = '',
  buttonClassName = '',
  wrapperClassName = '',
}) {
  const contenido = String(text ?? '').trim()
  const ref = useRef(null)
  const [expandido, setExpandido] = useState(false)
  const [desborda, setDesborda] = useState(false)

  useEffect(() => {
    if (expandido) return
    const elemento = ref.current
    if (!elemento) return

    const medir = () => {
      setDesborda(elemento.scrollHeight > elemento.clientHeight + 1)
    }

    medir()

    const observer = new ResizeObserver(medir)
    observer.observe(elemento)

    return () => observer.disconnect()
  }, [expandido, contenido, lines])

  if (!contenido) return null

  const clamp = CLASES_LINEAS[lines] || CLASES_LINEAS[2]

  return (
    <div className={wrapperClassName}>
      <p
        ref={ref}
        className={`${className} ${expandido ? '' : clamp}`.trim()}
      >
        {contenido}
      </p>
      {desborda && (
        <button
          type="button"
          onClick={() => setExpandido((valor) => !valor)}
          aria-expanded={expandido}
          className={`mt-1 text-[11px] font-semibold text-brand-blue/70 hover:text-brand-blue underline underline-offset-2 transition-colors ${buttonClassName}`.trim()}
        >
          {expandido ? 'Ver menos' : 'Ver más'}
        </button>
      )}
    </div>
  )
}
