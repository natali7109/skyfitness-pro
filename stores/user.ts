import { defineStore } from 'pinia';
import type { User } from '../types/api';

export const useUserStore = defineStore('user', {
  state: () => ({
    token: null as string | null,
    user: null as User | null,
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
    userName: (state) => state.user?.email || 'Гость',
  },
  actions: {
    setToken(token: string) {
      this.token = token;
      if (import.meta.client) {
        localStorage.setItem('token', token);
      }
    },
    setUser(user: User) {
      this.user = user;
    },
    logout() {
      this.token = null;
      this.user = null;
      if (import.meta.client) {
        localStorage.removeItem('token');
      }
    },
    loadTokenFromStorage() {
      if (import.meta.client) {
        const token = localStorage.getItem('token');
        if (token) {
          this.token = token;
        }
      }
    },
  },
});