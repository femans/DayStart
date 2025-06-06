// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxtjs/supabase', '@nuxt/ui', '@nuxt/eslint'],
  ssr: false,
  components: [
    { path: 'components/' },
    {
      path: 'node_modules/@headlessui/vue', // Path to the Headless UI components
      extensions: ['js', 'ts', 'vue'], // File extensions
    },
  ],
  devtools: { enabled: true },
  css: ['~/assets/css/main.css', 'vue-arrange/dist/vue-arrange.css'],
  router: {
    options: {
      strict: false, // Allows reusing components with dynamic params
    },
  },
  devServer: {
    port: 7777,
  },
  compatibilityDate: '2024-10-18',
  nitro: {
    preset: 'static', // Explicitly tell Nitro to generate static files
  },
  debug: false,
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
