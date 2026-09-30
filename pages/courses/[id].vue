<template>
  <div class="min-h-screen bg-white">
    <div class="max-w-[1440px] mx-auto px-4 lg:px-[140px] pt-4 lg:pt-[20px] pb-10 lg:pb-[60px]">
      <!-- Хлебные крошки -->
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

      <!-- Курс -->
      <div v-else-if="course">
        <!-- Цветной блок с названием -->
        <div
          class="relative overflow-hidden mb-8"
          :style="{
            width: '1160px',
            height: '310px',
            borderRadius: '30px',
            backgroundColor: courseColor
          }"
        >
          <h1
            class="absolute text-white font-bold z-10"
            style="font-size: 56px; line-height: 60px; left: 40px; top: 40px;"
          >
            {{ course.nameRU }}
          </h1>
          <img
            :src="courseImage"
            :alt="course.nameRU"
            class="absolute right-0 bottom-0 h-full object-contain"
             style="height: 140%; width: 50%; bottom: -10%;"
          />
        </div>

        <!-- Подойдет для вас, если -->
        <div v-if="course.fitting?.length" class="mb-8">
          <h2 class="font-bold text-black mb-6" style="font-size: 40px; line-height: 44px;">
            Подойдет для вас, если:
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-3" style="gap: 40px;">
            <div
              v-for="(item, index) in course.fitting"
              :key="index"
              class="flex items-start bg-gray-900 text-white"
              style="padding: 20px; border-radius: 20px; gap: 15px; width: 368px; height: 141px;"
            >
              <span class="font-bold" style="font-size: 56px; line-height: 60px; color: #BCEC30;">
                {{ index + 1 }}
              </span>
              <span style="font-size: 24px; line-height: 28px; padding-top: 10px;">
                {{ item }}
              </span>
            </div>
          </div>
        </div>

        <!-- Направления -->
<div v-if="course.directions?.length" class="mb-8">
  <h2 class="font-bold text-black mb-6" style="font-size: 40px; line-height: 44px;">
    Направления
  </h2>
  <div
    class="grid grid-cols-1 md:grid-cols-3"
    style="background-color: #BCEC30; border-radius: 20px; padding: 28px; gap: 10px 40px; width: 1160px; min-height: 146px;"
  >
    <span
      v-for="direction in course.directions"
      :key="direction"
      class="text-black"
      style="font-size: 18px; line-height: 20px;"
    >
      ✦ {{ direction }}
    </span>
  </div>
</div>

        <!-- Начните путь к новому телу -->
<div
  class="bg-white shadow-md mb-8 relative overflow-hidden"
  style="width: 1160px; height: 588px; border-radius: 30px;"
>
  <!-- Текст и кнопка -->
  <div class="absolute flex flex-col z-10" style="width: 437px; gap: 20px; left: 40px; top: 40px;">
    <h2 class="font-bold text-black" style="font-size: 56px; line-height: 60px;">
      Начните путь<br />к новому телу
    </h2>
    <ul class="list-disc pl-6 text-gray-700" style="font-size: 18px; line-height: 28px;">
      <li>проработка всех групп мышц</li>
      <li>тренировка суставов</li>
      <li>улучшение циркуляции крови</li>
      <li>упражнения заряжают бодростью</li>
      <li>помогают противостоять стрессам</li>
    </ul>
    <button
      @click="handleCourseAction"
      :disabled="actionLoading"
      class="bg-primary hover:bg-primary-hover text-black font-medium transition disabled:opacity-50"
      style="width: 300px; height: 52px; border-radius: 46px; font-size: 18px;"
    >
      {{ actionLoading ? 'Загрузка...' : buttonText }}
    </button>
  </div>

  <!-- Зелёная линия (за бегуном) -->
  <img
    src="~/assets/images/line.png"
    alt=""
    class="absolute"
    style="width: 700px; height: auto; right: 5px; top: 200px; z-index: 1;"
  />

  <!-- Бегун (спереди) -->
  <img
    src="~/assets/images/runner.png"
    alt=""
    class="absolute right-0 bottom-0 object-contain"
    style="width: 604px; height: 604px; z-index: 2;"
  />
</div>
</div>
</div>
    <!-- Модалка авторизации -->
    <AuthModal v-model="isAuthModalOpen" @success="handleAuthSuccess" />
  </div>
</template>

<script setup lang="ts">
import { getErrorMessage } from '~/utils/errors'
import { computed, ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import type { Course } from '~/types/api'
import { useUserStore } from '~/stores/user'
import AuthModal from '~/components/auth/AuthModal.vue'

const route = useRoute()
const userStore = useUserStore()
const api = useApi()

const course = ref<Course | null>(null)
const loading = ref(true)
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

// Цвет блока по ID курса
const courseColor = computed(() => {
  const map: Record<string, string> = {
    'ab1c3f': '#FFC700', // Йога — жёлтый
    'kfpq8e': '#3B82F6', // Стретчинг — синий
    'ypox9r': '#F97316', // Фитнес — оранжевый
    '6i67sm': '#EF4444', // Степ-аэробика — красный
    'q02a6i': '#A855F7', // Бодифлекс — фиолетовый
  }
  return map[course.value?._id || ''] || '#FFD748'
})

// Картинка курса
const courseImage = computed(() => {
  const map: Record<string, string> = {
    'ab1c3f': '/images/yoga.png',
    'kfpq8e': '/images/stretching.png',
    'ypox9r': '/images/fitness.png',
    '6i67sm': '/images/step-aerobics.png',
    'q02a6i': '/images/bodyflex.png',
  }
  return map[course.value?._id || ''] || '/images/yoga.png'
})

const loadCourse = async () => {
  try {
    loading.value = true
    error.value = null
    const id = route.params.id as string
    const data = await api.getCourseById(id)
    course.value = data
  } catch (err: unknown) {
    error.value = getErrorMessage(err, 'Не удалось загрузить курс')
  } finally {
    loading.value = false
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
    } else {
      await api.addCourse(course.value._id, userStore.token)
    }
    const user = await api.getMe(userStore.token)
    userStore.setUser(user)
  } catch (err: unknown) {
    console.error(getErrorMessage(err))
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
    } catch (err: unknown) {
      console.error(getErrorMessage(err))
    }
  }
}

onMounted(() => {
  loadCourse()
})
</script>