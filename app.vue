<template>
  <div class="min-h-screen flex flex-col">
    <AppHeader />
    <main class="flex-1">
      <NuxtPage />
    </main>

    <!-- Модалка авторизации (глобально) -->
    <AuthModal
      :model-value="uiStore.isAuthModalOpen"
      @update:model-value="uiStore.closeAuthModal()"
      @success="handleAuthSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import AppHeader from '~/components/common/AppHeader.vue'
import AuthModal from '~/components/auth/AuthModal.vue'
import { useUserStore } from '~/stores/user'
import { useUiStore } from '~/stores/ui'

const userStore = useUserStore()
const uiStore = useUiStore()
const api = useApi()

const handleAuthSuccess = () => {
  // Ничего не делаем — пользователь авторизован, модалка закроется сама
}

onMounted(async () => {
  userStore.loadTokenFromStorage()

  if (userStore.token && !userStore.user) {
    try {
      const user = await api.getMe(userStore.token)
      userStore.setUser(user)
    } catch (err) {
      console.error('Ошибка загрузки пользователя:', err)
      userStore.logout()
    }
  }
})
</script>