<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
    <div class="w-full max-w-[360px] bg-white rounded-[30px] shadow-md p-10">
      <!-- Логотип -->
      <div class="flex justify-center mb-10">
        <NuxtLink to="/" class="flex items-center gap-2">
          <img src="/images/logo.png" alt="SkyFitnessPro" class="h-8" />
        </NuxtLink>
      </div>

      <!-- Форма -->
      <form @submit.prevent="handleSubmit" class="flex flex-col gap-6">
        <!-- Email -->
        <input
          v-model="email"
          type="text"
          :placeholder="mode === 'login' ? 'Логин' : 'Эл. почта'"
          :class="[
            'w-full h-[52px] px-5 rounded-[30px] border text-black placeholder:text-gray-400 focus:outline-none focus:border-primary transition',
            errors.email ? 'border-red-500' : 'border-gray-200'
          ]"
        />

        <!-- Пароль -->
        <input
          v-model="password"
          type="password"
          placeholder="Пароль"
          :class="[
            'w-full h-[52px] px-5 rounded-[30px] border text-black placeholder:text-gray-400 focus:outline-none focus:border-primary transition',
            errors.password ? 'border-red-500' : 'border-gray-200'
          ]"
        />

        <!-- Подтверждение пароля (только для регистрации) -->
        <input
          v-if="mode === 'register'"
          v-model="confirmPassword"
          type="password"
          placeholder="Повторите пароль"
          :class="[
            'w-full h-[52px] px-5 rounded-[30px] border text-black placeholder:text-gray-400 focus:outline-none focus:border-primary transition',
            errors.confirmPassword ? 'border-red-500' : 'border-gray-200'
          ]"
        />

        <!-- Сообщение об ошибке от API -->
        <p
          v-if="apiError"
          class="text-red-500 text-sm text-center -mt-2"
        >
          {{ apiError }}
        </p>

        <!-- Сообщение об успехе -->
        <p
          v-if="successMessage"
          class="text-green-600 text-sm text-center -mt-2"
        >
          {{ successMessage }}
        </p>

        <!-- Кнопка «Войти» / «Зарегистрироваться» -->
        <button
          type="submit"
          :disabled="loading"
          class="w-full h-[52px] rounded-[30px] bg-primary hover:bg-primary-hover text-black font-medium transition disabled:opacity-50"
        >
          {{ loading ? 'Загрузка...' : (mode === 'login' ? 'Войти' : 'Зарегистрироваться') }}
        </button>

        <!-- Кнопка переключения режима -->
        <button
          type="button"
          @click="switchMode"
          class="w-full h-[52px] rounded-[30px] border-2 border-black text-black font-medium hover:bg-gray-50 transition"
        >
          {{ mode === 'login' ? 'Зарегистрироваться' : 'Войти' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '~/stores/user'
import { validateEmail, validatePassword } from '~/utils/validators'
import { getErrorMessage } from '~/utils/errors'

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

const switchMode = () => {
  mode.value = mode.value === 'login' ? 'register' : 'login'
  errors.email = ''
  errors.password = ''
  errors.confirmPassword = ''
  apiError.value = null
  successMessage.value = null
}

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

const handleSubmit = async () => {
  apiError.value = null
  successMessage.value = null

  if (!validateForm()) return

  loading.value = true

  try {
    if (mode.value === 'login') {
      const token = await api.login(email.value, password.value)
      userStore.setToken(token)
      const user = await api.getMe(token)
      userStore.setUser(user)
      router.push('/')
    } else {
      await api.register(email.value, password.value)
      successMessage.value = 'Регистрация прошла успешно! Теперь войдите в аккаунт.'
      mode.value = 'login'
      password.value = ''
      confirmPassword.value = ''
    }
  } catch (err: unknown) {
    apiError.value = getErrorMessage(err, 'Произошла ошибка')
  } finally {
    loading.value = false
  }
}
</script>