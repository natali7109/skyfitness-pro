<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
    <div class="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
      <!-- Переключатель Вход / Регистрация -->
      <div class="flex mb-8 bg-gray-100 rounded-full p-1">
        <button
          @click="mode = 'login'"
          :class="[
            'flex-1 py-2 rounded-full text-sm font-medium transition',
            mode === 'login' ? 'bg-white shadow text-black' : 'text-gray-500'
          ]"
        >
          Войти
        </button>
        <button
          @click="mode = 'register'"
          :class="[
            'flex-1 py-2 rounded-full text-sm font-medium transition',
            mode === 'register' ? 'bg-white shadow text-black' : 'text-gray-500'
          ]"
        >
          Зарегистрироваться
        </button>
      </div>

      <!-- Заголовок -->
      <h1 class="text-2xl font-bold text-gray-900 mb-6 text-center">
        {{ mode === 'login' ? 'Вход в аккаунт' : 'Регистрация' }}
      </h1>

      <!-- Форма -->
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <!-- Email -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            v-model="email"
            type="email"
            placeholder="user@example.com"
            class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <p v-if="errors.email" class="text-red-500 text-sm mt-1">{{ errors.email }}</p>
        </div>

        <!-- Пароль -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Пароль</label>
          <input
            v-model="password"
            type="password"
            placeholder="••••••••"
            class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <p v-if="errors.password" class="text-red-500 text-sm mt-1">{{ errors.password }}</p>
        </div>

        <!-- Подтверждение пароля (только для регистрации) -->
        <div v-if="mode === 'register'">
          <label class="block text-sm font-medium text-gray-700 mb-1">Подтвердите пароль</label>
          <input
            v-model="confirmPassword"
            type="password"
            placeholder="••••••••"
            class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <p v-if="errors.confirmPassword" class="text-red-500 text-sm mt-1">{{ errors.confirmPassword }}</p>
        </div>

        <!-- Сообщение об ошибке от API -->
        <div v-if="apiError" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {{ apiError }}
        </div>

        <!-- Сообщение об успехе -->
        <div v-if="successMessage" class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
          {{ successMessage }}
        </div>

        <!-- Кнопка -->
        <button
          type="submit"
          :disabled="loading"
          class="w-full py-3 rounded-full bg-primary hover:bg-primary-hover text-black font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ loading ? 'Загрузка...' : (mode === 'login' ? 'Войти' : 'Зарегистрироваться') }}
        </button>
      </form>

      <!-- Ссылка на главную -->
      <div class="mt-6 text-center">
        <NuxtLink to="/" class="text-sm text-gray-500 hover:text-gray-700">
          ← Вернуться на главную
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '~/stores/user'

const router = useRouter()
const userStore = useUserStore()
const api = useApi()

const mode = ref<'login' | 'register'>('login')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const apiError = ref<string | null>(null)
const successMessage = ref<string | null>(null)

const errors = reactive({
  email: '',
  password: '',
  confirmPassword: '',
})

// Валидация email
const validateEmail = (value: string): string => {
  if (!value) return 'Введите email'
  const re = /^.+@.+\..+$/
  if (!re.test(value)) return 'Введите корректный Email'
  return ''
}

// Валидация пароля (требования API)
const validatePassword = (value: string): string => {
  if (!value) return 'Введите пароль'
  if (value.length < 6) return 'Пароль должен содержать не менее 6 символов'
  const specialChars = value.match(/[!@#$%^&*(),.?":{}|<>]/g) || []
  if (specialChars.length < 2) return 'Пароль должен содержать не менее 2 специальных символов'
  if (!/[A-Z]/.test(value)) return 'Пароль должен содержать хотя бы одну заглавную букву'
  return ''
}

// Валидация всей формы
const validateForm = (): boolean => {
  errors.email = validateEmail(email.value)
  errors.password = validatePassword(password.value)
  errors.confirmPassword = ''

  if (mode.value === 'register') {
    if (!confirmPassword.value) {
      errors.confirmPassword = 'Подтвердите пароль'
    } else if (confirmPassword.value !== password.value) {
      errors.confirmPassword = 'Пароли не совпадают'
    }
  }

  return !errors.email && !errors.password && !errors.confirmPassword
}

// Отправка формы
const handleSubmit = async () => {
  apiError.value = null
  successMessage.value = null

  if (!validateForm()) return

  loading.value = true

  try {
    if (mode.value === 'login') {
      // Вход
      const token = await api.login(email.value, password.value)
      userStore.setToken(token)
      const user = await api.getMe(token)
      userStore.setUser(user)
      router.push('/')
    } else {
      // Регистрация
      await api.register(email.value, password.value)
      successMessage.value = 'Регистрация прошла успешно! Теперь войдите в аккаунт.'
      mode.value = 'login'
      password.value = ''
      confirmPassword.value = ''
    }
  } catch (err: any) {
    apiError.value = err.message || 'Произошла ошибка'
  } finally {
    loading.value = false
  }
}
</script>