import { useRef } from 'react';
import FileDropzone from './FileDropzone';

const MAX_BOOKS = 1;

export default function LibraryScreen({ books, isLoading, error, addBook, removeBook, onOpenBook }) {
  const inputRef = useRef(null);

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (file) addBook(file);
    e.target.value = '';
  }

  const atLimit = books.length >= MAX_BOOKS;

  if (isLoading) {
    return (
      <div className="loading">
        <div className="loading__dot" />
        <p className="loading__text">Cargando biblioteca...</p>
      </div>
    );
  }

  return (
    <>
      <main className="home__main">
        {books.length === 0 ? (
          <>
            <FileDropzone onFileSelected={addBook} />
            {error && <p className="home__error">{error}</p>}
          </>
        ) : (
          <>
            {/* MOBILE: carrusel horizontal */}
            <div className="flex sm:hidden w-full flex-1 flex-col justify-center">
              <div
                className="flex overflow-x-auto snap-x snap-mandatory"
                style={{
                  gap: '1rem',
                  paddingLeft: '2rem',
                  paddingRight: '2rem',
                  paddingBottom: '0.5rem',
                  scrollbarWidth: 'none',
                  WebkitOverflowScrolling: 'touch',
                }}
              >
                {books.map((book) => (
                  <div
                    key={book.id}
                    className="snap-center shrink-0"
                    style={{ width: '75vw', maxWidth: '320px' }}
                  >
                    <BookCard
                      book={book}
                      onOpen={() => onOpenBook(book.id)}
                      onRemove={(e) => { e.stopPropagation(); removeBook(book.id); }}
                    />
                  </div>
                ))}
              </div>

              {/* Botón añadir debajo del carrusel */}
              {!atLimit && (
                <div className="px-8 mt-4">
                  <AddBookRow onClick={() => inputRef.current?.click()} />
                </div>
              )}

              {atLimit && (
                <div className="flex justify-center mt-12 px-8">
                  <LimitBadge limit={MAX_BOOKS} />
                </div>
              )}
            </div>

            {/* DESKTOP: centrado */}
            <div className="hidden sm:flex w-full flex-1 items-center justify-center">
              <div className="flex flex-col items-center gap-6">
                {books.map((book) => (
                  <div key={book.id} style={{ width: '30vw', maxWidth: '280px' }}>
                    <BookCard
                      book={book}
                      onOpen={() => onOpenBook(book.id)}
                      onRemove={(e) => { e.stopPropagation(); removeBook(book.id); }}
                    />
                  </div>
                ))}
                {!atLimit && (
                  <div style={{ width: '30vw', maxWidth: '280px' }}>
                    <AddBookCard onClick={() => inputRef.current?.click()} />
                  </div>
                )}
                {atLimit && <LimitBadge limit={MAX_BOOKS} />}
              </div>
            </div>

            {error && <p className="home__error mt-2">{error}</p>}
          </>
        )}
      </main>

      <input
        ref={inputRef}
        type="file"
        accept=".epub"
        className="hidden"
        onChange={handleFileChange}
      />
    </>
  );
}

function BookCard({ book, onOpen, onRemove }) {
  const percent = book.percent ?? 0;

  return (
    <div className="flex flex-col cursor-pointer group" onClick={onOpen}>
      <div
        className="relative w-full rounded-xl overflow-hidden mb-3"
        style={{ aspectRatio: '2/3', background: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        {book.coverUrl ? (
          <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookIcon size={28} />
          </div>
        )}
        <button
          onClick={onRemove}
          aria-label="Eliminar libro"
          className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center opacity-60 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
          style={{ background: 'rgba(0,0,0,0.7)' }}
        >
          <XIcon />
        </button>
      </div>

      <div className="flex flex-col gap-1 px-0.5">
        <p className="leading-snug line-clamp-2" style={{ fontFamily: "'Fraunces', serif", fontSize: '0.9rem', fontWeight: 300, color: 'var(--text)' }}>
          {book.title}
        </p>
        {book.author && (
          <p className="truncate" style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>
            {book.author}
          </p>
        )}
        <div className="flex flex-col gap-1 mt-2">
          <div className="w-full rounded-full overflow-hidden" style={{ height: '2px', background: 'var(--border)' }}>
            <div className="h-full rounded-full transition-all duration-300" style={{ width: `${percent}%`, background: 'var(--accent)' }} />
          </div>
          <p className="uppercase tracking-wide" style={{ fontSize: '0.6rem', color: 'var(--muted)' }}>
            {percent}% leído
          </p>
        </div>
      </div>
    </div>
  );
}

// Botón horizontal para mobile (debajo del carrusel)
function AddBookRow({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-center gap-2 rounded-xl transition-all duration-200"
      style={{
        padding: '0.75rem',
        border: '1px dashed var(--border)',
        color: 'var(--muted)',
        background: 'transparent',
        cursor: 'pointer',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--muted)'; }}
    >
      <PlusIcon />
      <span className="uppercase tracking-widest" style={{ fontSize: '0.65rem' }}>Añadir libro</span>
    </button>
  );
}

// Celda del grid para desktop
function AddBookCard({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col"
      style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer' }}
    >
      <div
        className="w-full rounded-xl flex flex-col items-center justify-center gap-2 transition-all duration-300"
        style={{ aspectRatio: '2/3', border: '1px dashed var(--border)', color: 'var(--muted)' }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--muted)'; }}
      >
        <PlusIcon />
        <span className="uppercase tracking-widest" style={{ fontSize: '0.65rem' }}>Añadir</span>
      </div>
    </button>
  );
}

function LimitBadge({ limit }) {
  if (limit <= 1) return null;

  return (
    <div
      className="py-3 px-6 rounded-full flex items-center gap-2"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent)', opacity: 0.5 }} />
      <p className="uppercase tracking-widest" style={{ fontSize: '0.65rem', color: 'var(--muted)' }}>
        Límite de {limit} libros alcanzado
      </p>
    </div>
  );
}
function BookIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="var(--muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
      stroke="white" strokeWidth="2.5" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}