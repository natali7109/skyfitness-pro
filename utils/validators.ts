export const validateEmail = (value: string): string => {
  if (!value) return 'Введите email'
  const re = /^.+@.+\..+$/
  if (!re.test(value)) return 'Введите корректный Email'
  return ''
}

export const validatePassword = (value: string): string => {
  if (!value) return 'Введите пароль'
  if (value.length < 6) return 'Пароль должен содержать не менее 6 символов'
  const specialChars = value.match(/[!@#$%^&*(),.?":{}|<>]/g) || []
  if (specialChars.length < 2) return 'Пароль должен содержать не менее 2 специальных символов'
  if (!/[A-Z]/.test(value)) return 'Пароль должен содержать хотя бы одну заглавную букву'
  return ''
}