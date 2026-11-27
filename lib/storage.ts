export interface SavedScore {
  game: string;
  score: number;
  name: string;
  at: number;
}

const SCORES_KEY = "av_scores";

// Appends a score to localStorage. Client-only; silently ignores storage errors.
export function saveScore(entry: Omit<SavedScore, "at">): void {
  try {
    const raw = localStorage.getItem(SCORES_KEY);
    const all: SavedScore[] = raw ? JSON.parse(raw) : [];
    all.push({ ...entry, at: Date.now() });
    localStorage.setItem(SCORES_KEY, JSON.stringify(all));
  } catch {}
}
