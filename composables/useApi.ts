import type { Course, Workout, User, LoginResponse } from '../types/api';

export const useApi = () => {
  const AUTH_BASE_URL = 'https://wedev-api.sky.pro';
  const API_BASE_URL = 'https://wedev-api.sky.pro/api/fitness';

  // === АВТОРИЗАЦИЯ ===
  const register = async (email: string, password: string) => {
    const response = await fetch(`${AUTH_BASE_URL}/api/fitness/auth/register`, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Ошибка регистрации');
    }

    return response.json();
  };

  const login = async (email: string, password: string) => {
    const response = await fetch(`${AUTH_BASE_URL}/api/fitness/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Ошибка входа');
    }

    const data: LoginResponse = await response.json();
    return data.token;
  };

  // === КУРСЫ ===
  const getCourses = async (): Promise<Course[]> => {
    const response = await fetch(`${API_BASE_URL}/courses`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Ошибка загрузки курсов');
    }
    return response.json();
  };

  const getCourseById = async (id: string): Promise<Course> => {
    const response = await fetch(`${API_BASE_URL}/courses/${id}`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Курс не найден');
    }
    return response.json();
  };

  const getCourseWorkouts = async (courseId: string): Promise<Workout[]> => {
    const response = await fetch(`${API_BASE_URL}/courses/${courseId}/workouts`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Ошибка загрузки тренировок');
    }
    return response.json();
  };

  // === ПОЛЬЗОВАТЕЛЬ ===
  const getMe = async (token: string): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Ошибка загрузки профиля');
    }
    return response.json();
  };

  const addCourse = async (courseId: string, token: string) => {
    const response = await fetch(`${API_BASE_URL}/users/me/courses`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ courseId }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Ошибка добавления курса');
    }
    return response.json();
  };

  const deleteCourse = async (courseId: string, token: string) => {
    const response = await fetch(`${API_BASE_URL}/users/me/courses/${courseId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Ошибка удаления курса');
    }
    return response.json();
  };

  // === ПРОГРЕСС ===
  const getProgress = async (courseId: string, token: string) => {
    const response = await fetch(`${API_BASE_URL}/users/me/progress?courseId=${courseId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Ошибка загрузки прогресса');
    }
    return response.json();
  };

  const getWorkoutProgress = async (courseId: string, workoutId: string, token: string) => {
    const response = await fetch(
      `${API_BASE_URL}/users/me/progress?courseId=${courseId}&workoutId=${workoutId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Ошибка загрузки прогресса тренировки');
    }
    return response.json();
  };

  const updateProgress = async (
    courseId: string,
    workoutId: string,
    progressData: number[],
    token: string
  ) => {
    const response = await fetch(`${API_BASE_URL}/courses/${courseId}/workouts/${workoutId}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ progressData }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Ошибка обновления прогресса');
    }
    return response.json();
  };

  const resetCourseProgress = async (courseId: string, token: string) => {
    const response = await fetch(`${API_BASE_URL}/courses/${courseId}/reset`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Ошибка сброса прогресса курса');
    }
    return response.json();
  };

  return {
    register,
    login,
    getCourses,
    getCourseById,
    getCourseWorkouts,
    getMe,
    addCourse,
    deleteCourse,
    getProgress,
    getWorkoutProgress,
    updateProgress,
    resetCourseProgress,
  };
};