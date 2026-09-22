<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-container mx-auto px-4 py-8">
      <div class="mb-6">
        <NuxtLink :to="`/courses/${courseId}`" class="text-gray-500 hover:text-black transition text-sm">
          ← Назад к курсу
        </NuxtLink>
      </div>

      <!-- Загрузка -->
      <div v-if="loading" class="flex justify-center py-12">
        <div class="text-gray-500">Загрузка тренировки...</div>
      </div>

      <!-- Ошибка -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
        {{ error }}
      </div>

      <!-- Тренировка -->
      <div v-else-if="workout">
        <h1 class="text-3xl font-bold text-gray-900 mb-6">{{ workout.name }}</h1>

        <!-- Видео -->
        <div class="bg-white rounded-2xl shadow-md p-6 mb-8">
          <div class="aspect-video">
            <iframe
              :src="workout.video"
              class="w-full h-full rounded-xl"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
            ></iframe>
          </div>
        </div>

        <!-- Упражнения -->
        <div class="bg-white rounded-2xl shadow-md p-6 mb-8">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Упражнения</h2>
          <ul class="space-y-3">
            <li
              v-for="(exercise, index) in workout.exercises"
              :key="exercise._id"
              class="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
            >
              <div class="flex items-center gap-3">
                <span
                  class="w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium"
                  :class="isExerciseCompleted(index) ? 'bg-primary text-black' : 'bg-gray-200 text-gray-600'"
                >
                  {{ index + 1 }}
                </span>
                <span class="text-gray-700">{{ exercise.name }}</span>
              </div>
              <span class="text-sm text-gray-500">
                {{ getProgressValue(index) }} / {{ exercise.quantity }}
              </span>
            </li>
          </ul>
        </div>

        <!-- Кнопка заполнения прогресса -->
        <div class="bg-white rounded-2xl shadow-md p-6">
          <button
            @click="isProgressModalOpen = true"
            class="w-full sm:w-auto px-8 py-3 rounded-full bg-primary hover:bg-primary-hover text-black font-medium transition"
          >
            Заполнить свой прогресс
          </button>
        </div>
      </div>
    </div>

    <!-- Модалка прогресса -->
    <div
      v-if="isProgressModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      @click.self="isProgressModalOpen = false"
    >
      <div class="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <h2 class="text-xl font-bold text-gray-900 mb-6">Заполнить прогресс</h2>
        <form @submit.prevent="handleSaveProgress" class="space-y-4">
          <div
            v-for="(exercise, index) in workout?.exercises || []"
            :key="exercise._id"
          >
            <label class="block text-sm font-medium text-gray-700 mb-1">
              {{ exercise.name }}
            </label>
            <input
              v-model.number="progressForm[index]"
              type="number"
              min="0"
              :max="exercise.quantity"
              class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div v-if="saveError" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {{ saveError }}
          </div>

          <div class="flex gap-3">
            <button
              type="submit"
              :disabled="saving"
              class="flex-1 py-3 rounded-full bg-primary hover:bg-primary-hover text-black font-medium transition disabled:opacity-50"
            >
              {{ saving ? 'Сохранение...' : 'Сохранить' }}
            </button>
            <button
              type="button"
              @click="isProgressModalOpen = false"
              class="flex-1 py-3 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium transition"
            >
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import type { Workout } from '~/types/api'
import { useUserStore } from '~/stores/user'

const route = useRoute()
const userStore = useUserStore()
const api = useApi()

const workout = ref<Workout | null>(null)
const progressData = ref<number[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

const isProgressModalOpen = ref(false)
const progressForm = ref<number[]>([])
const saving = ref(false)
const saveError = ref<string | null>(null)

const courseId = computed(() => route.query.courseId as string || '')
const workoutId = computed(() => route.params.id as string)

const isExerciseCompleted = (index: number) => {
  if (!workout.value) return false
  const exercise = workout.value.exercises[index]
  const done = progressData.value[index] || 0
  return done >= (exercise?.quantity || 0)
}

const getProgressValue = (index: number) => {
  return progressData.value[index] || 0
}

const loadWorkout = async () => {
  try {
    loading.value = true
    error.value = null

    if (!courseId.value) {
      error.value = 'Не указан ID курса'
      return
    }

    // Загружаем данные тренировки
    const workoutResponse = await api.getCourseWorkouts(courseId.value, userStore.token!)
    const found = workoutResponse.find((w) => w._id === workoutId.value)
    if (!found) {
      error.value = 'Тренировка не найдена'
      return
    }
    workout.value = found

    // Загружаем прогресс (если авторизован)
    if (userStore.isAuthenticated && userStore.token) {
      try {
        const progress = await api.getWorkoutProgress(courseId.value, workoutId.value, userStore.token)
        progressData.value = progress.progressData || []
      } catch (err) {
        // Прогресса может не быть — это нормально
        progressData.value = []
      }
    }

    // Инициализируем форму
    progressForm.value = workout.value.exercises.map(
      (_, index) => progressData.value[index] || 0
    )
  } catch (err: any) {
    error.value = err.message || 'Не удалось загрузить тренировку'
  } finally {
    loading.value = false
  }
}

const handleSaveProgress = async () => {
  if (!userStore.token || !workout.value) return

  saving.value = true
  saveError.value = null

  try {
    await api.updateProgress(
      courseId.value,
      workoutId.value,
      progressForm.value,
      userStore.token
    )
    progressData.value = [...progressForm.value]
    isProgressModalOpen.value = false
  } catch (err: any) {
    saveError.value = err.message || 'Ошибка сохранения'
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadWorkout()
})
</script>