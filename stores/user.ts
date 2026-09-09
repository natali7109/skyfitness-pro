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
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', token);
      }
    },
    setUser(user: User) {
      this.user = user;
    },
    logout() {
      this.token = null;
      this.user = null;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
      }
    },
    loadTokenFromStorage() {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) {
          this.token = token;
        }
      }
    },
  },
});