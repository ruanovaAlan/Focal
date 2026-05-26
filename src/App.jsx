import { useState, useEffect } from 'react'
import { useLibrary } from './hooks/useLibrary'
import { getBookFile } from './lib/db'
import LibraryScreen from './components/LibraryScreen'
import ReaderScreen from './components/ReaderScreen'

export default function App() {
  const {
    books, isLoading, error,
    addBook, removeBook,
    updateProgress, getBookProgress, openBook,
  } = useLibrary()

  const [screen, setScreen] = useState('splash')
  const [splashExiting, setSplashExiting] = useState(false)
  const [currentBookId, setCurrentBookId] = useState(null)
  const [currentBookFile, setCurrentBookFile] = useState(null)

  useEffect(() => {
    const exitTimer = setTimeout(() => setSplashExiting(true), 2700)
    const screenTimer = setTimeout(() => setScreen('library'), 3000)
    return () => { clearTimeout(exitTimer); clearTimeout(screenTimer) }
  }, [])

  async function handleOpenBook(bookId) {
    try {
      setScreen('loading')
      const blob = await getBookFile(bookId)
      openBook(bookId)
      setCurrentBookId(bookId)
      setCurrentBookFile(blob)
      setScreen('reader')
    } catch (e) {
      console.error('Error al abrir el libro:', e)
      setScreen('library')
    }
  }

  const currentBookMeta = books.find(b => b.id === currentBookId) ?? null

  return (
    <div className="app">
      {screen === 'splash' && <SplashScreen exiting={splashExiting} />}

      {screen === 'reader' && currentBookFile && (
        <ReaderScreen
          bookFile={currentBookFile}
          bookMeta={currentBookMeta}
          bookId={currentBookId}
          updateProgress={updateProgress}
          getBookProgress={getBookProgress}
          onBack={() => setScreen('library')}
        />
      )}

      {screen !== 'reader' && screen !== 'splash' && (
        <div className="home">
          <header className="home__header">
            <span className="home__logo">fluum</span>
            <span className="home__tagline">una palabra a la vez</span>
          </header>

          {screen === 'library' && (
            <LibraryScreen
              books={books}
              isLoading={isLoading}
              error={error}
              addBook={addBook}
              removeBook={removeBook}
              onOpenBook={handleOpenBook}
            />
          )}

          {screen === 'loading' && <LoadingScreen />}

          <footer className="home__footer">
            <div className="w-10 mx-auto mb-3" style={{ height: '1px', background: 'var(--border)' }} />
            <span>RSVP · Lectura de velocidad</span>
          </footer>
        </div>
      )}
    </div>
  )
}

function LoadingScreen() {
  return (
    <div className="loading">
      <div className="loading__dot" />
      <p className="loading__text">Cargando...</p>
    </div>
  )
}

function SplashScreen({ exiting }) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: '#0c0c0d',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: '1.5rem',
        transition: 'opacity 0.3s ease',
        opacity: exiting ? 0 : 1,
      }}
    >
      <img
        src="/icon-512.png"
        className="fade-in scale-up"
        style={{ width: '8rem', height: '8rem' }}
        alt="Fluum"
      />
      <span
        className="fade-in"
        style={{
          fontFamily: "'Fraunces', serif",
          color: 'var(--accent)',
          fontSize: '2.5rem',
          fontWeight: 300,
          letterSpacing: '0.2em',
          animationDelay: '0.3s',
        }}
      >
        fluum
      </span>
      <span
        className="fade-in"
        style={{
          fontSize: '0.65rem',
          color: 'var(--muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          animationDelay: '0.6s',
        }}
      >
        una palabra a la vez
      </span>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px', background: 'var(--border)' }}>
        <div className="loading-bar-fill" style={{ height: '100%', background: 'var(--accent)' }} />
      </div>
    </div>
  )
}