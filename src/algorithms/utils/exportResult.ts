import JSZip from 'jszip'
import JSPDF from 'jsPDF'
import html2canvas from 'html2canvas'
import { saveAs } from 'file-saver'
import { AlgorithmResult } from '../types/Result.types'
import { exportSimulation } from '../model'

window.html2canvas = html2canvas

export function isBlobApiSupported() {
  try {
    return !!new Blob()
  } catch (error) {
    return false
  }
}

export function saveFile(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  saveAs(blob, filename)
}

export async function exportAll(result: AlgorithmResult) {
  if (!result) {
    throw new Error(`Algorithm result expected, but got ${result}`)
  }

  const { deterministic, params } = result

  if (!(deterministic || params)) {
    console.error('Error: the results, and params, of the simulation cannot be exported')
    return
  }

  const zip = new JSZip()

  if (!params) {
    console.error('Error: the params of the simulation cannot be exported because they are null')
  } else {
    zip.file('covid.params.json', JSON.stringify(params, null, 2))
  }

  if (!deterministic) {
    console.error('Error: the results of the simulation cannot be exported because they are nondeterministic')
  } else {
    zip.file('covid.results.deterministic.tsv', exportSimulation(deterministic))
  }

  const zipFile = await zip.generateAsync({ type: 'blob' })
  saveAs(zipFile, 'covid.params.results.zip')
}

export function exportPdf() {
  const element = document.body

  html2canvas(element, {
    imageTimeout: 30000,
    backgroundColor: 'white',
    allowTaint: true,
    height: element.clientHeight,
    width: element.clientWidth,
    ignoreElements: (element) => {
      // Ignore modal backdrop. We do this here because there is no way
      // to add attributes to the react bootstrap modal backdrop.
      if (element.classList.contains('modal-backdrop')) return true
      return false
    },
    // Modify elements in the cloned document. This will only affect the PDF.
    onclone: (document) => {
      // If the severity card is collapsed, expand it.
      const collapseCard = document.querySelector('.collapse')
      if (collapseCard) collapseCard.classList.add('show')
    },
  })
    .then((canvas) => {
      const imgData = canvas.toDataURL('image/png')
      const imgWidth = 210
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      const pageHeight = 295
      const doc = new JSPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
        putOnlyUsedFonts: true,
        floatPrecision: 16,
      })
      let heightLeft = imgHeight
      let position = 0

      doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)

      heightLeft -= pageHeight
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        doc.addPage()
        doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }
      return doc.save('covid_scenarios.pdf')
    })
    .catch((error) => {
      console.error(error)
    })
}

export function exportResult(result: AlgorithmResult) {
  if (!result) {
    throw new Error(`Algorithm result expected, but got ${result}`)
  }

  const { deterministic } = result

  if (!isBlobApiSupported()) {
    // TODO: Display an error popup
    console.error('Error: export is not supported in this browser: `Blob()` API is not implemented')
    return
  }

  if (!deterministic) {
    console.error('Error: the results of the simulation cannot be exported because they are nondeterministic')
    return
  }

  saveFile(exportSimulation(deterministic), 'covid.results.deterministic.tsv')
}

export function exportParams(result: AlgorithmResult) {
  if (!result) {
    throw new Error(`Algorithm result expected, but got ${result}`)
  }

  const { params } = result

  if (!isBlobApiSupported()) {
    // TODO: Display an error popup
    console.error('Error: export is not supported in this browser: `Blob()` API is not implemented')
    return
  }

  if (!params) {
    console.error('Error: the params of the simulation cannot be exported because they are null')
    return
  }

  saveFile(JSON.stringify(params, null, 2), 'covid.params.json')
}
