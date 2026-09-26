<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-container mx-auto px-4 py-8">
      <div class="mb-6">
        <NuxtLink to="/" class="text-gray-500 hover:text-black transition text-sm">
          ← Все курсы
        </NuxtLink>
      </div>

      <!-- Загрузка -->
      <div v-if="loading" class="flex justify-center py-12">
        <div class="text-gray-500">Загрузка курса...</div>
      </div>

      <!-- Ошибка -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
        {{ error }}
      </div>

      <!-- Курс не найден -->
      <div v-else-if="!course" class="text-center py-12">
        <p class="text-gray-500">Курс не найден</p>
      </div>

      <!-- Курс -->
      <div v-else>
        <h1 class="text-4xl font-bold text-gray-900 mb-4">{{ course.nameRU }}</h1>

        <div class="flex flex-wrap items-center gap-4 mb-8">
          <span v-if="course.durationInDays" class="text-sm text-gray-500">
            {{ course.durationInDays }} дней
          </span>
          <span
            v-if="course.difficulty"
            class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
            :class="difficultyClass(course.difficulty)"
          >
            {{ course.difficulty }}
          </span>
          <span v-if="course.dailyDurationInMinutes" class="text-sm text-gray-500">
            {{ course.dailyDurationInMinutes.from }}–{{ course.dailyDurationInMinutes.to }} мин/день
          </span>
        </div>

        <div class="bg-white rounded-2xl shadow-md p-6 mb-8">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Описание</h2>
          <p class="text-gray-600 leading-relaxed">{{ course.description }}</p>
        </div>

        <div v-if="course.fitting?.length" class="bg-white rounded-2xl shadow-md p-6 mb-8">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Подойдет для вас, если:</h2>
          <ul class="space-y-3">
            <li v-for="(item, index) in course.fitting" :key="index" class="flex items-start gap-3">
              <span class="text-primary font-bold">{{ index + 1 }}.</span>
              <span class="text-gray-600">{{ item }}</span>
            </li>
          </ul>
        </div>

        <div v-if="course.directions?.length" class="bg-white rounded-2xl shadow-md p-6 mb-8">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Направления</h2>
          <div class="flex flex-wrap gap-3">
            <span
              v-for="direction in course.directions"
              :key="direction"
              class="inline-flex items-center px-4 py-2 rounded-full bg-gray-100 text-gray-700 text-sm"
            >
              {{ direction }}
            </span>
          </div>
        </div>

        <div class="bg-white rounded-2xl shadow-md p-6 mb-8">
          <button
            @click="handleCourseAction"
            :disabled="actionLoading"
            class="w-full sm:w-auto px-8 py-3 rounded-full bg-primary hover:bg-primary-hover text-black font-medium transition disabled:opacity-50"
          >
            {{ actionLoading ? 'Загрузка...' : buttonText }}
          </button>
        </div>

        <!-- Тренировки (только если курс добавлен) -->
        <div v-if="isCourseAdded" class="bg-white rounded-2xl shadow-md p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Тренировки</h2>

          <div v-if="workoutsLoading" class="text-gray-500">Загрузка тренировок...</div>

          <ul v-else class="space-y-3">
            <li
              v-for="(workout, index) in workouts"
              :key="workout._id"
              class="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
            >
              <div class="flex items-center gap-3">
                <span class="w-6 h-6 rounded-full bg-primary text-black flex items-center justify-center text-sm font-medium">
                  {{ index + 1 }}
                </span>
                <span class="text-gray-700">{{ workout.name }}</span>
              </div>
              <NuxtLink
                :to="`/training/${workout._id}?courseId=${course._id}`"
                class="text-primary hover:text-primary-hover font-medium text-sm transition"
              >
                Начать →
              </NuxtLink>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Модальное окно авторизации -->
    <AuthModal v-model="isAuthModalOpen" @success="handleAuthSuccess" />
  </div>
</template>

<script setup lang="ts">
import { getErrorMessage } from '~/utils/errors'
import { computed, ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import type { Course, Workout } from '~/types/api'
import { useUserStore } from '~/stores/user'
import AuthModal from '~/components/auth/AuthModal.vue'

const route = useRoute()
const userStore = useUserStore()
const api = useApi()

const course = ref<Course | null>(null)
const workouts = ref<Workout[]>([])
const loading = ref(true)
const workoutsLoading = ref(false)
const error = ref<string | null>(null)
const isAuthModalOpen = ref(false)
const actionLoading = ref(false)

const isCourseAdded = computed(() => {
  return userStore.user?.selectedCourses?.includes(course.value?._id || '') || false
})

const buttonText = computed(() => {
  if (!userStore.isAuthenticated) return 'Войдите, чтобы добавить курс'
  if (isCourseAdded.value) return 'Удалить курс'
  return 'Добавить курс'
})

const difficultyClass = (difficulty: string) => {
  const map: Record<string, string> = {
    'начальный': 'bg-green-100 text-green-800',
    'средний': 'bg-yellow-100 text-yellow-800',
    'сложный': 'bg-red-100 text-red-800',
  }
  return map[difficulty] || 'bg-gray-100 text-gray-800'
}

const loadCourse = async () => {
  try {
    loading.value = true
    error.value = null
    const id = route.params.id as string
    const data = await api.getCourseById(id)
    course.value = data
    await loadWorkouts()
  } catch (err: unknown) {
    error.value = getErrorMessage(err, 'Не удалось загрузить курс')
  } finally {
    loading.value = false
  }
}

const loadWorkouts = async () => {
  if (!course.value || !isCourseAdded.value || !userStore.token) return
  try {
    workoutsLoading.value = true
    const data = await api.getCourseWorkouts(course.value._id, userStore.token)
    workouts.value = data
  } catch (err: unknown) {
    console.error('Ошибка загрузки тренировок:', getErrorMessage(err))
  } finally {
    workoutsLoading.value = false
  }
}

const handleCourseAction = async () => {
  if (!userStore.isAuthenticated) {
    isAuthModalOpen.value = true
    return
  }

  if (!course.value || !userStore.token) return

  actionLoading.value = true
  try {
    if (isCourseAdded.value) {
      await api.deleteCourse(course.value._id, userStore.token)
      workouts.value = []
    } else {
      await api.addCourse(course.value._id, userStore.token)
    }
    const user = await api.getMe(userStore.token)
    userStore.setUser(user)
    await loadWorkouts()
  } catch (err: unknown) {
    console.error('Ошибка:', getErrorMessage(err))
  } finally {
    actionLoading.value = false
  }
}

const handleAuthSuccess = async () => {
  if (course.value && userStore.token && !isCourseAdded.value) {
    try {
      await api.addCourse(course.value._id, userStore.token)
      const user = await api.getMe(userStore.token)
      userStore.setUser(user)
      await loadWorkouts()
    } catch (err: unknown) {
      console.error('Ошибка добавления курса:', getErrorMessage(err))
    }
  }
}

// Следим за изменением курса
watch(isCourseAdded, (added) => {
  if (added) loadWorkouts()
})

onMounted(() => {
  loadCourse()
})
</script>