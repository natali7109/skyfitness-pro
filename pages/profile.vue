<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-container mx-auto px-4 py-8">
      <h1 class="font-bold text-gray-900 mb-6" style="font-size: 40px; line-height: 44px;">
        Профиль
      </h1>

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
        <div class="bg-white rounded-[30px] shadow-md p-8 mb-8" style="width: 1160px; height: 257px;">
          <div class="flex items-center" style="gap: 33px;">
            <!-- Аватар-заглушка -->
            <div class="bg-gray-200 rounded-[20px] flex items-center justify-center flex-shrink-0 overflow-hidden" style="width: 197px; height: 197px;">
              <svg xmlns="http://www.w3.org/2000/svg" class="text-gray-400" style="width: 140px; height: 140px; margin-top: 40px;" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </div>

            <!-- Информация -->
            <div class="flex flex-col" style="width: 300px; height: 181px;">
              <p class="text-black" style="font-size: 32px; line-height: 35px; font-weight: 600;">
                {{ userStore.user?.email?.split('@')[0] || 'Пользователь' }}
              </p>
              <p class="text-gray-500" style="font-size: 18px; line-height: 20px; margin-top: 30px;">
                Логин: {{ userStore.user?.email?.split('@')[0] || 'sergey.petrov96' }}
              </p>
              <button
                @click="handleLogout"
                class="bg-transparent border border-black text-black hover:bg-gray-50 transition"
                style="width: 192px; height: 52px; border-radius: 46.2px; font-size: 18px; margin-top: 30px;"
              >
                Выйти
              </button>
            </div>
          </div>
        </div>

        <!-- Мои курсы -->
        <div class="bg-white rounded-[30px] shadow-md p-8">
          <h2 class="font-bold text-gray-900 mb-6" style="font-size: 40px; line-height: 44px;">
            Мои курсы
          </h2>

          <div v-if="loading" class="text-gray-500">Загрузка курсов...</div>

          <div v-else-if="!myCourses.length" class="text-gray-500">
            У вас пока нет добавленных курсов
          </div>

          <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
            <CourseCard
              v-for="course in myCourses"
              :key="course._id"
              :course="course"
              variant="profile"
              :progress="getProgressPercent(course._id)"
              @delete="handleDeleteCourse"
              @start="openWorkoutsModal"
            />
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
import type { ProgressData } from '~/types/api'
import { getErrorMessage } from '~/utils/errors'
import { ref, computed, onMounted } from 'vue'
import type { Course } from '~/types/api'
import { useUserStore } from '~/stores/user'
import WorkoutsModal from '~/components/course/WorkoutsModal.vue'
import CourseCard from '~/components/course/CourseCard.vue'

const userStore = useUserStore()
const api = useApi()

const allCourses = ref<Course[]>([])
const progressMap = ref<Record<string, number>>({})
const loading = ref(true)
const deletingId = ref<string | null>(null)
const resettingId = ref<string | null>(null)

// Модалка
const isWorkoutsModalOpen = ref(false)
const selectedCourseId = ref('')

const myCourses = computed(() => {
  const selected = userStore.user?.selectedCourses || []
  return allCourses.value.filter((course) => selected.includes(course._id))
})

const getProgressPercent = (courseId: string): number => {
  return progressMap.value[courseId] || 0
}

// Вычисление процента прогресса курса
const calculateProgress = (progress: ProgressData): number => {
  if (!progress || !progress.workoutsProgress?.length) return 0
  const total = progress.workoutsProgress.length
  const completed = progress.workoutsProgress.filter((w) => w.workoutCompleted).length
  return Math.round((completed / total) * 100)
}

// Загрузка прогресса для каждого курса
const loadProgress = async () => {
  if (!userStore.token) return
  for (const course of myCourses.value) {
    try {
      const progress = await api.getProgress(course._id, userStore.token)
      progressMap.value[course._id] = calculateProgress(progress)
    } catch {
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
  } catch (err: unknown) {
    console.error('Ошибка загрузки курсов:', getErrorMessage(err))
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
  } catch (err: unknown) {
    console.error('Ошибка удаления курса:', getErrorMessage(err))
  } finally {
    deletingId.value = null
  }
}

// Сброс прогресса курса
const handleResetProgress = async (courseId: string) => {
  if (!userStore.token) return
  resettingId.value = courseId
  try {
    await api.resetCourseProgress(courseId, userStore.token)
    await loadProgress()
  } catch (err: unknown) {
    console.error('Ошибка сброса прогресса:', getErrorMessage(err))
  } finally {
    resettingId.value = null
  }
}

// Выход из аккаунта
const handleLogout = () => {
  userStore.logout()
  navigateTo('/')
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