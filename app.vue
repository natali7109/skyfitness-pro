<template>
  <div class="min-h-screen flex flex-col">
    
    <AppHeader />
    <main class="flex-1">
      <NuxtPage />
    </main>
  </div>
</template>

<script setup lang="ts">
import AppHeader from '~/components/common/AppHeader.vue'
</script>