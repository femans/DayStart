// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: false },
  modules: ['@nuxtjs/supabase', '@nuxt/ui', '@nuxt/eslint'],
  components: [
    'components/',
    {
      path: 'node_modules/@headlessui/vue', // Path to the Headless UI components
      extensions: ['js', 'ts', 'vue'], // File extensions
    },
  ],
  supabase: {
    redirectOptions: {
      login: '/',
      callback: '/confirm',
    },
  },

  compatibilityDate: '2024-10-18',
})