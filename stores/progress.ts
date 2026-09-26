import { defineStore } from 'pinia';
import type { ProgressData } from '~/types/api';

export const useProgressStore = defineStore('progress', {
  state: () => ({
    progress: null as ProgressData | null,
    currentProgress: null as ProgressData | null,
  }),
  actions: {
    setProgress(progress: ProgressData) {
      this.progress = progress;
    },
    setCurrentProgress(progress: ProgressData) {
      this.currentProgress = progress;
    },
    resetProgress() {
      this.progress = null;
      this.currentProgress = null;
    },
  },
});