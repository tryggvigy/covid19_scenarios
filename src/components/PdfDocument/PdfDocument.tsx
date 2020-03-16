import React, { useState } from 'react'

import { Document, Page, pdfjs } from 'react-pdf/dist/entry.webpack'
import 'react-pdf/dist/Page/AnnotationLayer.css'

export interface PdfDocumentProps {
  file: File
}

export default function PdfDocument({ file }: PdfDocumentProps) {
  const [numPages, setNumPages] = useState<number | null>(null)

  const onDocumentLoadSuccess = ({ numPages }: pdfjs.PDFDocumentProxy) => {
    setNumPages(numPages)
  }

  const options = {
    cMapUrl: 'cmaps/',
    cMapPacked: true,
  }

  return (
    <Document file={file} onLoadSuccess={onDocumentLoadSuccess} options={options}>
      {[...new Array(numPages)].map((_0, index) => (
        <Page key={`page_${index + 1}`} pageNumber={index + 1} />
      ))}
    </Document>
  )
}
