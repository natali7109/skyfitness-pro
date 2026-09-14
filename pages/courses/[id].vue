<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-container mx-auto px-4 py-8">
      <!-- Хлебные крошки -->
      <div class="mb-6">
        <NuxtLink to="/" class="text-gray-500 hover:text-black transition text-sm">
          ← Все курсы
        </NuxtLink>
      </div>

      <!-- Если курс не найден -->
      <div v-if="!course" class="text-center py-12">
        <p class="text-gray-500">Курс не найден</p>
      </div>

      <!-- Курс -->
      <div v-else>
        <!-- Заголовок -->
        <h1 class="text-4xl font-bold text-gray-900 mb-4">{{ course.nameRU }}</h1>

        <!-- Метаданные -->
        <div class="flex flex-wrap items-center gap-4 mb-8">
          <span class="text-sm text-gray-500">{{ course.durationInDays }} дней</span>
          <span
            class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
            :class="difficultyClass(course.difficulty)"
          >
            {{ course.difficulty }}
          </span>
          <span class="text-sm text-gray-500">
            {{ course.dailyDurationInMinutes.from }}–{{ course.dailyDurationInMinutes.to }} мин/день
          </span>
        </div>

        <!-- Описание -->
        <div class="bg-white rounded-2xl shadow-md p-6 mb-8">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Описание</h2>
          <p class="text-gray-600 leading-relaxed">{{ course.description }}</p>
        </div>

        <!-- Подойдет для вас, если -->
        <div class="bg-white rounded-2xl shadow-md p-6 mb-8">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Подойдет для вас, если:</h2>
          <ul class="space-y-3">
            <li v-for="(item, index) in course.fitting" :key="index" class="flex items-start gap-3">
              <span class="text-primary font-bold">{{ index + 1 }}.</span>
              <span class="text-gray-600">{{ item }}</span>
            </li>
          </ul>
        </div>

        <!-- Направления -->
        <div class="bg-white rounded-2xl shadow-md p-6 mb-8">
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

        <!-- Кнопка "Добавить курс" -->
        <div class="bg-white rounded-2xl shadow-md p-6">
          <button
            @click="handleAddCourse"
            class="w-full sm:w-auto px-8 py-3 rounded-full bg-primary hover:bg-primary-hover text-black font-medium transition"
          >
            {{ buttonText }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { mockCourses } from '~/utils/mockCourses'
import { useUserStore } from '~/stores/user'

const route = useRoute()
const userStore = useUserStore()

const course = computed(() => {
  const id = route.params.id as string
  return mockCourses.find((c) => c._id === id)
})

const isCourseAdded = computed(() => {
  return userStore.user?.selectedCourses?.includes(course.value?._id || '') || false
})

const buttonText = computed(() => {
  if (!userStore.isAuthenticated) return 'Войдите, чтобы добавить курс'
  if (isCourseAdded.value) return 'Перейти к тренировкам'
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

const handleAddCourse = () => {
  if (!userStore.isAuthenticated) {
    navigateTo('/login')
    return
  }
  // TODO: добавить курс через API (пока заглушка)
  console.log('Добавить курс:', course.value?._id)
}
</script>