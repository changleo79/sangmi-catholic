import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist'
import workerSrc from 'pdfjs-dist/build/pdf.worker?url'

GlobalWorkerOptions.workerSrc = workerSrc

export async function extractPdfText(url: string): Promise<string> {
  try {
    const loadingTask = getDocument({ url })
    const pdf = await loadingTask.promise
    const textChunks: string[] = []

    for (let i = 1; i <= pdf.numPages; i += 1) {
      const page = await pdf.getPage(i)
      const content = await page.getTextContent()
      const pageText = content.items
        .map((item) => {
          if (typeof (item as any).str === 'string') {
            return (item as any).str
          }
          return ''
        })
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim()

      if (pageText) {
        textChunks.push(pageText)
      }
    }

    return textChunks.join('\n\n')
  } catch (error) {
    console.error('PDF 텍스트 추출 실패:', error)
    return ''
  }
}

export async function fetchPdfBlob(url: string): Promise<Blob | null> {
  try {
    const response = await fetch(url)
    if (!response.ok) return null
    return await response.blob()
  } catch (error) {
    console.error('PDF 다운로드 실패:', error)
    return null
  }
}
