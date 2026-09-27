<template>
  <header class="bg-white">
    <div class="max-w-[1440px] mx-auto px-4 lg:px-[140px] py-5 lg:py-[50px] flex items-start justify-between">
      <!-- Логотип + подпись -->
      <div class="flex flex-col gap-[15px]">
        <NuxtLink to="/" class="flex items-center gap-2">
         <img src="/images/logo.png" alt="SkyFitnessPro" class="h-[35px]" />
        </NuxtLink>
        <NuxtLink
          to="/"
          class="hidden lg:block text-[14px] text-black/50 hover:underline transition"
        >
          Онлайн-тренировки для занятий дома
        </NuxtLink>
      </div>

      <!-- Кнопка «Войти» / Профиль -->
      <div class="relative">
       <button
  v-if="!userStore.isAuthenticated"
  @click="uiStore.openAuthModal()"
  class="inline-flex items-center justify-center w-[83px] h-9 lg:w-[103px] lg:h-[52px] rounded-[46px] bg-primary hover:bg-primary-hover text-black text-sm lg:text-base font-normal transition"
>
  Войти
</button>

        <div v-else class="relative">
          <button
            @click="isMenuOpen = !isMenuOpen"
            class="flex items-center gap-2 text-black hover:text-gray-700 transition"
          >
            <span>{{ userName }}</span>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

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
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useUiStore } from '~/stores/ui'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '~/stores/user'

const uiStore = useUiStore()
const router = useRouter()
const userStore = useUserStore()
const isMenuOpen = ref(false)

const userName = computed(() => {
  return userStore.user?.email?.split('@')[0] || 'Пользователь'
})

const handleLogout = () => {
  userStore.logout()
  isMenuOpen.value = false
  router.push('/')
}
</script>