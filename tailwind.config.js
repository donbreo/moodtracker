/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#f5f6f1",
        ink: "#25302a",
        sage: {
          50: "#f0f5f1",
          100: "#dfe9e1",
          300: "#abc4b1",
          500: "#61836a",
          600: "#4c6b55",
          700: "#3e5746"
        }
      },
      boxShadow: {
        card: "0 1px 2px rgba(31, 41, 35, 0.05), 0 8px 28px rgba(31, 41, 35, 0.04)"
      }
    }
  },
  plugins: []
};
