const KEYS = {
  wpm: 'fluum:wpm',
  theme: 'fluum:theme',
  lastBook: 'fluum:lastBook',
};

export function getWPM() {
  const raw = localStorage.getItem(KEYS.wpm);
  const parsed = Number(raw);
  return raw !== null && Number.isFinite(parsed) ? parsed : 250;
}

export function setWPM(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 100 || n > 1000) return;
  localStorage.setItem(KEYS.wpm, String(n));
}

export function getTheme() {
  const raw = localStorage.getItem(KEYS.theme);
  return raw === 'light' || raw === 'dark' ? raw : 'light';
}

export function setTheme(value) {
  if (value !== 'light' && value !== 'dark') return;
  localStorage.setItem(KEYS.theme, value);
}

export function getLastOpenedBook() {
  const raw = localStorage.getItem(KEYS.lastBook);
  const id = Number(raw);
  return raw !== null && Number.isInteger(id) ? id : null;
}

export function setLastOpenedBook(id) {
  localStorage.setItem(KEYS.lastBook, String(id));
}

export function clearAll() {
  Object.values(KEYS).forEach((key) => localStorage.removeItem(key));
}
