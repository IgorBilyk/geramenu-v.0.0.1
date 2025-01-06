/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bgGreen: "#356061",
        gray: {
          100: "#C6D8D3",
          500: "#8A9A94",
          900: "#2E3E3B",
        },
        red: {
          100: "#F8E1E1",
          500: "#EB5E55",
          600: "#D9534F",
        },
        textWhite: "#ffffff",
      },
    },
  },
  plugins: [],
};
