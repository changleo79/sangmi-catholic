/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'catholic-blue': '#1e3a8a',
        'catholic-logo': '#7B1F4B',
        'catholic-logo-dark': '#5a1538',
        'catholic-gold': '#d4af37',
      },
      fontFamily: {
        sans: [
          'Pretendard',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Noto Sans KR',
          'Apple SD Gothic Neo',
          'Malgun Gothic',
          'sans-serif'
        ]
      }
    },
  },
  plugins: [],
}
