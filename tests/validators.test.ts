import { describe, it, expect } from 'vitest'
import { validateEmail, validatePassword } from '../utils/validators'

describe('validateEmail', () => {
  it('возвращает ошибку для пустого email', () => {
    expect(validateEmail('')).toBe('Введите email')
  })

  it('возвращает ошибку для некорректного email', () => {
    expect(validateEmail('not-an-email')).toBe('Введите корректный Email')
  })

  it('возвращает пустую строку для корректного email', () => {
    expect(validateEmail('user@example.com')).toBe('')
  })
})

describe('validatePassword', () => {
  it('возвращает ошибку для пустого пароля', () => {
    expect(validatePassword('')).toBe('Введите пароль')
  })

  it('возвращает ошибку для короткого пароля', () => {
    expect(validatePassword('Ab1!')).toBe('Пароль должен содержать не менее 6 символов')
  })

  it('возвращает ошибку, если меньше 2 спецсимволов', () => {
    expect(validatePassword('Abcdef1!')).toBe('Пароль должен содержать не менее 2 специальных символов')
  })

  it('возвращает ошибку, если нет заглавной буквы', () => {
  expect(validatePassword('abcdef1!@')).toBe('Пароль должен содержать хотя бы одну заглавную букву')
})

  it('возвращает пустую строку для корректного пароля', () => {
    expect(validatePassword('Qwerty!@')).toBe('')
  })
})