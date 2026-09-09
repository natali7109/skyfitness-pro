// === ПОЛЬЗОВАТЕЛЬ ===
export interface User {
  email: string;
  selectedCourses: string[];
  courseProgress: CourseProgress[];
}

export interface CourseProgress {
  courseId: string;
  courseCompleted: boolean;
  workoutsProgress: WorkoutProgress[];
}

export interface WorkoutProgress {
  workoutId: string;
  workoutCompleted: boolean;
  progressData: number[];
}

// === КУРС ===
export interface Course {
  _id: string;
  description: string;
  directions: string[];
  fitting: string[];
  nameEN: string;
  nameRU: string;
  order: number;
  difficulty: 'начальный' | 'средний' | 'сложный';
  durationInDays: number;
  dailyDurationInMinutes: {
    from: number;
    to: number;
  };
  workouts: string[];
}

// === ТРЕНИРОВКА ===
export interface Workout {
  _id: string;
  name: string;
  video: string;
  exercises: Exercise[];
}

export interface Exercise {
  name: string;
  quantity: number;
}

// === ОТВЕТЫ API ===
export interface LoginResponse {
  token: string;
}

export interface ErrorResponse {
  message: string;
}