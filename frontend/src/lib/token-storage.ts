const storage_key = "wishmatch.access_token";

type Listener = (token: string | null) => void;

const listeners = new Set<Listener>();

export const token_storage = {
  get(): string | null {
    try {
      return window.localStorage.getItem(storage_key);
    } catch {
      return null;
    }
  },

  set(token: string): void {
    try {
      window.localStorage.setItem(storage_key, token);
    } catch {
      /* storage unavailable — keep working in-memory only */
    }
    for (const listener of listeners) {
      listener(token);
    }
  },

  clear(): void {
    try {
      window.localStorage.removeItem(storage_key);
    } catch {
      /* ignore */
    }
    for (const listener of listeners) {
      listener(null);
    }
  },

  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};
