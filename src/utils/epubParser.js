import Epub from 'epubjs'

/**
 * Loads an epub file and extracts all words in order.
 * Returns: { words: string[], title: string, author: string }
 */
export async function parseEpub(file) {
  const arrayBuffer = await file.arrayBuffer()
  const book = Epub(arrayBuffer)

  await book.ready

  const metadata = await book.loaded.metadata
  const spine = await book.loaded.spine

  const words = []

  for (const item of spine.items) {
    if (!item.href) continue

    try {
      const doc = await book.load(item.href)
      const text = extractText(doc.body || doc.documentElement)
      const chunkWords = tokenize(text)
      words.push(...chunkWords)
    } catch (e) {
      console.log('Error extracting text: ', e)
    }
  }

  return {
    words,
    title: metadata.title || file.name.replace('.epub', ''),
    author: metadata.creator || '',
  }
}

function extractText(node) {
  node.querySelectorAll('script, style').forEach(el => el.remove())
  return node.textContent || ''
}

function tokenize(text) {
  return text
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .map(w => w.trim())
    .filter(w => w.length > 0)
}
