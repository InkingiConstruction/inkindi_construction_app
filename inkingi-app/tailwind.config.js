/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e6f2f0',
          100: '#cce6e2',
          200: '#99ccc4',
          300: '#66b3a7',
          400: '#339989',
          500: '#007E6E', // Primary Brand Color
          600: '#007163',
          700: '#005e52',
          800: '#004c42',
          900: '#003f37',
          DEFAULT: '#007E6E',
        },
        secondary: '#00A896',
        darkBg: '#0f172a', // Slate-900 style
        darkCard: '#1e293b', // Slate-800 style
        darkBorder: '#334155', // Slate-700 style
      },
      fontFamily: {
        inter: ['Inter_400Regular', 'Inter_700Bold', 'sans-serif'],
        openSans: ['OpenSans_400Regular', 'OpenSans_600SemiBold', 'OpenSans_700Bold', 'sans-serif'],
        robotoMono: ['RobotoMono_400Regular', 'RobotoMono_700Bold', 'monospace'],
      }
    },
  },
  plugins: [],
}