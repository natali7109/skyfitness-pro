<template>
  <div class="min-h-screen flex flex-col">
    <AppHeader />
    <main class="flex-1">
      <NuxtPage />
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import AppHeader from '~/components/common/AppHeader.vue'
import { useUserStore } from '~/stores/user'

const userStore = useUserStore()
const api = useApi()

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