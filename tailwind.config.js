export default {
  content: [
    "./components/**/*.{vue,js,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./app.vue",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#BCEC30',
        'primary-hover': '#C6FF00',
      },
      maxWidth: {
        container: '1160px',
      },
    },
  },
  plugins: [],
}