/** @type {import('tailwindcss').Config} */
module.exports = {
  // darkMode: "class",
  content: ["./App.{js,jsx,ts,tsx}", "./screens/**/*.{js,jsx,ts,tsx}"],
  theme: {
    colors: {
      primary: "#ffffff",
      secondary: "#000000",
      gray: "#E8E8E8",
    },
    extend: {
      fontFamily: {
        urbanistBold: ["Urbanist_600SemiBold"],
        urbanist: ["Urbanist_500Medium"],
      },
    },
  },
  plugins: [],
};
