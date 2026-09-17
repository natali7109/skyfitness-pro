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
          <div v-if="!userStore.user?.selectedCourses?.length" class="text-gray-500">
            У вас пока нет добавленных курсов
          </div>
          <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
              v-for="courseId in userStore.user.selectedCourses"
              :key="courseId"
              class="border rounded-xl p-4"
            >
              <p class="text-gray-500 text-sm">ID курса: {{ courseId }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '~/stores/user'

const userStore = useUserStore()
</script>