<template>
  <div class="min-h-screen bg-white">
    <div class="max-w-[1440px] mx-auto px-4 lg:px-[140px] pt-4 lg:pt-[20px] pb-10 lg:pb-[60px]">

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
        <!-- Цветной блок с названием (десктоп) -->
        <div
          class="hidden lg:block relative overflow-hidden mb-8 w-full max-w-[1160px] h-[310px]"
          :style="{
            borderRadius: '30px',
            backgroundColor: courseColor
          }"
        >
          <h1
            class="absolute text-white font-medium z-10 left-[40px] top-[40px]"
            :style="{
              fontSize: course.nameRU.length > 10 ? '48px' : '60px',
              lineHeight: '110%',
              maxWidth: '600px'
            }"
          >
            {{ course.nameRU }}
          </h1>
          <img
            :src="courseImage"
            :alt="course.nameRU"
            class="absolute right-0 bottom-0 object-cover w-[50%] h-full"
          />
        </div>

        <!-- Картинка курса (мобильные) -->
        <div class="block lg:hidden mb-6">
          <img
            :src="courseImage"
            :alt="course.nameRU"
            class="w-full h-auto rounded-[30px]"
          />
        </div>

        <!-- Подойдет для вас, если -->
        <div v-if="course.fitting?.length" class="mb-8">
          <h2 class="font-bold text-black mb-4 lg:mb-6" style="font-size: 28px; line-height: 32px;">
            Подойдет для вас, если:
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-[10px] md:gap-[40px] w-[1160px] max-w-full mx-auto lg:mx-0">
            <div
              v-for="(item, index) in course.fitting"
              :key="index"
              class="flex items-start bg-gray-900 text-white"
              style="padding: 20px; border-radius: 20px; gap: 15px; min-height: 141px;"
            >
              <span class="font-bold" style="font-size: 56px; line-height: 60px; color: #BCEC30;">
                {{ index + 1 }}
              </span>
              <span style="font-size: 18px; line-height: 22px; padding-top: 10px;">
                {{ item }}
              </span>
            </div>
          </div>
        </div>

        <!-- Направления -->
        <div v-if="course.directions?.length" class="mb-12 lg:mb-16">
          <h2 class="font-bold text-black mb-4 lg:mb-6" style="font-size: 28px; line-height: 32px;">
            Направления
          </h2>
          <div
            class="grid grid-cols-1 md:grid-cols-3 w-[1160px] max-w-full gap-[10px] md:gap-x-[40px] md:gap-y-[10px] mx-auto lg:mx-0"
            style="background-color: #BCEC30; border-radius: 20px; padding: 28px; min-height: 146px;"
          >
            <span
              v-for="direction in course.directions"
              :key="direction"
              class="text-black"
              style="font-size: 18px; line-height: 22px;"
            >
              ✦ {{ direction }}
            </span>
          </div>
        </div>

        <!-- Начните путь к новому телу -->
        <div
          class="bg-white shadow-md mb-12 lg:mb-16 relative overflow-hidden w-full lg:w-[1160px] max-w-full mx-auto lg:mx-0"
          style="border-radius: 30px; padding: 40px 20px 20px 20px;"
        >
          <!-- Текст и кнопка -->
          <div class="flex flex-col relative z-10 w-full lg:w-[437px]" style="gap: 10px;">
            <h2 class="font-bold text-black text-[28px] lg:text-[56px]" style="line-height: 1.1;">
              Начните путь<br />к новому телу
            </h2>
            <ul class="list-disc pl-6 text-gray-700 text-[16px] lg:text-[24px]" style="line-height: 1.4;">
              <li>проработка всех групп мышц</li>
              <li>тренировка суставов</li>
              <li>улучшение циркуляции крови</li>
              <li>упражнения заряжают бодростью</li>
              <li>помогают противостоять стрессам</li>
            </ul>
            <button
              @click="handleCourseAction"
              :disabled="actionLoading"
              class="bg-primary hover:bg-primary-hover text-black font-medium transition disabled:opacity-50 w-full lg:w-[437px]"
              style="height: 52px; border-radius: 46px; font-size: 16px;"
            >
              {{ actionLoading ? 'Загрузка...' : buttonText }}
            </button>
          </div>

          <!-- Бегун и линия (только для десктопа) -->
          <div
            class="hidden lg:block absolute lg:right-0 lg:top-[50%] lg:translate-y-[-50%]"
            style="width: 670px; height: 542px;"
          >
            <img
              src="~/assets/images/line.png"
              alt=""
              class="absolute z-[1] object-contain"
              style="
                width: 670px;
                height: 391px;
                left: 5px;
                top: 70%;
                transform: translateY(-50%) rotate(-12.38deg);
              "
            />
            <img
              src="~/assets/images/runner.png"
              alt=""
              class="absolute z-[2] object-contain"
              style="
                width: 487px;
                height: 542px;
                right: 0;
                top: 0;
                transform: rotate(2.99deg);
              "
            />
          </div>
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

// Цвета из Figma
const courseColor = computed(() => {
  const map: Record<string, string> = {
    'ab1c3f': '#FFC700', // Йога — жёлтый
    'kfpq8e': '#2491D2', // Стретчинг — синий
    'ypox9r': '#F7A012', // Фитнес — оранжевый
    '6i67sm': '#FF7E65', // Степ-аэробика — коралловый
    'q02a6i': '#7D458C', // Бодифлекс — фиолетовый
  }
  return map[course.value?._id || ''] || '#FFC700'
})

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
