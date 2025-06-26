import { useTheme } from '../contexts/ThemeContext'
import { FiSun, FiMoon } from 'react-icons/fi'

const ThemeToggle = ({ className = '', size = 'md' }) => {
  const { toggleTheme, isDark } = useTheme()

  const sizeClasses = {
    sm: 'w-8 h-8 p-1.5',
    md: 'w-10 h-10 p-2',
    lg: 'w-12 h-12 p-2.5'
  }

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24
  }

  return (
    <button
      onClick={toggleTheme}
      className={`
        theme-toggle
        ${sizeClasses[size]}
        relative overflow-hidden
        bg-white dark:bg-neutral-800
        border-2 border-neutral-200 dark:border-neutral-600
        hover:border-primary-400 dark:hover:border-primary-500
        text-neutral-700 dark:text-neutral-300
        hover:text-primary-600 dark:hover:text-primary-400
        rounded-full transition-all duration-300 ease-in-out
        hover:scale-110 hover:shadow-lg
        focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-800
        group
        ${className}
      `}
      title={isDark ? 'Переключить на светлую тему' : 'Переключить на темную тему'}
      aria-label={isDark ? 'Переключить на светлую тему' : 'Переключить на темную тему'}
    >
      {/* Анимированный фон */}
      <div className={`
        absolute inset-0 rounded-full transition-all duration-500 ease-in-out
        ${isDark 
          ? 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 opacity-20' 
          : 'bg-gradient-to-br from-yellow-400 via-orange-400 to-red-400 opacity-20'
        }
        group-hover:opacity-30
      `} />
      
      {/* Контейнер для иконок */}
      <div className="relative flex items-center justify-center">
        {/* Иконка солнца */}
        <FiSun
          size={iconSizes[size]}
          className={`
            absolute transition-all duration-500 ease-in-out
            ${isDark 
              ? 'opacity-0 rotate-90 scale-50' 
              : 'opacity-100 rotate-0 scale-100'
            }
          `}
        />
        
        {/* Иконка луны */}
        <FiMoon
          size={iconSizes[size]}
          className={`
            absolute transition-all duration-500 ease-in-out
            ${isDark 
              ? 'opacity-100 rotate-0 scale-100' 
              : 'opacity-0 -rotate-90 scale-50'
            }
          `}
        />
      </div>
      
      {/* Анимированные лучи для светлой темы */}
      <div className={`
        absolute inset-0 transition-all duration-700 ease-in-out
        ${!isDark ? 'opacity-100' : 'opacity-0'}
      `}>
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className={`
              absolute w-0.5 h-2 bg-gradient-to-t from-yellow-400 to-orange-400
              transition-all duration-700 ease-in-out
              ${!isDark ? 'opacity-60' : 'opacity-0'}
            `}
            style={{
              top: '2px',
              left: '50%',
              transformOrigin: '50% 20px',
              transform: `translateX(-50%) rotate(${i * 45}deg)`
            }}
          />
        ))}
      </div>
      
      {/* Анимированные звезды для темной темы */}
      <div className={`
        absolute inset-0 transition-all duration-700 ease-in-out
        ${isDark ? 'opacity-100' : 'opacity-0'}
      `}>
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className={`
              absolute w-1 h-1 bg-white rounded-full
              transition-all duration-1000 ease-in-out
              ${isDark ? 'opacity-80 animate-pulse' : 'opacity-0'}
            `}
            style={{
              top: `${15 + i * 15}%`,
              left: `${20 + i * 25}%`,
              animationDelay: `${i * 0.5}s`
            }}
          />
        ))}
      </div>
    </button>
  )
}

export default ThemeToggle 