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
          class="hidden lg:block text-[18px] text-black/50 hover:underline transition"
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
            <!-- На десктопе: имя -->
            <span class="hidden lg:inline">{{ userName }}</span>

            <!-- На мобильных: иконка аватара -->
            <div class="lg:hidden w-[32px] h-[32px] bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-[24px] h-[24px] text-gray-400" style="margin-top: 8px;" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </div>

            <!-- Стрелка -->
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <!-- Выпадающее меню -->
          <div
            v-if="isMenuOpen"
            class="absolute right-0 bg-white shadow-lg z-50"
            style="width: 266px; border-radius: 30px; padding: 30px; margin-top: 10px;"
          >
            <!-- Имя и email -->
            <div class="text-center" style="margin-bottom: 34px;">
              <p class="text-black" style="font-size: 24px; line-height: 28px; font-weight: 500;">
                {{ userName }}
              </p>
              <p class="text-gray-500" style="font-size: 14px; line-height: 18px; margin-top: 8px;">
                {{ userStore.user?.email }}
              </p>
            </div>

            <!-- Кнопка "Мой профиль" -->
            <NuxtLink
              to="/profile"
              class="block text-center bg-primary hover:bg-primary-hover text-black font-medium transition"
              style="height: 52px; line-height: 52px; border-radius: 46px; font-size: 18px; margin-bottom: 10px;"
              @click="isMenuOpen = false"
            >
              Мой профиль
            </NuxtLink>

            <!-- Кнопка "Выйти" -->
            <button
              @click="handleLogout"
              class="w-full text-center bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium transition"
              style="height: 52px; border-radius: 46px; font-size: 18px;"
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