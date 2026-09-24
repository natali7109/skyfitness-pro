<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      @click.self="close"
    >
      <div
        class="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 relative max-h-[80vh] flex flex-col"
      >
        <!-- Кнопка закрытия -->
        <button
          @click="close"
          class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
          aria-label="Закрыть"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <h2 class="text-xl font-bold text-gray-900 mb-6">
          Выберите тренировку
        </h2>

        <!-- Загрузка -->
        <div v-if="loading" class="text-gray-500 text-center py-8">
          Загрузка тренировок...
        </div>

        <!-- Ошибка -->
        <div
          v-else-if="error"
          class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"
        >
          {{ error }}
        </div>

        <!-- Список тренировок -->
        <ul v-else class="space-y-2 overflow-y-auto flex-1 mb-6">
          <li
            v-for="workout in workouts"
            :key="workout._id"
            class="flex items-start gap-3 p-3 rounded-xl transition cursor-pointer"
            :class="[
              selectedWorkout?._id === workout._id
                ? 'bg-gray-100'
                : 'hover:bg-gray-50',
            ]"
            @click="selectWorkout(workout)"
          >
            <!-- Кружок статуса -->
            <div
              class="w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 flex-shrink-0"
              :class="
                isWorkoutCompleted(workout._id)
                  ? 'bg-primary border-primary'
                  : 'border-gray-300'
              "
            >
              <svg
                v-if="isWorkoutCompleted(workout._id)"
                xmlns="http://www.w3.org/2000/svg"
                class="h-3 w-3 text-black"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="3"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            <!-- Информация -->
            <div class="flex-1">
              <p class="text-gray-900 font-medium">
                {{ getWorkoutTitle(workout.name) }}
              </p>
              <p class="text-gray-500 text-xs mt-1">
                {{ getWorkoutSubtitle(workout.name) }}
              </p>
            </div>
          </li>
        </ul>

        <!-- Кнопка "Начать" -->
        <button
          @click="handleStart"
          :disabled="!selectedWorkout"
          class="w-full py-3 rounded-full bg-primary hover:bg-primary-hover text-black font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Начать
        </button>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import type { WorkoutProgress } from "~/types/api";
import { getErrorMessage } from "~/utils/errors";
import { ref, watch } from "vue";
import type { Workout } from "~/types/api";
import { useUserStore } from "~/stores/user";

const props = defineProps<{
  modelValue: boolean;
  courseId: string;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
}>();

const userStore = useUserStore();
const api = useApi();

const workouts = ref<Workout[]>([]);
const progressData = ref<Record<string, WorkoutProgress>>({});
const loading = ref(false);
const error = ref<string | null>(null);
const selectedWorkout = ref<Workout | null>(null);

// Загрузка тренировок при открытии
watch(
  () => props.modelValue,
  async (val) => {
    if (val && props.courseId) {
      await loadWorkouts();
    } else {
      reset();
    }
  }
);

const loadWorkouts = async () => {
  if (!userStore.token) return;

  loading.value = true;
  error.value = null;

  try {
    const data = await api.getCourseWorkouts(props.courseId, userStore.token);
    workouts.value = data;

    const progress = await api.getProgress(props.courseId, userStore.token);
    const map: Record<string, WorkoutProgress> = {};
    if (progress.workoutsProgress) {
      for (const wp of progress.workoutsProgress) {
        map[wp.workoutId] = wp;
      }
    }
    progressData.value = map;
  } catch (err: unknown) {
    error.value = getErrorMessage(err, "Не удалось загрузить тренировки");
  } finally {
    loading.value = false;
  }
};

// Проверка, завершена ли тренировка
const isWorkoutCompleted = (workoutId: string): boolean => {
  return progressData.value[workoutId]?.workoutCompleted || false;
};

const selectWorkout = (workout: Workout) => {
  selectedWorkout.value = workout;
};

// Разбивка длинного названия
const getWorkoutTitle = (name: string): string => {
  return name.split(" / ")[0] || name;
};

const getWorkoutSubtitle = (name: string): string => {
  const parts = name.split(" / ");
  if (parts.length >= 3) {
    return `${parts[1]} / ${parts[2]}`;
  }
  return parts.slice(1).join(" / ") || "";
};

const handleStart = () => {
  if (!selectedWorkout.value) return;

  navigateTo(
    `/training/${selectedWorkout.value._id}?courseId=${props.courseId}`
  );
  close();
};

const close = () => {
  emit("update:modelValue", false);
};

const reset = () => {
  workouts.value = [];
  progressData.value = {};
  selectedWorkout.value = null;
  error.value = null;
};
</script>
