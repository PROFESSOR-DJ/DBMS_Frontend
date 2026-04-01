// Tailwind config defines the frontend utility class scanning paths and theme extensions.
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81'
        },
        accent: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7e22ce',
          800: '#6b21a8',
          900: '#581c87'
        },
        surface: {
          900: '#0a0f1e',
          800: '#0d1b2a',
          700: '#111827',
          600: '#1a2332',
          500: '#1e2d3d',
          400: '#243447',
          300: '#2d3f52'
        },
        glass: {
          DEFAULT: 'rgba(255,255,255,0.05)',
          light: 'rgba(255,255,255,0.08)',
          border: 'rgba(255,255,255,0.12)'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif']
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'hero-gradient': 'linear-gradient(135deg, #0a0f1e 0%, #0d1b2a 50%, #0f172a 100%)',
        'card-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
        'btn-gradient': 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
        'btn-gradient-hover': 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #9333ea 100%)'
      },
      backdropBlur: {
        xs: '2px'
      },
      boxShadow: {
        'glow-sm': '0 0 10px rgba(99,102,241,0.3)',
        'glow': '0 0 20px rgba(99,102,241,0.4)',
        'glow-lg': '0 0 40px rgba(99,102,241,0.5)',
        'glow-accent': '0 0 20px rgba(168,85,247,0.4)',
        'card': '0 4px 24px rgba(0,0,0,0.4), 0 1px 4px rgba(0,0,0,0.3)',
        'card-hover': '0 8px 40px rgba(0,0,0,0.5), 0 0 20px rgba(99,102,241,0.2)',
        'inner-glow': 'inset 0 1px 0 rgba(255,255,255,0.1)'
      },
      keyframes: {
        fadeIn: {
          '0%': {
            opacity: '0',
            transform: 'translateY(16px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)'
          }
        },
        slideUp: {
          '0%': {
            opacity: '0',
            transform: 'translateY(32px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)'
          }
        },
        scaleIn: {
          '0%': {
            opacity: '0',
            transform: 'scale(0.92)'
          },
          '100%': {
            opacity: '1',
            transform: 'scale(1)'
          }
        },
        float: {
          '0%, 100%': {
            transform: 'translateY(0px)'
          },
          '50%': {
            transform: 'translateY(-12px)'
          }
        },
        floatSlow: {
          '0%, 100%': {
            transform: 'translateY(0px) rotate(0deg)'
          },
          '33%': {
            transform: 'translateY(-18px) rotate(3deg)'
          },
          '66%': {
            transform: 'translateY(-8px) rotate(-2deg)'
          }
        },
        glow: {
          '0%, 100%': {
            boxShadow: '0 0 20px rgba(99,102,241,0.3)'
          },
          '50%': {
            boxShadow: '0 0 40px rgba(99,102,241,0.6), 0 0 60px rgba(168,85,247,0.3)'
          }
        },
        shimmer: {
          '0%': {
            backgroundPosition: '-1000px 0'
          },
          '100%': {
            backgroundPosition: '1000px 0'
          }
        },
        pulseGlow: {
          '0%, 100%': {
            opacity: '0.6'
          },
          '50%': {
            opacity: '1'
          }
        },
        orb: {
          '0%': {
            transform: 'translate(0, 0) scale(1)'
          },
          '33%': {
            transform: 'translate(30px, -30px) scale(1.05)'
          },
          '66%': {
            transform: 'translate(-20px, 20px) scale(0.95)'
          },
          '100%': {
            transform: 'translate(0, 0) scale(1)'
          }
        },
        gradientShift: {
          '0%, 100%': {
            backgroundPosition: '0% 50%'
          },
          '50%': {
            backgroundPosition: '100% 50%'
          }
        },
        countUp: {
          '0%': {
            opacity: '0',
            transform: 'translateY(8px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)'
          }
        },
        borderGlow: {
          '0%, 100%': {
            borderColor: 'rgba(99,102,241,0.3)'
          },
          '50%': {
            borderColor: 'rgba(168,85,247,0.6)'
          }
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out both',
        'fade-in-slow': 'fadeIn 0.8s ease-out both',
        'slide-up': 'slideUp 0.6s ease-out both',
        'scale-in': 'scaleIn 0.4s ease-out both',
        'float': 'float 4s ease-in-out infinite',
        'float-slow': 'floatSlow 7s ease-in-out infinite',
        'glow': 'glow 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'orb': 'orb 8s ease-in-out infinite',
        'orb-reverse': 'orb 10s ease-in-out infinite reverse',
        'gradient': 'gradientShift 4s ease infinite',
        'count-up': 'countUp 0.5s ease-out both',
        'border-glow': 'borderGlow 2s ease-in-out infinite'
      },
      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
      }
    }
  },
  plugins: []
};
