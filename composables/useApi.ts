import type { Course, Workout, User, LoginResponse } from '../types/api';

export const useApi = () => {
  const baseURL = '/api/fitness';

  const register = async (email: string, password: string) => {
    const response = await fetch(`${baseURL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Ошибка регистрации');
    }
    return response.json();
  };

  const login = async (email: string, password: string) => {
    const response = await fetch(`${baseURL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Ошибка входа');
    }
    const data: LoginResponse = await response.json();
    return data.token;
  };

  const getCourses = async (): Promise<Course[]> => {
    const response = await fetch(`${baseURL}/courses`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Ошибка загрузки курсов');
    }
    return response.json();
  };

  const getCourseById = async (id: string): Promise<Course> => {
    const response = await fetch(`${baseURL}/courses/${id}`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Курс не найден');
    }
    return response.json();
  };

  const getCourseWorkouts = async (courseId: string): Promise<Workout[]> => {
    const response = await fetch(`${baseURL}/courses/${courseId}/workouts`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Ошибка загрузки тренировок');
    }
    return response.json();
  };

  const getMe = async (token: string): Promise<User> => {
    const response = await fetch(`${baseURL}/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Ошибка загрузки профиля');
    }
    return response.json();
  };

  const addCourse = async (courseId: string, token: string) => {
    const response = await fetch(`${baseURL}/users/me/courses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ courseId }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Ошибка добавления курса');
    }
    return response.json();
  };

  const deleteCourse = async (courseId: string, token: string) => {
    const response = await fetch(`${baseURL}/users/me/courses/${courseId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Ошибка удаления курса');
    }
    return response.json();
  };

  const getProgress = async (courseId: string, workoutId: string, token: string) => {
    const response = await fetch(
      `${baseURL}/users/me/progress?courseId=${courseId}&workoutId=${workoutId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Ошибка загрузки прогресса');
    }
    return response.json();
  };

  const updateProgress = async (
    courseId: string,
    workoutId: string,
    progressData: number[],
    token: string
  ) => {
    const response = await fetch(`${baseURL}/courses/${courseId}/workouts/${workoutId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ progressData }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Ошибка обновления прогресса');
    }
    return response.json();
  };

  const resetProgress = async (courseId: string, workoutId: string, token: string) => {
    const response = await fetch(
      `${baseURL}/courses/${courseId}/workouts/${workoutId}/reset`,
      { method: 'PATCH', headers: { Authorization: `Bearer ${token}` } }
    );
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Ошибка сброса прогресса');
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
    updateProgress,
    resetProgress,
  };
};