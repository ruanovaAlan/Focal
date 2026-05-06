import { useState } from 'react'
import FileDropzone from './components/FileDropzone'
import ReaderScreen from './components/ReaderScreen'
import { parseEpub } from './utils/epubParser'

export default function App() {
  const [screen, setScreen] = useState('home') // 'home' | 'loading' | 'reader'
  const [book, setBook] = useState(null)
  const [loadError, setLoadError] = useState(null)

  async function handleFileSelected(file) {
    setScreen('loading')
    setLoadError(null)
    try {
      const parsed = await parseEpub(file)
      setBook(parsed)
      setScreen('reader')
      console.log(parsed);

    } catch (e) {
      console.error(e)
      setLoadError('No se pudo leer el archivo. ¿Es un epub válido?')
      setScreen('home')
    }
  }

  return (
    <div className="app">
      {screen === 'home' && (
        <HomeScreen onFileSelected={handleFileSelected} error={loadError} />
      )}
      {screen === 'loading' && (
        <LoadingScreen />
      )}
      {screen === 'reader' && book && (
        <ReaderScreen book={book} onBack={() => { setBook(null); setScreen('home') }} />
      )}
    </div>
  )
}

function HomeScreen({ onFileSelected, error }) {
  return (
    <div className="home">
      <header className="home__header">
        <span className="home__logo">fluum</span>
        <span className="home__tagline">una palabra a la vez</span>
      </header>

      <main className="home__main">
        <FileDropzone onFileSelected={onFileSelected} />
        {error && <p className="home__error">{error}</p>}
      </main>

      <footer className="home__footer">
        <span>RSVP · Lectura de velocidad</span>
      </footer>
    </div>
  )
}

function LoadingScreen() {
  return (
    <div className="loading">
      <div className="loading__dot" />
      <p className="loading__text">Cargando libro...</p>
    </div>
  )
}
