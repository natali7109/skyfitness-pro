import { defineStore } from 'pinia';
import type { Course, Workout } from '../types/api'; 

export const useCoursesStore = defineStore('courses', {
  state: () => ({
    courses: [] as Course[],
    currentCourse: null as Course | null,
    currentWorkouts: [] as Workout[],
    loading: false,
  }),
  getters: {
    getCourseById: (state) => (id: string): Course | undefined => { // <-- явные типы
      return state.courses.find((course: Course) => course._id === id);
    },
  },
  actions: {
    setCourses(courses: Course[]) {
      this.courses = courses;
    },
    setCurrentCourse(course: Course) {
      this.currentCourse = course;
    },
    setCurrentWorkouts(workouts: Workout[]) {
      this.currentWorkouts = workouts;
    },
    setLoading(loading: boolean) {
      this.loading = loading;
    },
  },
});