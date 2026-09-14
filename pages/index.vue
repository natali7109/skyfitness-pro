<template>
  <div class="min-h-screen bg-gray-50">
    <div class="bg-white shadow-sm">
      <div class="max-w-container mx-auto px-4 py-8">
        <h1 class="text-3xl font-bold text-gray-900">Все курсы</h1>
        <p class="text-gray-600 mt-1">Выберите курс и начните тренировку</p>
      </div>
    </div>

    <div class="max-w-container mx-auto px-4 py-8">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <NuxtLink
          v-for="course in courses"
          :key="course._id"
          :to="`/courses/${course._id}`"
          class="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden"
        >
          <div class="p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-3">
              {{ course.nameRU }}
            </h2>
            <p class="text-gray-600 text-sm line-clamp-3 mb-4">
              {{ course.description }}
            </p>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-500">
                {{ course.durationInDays }} дней
              </span>
              <span
                class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                :class="difficultyClass(course.difficulty)"
              >
                {{ course.difficulty }}
              </span>
            </div>
          </div>
        </NuxtLink>
      </div>
    </div>

    <!-- Кнопка "Наверх" -->
    <button
      v-show="showScrollButton"
      @click="scrollToTop"
      class="fixed bottom-8 right-8 bg-primary hover:bg-primary-hover text-black p-3 rounded-full shadow-lg transition-all duration-200"
      aria-label="Наверх"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { mockCourses } from '~/utils/mockCourses'

const courses = ref(mockCourses)
const showScrollButton = ref(false)

const handleScroll = () => {
  showScrollButton.value = window.scrollY > 300
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const difficultyClass = (difficulty: string) => {
  const map: Record<string, string> = {
    'начальный': 'bg-green-100 text-green-800',
    'средний': 'bg-yellow-100 text-yellow-800',
    'сложный': 'bg-red-100 text-red-800',
  }
  return map[difficulty] || 'bg-gray-100 text-gray-800'
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>