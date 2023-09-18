/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./App.{js,jsx,ts,tsx}", "./screens/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        example: ["ExampleFontFamily"],
      },
    },
  },
  plugins: [],
};
