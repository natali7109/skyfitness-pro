<template>
  <div class="min-h-screen bg-white">
    <div class="max-w-[1440px] mx-auto px-4 lg:px-[140px] pt-4 lg:pt-[20px] pb-10 lg:pb-[60px]">
      <!-- Заголовок -->
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
        <!-- Название -->
        <h1 class="font-bold text-black mb-4 lg:mb-8 text-[24px] lg:text-[56px]" style="line-height: 1.1;">
          {{ getWorkoutTitle(workout.name) }}
        </h1>

        <!-- Видео -->
        <div class="bg-white rounded-[30px] shadow-md mb-4 lg:mb-8" style="padding: 20px;">
          <div class="aspect-video relative rounded-[20px] lg:rounded-[30px] overflow-hidden bg-gray-100 flex items-center justify-center">
            <!-- Заглушка с кнопкой -->
            <div class="text-center px-4">
              <div class="w-12 h-12 lg:w-20 lg:h-20 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-2 lg:mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 lg:h-10 lg:w-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
              <p class="text-gray-700 text-sm lg:text-lg mb-2 lg:mb-4">Видео доступно на YouTube</p>
              <a
                :href="workout.video.replace('/embed/', '/watch?v=')"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-block bg-red-600 hover:bg-red-700 text-white font-medium transition text-sm lg:text-base"
                style="padding: 8px 20px; lg:padding: 12px 32px; border-radius: 46px;"
              >
                Смотреть на YouTube
              </a>
            </div>
          </div>
        </div>

        <!-- Упражнения -->
        <div class="bg-white rounded-[30px] shadow-md mb-4 lg:mb-8" style="padding: 20px;">
          <h2 class="font-semibold text-black mb-4 lg:mb-6 text-[20px] lg:text-[32px]" style="line-height: 1.1;">
            Упражнения тренировки
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-10">
            <div
              v-for="(exercise, index) in workout.exercises"
              :key="index"
              class="flex flex-col"
              style="gap: 8px;"
            >
              <p class="text-black text-[16px] lg:text-[18px]" style="line-height: 1.2;">
                {{ exercise.name }}
              </p>
              <p class="text-gray-500 text-[16px] lg:text-[18px]" style="line-height: 1.2;">
                {{ getProgressValue(index) }}%
              </p>
              <!-- Голубая полоса прогресса -->
              <div class="w-full" style="height: 4px; background-color: #E5E7EB; border-radius: 2px;">
                <div
                  class="h-full transition-all duration-300"
                  style="background-color: #3B82F6;"
                  :style="{ width: `${getProgressValue(index)}%` }"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Кнопка заполнения прогресса -->
        <div class="bg-white rounded-[30px] shadow-md" style="padding: 20px;">
          <button
            @click="isProgressModalOpen = true"
            class="bg-primary hover:bg-primary-hover text-black font-medium transition w-full lg:w-[320px] text-[16px] lg:text-[18px]"
            style="height: 50px; lg:height: 52px; border-radius: 46px;"
          >
            {{ isAnyProgress ? 'Обновить свой прогресс' : 'Заполнить свой прогресс' }}
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
      <div class="bg-white shadow-xl w-full max-w-[426px]" style="border-radius: 30px; padding: 30px;">
        <h2 class="font-bold text-black mb-6 text-[24px] lg:text-[32px]" style="line-height: 1.1;">
          Мой прогресс
        </h2>

        <form @submit.prevent="handleSaveProgress" class="flex flex-col" style="gap: 20px; lg:gap: 40px;">
          <div
            v-for="(exercise, index) in workout?.exercises || []"
            :key="index"
            class="flex flex-col"
            style="gap: 10px;"
          >
            <label class="text-black text-[16px] lg:text-[18px]" style="line-height: 1.2;">
              Сколько раз вы сделали {{ exercise.name.toLowerCase() }}?
            </label>
            <input
              v-model.number="progressForm[index]"
              type="number"
              min="0"
              :max="exercise.quantity"
              class="border border-gray-300 focus:outline-none focus:border-black"
              style="height: 50px; lg:height: 52px; border-radius: 30px; padding: 0 20px; font-size: 16px; lg:font-size: 18px;"
            />
          </div>

          <div v-if="saveError" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {{ saveError }}
          </div>

          <button
            type="submit"
            :disabled="saving"
            class="bg-primary hover:bg-primary-hover text-black font-medium transition disabled:opacity-50 w-full text-[16px] lg:text-[18px]"
            style="height: 50px; lg:height: 52px; border-radius: 46px;"
          >
            {{ saving ? 'Сохранение...' : 'Сохранить' }}
          </button>
        </form>
      </div>
    </div>

    <!-- Модалка "Ваш прогресс засчитан!" -->
    <div
      v-if="isSuccessModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      @click.self="isSuccessModalOpen = false"
    >
      <div class="bg-white shadow-xl text-center w-full max-w-[426px]" style="border-radius: 30px; padding: 30px;">
        <p class="font-bold text-black text-[24px] lg:text-[40px]" style="line-height: 1.1; margin-bottom: 20px; lg:margin-bottom: 34px;">
          Ваш прогресс засчитан!
        </p>
        <div class="w-12 h-12 lg:w-16 lg:h-16 bg-primary rounded-full flex items-center justify-center mx-auto">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 lg:h-8 lg:w-8 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <button
          @click="isSuccessModalOpen = false"
          class="mt-4 lg:mt-6 text-gray-500 hover:text-black transition text-sm"
        >
          Закрыть
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getErrorMessage } from '~/utils/errors'
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
const isSuccessModalOpen = ref(false)
const progressForm = ref<number[]>([])
const saving = ref(false)
const saveError = ref<string | null>(null)

const courseId = computed(() => route.query.courseId as string || '')
const workoutId = computed(() => route.params.id as string)

const isAnyProgress = computed(() => {
  return progressData.value.some((value) => value > 0)
})

const getWorkoutTitle = (name: string): string => {
  return name.split(' / ')[0] || name
}

const getProgressValue = (index: number): number => {
  if (!workout.value) return 0
  const exercise = workout.value.exercises[index]
  const done = progressData.value[index] || 0
  const total = exercise?.quantity || 1
  return Math.round((done / total) * 100)
}

const loadWorkout = async () => {
  try {
    loading.value = true
    error.value = null

    if (!courseId.value) {
      error.value = 'Не указан ID курса'
      return
    }

    const workoutResponse = await api.getCourseWorkouts(courseId.value, userStore.token!)
    const found = workoutResponse.find((w) => w._id === workoutId.value)
    if (!found) {
      error.value = 'Тренировка не найдена'
      return
    }
    workout.value = found

    if (userStore.isAuthenticated && userStore.token) {
      try {
        const progress = await api.getWorkoutProgress(courseId.value, workoutId.value, userStore.token)
        progressData.value = progress.progressData || []
      } catch {
        progressData.value = []
      }
    }

    progressForm.value = workout.value.exercises.map(
      (_, index) => progressData.value[index] || 0
    )
  } catch (err: unknown) {
    error.value = getErrorMessage(err, 'Не удалось загрузить тренировку')
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
    isSuccessModalOpen.value = true
  } catch (err: unknown) {
    saveError.value = getErrorMessage(err, 'Ошибка сохранения')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadWorkout()
})
</script>
