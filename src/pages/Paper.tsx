import React from 'react'

import paper from '../assets/text/COVID_model.pdf'

import PdfDocument from '../components/PdfDocument/PdfDocument'

function Paper() {
  return <PdfDocument file={paper} />
}

export default Paper
