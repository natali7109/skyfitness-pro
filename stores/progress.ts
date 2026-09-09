import { defineStore } from 'pinia';

export const useProgressStore = defineStore('progress', {
  state: () => ({
    progress: null as any,
    currentProgress: null as any,
  }),
  actions: {
    setProgress(progress: any) {
      this.progress = progress;
    },
    setCurrentProgress(progress: any) {
      this.currentProgress = progress;
    },
    resetProgress() {
      this.progress = null;
      this.currentProgress = null;
    },
  },
});