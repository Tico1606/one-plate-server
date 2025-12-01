import { Buffer } from 'node:buffer'
import type { RecipeDTO, RecipeIngredientDTO } from '@/types/dtos.ts'

const PAGE_WIDTH = 612 // 8.5 pol * 72 dpi
const PAGE_HEIGHT = 792 // 11 pol * 72 dpi
const PAGE_MARGIN = 50
const DEFAULT_FONT_SIZE = 12
const TITLE_FONT_SIZE = 20
const SUBTITLE_FONT_SIZE = 14
const MAX_LINE_CHARACTERS = 90

type FontSize = typeof DEFAULT_FONT_SIZE | typeof TITLE_FONT_SIZE | typeof SUBTITLE_FONT_SIZE | number

function sanitizeFileName(title: string): string {
  const normalized = title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

  return (normalized || 'receita').toLowerCase()
}

function textToPdfHex(text: string): string {
  if (!text) {
    return ''
  }

  const normalized = text.normalize('NFC')
  const sanitized = normalized.replace(/[\u0000-\u001f]/g, ' ').replace(/\s+/g, ' ')

  const safeBuffer = Buffer.from(
    sanitized.replace(
      /[^\u0000-\u00ff]/g,
      (match) => (match.codePointAt(0) ?? 0) <= 0xff ? match : '?',
    ),
    'latin1',
  )

  return safeBuffer.toString('hex').toUpperCase()
}

function wrapText(text: string, maxLength = MAX_LINE_CHARACTERS): string[] {
  if (!text) {
    return []
  }

  const normalized = text.replace(/\s+/g, ' ').trim()
  if (!normalized) {
    return []
  }

  const words = normalized.split(' ')
  const lines: string[] = []
  let currentLine = ''

  for (const word of words) {
    if (!currentLine) {
      currentLine = word
      continue
    }

    const tentative = `${currentLine} ${word}`
    if (tentative.length <= maxLength) {
      currentLine = tentative
    } else {
      lines.push(currentLine)
      if (word.length > maxLength) {
        // Quebrar palavras muito grandes
        const chunks = word.match(new RegExp(`.{1,${maxLength}}`, 'g')) ?? []
        currentLine = chunks.pop() ?? ''
        lines.push(...chunks)
      } else {
        currentLine = word
      }
    }
  }

  if (currentLine) {
    lines.push(currentLine)
  }

  return lines
}

class PdfContentBuilder {
  private pages: string[] = []
  private currentY = PAGE_HEIGHT - PAGE_MARGIN
  private currentContent = ''

  private getLineHeight(fontSize: FontSize): number {
    if (fontSize >= TITLE_FONT_SIZE) {
      return fontSize + 8
    }
    if (fontSize >= SUBTITLE_FONT_SIZE) {
      return fontSize + 6
    }
    if (fontSize <= 10) {
      return fontSize + 2
    }
    return fontSize + 4
  }

  private ensurePageSpace(fontSize: FontSize) {
    const lineHeight = this.getLineHeight(fontSize)
    if (this.currentY - lineHeight < PAGE_MARGIN) {
      this.startNewPage()
    }
  }

  private startNewPage() {
    if (this.currentContent) {
      this.pages.push(this.currentContent)
    } else if (this.pages.length === 0) {
      this.pages.push(
        `BT /F1 ${DEFAULT_FONT_SIZE} Tf 1 0 0 1 ${PAGE_MARGIN} ${PAGE_HEIGHT - PAGE_MARGIN} Tm <${textToPdfHex(
          ' ',
        )}> Tj ET\n`,
      )
    }

    this.currentContent = ''
    this.currentY = PAGE_HEIGHT - PAGE_MARGIN
  }

  addHeading(text: string, fontSize: FontSize = TITLE_FONT_SIZE) {
    this.addWrappedText(text, fontSize)
    this.addSpacer(fontSize / 2)
  }

  addWrappedText(
    text: string,
    fontSize: FontSize = DEFAULT_FONT_SIZE,
    options?: { indent?: number; maxLength?: number },
  ) {
    if (!text) {
      return
    }

    const indent = options?.indent ?? 0
    const maxLength =
      options?.maxLength ?? Math.max(40, MAX_LINE_CHARACTERS - Math.floor(indent / 4))

    const lines = wrapText(text, maxLength)
    for (const line of lines) {
      this.ensurePageSpace(fontSize)
      const hex = textToPdfHex(line)
      const x = PAGE_MARGIN + indent
      const command = `BT /F1 ${fontSize} Tf 1 0 0 1 ${x} ${this.currentY} Tm <${hex}> Tj ET\n`
      this.currentContent += command
      this.currentY -= this.getLineHeight(fontSize)
    }
  }

  addSpacer(size = DEFAULT_FONT_SIZE) {
    if (this.currentY - size < PAGE_MARGIN) {
      this.startNewPage()
      return
    }

    this.currentY -= size
  }

  finalize(): string[] {
    if (!this.currentContent) {
      this.currentContent = `BT /F1 ${DEFAULT_FONT_SIZE} Tf 1 0 0 1 ${PAGE_MARGIN} ${
        PAGE_HEIGHT - PAGE_MARGIN
      } Tm <${textToPdfHex(' ')}> Tj ET\n`
    }

    this.pages.push(this.currentContent)
    return this.pages
  }
}

