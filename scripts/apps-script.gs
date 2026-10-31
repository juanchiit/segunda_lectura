/**
 * Segunda Lectura — publicación automática desde Google Sheets.
 *
 * Uso:
 * 1. Abre la hoja de cálculo.
 * 2. Extensiones > Apps Script.
 * 3. Pega este archivo completo y guarda.
 * 4. Ejecuta la función "configurar" y pega la URL del build hook de Netlify.
 * 5. Ejecuta la función "instalarTrigger" y autoriza los permisos.
 *
 * El build se pide 5 minutos después del último cambio en la hoja Catálogo.
 * Netlify mantiene la última versión buena si el build falla por datos inválidos.
 */

const HOJA_CATALOGO = 'Catálogo'
const ESPERA_MS = 5 * 60 * 1000
const PROPIEDAD_HOOK = 'NETLIFY_BUILD_HOOK'
const PROPIEDAD_PENDIENTE = 'ULTIMO_CAMBIO'

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Segunda Lectura')
    .addItem('Configurar build hook', 'configurar')
    .addItem('Instalar activador', 'instalarTrigger')
    .addItem('Publicar ahora', 'publicarAhora')
    .addToUi()
}

function configurar() {
  const ui = SpreadsheetApp.getUi()
  const respuesta = ui.prompt(
    'Build hook de Netlify',
    'Pega la URL del build hook de Netlify:',
    ui.ButtonSet.OK_CANCEL,
  )

  if (respuesta.getSelectedButton() !== ui.Button.OK) return

  const hook = respuesta.getResponseText().trim()
  if (!hook.startsWith('https://api.netlify.com/')) {
    ui.alert('La URL no parece un build hook de Netlify. No se guardó.')
    return
  }

  PropertiesService.getScriptProperties().setProperty(PROPIEDAD_HOOK, hook)
  ui.alert('Build hook guardado. Ahora ejecuta "Instalar activador".')
}

function instalarTrigger() {
  const triggers = ScriptApp.getProjectTriggers()

  const cambio = triggers.filter(
    (trigger) => trigger.getHandlerFunction() === 'alCambiar',
  )

  if (cambio.length === 0) {
    ScriptApp.newTrigger('alCambiar')
      .forSpreadsheet(SpreadsheetApp.getActive())
      .onChange()
      .create()
  }

  triggers
    .filter(
      (trigger) => trigger.getHandlerFunction() === 'publicarSiCorresponde',
    )
    .forEach((trigger) => ScriptApp.deleteTrigger(trigger))

  ScriptApp.newTrigger('publicarSiCorresponde')
    .timeBased()
    .everyMinutes(1)
    .create()

  SpreadsheetApp.getUi().alert(
    'Activador instalado. La web se publicará 5 minutos después del último cambio.',
  )
}

function alCambiar(evento) {
  const hoja = evento?.source?.getActiveSheet?.()
  if (hoja && hoja.getName() !== HOJA_CATALOGO) return

  PropertiesService.getScriptProperties().setProperty(
    PROPIEDAD_PENDIENTE,
    String(Date.now()),
  )
}

function publicarSiCorresponde() {
  const propiedades = PropertiesService.getScriptProperties()
  const ultimoCambio = Number(
    propiedades.getProperty(PROPIEDAD_PENDIENTE) || 0,
  )

  if (!ultimoCambio) return

  const restante = ESPERA_MS - (Date.now() - ultimoCambio)
  if (restante > 0) return

  propiedades.deleteProperty(PROPIEDAD_PENDIENTE)

  try {
    lanzarBuild()
  } catch (error) {
    console.error(error)
  }
}

function publicarAhora() {
  const propiedades = PropertiesService.getScriptProperties()
  propiedades.deleteProperty(PROPIEDAD_PENDIENTE)

  lanzarBuild()
  SpreadsheetApp.getUi().alert(
    'Build solicitado. La web puede tardar unos minutos en actualizarse.',
  )
}

function lanzarBuild() {
  const propiedades = PropertiesService.getScriptProperties()
  const hook = propiedades.getProperty(PROPIEDAD_HOOK)

  if (!hook) {
    throw new Error(
      'Falta el build hook. Ejecuta "Configurar build hook" desde el menú Segunda Lectura.',
    )
  }

  const respuesta = UrlFetchApp.fetch(hook, {
    method: 'post',
    muteHttpExceptions: true,
  })

  const codigo = respuesta.getResponseCode()
  if (codigo < 200 || codigo >= 300) {
    throw new Error(
      `Netlify respondió ${codigo}: ${respuesta.getContentText()}`,
    )
  }
}
