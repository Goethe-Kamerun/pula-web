import { create } from 'zustand';

const TOKEN_KEY = 'auth_token';
const USERNAME_KEY = 'auth_username';
const PREF_LANGS_KEY = 'auth_pref_langs';

export interface AuthState {
  token: string | null;
  username: string | null;
  pref_langs: string | null;
  setToken: (token: string) => void;
  setUsername: (username: string) => void;
  setPrefLangs: (pref_langs: string) => void;
  clearToken: () => void;
  clearUsername: () => void;
  clearPrefLangs: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  username: null,
  pref_langs: null,
  setToken: (token) => {
    set({ token });
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, token);
    }
  },
  setUsername: (username) => {
    set({ username });
    if (typeof window !== 'undefined') {
      localStorage.setItem(USERNAME_KEY, username);
    }
  },
  setPrefLangs: (pref_langs) => {
    set({ pref_langs });
    if (typeof window !== 'undefined') {
      localStorage.setItem(PREF_LANGS_KEY, pref_langs);
    }
  },
  clearToken: () => {
    set({ token: null });
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
    }
  },
  clearUsername: () => {
    set({ username: null });
    if (typeof window !== 'undefined') {
      localStorage.removeItem(USERNAME_KEY);
    }
  },
  clearPrefLangs: () => {
    set({ pref_langs: null });
    if (typeof window !== 'undefined') {
      localStorage.removeItem(PREF_LANGS_KEY);
    }
  },
  hydrate: () => {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      const storedUsername = localStorage.getItem(USERNAME_KEY);
      const storedPrefLangs = localStorage.getItem(PREF_LANGS_KEY);
      
      if (storedToken) {
        set({ token: storedToken });
      }
      if (storedUsername) {
        set({ username: storedUsername });
      }
      if (storedPrefLangs) {
        set({ pref_langs: storedPrefLangs });
      }
    }
  },
})); 