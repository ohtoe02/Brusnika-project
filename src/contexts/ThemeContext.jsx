import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext()

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export const ThemeProvider = ({ children }) => {
  // Инициализация темы: проверяем localStorage, затем системные предпочтения
  const [theme, setTheme] = useState(() => {
    // Проверяем localStorage
    const saved = localStorage.getItem('brusnika-theme')
    if (saved) return saved
    
    // Проверяем системные предпочтения
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark'
    }
    
    return 'light'
  })

  // Функция переключения темы
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
  }

  // Функция установки конкретной темы
  const setThemeMode = (newTheme) => {
    if (newTheme === 'light' || newTheme === 'dark') {
      setTheme(newTheme)
    }
  }

  // Применяем тему к DOM и сохраняем в localStorage
  useEffect(() => {
    const root = document.documentElement
    
    // Убираем предыдущие классы темы
    root.classList.remove('light', 'dark')
    
    // Добавляем новый класс темы
    root.classList.add(theme)
    
    // Сохраняем в localStorage
    localStorage.setItem('brusnika-theme', theme)
    
    // Устанавливаем color-scheme для браузера
    root.style.colorScheme = theme
  }, [theme])

  // Слушаем изменения системных предпочтений
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const handleChange = (e) => {
      // Обновляем тему только если пользователь не выбрал тему вручную
      const savedTheme = localStorage.getItem('brusnika-theme')
      if (!savedTheme) {
        setTheme(e.matches ? 'dark' : 'light')
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  const value = {
    theme,
    toggleTheme,
    setThemeMode,
    isDark: theme === 'dark',
    isLight: theme === 'light',
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
} 