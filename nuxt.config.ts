// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxtjs/supabase', '@nuxt/ui', '@nuxt/eslint'],
  components: [
    'components/',
    {
      path: 'node_modules/@headlessui/vue', // Path to the Headless UI components
      extensions: ['js', 'ts', 'vue'], // File extensions
    },
  ],
  devtools: { enabled: true },
  css: [
    'vue-arrange/dist/vue-arrange.css',
  ],
  compatibilityDate: '2024-10-18',
  eslint: {
    config: {
      stylistic: true,
    },
  },
  supabase: {
    redirectOptions: {
      login: '/',
      callback: '/confirm',
    },
  },
})
