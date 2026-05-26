import { useState, useEffect, useRef, useCallback } from 'react'
import { ArrowLeft, Play, Pause, RotateCcw } from 'lucide-react'
import ePub from 'epubjs'
import { getWPM, setWPM } from '../lib/storage'

async function parseWords(file) {
  const book = ePub(file)
  await book.ready
  await book.spine.ready

  const words = []
  for (const item of book.spine.spineItems) {
    try {
      await item.load(book.load.bind(book))
      const text = item.document?.body?.textContent ?? ''
      text.split(/\s+/).forEach(w => { if (w.trim()) words.push(w) })
      item.unload()
    } catch {
      // skip corrupt spine section
    }
  }
  return words
}

function renderWord(word) {
  if (!word) return null
  const orpIndex = Math.floor(word.length / 2)
  const before = word.slice(0, orpIndex)
  const orp = word[orpIndex]
  const after = word.slice(orpIndex + 1)
  return (
    <div className="reader-word select-none" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
      <span style={{ textAlign: 'right', flex: 1 }}>{before}</span>
      <span style={{ color: 'var(--accent)', flexShrink: 0 }}>{orp}</span>
      <span style={{ textAlign: 'left', flex: 1 }}>{after}</span>
    </div>
  )
}

const wpmBtnClass =
  'bg-transparent border border-[var(--border)] rounded-md text-[var(--muted)] w-7 h-7 cursor-pointer font-mono text-[0.9rem] flex items-center justify-center transition-colors hover:text-[var(--accent)] hover:border-[var(--accent)]'

const iconBtnClass =
  'bg-transparent border border-[var(--border)] rounded-full text-[var(--muted)] w-11 h-11 cursor-pointer flex items-center justify-center transition-colors hover:text-[var(--text)] hover:border-[var(--accent)]'

