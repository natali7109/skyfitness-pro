<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-6">Мой профиль</h1>

      <!-- Если не авторизован -->
      <div v-if="!userStore.isAuthenticated" class="bg-white rounded-2xl shadow-md p-6 text-center">
        <p class="text-gray-600 mb-4">Вы не авторизованы</p>
        <NuxtLink
          to="/login"
          class="inline-block px-6 py-2 rounded-full bg-primary hover:bg-primary-hover text-black font-medium transition"
        >
          Войти
        </NuxtLink>
      </div>

      <!-- Если авторизован -->
      <div v-else>
        <!-- Данные пользователя -->
        <div class="bg-white rounded-2xl shadow-md p-6 mb-8">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Мои данные</h2>
          <p class="text-gray-600"><strong>Email:</strong> {{ userStore.user?.email }}</p>
        </div>

        <!-- Мои курсы -->
        <div class="bg-white rounded-2xl shadow-md p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Мои курсы</h2>

          <div v-if="loading" class="text-gray-500">Загрузка курсов...</div>

          <div v-else-if="!myCourses.length" class="text-gray-500">
            У вас пока нет добавленных курсов
          </div>

          <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div
              v-for="course in myCourses"
              :key="course._id"
              class="border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow duration-200 flex flex-col"
            >
              <!-- Картинка-заглушка -->
              <div class="h-40 bg-gradient-to-br from-yellow-300 to-orange-400 relative">
                <button
                  @click="handleDeleteCourse(course._id)"
                  :disabled="deletingId === course._id"
                  class="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow hover:bg-gray-100 transition disabled:opacity-50"
                  aria-label="Удалить курс"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>

              <div class="p-5 flex flex-col flex-1">
                <h3 class="text-lg font-semibold text-gray-900 mb-3">
                  {{ course.nameRU }}
                </h3>

                <!-- Метаданные -->
                <div class="flex flex-wrap items-center gap-3 text-xs text-gray-500 mb-3">
                  <span v-if="course.durationInDays">📅 {{ course.durationInDays }} дней</span>
                  <span v-if="course.dailyDurationInMinutes">
                    ⏱️ {{ course.dailyDurationInMinutes.from }}-{{ course.dailyDurationInMinutes.to }} мин/день
                  </span>
                </div>

                <!-- Сложность -->
                <div v-if="course.difficulty" class="flex items-center gap-2 text-xs mb-4">
                  <span class="text-gray-500">Сложность:</span>
                  <span
                    class="inline-flex items-center px-2 py-1 rounded-full font-medium"
                    :class="difficultyClass(course.difficulty)"
                  >
                    {{ course.difficulty }}
                  </span>
                </div>

                <!-- Прогресс -->
                <div class="mb-4">
                  <div class="flex items-center justify-between text-xs text-gray-600 mb-1">
                    <span>Прогресс:</span>
                    <span>{{ getProgressPercent(course._id) }}%</span>
                  </div>
                  <div class="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      class="h-full bg-blue-500 transition-all duration-300"
                      :style="{ width: `${getProgressPercent(course._id)}%` }"
                    ></div>
                  </div>
                </div>

                <!-- Кнопка -->
                <button
                  @click="openWorkoutsModal(course._id)"
                  class="mt-auto w-full text-center px-4 py-2 rounded-full bg-primary hover:bg-primary-hover text-black font-medium transition"
                >
                  Начать тренировку
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Модалка выбора тренировки -->
    <WorkoutsModal
      v-model="isWorkoutsModalOpen"
      :course-id="selectedCourseId"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Course } from '~/types/api'
import { useUserStore } from '~/stores/user'
import WorkoutsModal from '~/components/course/WorkoutsModal.vue'

const userStore = useUserStore()
const api = useApi()

const allCourses = ref<Course[]>([])
const progressMap = ref<Record<string, number>>({})
const loading = ref(true)
const deletingId = ref<string | null>(null)

// Модалка
const isWorkoutsModalOpen = ref(false)
const selectedCourseId = ref('')

const myCourses = computed(() => {
  const selected = userStore.user?.selectedCourses || []
  return allCourses.value.filter((course) => selected.includes(course._id))
})

const difficultyClass = (difficulty: string) => {
  const map: Record<string, string> = {
    'начальный': 'bg-green-100 text-green-800',
    'средний': 'bg-yellow-100 text-yellow-800',
    'сложный': 'bg-red-100 text-red-800',
  }
  return map[difficulty] || 'bg-gray-100 text-gray-800'
}

const getProgressPercent = (courseId: string): number => {
  return progressMap.value[courseId] || 0
}

// Вычисление процента прогресса курса
const calculateProgress = (progress: any): number => {
  if (!progress || !progress.workoutsProgress?.length) return 0

  const total = progress.workoutsProgress.length
  const completed = progress.workoutsProgress.filter((w: any) => w.workoutCompleted).length

  return Math.round((completed / total) * 100)
}

// Загрузка прогресса для каждого курса
const loadProgress = async () => {
  if (!userStore.token) return

  for (const course of myCourses.value) {
    try {
      const progress = await api.getProgress(course._id, userStore.token)
      progressMap.value[course._id] = calculateProgress(progress)
    } catch (err) {
      progressMap.value[course._id] = 0
    }
  }
}

const loadCourses = async () => {
  try {
    loading.value = true
    const data = await api.getCourses()
    allCourses.value = data
    await loadProgress()
  } catch (err: any) {
    console.error('Ошибка загрузки курсов:', err.message)
  } finally {
    loading.value = false
  }
}

const handleDeleteCourse = async (courseId: string) => {
  if (!userStore.token) return

  deletingId.value = courseId
  try {
    await api.deleteCourse(courseId, userStore.token)
    const user = await api.getMe(userStore.token)
    userStore.setUser(user)
  } catch (err: any) {
    console.error('Ошибка удаления курса:', err.message)
  } finally {
    deletingId.value = null
  }
}

// Открытие модалки
const openWorkoutsModal = (courseId: string) => {
  selectedCourseId.value = courseId
  isWorkoutsModalOpen.value = true
}

onMounted(() => {
  loadCourses()
})
</script>