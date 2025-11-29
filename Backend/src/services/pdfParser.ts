import pdf from 'pdf-parse'

export interface ParsedPDF {
  text: string
  numPages: number
  info?: any
}

/**
 * Parse PDF buffer and extract text content
 */
export const parsePDF = async (buffer: Buffer): Promise<ParsedPDF> => {
  try {
    const data = await pdf(buffer)
    
    return {
      text: data.text,
      numPages: data.numpages,
      info: data.info,
    }
  } catch (error) {
    throw new Error(`Failed to parse PDF: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

