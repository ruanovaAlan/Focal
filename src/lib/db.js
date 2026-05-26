import Dexie from 'dexie';

const db = new Dexie('FluumDB');

db.version(1).stores({
  books: '++id, title, author, fileSize, addedAt',
  progress: 'bookId, lastOpenedAt',
});

if (navigator.storage?.persist) {
  navigator.storage.persist();
}

export async function saveBook({ title, author, fileBlob, coverUrl, fileSize }) {
  return db.books.add({ title, author, fileBlob, coverUrl, fileSize, addedAt: Date.now() });
}

export async function getAllBooks() {
  const books = await db.books.toArray();
  const allProgress = await db.progress.toArray();

  const progressMap = {};
  allProgress.forEach(p => { progressMap[p.bookId] = p; });

  return books.map((book) => {
    const meta = { ...book };
    delete meta.fileBlob;
    const prog = progressMap[book.id];
    meta.percent = prog?.percent ?? 0;
    meta.cfi = prog?.cfi ?? null;
    return meta;
  });
}

export async function getBookFile(id) {
  const book = await db.books.get(id);
  return book?.fileBlob ?? null;
}

export async function deleteBook(id) {
  await db.transaction('rw', db.books, db.progress, async () => {
    await db.books.delete(id);
    await db.progress.delete(id);
  });
}

export async function saveProgress(bookId, cfi, percent) {
  await db.progress.put({ bookId, cfi, percent, lastOpenedAt: Date.now() });
}

export async function getProgress(bookId) {
  const record = await db.progress.get(bookId);
  if (!record) return null;
  return { cfi: record.cfi, percent: record.percent };
}
