import { useState, useRef, useCallback } from 'react'

export default function FileDropzone({ onFileSelected }) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState(null)
  const inputRef = useRef(null)

  const handleFile = useCallback((file) => {
    setError(null)
    if (!file) return

    const validTypes = ['application/epub+zip', 'application/epub']
    const validExt = file.name.toLowerCase().endsWith('.epub')

    if (!validTypes.includes(file.type) && !validExt) {
      setError('Solo se aceptan archivos .epub')
      return
    }

    onFileSelected(file)
  }, [onFileSelected])

  const onDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    handleFile(file)
  }, [handleFile])

  const onDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const onDragLeave = () => setIsDragging(false)

  const onInputChange = (e) => {
    handleFile(e.target.files[0])
  }

  return (
    <div className="dropzone-wrapper">
      <div
        className={`dropzone ${isDragging ? 'dropzone--active' : ''}`}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".epub"
          onChange={onInputChange}
          style={{ display: 'none' }}
        />

        <div className="dropzone__icon">
          <BookIcon active={isDragging} />
        </div>

        <p className="dropzone__title">
          {isDragging ? 'Suelta aquí' : 'Sube tu libro'}
        </p>

        <p className="dropzone__subtitle">
          Arrastra un archivo <span>.epub</span> o haz clic para seleccionar
        </p>

        {error && (
          <p className="dropzone__error">{error}</p>
        )}
      </div>
    </div>
  )
}

function BookIcon({ active }) {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 24 24"
      fill="none"
      stroke={active ? 'var(--accent)' : 'currentColor'}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ transition: 'stroke 0.2s ease' }}
    >
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  )
}
