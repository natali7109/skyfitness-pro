<template>
 <div class="w-full bg-white rounded-[30px] overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-200 flex flex-col">
    <!-- Картинка + иконка -->
    <div class="relative w-full h-[275px] lg:h-[325px] flex-shrink-0">
      <img
        :src="courseImage"
        :alt="course.nameRU"
        class="w-full h-full object-cover"
      />
      <!-- Иконка «+» (для главной) -->
      <button
        v-if="variant === 'home'"
        @click="$emit('add', course._id)"
        class="absolute top-5 right-5 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow hover:bg-gray-100 transition"
        aria-label="Добавить курс"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
      </button>
      <!-- Иконка удаления (для профиля) -->
      <button
        v-else
        @click="$emit('delete', course._id)"
        class="absolute top-5 right-5 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow hover:bg-gray-100 transition"
        aria-label="Удалить курс"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>

    <!-- Контент -->
    <div class="p-5 flex flex-col flex-1 gap-4">
      <!-- Название -->
      <h3 class="text-[28px] font-semibold text-black leading-tight">
        {{ course.nameRU }}
      </h3>

      <!-- Метаданные (пилюли) -->
      <div class="flex flex-wrap items-center gap-2">
        <span
          v-if="course.durationInDays"
          class="inline-flex items-center gap-2 bg-gray-100 rounded-[46px] px-3 py-2 text-sm text-black"
        >
          <img src="/images/calendar.png" alt="" class="w-[18px] h-[18px]" />
          {{ course.durationInDays }} дней
        </span>
        <span
          v-if="course.dailyDurationInMinutes"
          class="inline-flex items-center gap-2 bg-gray-100 rounded-[46px] px-3 py-2 text-sm text-black"
        >
          <img src="/images/clock.png" alt="" class="w-[15px] h-[15px]" />
          {{ course.dailyDurationInMinutes.from }}-{{ course.dailyDurationInMinutes.to }} мин/день
        </span>
      </div>

      <!-- Сложность -->
      <div v-if="course.difficulty" class="flex items-center gap-2 text-sm text-gray-500">
        <img src="/images/difficulty.png" alt="" class="w-[18px] h-[18px]" />
        <span>Сложность:</span>
        <span class="text-gray-700">{{ course.difficulty }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Course } from '~/types/api'

const props = defineProps<{
  course: Course
  variant?: 'home' | 'profile'
}>()

defineEmits<{
  (e: 'add', courseId: string): void
  (e: 'delete', courseId: string): void
}>()

// Картинка курса по ID
const courseImage = computed(() => {
  const map: Record<string, string> = {
    'ab1c3f': '/images/yoga.png',
    'kfpq8e': '/images/stretching.png',
    'ypox9r': '/images/fitness.png',
    '6i67sm': '/images/step-aerobics.png',
    'q02a6i': '/images/bodyflex.png',
  }
  return map[props.course._id] || '/images/yoga.png'
})
</script>