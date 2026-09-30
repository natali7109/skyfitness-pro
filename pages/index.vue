<template>
  <div class="min-h-screen bg-white">
    <!-- Заголовок + зелёный блок -->
    <section
      class="max-w-[1440px] mx-auto px-4 lg:px-[140px] pt-4 lg:pt-[20px] pb-10 lg:pb-[60px]"
    >
      <div
        class="relative flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6"
      >
        <!-- Заголовок -->
        <h1
          class="text-[28px] md:text-[36px] lg:text-[40px] xl:text-[60px] font-medium leading-[1.1] lg:leading-[1.1] text-black max-w-[947px]"
        >
          Начните заниматься спортом и улучшите качество жизни
        </h1>

        <!-- Зелёный блок -->
        <div class="relative hidden lg:block lg:mt-[10px] flex-shrink-0">
          <div class="bg-primary rounded-[5px] px-5 py-4 max-w-[288px]">
            <p class="text-black text-lg lg:text-xl font-medium leading-tight">
              Измени своё тело за полгода!
            </p>
          </div>
          <!-- Полигон -->
          <img
            src="/images/polygon.png"
            alt=""
            class="absolute -bottom-[25px] left-[80px] w-[30px] h-[35px]"
          />
        </div>
      </div>
    </section>

    <!-- Карточки курсов -->
    <section class="max-w-[1440px] mx-auto px-4 lg:px-[140px] pb-[60px]">
      <!-- Загрузка -->
      <div v-if="loading" class="flex justify-center py-12">
        <div class="text-gray-500">Загрузка курсов...</div>
      </div>

      <!-- Ошибка -->
      <div
        v-else-if="error"
        class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl"
      >
        {{ error }}
      </div>

      <!-- Список курсов -->
      <div
        v-else
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center"
      >
        <CourseCard
          v-for="course in courses"
          :key="course._id"
          :course="course"
          variant="home"
          @add="handleAddCourse"
        />
      </div>
    </section>

    <!-- Кнопка «Наверх» -->
    <div v-show="showScrollButton" class="flex justify-center pb-[60px]">
      <button
        v-show="showScrollButton"
        @click="scrollToTop"
        class="fixed bottom-8 z-40 inline-flex items-center justify-center gap-2 w-[127px] h-[52px] rounded-[46px] bg-primary hover:bg-primary-hover text-black font-medium transition shadow-lg right-4 lg:right-auto lg:left-1/2 lg:-translate-x-1/2"
      >
        Наверх
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M5 10l7-7m0 0l7 7m-7-7v18"
          />
        </svg>
      </button>
    </div>

    <!-- Модалка авторизации -->
    <AuthModal v-model="isAuthModalOpen" @success="handleAuthSuccess" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import type { Course } from "~/types/api";
import { useUserStore } from "~/stores/user";
import { getErrorMessage } from "~/utils/errors";
import CourseCard from "~/components/course/CourseCard.vue";

const userStore = useUserStore();
const api = useApi();

const courses = ref<Course[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const showScrollButton = ref(false);
const isAuthModalOpen = ref(false);

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
};

const handleScroll = () => {
  showScrollButton.value = window.scrollY > 300;
};

const loadCourses = async () => {
  try {
    loading.value = true;
    error.value = null;
    const data = await api.getCourses();
    courses.value = data.sort((a, b) => a.order - b.order);
  } catch (err: unknown) {
    error.value = getErrorMessage(err, "Не удалось загрузить курсы");
  } finally {
    loading.value = false;
  }
};

const handleAddCourse = async (courseId: string) => {
  if (!userStore.isAuthenticated) {
    isAuthModalOpen.value = true;
    return;
  }
  if (!userStore.token) return;
  try {
    await api.addCourse(courseId, userStore.token);
    const user = await api.getMe(userStore.token);
    userStore.setUser(user);
  } catch (err: unknown) {
    console.error(getErrorMessage(err));
  }
};

onMounted(() => {
  loadCourses();
  window.addEventListener("scroll", handleScroll);
});

onBeforeUnmount(() => {
  window.removeEventListener("scroll", handleScroll);
});
</script>