function buildPdfDocument(pageContents: string[]): Buffer {
  const pages = pageContents.length > 0 ? pageContents : ['']
  const objects: string[] = []
  const pageObjectIds: number[] = []
  const addObject = (body: string) => {
    const id = objects.length + 1
    objects.push(`${id} 0 obj\n${body}\nendobj\n`)
    return id
  }

  const fontObjectId = addObject(
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
  )
  const pagesObjId = pages.length * 2 + 2

  for (const content of pages) {
    const safeContent =
      content ||
      `BT /F1 ${DEFAULT_FONT_SIZE} Tf 1 0 0 1 ${PAGE_MARGIN} ${PAGE_HEIGHT - PAGE_MARGIN} Tm <${textToPdfHex(
        ' ',
      )}> Tj ET\n`

    const streamContent = `<< /Length ${Buffer.byteLength(
      safeContent,
    )} >>\nstream\n${safeContent}\nendstream`
    const contentObjectId = addObject(streamContent)
    const pageObjectId = addObject(
      `<< /Type /Page /Parent ${pagesObjId} 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Contents ${contentObjectId} 0 R /Resources << /Font << /F1 ${fontObjectId} 0 R >> >> >>`,
    )
    pageObjectIds.push(pageObjectId)
  }

  const pagesObjectId = addObject(
    `<< /Type /Pages /Count ${pageObjectIds.length} /Kids [${pageObjectIds
      .map((id) => `${id} 0 R`)
      .join(' ')}] >>`,
  )
  const catalogObjectId = addObject(`<< /Type /Catalog /Pages ${pagesObjectId} 0 R >>`)

  let pdfBody = '%PDF-1.4\n'
  const xrefPositions: number[] = []
  let offset = pdfBody.length

  for (const object of objects) {
    xrefPositions.push(offset)
    pdfBody += object
    offset = pdfBody.length
  }

  pdfBody += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
  for (const position of xrefPositions) {
    pdfBody += `${position.toString().padStart(10, '0')} 00000 n \n`
  }

  pdfBody += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogObjectId} 0 R >>\nstartxref\n${offset}\n%%EOF`

  return Buffer.from(pdfBody, 'binary')
}

function formatIngredient(ingredient: RecipeIngredientDTO): string {
  const amount = ingredient.amount ?? undefined
  const unit = ingredient.unit ?? ''
  if (amount !== undefined && amount !== null) {
    const formattedAmount = Number.isInteger(amount) ? amount : Number(amount).toFixed(2)
    return unit
      ? `${formattedAmount} ${unit} - ${ingredient.name}`
      : `${formattedAmount} ${ingredient.name}`
  }

  if (unit) {
    return `${unit} - ${ingredient.name}`
  }

  return ingredient.name
}

export function buildRecipePdf(recipe: RecipeDTO): { buffer: Buffer; filename: string } {
  const builder = new PdfContentBuilder()

  builder.addHeading(recipe.title, TITLE_FONT_SIZE)
  builder.addWrappedText(`Autor: ${recipe.author.name || recipe.author.email}`, SUBTITLE_FONT_SIZE)

  if (recipe.description) {
    builder.addSpacer(10)
    builder.addWrappedText(recipe.description, DEFAULT_FONT_SIZE)
  }

  builder.addSpacer(12)
  builder.addHeading('Informacoes gerais', SUBTITLE_FONT_SIZE)
  builder.addWrappedText(`Dificuldade: ${recipe.difficulty}`)
  builder.addWrappedText(`Tempo de preparo: ${recipe.prepTime} min`)
  builder.addWrappedText(`Rendimento: ${recipe.servings} porcoes`)

  if (recipe.calories != null) {
    builder.addWrappedText(`Calorias: ${recipe.calories} kcal`)
  }

  if (recipe.proteinGrams != null || recipe.carbGrams != null || recipe.fatGrams != null) {
    const macros: string[] = []
    if (recipe.proteinGrams != null) {
      macros.push(`Proteinas: ${recipe.proteinGrams} g`)
    }
    if (recipe.carbGrams != null) {
      macros.push(`Carboidratos: ${recipe.carbGrams} g`)
    }
    if (recipe.fatGrams != null) {
      macros.push(`Gorduras: ${recipe.fatGrams} g`)
    }
    builder.addWrappedText(macros.join(' | '))
  }

  if (recipe.categories?.length) {
    builder.addWrappedText(
      `Categorias: ${recipe.categories.map((category) => category.name).join(', ')}`,
    )
  }

  builder.addSpacer(12)
  builder.addHeading('Ingredientes', SUBTITLE_FONT_SIZE)
  if (recipe.ingredients.length === 0) {
    builder.addWrappedText('Nenhum ingrediente cadastrado.')
  } else {
    for (const ingredient of recipe.ingredients) {
      builder.addWrappedText(`- ${formatIngredient(ingredient)}`, DEFAULT_FONT_SIZE, {
        indent: 10,
        maxLength: MAX_LINE_CHARACTERS - 6,
      })
    }
  }

  builder.addSpacer(12)
  builder.addHeading('Modo de preparo', SUBTITLE_FONT_SIZE)
  if (recipe.steps.length === 0) {
    builder.addWrappedText('Nenhum passo cadastrado.')
  } else {
    for (const step of recipe.steps.sort((a, b) => a.order - b.order)) {
      const title = `${step.order + 1}. ${step.description}`
      builder.addWrappedText(title, DEFAULT_FONT_SIZE, {
        indent: 10,
        maxLength: MAX_LINE_CHARACTERS - 6,
      })
      if (step.durationSec) {
        builder.addWrappedText(`   Duracao: ${Math.round(step.durationSec / 60)} min`, 10, {
          indent: 10,
        })
      }
      builder.addSpacer(6)
    }
  }

  if (recipe.source) {
    builder.addSpacer(12)
    builder.addHeading('Fonte', SUBTITLE_FONT_SIZE)
    builder.addWrappedText(recipe.source)
  }

  const filename = `${sanitizeFileName(recipe.title)}.pdf`
  const pages = builder.finalize()
  const buffer = buildPdfDocument(pages)

  return { buffer, filename }
}
