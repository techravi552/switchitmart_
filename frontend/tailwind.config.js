export default {
  darkMode: 'class',
  content: ["./index.html","./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: { 50:'#fff7ed',100:'#ffedd5',200:'#fed7aa',300:'#fdba74',400:'#fb923c',500:'#f97316',600:'#ea580c',700:'#c2410c',800:'#9a3412',900:'#7c2d12' },
        navy:  { 50:'#f0f4ff',100:'#e0e9ff',200:'#c7d5fe',300:'#a5b8fc',400:'#8191f9',500:'#6366f1',600:'#4f46e5',700:'#4338ca',800:'#1e1b4b',900:'#0f0e2e' },
      },
      fontFamily: { display:['"Syne"','sans-serif'], body:['"DM Sans"','sans-serif'] },
      animation: { 'fade-in':'fadeIn 0.5s ease-out','slide-up':'slideUp 0.4s ease-out','pulse-slow':'pulse 3s infinite','bounce-gentle':'bounceGentle 2s ease-in-out infinite' },
      keyframes: {
        fadeIn:       {'0%':{opacity:'0'},'100%':{opacity:'1'}},
        slideUp:      {'0%':{opacity:'0',transform:'translateY(20px)'},'100%':{opacity:'1',transform:'translateY(0)'}},
        bounceGentle: {'0%,100%':{transform:'translateY(0)'},'50%':{transform:'translateY(-6px)'}},
      },
      boxShadow: { card:'0 4px 24px rgba(0,0,0,0.08)', 'card-hover':'0 8px 40px rgba(0,0,0,0.14)', orange:'0 4px 20px rgba(249,115,22,0.35)' },
    },
  },
  plugins: [],
}
