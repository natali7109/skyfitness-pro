export {}

declare module 'nuxt/app' {
  export const $fetch: typeof import('ofetch').$fetch
}