export default function ReaderScreen({ bookFile, bookMeta, onBack, bookId, updateProgress, getBookProgress }) {
  const [words, setWords] = useState(null)
  const [parseError, setParseError] = useState(null)
  const [wordIndex, setWordIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [wpm, setWpm] = useState(getWPM)

  const wordIndexRef = useRef(0)
  const intervalRef = useRef(null)

  useEffect(() => {
    wordIndexRef.current = wordIndex
  }, [wordIndex])

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const extracted = await parseWords(bookFile)
        if (cancelled) return
        setWords(extracted)

        const saved = await getBookProgress(bookId)
        if (!cancelled && saved !== null && typeof saved.percent === 'number' && extracted.length > 0) {
          const idx = Math.floor((saved.percent / 100) * extracted.length)
          setWordIndex(Math.max(0, Math.min(idx, extracted.length - 1)))
        }
      } catch {
        if (!cancelled) setParseError('No se pudo leer el libro')
      }
    }
    load()
    return () => { cancelled = true }
  }, [bookFile, bookId, getBookProgress])

  useEffect(() => {
    if (!isPlaying || !words) {
      clearInterval(intervalRef.current)
      return
    }

    const len = words.length
    intervalRef.current = setInterval(() => {
      const next = wordIndexRef.current + 1
      if (next >= len) {
        setIsPlaying(false)
        return
      }
      setWordIndex(next)
    }, 60000 / wpm)

    return () => clearInterval(intervalRef.current)
  }, [isPlaying, wpm, words])

  const togglePlay = useCallback(() => {
    setIsPlaying(prev => {
      if (!prev && wordIndexRef.current >= (words?.length ?? 1) - 1) {
        setWordIndex(0)
      }
      return !prev
    })
  }, [words])

  const restart = useCallback(() => {
    setIsPlaying(false)
    setWordIndex(0)
  }, [])

  const adjustWpm = useCallback((delta) => {
    setWpm(prev => {
      const next = Math.min(600, Math.max(200, prev + delta))
      setWPM(next)
      return next
    })
  }, [])

  useEffect(() => {
    function handleKey(e) {
      if (e.code === 'Space') { e.preventDefault(); togglePlay() }
      if (e.code === 'KeyR') { restart() }
      if (e.code === 'ArrowUp') { e.preventDefault(); adjustWpm(25) }
      if (e.code === 'ArrowDown') { e.preventDefault(); adjustWpm(-25) }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [togglePlay, restart, adjustWpm])

  useEffect(() => {
    if (!words) return
    const pct = words.length > 1 ? Math.floor((wordIndex / (words.length - 1)) * 100) : 0
    const timer = setTimeout(() => {
      updateProgress(bookId, null, pct)
    }, 2000)
    return () => clearTimeout(timer)
  }, [wordIndex, words, bookId, updateProgress])

  function handleProgressClick(e) {
    if (!words) return
    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = (e.clientX - rect.left) / rect.width
    const newIndex = Math.floor(ratio * words.length)
    setWordIndex(Math.max(0, Math.min(newIndex, words.length - 1)))
  }

  const progress = words && words.length > 1
    ? Math.floor((wordIndex / (words.length - 1)) * 100)
    : 0

  if (parseError) {
    return (
      <div className="loading">
        <p className="loading__text" style={{ color: '#e05c5c' }}>{parseError}</p>
        <button
          onClick={onBack}
          style={{ color: 'var(--muted)', fontSize: '0.75rem', marginTop: '1.5rem' }}
        >
          Volver a la biblioteca
        </button>
      </div>
    )
  }

  if (!words) {
    return (
      <div className="loading">
        <div className="loading__dot" />
        <p className="loading__text">Cargando libro...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-dvh p-4">
      {/* Header */}
      <header className="flex items-center gap-4 pb-4 border-b border-[var(--border)]">
        <button
          className="bg-transparent border border-[var(--border)] rounded-lg text-[var(--muted)] p-2 cursor-pointer flex items-center justify-center shrink-0 transition-colors hover:text-[var(--text)] hover:border-[var(--accent)]"
          onClick={onBack}
          aria-label="Volver"
        >
          <ArrowLeft size={18} />
        </button>

        <div className="flex flex-col items-center gap-0.5 flex-1 min-w-0">
          <span
            className="text-sm font-light text-[var(--text)] truncate max-w-full"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            {bookMeta?.title ?? ''}
          </span>
          {bookMeta?.author && (
            <span className="text-[0.65rem] text-[var(--muted)] truncate max-w-full">
              {bookMeta.author}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-[0.7rem] text-[var(--muted)] tracking-[0.04em] shrink-0">
          <button className={wpmBtnClass} onClick={() => adjustWpm(-25)} aria-label="Reducir velocidad">−</button>
          <span>{wpm} ppm</span>
          <button className={wpmBtnClass} onClick={() => adjustWpm(25)} aria-label="Aumentar velocidad">+</button>
        </div>
      </header>

      {/* Word stage */}
      <main className="flex-1 flex items-center justify-center p-8">
        {renderWord(words[wordIndex])}
      </main>

      {/* Controls */}
      <div className="flex items-center justify-center gap-6 py-4">
        <button className={iconBtnClass} onClick={restart} aria-label="Reiniciar">
          <RotateCcw size={18} />
        </button>
        <button
          className="bg-transparent border border-[var(--accent)] rounded-full text-[var(--accent)] w-14 h-14 cursor-pointer flex items-center justify-center transition-colors hover:bg-[var(--accent-dim)]"
          onClick={togglePlay}
          aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
        >
          {isPlaying ? <Pause size={22} /> : <Play size={22} />}
        </button>
      </div>

      {/* Progress bar */}
      <div
        className="h-1 bg-[var(--surface)] rounded-sm cursor-pointer my-2 overflow-hidden"
        onClick={handleProgressClick}
        role="progressbar"
        aria-valuenow={wordIndex}
        aria-valuemax={words.length - 1}
      >
        <div
          className="h-full bg-[var(--accent)] rounded-sm transition-[width] duration-100 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Counter */}
      <div className="text-[0.65rem] text-[var(--muted)] text-center pb-2 tracking-[0.06em]">
        {(wordIndex + 1).toLocaleString()} / {words.length.toLocaleString()}
      </div>
    </div>
  )
}
