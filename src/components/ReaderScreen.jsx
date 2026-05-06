import { useState, useEffect, useRef, useCallback } from 'react'
import { ArrowLeft, Play, Pause, RotateCcw } from 'lucide-react'

function renderWord(word) {
  if (!word) return null
  const orpIndex = word.length - 1
  const before = word.slice(0, orpIndex)
  const orp = word[orpIndex]
  const after = word.slice(orpIndex + 1)
  return (
    <span className="reader-word select-none">
      <span>{before}</span>
      <span className="text-[var(--accent)]">{orp}</span>
      <span>{after}</span>
    </span>
  )
}

const wpmBtnClass =
  'bg-transparent border border-[var(--border)] rounded-md text-[var(--muted)] w-7 h-7 cursor-pointer font-mono text-[0.9rem] flex items-center justify-center transition-colors hover:text-[var(--accent)] hover:border-[var(--accent)]'

const iconBtnClass =
  'bg-transparent border border-[var(--border)] rounded-full text-[var(--muted)] w-11 h-11 cursor-pointer flex items-center justify-center transition-colors hover:text-[var(--text)] hover:border-[var(--accent)]'

export default function ReaderScreen({ book, onBack }) {
  const [wordIndex, setWordIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [wpm, setWpm] = useState(300)

  const wordIndexRef = useRef(0)
  const intervalRef = useRef(null)
  wordIndexRef.current = wordIndex

  useEffect(() => {
    if (!isPlaying) {
      clearInterval(intervalRef.current)
      return
    }

    intervalRef.current = setInterval(() => {
      const next = wordIndexRef.current + 1
      if (next >= book.words.length) {
        setIsPlaying(false)
        return
      }
      setWordIndex(next)
    }, 60000 / wpm)

    return () => clearInterval(intervalRef.current)
  }, [isPlaying, wpm, book.words.length])

  const togglePlay = useCallback(() => {
    setIsPlaying(prev => {
      if (!prev && wordIndexRef.current >= book.words.length - 1) {
        setWordIndex(0)
      }
      return !prev
    })
  }, [book.words.length])

  const restart = useCallback(() => {
    setIsPlaying(false)
    setWordIndex(0)
  }, [])

  const adjustWpm = useCallback((delta) => {
    setWpm(prev => Math.min(600, Math.max(200, prev + delta)))
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

  function handleProgressClick(e) {
    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = (e.clientX - rect.left) / rect.width
    const newIndex = Math.floor(ratio * book.words.length)
    setWordIndex(Math.max(0, Math.min(newIndex, book.words.length - 1)))
  }

  const progress = book.words.length > 1
    ? (wordIndex / (book.words.length - 1)) * 100
    : 0

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
            {book.title}
          </span>
          {book.author && (
            <span className="text-[0.65rem] text-[var(--muted)] truncate max-w-full">
              {book.author}
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
        {renderWord(book.words[wordIndex])}
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
        aria-valuemax={book.words.length - 1}
      >
        <div
          className="h-full bg-[var(--accent)] rounded-sm transition-[width] duration-100 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Counter */}
      <div className="text-[0.65rem] text-[var(--muted)] text-center pb-2 tracking-[0.06em]">
        {(wordIndex + 1).toLocaleString()} / {book.words.length.toLocaleString()}
      </div>
    </div>
  )
}
