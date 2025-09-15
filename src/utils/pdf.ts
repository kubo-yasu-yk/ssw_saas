import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

export async function exportPdfFromElement(elementId: string, filename: string) {
  const el = document.getElementById(elementId)
  if (!el) throw new Error(`Element #${elementId} not found`)
  const canvas = await html2canvas(el)
  const imgData = canvas.toDataURL('image/png')
  const pdf = new jsPDF('p', 'mm', 'a4')
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const imgWidth = pageWidth
  const imgHeight = (canvas.height * imgWidth) / canvas.width
  let position = 0
  let heightLeft = imgHeight

  pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
  heightLeft -= pageHeight
  while (heightLeft > 0) {
    position = heightLeft - imgHeight
    pdf.addPage()
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight
  }
  pdf.save(filename)
}

