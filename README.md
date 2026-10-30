# Segunda Lectura

Sitio web de la librería de libros usados **Segunda Lectura**. El catálogo se
administra desde una hoja de Google Sheets y se publica automáticamente en
Netlify unos minutos después de cada cambio.

## Stack

- React 19 + Vite 6
- Tailwind CSS 3
- Google Sheets como CMS (API key)
- Netlify (build, funciones y build hooks)
- Prerender/SSR para SEO (JSON-LD, `robots.txt`, `sitemap.xml`)

## Estructura

```
src/                 Aplicación React
  components/        Navbar, Hero, filtros, grillas, footer
  data/              catalogo.json (snapshot generado) y helpers
  entry-server.jsx   Entrada para el prerender
shared/normalize.js  Validación y normalización de la hoja
scripts/             fetch-data, build-template, prerender, apps-script.gs
netlify/functions/   Función de estado del catálogo
public/              Imágenes, estado.html y assets estáticos
data/                Plantilla CSV y guía para cargar la hoja
```

## Requisitos

- Node.js 22
- Una hoja de Google Sheets compartida como lector
- Una API key con la Google Sheets API habilitada

## Desarrollo local

```bash
npm install
cp .env.example .env   # opcional: completar credenciales
npm run dev
```

Sin credenciales, el build usa `src/data/catalogo.json` como snapshot local.
Con `REQUIRE_SHEETS=1` se exige que Google Sheets responda.

Abrir:

- Tienda: http://localhost:5173/
- Estado del catálogo: http://localhost:5173/estado.html

## Variables de entorno

| Variable | Obligatoria | Descripción |
| --- | --- | --- |
| `GOOGLE_SHEETS_ID` | Sí | ID de la hoja (está en la URL de la hoja). |
| `GOOGLE_SHEETS_API_KEY` | Sí | API key con Google Sheets API habilitada. |
| `GOOGLE_SHEETS_TAB` | No | Nombre de la pestaña. Por defecto `Catálogo`. |
| `SITE_URL` | Sí en producción | URL pública sin barra final. |
| `REQUIRE_SHEETS` | No | `1` fuerza el uso de la hoja en builds locales. |

En Netlify `NETLIFY=true` hace que el build falle si faltan las credenciales,
para no publicar datos viejos por error.

## Datos: Google Sheets

1. Crear una hoja nueva y renombrar la pestaña a `Catálogo`.
2. Importar `data/plantilla-catalogo.csv`:
   Archivo > Importar > Subir > **Reemplazar hoja actual**.
3. Mantener las 12 columnas y sus nombres:
   `tipo, titulo, autor, generos, anio, sinopsis, descripcion, condicion, precio, precio_nota, imagen, publicacion`.
4. Compartir la hoja con "Cualquier persona con el enlace" como **Lector**.
5. En Google Cloud, habilitar **Google Sheets API** y crear una **API key**.
   Restringir la key solo a esa API (no por IP: se usa desde el servidor).
6. Copiar el ID de la hoja y la key a las variables de entorno.

Reglas de contenido:

- `tipo`: `Libro` o `Cuaderno`. Los libros van primero y los cuadernos al final.
- `generos`: separados con `|` (ej. `Fantasía juvenil | Romance | Misterio`).
- `precio`: solo el número (ej. `18000`). Aclaraciones en `precio_nota`.
- `imagen`: URL de Cloudinary o ruta local `/libros/archivo.jpg`. No usar Google Drive.
- `publicacion`: `Publicado` (visible), `Vendido` (oculto, conserva la fila) o `Borrador`.
- Los cuadernos solo requieren `tipo`, `titulo`, `descripcion`, `precio` e `imagen`.

La guía para el usuario final está en `data/LEEME.csv`.

## Scripts

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Servidor de desarrollo. |
| `npm run build` | Build completo: datos + cliente + SSR + prerender. |
| `npm run fetch-data` | Lee Google Sheets y genera `catalogo.json` y `estado.json`. |
| `npm run build:template` | Regenera plantilla CSV y snapshot desde `Libros/Catalogo_de_libros.txt`. |
| `npm run prerender` | Genera HTML prerenderizado, `robots.txt` y `sitemap.xml`. |
| `npm run preview` | Sirve el build de producción. |

## Despliegue en Netlify

1. Subir el repositorio a GitHub.
2. En Netlify: **Add new site > Import an existing project** y conectar el repo.
3. Configuración de build (también está en `netlify.toml`):
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Functions directory: `netlify/functions`
4. Cargar las variables de entorno en **Site configuration > Environment variables**:
   - `GOOGLE_SHEETS_ID`
   - `GOOGLE_SHEETS_API_KEY`
   - `GOOGLE_SHEETS_TAB=Catálogo`
   - `SITE_URL=https://<sitio>.netlify.app`
5. Lanzar el primer deploy.

Cada push a la rama principal vuelve a publicar el sitio.

## Publicación automática desde Sheets

El archivo `scripts/apps-script.gs` conecta la hoja con un build hook de Netlify.

1. Crear un build hook en Netlify:
   **Site configuration > Build & deploy > Build hooks > Add build hook**.
2. En la hoja: **Extensiones > Apps Script** y pegar `scripts/apps-script.gs`.
3. Guardar y ejecutar la función `configurar`; pegar la URL del build hook.
4. Ejecutar `instalarTrigger` y autorizar los permisos.
5. Probar **Segunda Lectura > Publicar ahora**.

El build se solicita 5 minutos después del último cambio en la pestaña
`Catálogo`. Si la hoja tiene errores, Netlify mantiene la última versión buena.

## Página de estado

`/estado.html` muestra si la hoja se puede publicar, con contadores y errores.
No está indexada (`noindex`) y no aparece en el sitemap.

- En producción consulta `/.netlify/functions/estado` (datos en vivo).
- En local usa `/estado.json` (generado por `npm run fetch-data`).

## Operación diaria

- Editar la hoja y esperar unos minutos: el sitio se reconstruye solo.
- Revisar `/estado.html` si un cambio no aparece.
- Para ocultar un libro sin borrarlo, cambiar `publicacion` a `Vendido`.
- Las imágenes locales se guardan en `public/libros/`.

## Solución de problemas

- **El build falla por columnas**: revisar que existan las 12 columnas con sus nombres.
- **El build falla por filas**: `/estado.html` indica fila y error exacto.
- **La hoja responde 403/404**: verificar que esté compartida como lector y que la API key sea válida.
- **El sitio no se actualiza**: revisar el build hook en Apps Script y los deploys en Netlify.
- **Canonical/sitemap con URL incorrecta**: corregir `SITE_URL` y volver a desplegar.

## Seguridad

- La API key se usa solo en el build y en la función de Netlify; nunca se envía al navegador.
- No commitear `.env` (ya está en `.gitignore`).
- Restringir la API key a Google Sheets API.
