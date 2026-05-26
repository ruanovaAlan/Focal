import { useState, useEffect, useCallback } from 'react';
import ePub from 'epubjs';
import {
  getAllBooks,
  saveBook,
  deleteBook,
  saveProgress,
  getProgress,
} from '../lib/db';
import { setLastOpenedBook } from '../lib/storage';

async function extractEpubMeta(file) {
  const buffer = await file.arrayBuffer();
  const book = ePub(buffer);
  await book.ready;

  const meta = await book.loaded.metadata;
  const title = meta.title || file.name.replace(/\.epub$/i, '');
  const author = meta.creator || '';

  let coverUrl = null;
  try {
    const coverHref = await book.loaded.cover;
    if (coverHref) {
      coverUrl = await book.archive.createUrl(coverHref, { base64: true });
    }
  } catch {
    // cover is optional — leave null
  }

  return { title, author, coverUrl };
}

export function useLibrary() {
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getAllBooks()
      .then(setBooks)
      .catch((err) => setError(err.message ?? 'Error al cargar la biblioteca'))
      .finally(() => setIsLoading(false));
  }, []);

  const addBook = useCallback(async (file) => {
    try {
      const { title, author, coverUrl } = await extractEpubMeta(file);
      const id = await saveBook({
        title,
        author,
        fileBlob: file,
        coverUrl,
        fileSize: file.size,
      });
      setBooks((prev) => [...prev, { id, title, author, coverUrl, fileSize: file.size, addedAt: Date.now() }]);
    } catch (err) {
      setError(err.message ?? 'Error al añadir el libro');
    }
  }, []);

  const removeBook = useCallback(async (id) => {
    try {
      await deleteBook(id);
      setBooks((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      setError(err.message ?? 'Error al eliminar el libro');
    }
  }, []);

  const updateProgress = useCallback(async (bookId, cfi, percent) => {
    try {
      await saveProgress(bookId, cfi, percent);
      setBooks((prev) =>
        prev.map((b) => (b.id === bookId ? { ...b, percent } : b))
      );
    } catch (err) {
      setError(err.message ?? 'Error al guardar el progreso');
    }
  }, []);

  const getBookProgress = useCallback((bookId) => getProgress(bookId), []);

  const openBook = useCallback((bookId) => {
    setLastOpenedBook(bookId);
  }, []);

  return { books, isLoading, error, addBook, removeBook, updateProgress, getBookProgress, openBook };
}
