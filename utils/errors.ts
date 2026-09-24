export const getErrorMessage = (err: unknown, fallback = 'Произошла ошибка'): string => {
  if (err && typeof err === 'object' && 'message' in err) {
    return String((err as { message: unknown }).message)
  }
  return fallback
}