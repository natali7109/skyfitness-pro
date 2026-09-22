<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-6">Мой профиль</h1>

      <!-- Если не авторизован -->
      <div
        v-if="!userStore.isAuthenticated"
        class="bg-white rounded-2xl shadow-md p-6 text-center"
      >
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
          <p class="text-gray-600">
            <strong>Email:</strong> {{ userStore.user?.email }}
          </p>
        </div>

        <!-- Мои курсы -->
        <div class="bg-white rounded-2xl shadow-md p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Мои курсы</h2>

          <!-- Загрузка -->
          <div v-if="loading" class="text-gray-500">Загрузка курсов...</div>

          <!-- Нет курсов -->
          <div v-else-if="!myCourses.length" class="text-gray-500">
            У вас пока нет добавленных курсов
          </div>

          <!-- Список курсов -->
          <div
            v-else
            class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <div
              v-for="course in myCourses"
              :key="course._id"
              class="border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-shadow duration-200 flex flex-col"
            >
              <h3 class="text-lg font-semibold text-gray-900 mb-2">
                {{ course.nameRU }}
              </h3>
              <p class="text-gray-600 text-sm line-clamp-3 mb-4 flex-1">
                {{ course.description }}
              </p>

              <div class="flex flex-col gap-2">
                <NuxtLink
                  :to="`/courses/${course._id}`"
                  class="w-full text-center px-4 py-2 rounded-full bg-primary hover:bg-primary-hover text-black font-medium transition"
                >
                  Начать тренировку
                </NuxtLink>
                <button
                  @click="handleDeleteCourse(course._id)"
                  :disabled="deletingId === course._id"
                  class="w-full px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition disabled:opacity-50"
                >
                  {{
                    deletingId === course._id ? "Удаление..." : "Удалить курс"
                  }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import type { Course } from "~/types/api";
import { useUserStore } from "~/stores/user";

const userStore = useUserStore();
const api = useApi();

const allCourses = ref<Course[]>([]);
const loading = ref(true);
const deletingId = ref<string | null>(null);

// Фильтруем курсы: только те, что в selectedCourses пользователя
const myCourses = computed(() => {
  const selected = userStore.user?.selectedCourses || [];
  return allCourses.value.filter((course) => selected.includes(course._id));
});

// Загрузка всех курсов
const loadCourses = async () => {
  try {
    loading.value = true;
    const data = await api.getCourses();
    allCourses.value = data;
  } catch (err: any) {
    console.error("Ошибка загрузки курсов:", err.message);
  } finally {
    loading.value = false;
  }
};

// Удаление курса
const handleDeleteCourse = async (courseId: string) => {
  if (!userStore.token) return;

  deletingId.value = courseId;
  try {
    await api.deleteCourse(courseId, userStore.token);
    const user = await api.getMe(userStore.token);
    userStore.setUser(user);
  } catch (err: any) {
    console.error("Ошибка удаления курса:", err.message);
  } finally {
    deletingId.value = null;
  }
};

onMounted(() => {
  loadCourses();
});
</script>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
