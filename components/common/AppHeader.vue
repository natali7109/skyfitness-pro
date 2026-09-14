<template>
  <header class="bg-white shadow-sm">
    <div class="max-w-container mx-auto px-4 py-4 flex items-center justify-between">
      <!-- Логотип -->
      <NuxtLink to="/" class="flex items-center gap-2">
        <span class="text-2xl font-bold text-black">SkyFitnessPro</span>
      </NuxtLink>

      <!-- Навигация и пользователь -->
      <div class="flex items-center gap-6">
        <NuxtLink to="/" class="text-gray-600 hover:text-black transition">
          Курсы
        </NuxtLink>

        <!-- Если пользователь авторизован -->
        <div v-if="userStore.isAuthenticated" class="relative">
          <button
            @click="isMenuOpen = !isMenuOpen"
            class="flex items-center gap-2 text-gray-700 hover:text-black transition"
          >
            <span>{{ userStore.userName }}</span>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <!-- Выпадающее меню -->
          <div
            v-if="isMenuOpen"
            class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50"
          >
            <NuxtLink
              to="/profile"
              class="block px-4 py-2 text-gray-700 hover:bg-gray-50 transition"
              @click="isMenuOpen = false"
            >
              Мой профиль
            </NuxtLink>
            <button
              @click="handleLogout"
              class="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-50 transition"
            >
              Выйти
            </button>
          </div>
        </div>

        <!-- Если пользователь не авторизован -->
        <NuxtLink
          v-else
          to="/login"
          class="px-6 py-2 rounded-full bg-primary hover:bg-primary-hover text-black font-medium transition"
        >
          Войти
        </NuxtLink>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '~/stores/user'

const router = useRouter()
const userStore = useUserStore()
const isMenuOpen = ref(false)

const handleLogout = () => {
  userStore.logout()
  isMenuOpen.value = false
  router.push('/')
}
</script>