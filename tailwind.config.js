/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#0D4F4E',
          light: '#1A6E6D',
          dark: '#083635',
          50: '#EFF7F6',
          100: '#D6EAE9',
          200: '#A8D2D0',
          300: '#73B3B0',
          400: '#3F8E8C',
          500: '#1A6E6D',
          600: '#0D4F4E',
          700: '#083635',
          800: '#052524',
          900: '#021413',
          950: '#010A09'
        },
        accent: {
          DEFAULT: '#FF6B6B',
          light: '#FF8E8E',
          dark: '#E54848',
          glow: '#FFB4B4'
        },
        gold: {
          DEFAULT: '#D4AF37',
          light: '#E5C76B',
          dark: '#A88824'
        },
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
        info: '#3B82F6',
        bg: {
          DEFAULT: '#FAFAFA',
          warm: '#F9F7F4',
          dark: '#0A1414'
        },
        surface: '#FFFFFF',
        ink: {
          primary: '#0F1B1A',
          secondary: '#4B5563',
          tertiary: '#9CA3AF'
        },
        border: '#E5E7EB'
      },
      fontFamily: {
        sans: ['Tajawal', 'IBM Plex Sans Arabic', 'Inter', 'system-ui', 'sans-serif'],
        arabic: ['Tajawal', 'IBM Plex Sans Arabic', 'system-ui', 'sans-serif'],
        display: ['Tajawal', 'IBM Plex Sans Arabic', 'system-ui', 'sans-serif'],
        latin: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      },
      fontSize: {
        '7xl': ['4.5rem', { lineHeight: '1.05', letterSpacing: '-0.04em' }],
        '8xl': ['5.5rem', { lineHeight: '1.02', letterSpacing: '-0.045em' }],
        '9xl': ['7rem', { lineHeight: '1', letterSpacing: '-0.05em' }]
      },
      borderRadius: {
        card: '16px',
        btn: '10px',
        '2xl': '20px',
        '3xl': '28px',
        '4xl': '36px'
      },
      boxShadow: {
        card: '0 1px 2px 0 rgba(15, 27, 26, 0.04), 0 1px 3px 0 rgba(15, 27, 26, 0.06)',
        'card-hover':
          '0 12px 32px -8px rgba(13, 79, 78, 0.12), 0 4px 12px -4px rgba(13, 79, 78, 0.08)',
        soft: '0 2px 12px rgba(13, 79, 78, 0.06), 0 1px 3px rgba(13, 79, 78, 0.04)',
        glow: '0 0 0 4px rgba(13, 79, 78, 0.08)',
        'glow-lg': '0 0 60px -8px rgba(13, 79, 78, 0.3), 0 0 30px -6px rgba(13, 79, 78, 0.2)',
        'glow-accent': '0 0 60px -10px rgba(255, 107, 107, 0.45)',
        premium:
          '0 24px 48px -16px rgba(15, 27, 26, 0.16), 0 12px 24px -8px rgba(15, 27, 26, 0.08), 0 0 0 1px rgba(15, 27, 26, 0.04)',
        inset: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.6)'
      },
      backgroundImage: {
        'mesh-1':
          'radial-gradient(at 0% 0%, rgba(13,79,78,0.18) 0%, transparent 50%), radial-gradient(at 100% 0%, rgba(255,107,107,0.10) 0%, transparent 50%), radial-gradient(at 50% 100%, rgba(212,175,55,0.08) 0%, transparent 50%)',
        'mesh-2':
          'radial-gradient(at 100% 0%, rgba(13,79,78,0.25) 0%, transparent 55%), radial-gradient(at 0% 100%, rgba(255,107,107,0.18) 0%, transparent 55%)',
        'brand-gradient':
          'linear-gradient(135deg, #083635 0%, #0D4F4E 35%, #1A6E6D 70%, #0D4F4E 100%)',
        'accent-gradient': 'linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 50%, #E54848 100%)',
        grain: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3CfeColorMatrix values='0 0 0 0 0.05 0 0 0 0 0.3 0 0 0 0 0.3 0 0 0 0.5 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")"
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-down': 'slideDown 0.4s ease-out',
        float: 'float 6s ease-in-out infinite',
        'float-delay': 'float 6s ease-in-out 2s infinite',
        'float-slow': 'float 8s ease-in-out infinite',
        shimmer: 'shimmer 2.5s linear infinite',
        'gradient-x': 'gradientX 8s ease infinite',
        marquee: 'marquee 30s linear infinite',
        'spin-slow': 'spin 12s linear infinite',
        glow: 'glow 3s ease-in-out infinite',
        'bounce-subtle': 'bounceSubtle 2s ease-in-out infinite'
      },
      keyframes: {
        fadeIn: { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        slideUp: {
          '0%': { opacity: 0, transform: 'translateY(20px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' }
        },
        slideDown: {
          '0%': { opacity: 0, transform: 'translateY(-12px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' }
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' }
        },
        gradientX: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' }
        },
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(100%)' }
        },
        glow: {
          '0%, 100%': { opacity: 0.4 },
          '50%': { opacity: 0.8 }
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' }
        }
      },
      backdropBlur: { xs: '2px' }
    }
  },
  plugins: []
}
