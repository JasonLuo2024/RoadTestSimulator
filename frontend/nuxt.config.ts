export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",
  devtools: { enabled: true },
  modules: ["@nuxtjs/tailwindcss"],
  target: "static", // Set the target to 'static'
  router: {
    base: "/RoadTestSimulator/", // Make sure to include leading and trailing slashes
  },
});
