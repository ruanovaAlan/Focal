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
      const text = extractText(doc)
      const chunkWords = tokenize(text)
      words.push(...chunkWords)
    } catch (e) {
      // skip sections that fail to load
      console.log('Error extracting text: ', e);

    }
  }

  return {
    words,
    title: metadata.title || file.name.replace('.epub', ''),
    author: metadata.creator || '',
  }
}

function extractText(doc) {
  // Remove script/style nodes
  const clone = doc.cloneNode ? doc : doc.documentElement
  const scripts = clone.querySelectorAll?.('script, style') || []
  scripts.forEach(el => el.remove())

  return clone.textContent || clone.innerText || ''
}

function tokenize(text) {
  return text
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .map(w => w.trim())
    .filter(w => w.length > 0)
}
