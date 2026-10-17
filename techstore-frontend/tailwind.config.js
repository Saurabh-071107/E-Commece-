/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: { extend: { fontFamily: { sans: ["Inter", "ui-sans-serif", "system-ui"] }, colors: { ink: "#191919", paper: "#F8F7F4", muted: "#73736F", accent: "#D9F36A" } } },
  plugins: []
};
