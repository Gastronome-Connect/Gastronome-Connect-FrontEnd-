/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: "jit",
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      animation: {
        "slide-background": "slideBackground 30s infinite",
      },
      keyframes: {
        slideBackground: {
          "0%": {
            transform: "translateX(0)",
          },
          "33%": {
            transform: "translateX(-100%)",
          },
          "66%": {
            transform: "translateX(-200%)",
          },
          "100%": {
            transform: "translateX(-300%)",
          },
        },
      },
      fontFamily: {
        roboto: ["Roboto", "sans-serif"],
        sfpro: [
          "SF Pro Display", 
          "SF Pro Text",
          "SF Pro Condensed", 
          "-apple-system", 
          "BlinkMacSystemFont", 
          "Segoe UI", 
          "Roboto", 
          "Oxygen", 
          "Ubuntu", 
          "Cantarell", 
          "Open Sans", 
          "Helvetica Neue", 
          "sans-serif"
        ],
      },
    },
  },
  plugins: [],
};
