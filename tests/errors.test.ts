import { describe, it, expect } from 'vitest'
import { getErrorMessage } from '../utils/errors'

describe('getErrorMessage', () => {
  it('возвращает message из Error', () => {
    const error = new Error('Что-то пошло не так')
    expect(getErrorMessage(error)).toBe('Что-то пошло не так')
  })

  it('возвращает fallback для объекта без message', () => {
    expect(getErrorMessage({}, 'Ошибка по умолчанию')).toBe('Ошибка по умолчанию')
  })

  it('возвращает fallback для строки', () => {
    expect(getErrorMessage('просто строка', 'Ошибка')).toBe('Ошибка')
  })

  it('возвращает fallback для null', () => {
    expect(getErrorMessage(null, 'Ошибка')).toBe('Ошибка')
  })

  it('возвращает дефолтный fallback, если он не указан', () => {
    expect(getErrorMessage(null)).toBe('Произошла ошибка')
  })
})