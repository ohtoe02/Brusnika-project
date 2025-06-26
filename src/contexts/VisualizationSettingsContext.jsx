import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import { TREE_CONFIG } from '../constants/treeConfig'

// Типы настроек для лучшей организации
const SETTING_CATEGORIES = {
  LAYOUT: 'layout',
  GRID: 'grid'
}

// Определение всех настроек с категориями и валидацией
const SETTINGS_SCHEMA = {
  // Настройки расположения
  nodeSize: { 
    category: SETTING_CATEGORIES.LAYOUT,
    defaultValue: { width: 50, height: 50 },
    validate: (value) => value.width >= 20 && value.width <= 200
  },
  spacing: {
    category: SETTING_CATEGORIES.LAYOUT,
    defaultValue: { horizontal: 200, vertical: 80 },
    validate: (value) => value.horizontal >= 50 && value.vertical >= 30
  },
  

  
  // Настройки сетки
  gridEnabled: {
    category: SETTING_CATEGORIES.GRID,
    defaultValue: true,
    validate: (value) => typeof value === 'boolean'
  },
  gridSize: {
    category: SETTING_CATEGORIES.GRID,
    defaultValue: 20,
    validate: (value) => value >= 5 && value <= 100
  },
  gridOpacity: {
    category: SETTING_CATEGORIES.GRID,
    defaultValue: 0.15,
    validate: (value) => value >= 0 && value <= 1
  },
  gridColor: {
    category: SETTING_CATEGORIES.GRID,
    defaultValue: '#6b7280',
    validate: (value) => /^#[0-9A-F]{6}$/i.test(value)
  },
  majorGridEnabled: {
    category: SETTING_CATEGORIES.GRID,
    defaultValue: true,
    validate: (value) => typeof value === 'boolean'
  },
  


}

// Создаем контекст
const VisualizationSettingsContext = createContext()

// Хук для использования контекста
export const useVisualizationSettings = () => {
  const context = useContext(VisualizationSettingsContext)
  if (!context) {
    throw new Error('useVisualizationSettings must be used within a VisualizationSettingsProvider')
  }
  return context
}

// Функция для получения настроек по умолчанию
const getDefaultSettings = () => {
  const defaults = {}
  Object.entries(SETTINGS_SCHEMA).forEach(([key, config]) => {
    defaults[key] = config.defaultValue
  })
  return defaults
}

// Функция валидации настройки
const validateSetting = (key, value) => {
  const schema = SETTINGS_SCHEMA[key]
  if (!schema) return false
  return schema.validate ? schema.validate(value) : true
}

// Функция для загрузки настроек из localStorage
const loadSettingsFromStorage = () => {
  try {
    const stored = localStorage.getItem('visualization-settings')
    if (stored) {
      const parsed = JSON.parse(stored)
      // Валидируем и возвращаем только корректные настройки
      const validated = {}
      Object.entries(parsed).forEach(([key, value]) => {
        if (SETTINGS_SCHEMA[key] && validateSetting(key, value)) {
          validated[key] = value
        }
      })
      return { ...getDefaultSettings(), ...validated }
    }
  } catch (error) {
    console.warn('Error loading settings from localStorage:', error)
  }
  return getDefaultSettings()
}

// Функция сохранения настроек в localStorage
const saveSettingsToStorage = (settings) => {
  try {
    localStorage.setItem('visualization-settings', JSON.stringify(settings))
  } catch (error) {
    console.warn('Error saving settings to localStorage:', error)
  }
}

// Функция преобразования настроек в формат TREE_CONFIG
const mapSettingsToTreeConfig = (settings) => {
  const config = { ...TREE_CONFIG }
  
  // Размеры узлов
  if (settings.nodeSize) {
    config.nodeSize = settings.nodeSize
  }
  
  // Расстояния
  if (settings.spacing) {
    config.spacing = {
      ...config.spacing,
      horizontal: settings.spacing.horizontal,
      vertical: settings.spacing.vertical
    }
  }
  


  
  // Сетка
  config.grid = {
    ...config.grid,
    enabled: settings.gridEnabled,
    size: settings.gridSize,
    opacity: {
      light: settings.gridOpacity,
      dark: settings.gridOpacity * 0.7
    },
    color: {
      light: settings.gridColor,
      dark: settings.gridColor
    },
    majorGrid: {
      ...config.grid.majorGrid,
      enabled: settings.majorGridEnabled
    }
  }
  

  
  return config
}

// Провайдер контекста
export const VisualizationSettingsProvider = ({ children }) => {
  // Состояние настроек
  const [settings, setSettings] = useState(() => loadSettingsFromStorage())
  
  // Список слушателей изменений для компонентов визуализации
  const [listeners, setListeners] = useState(new Set())
  
  // Функция обновления одной настройки
  const updateSetting = useCallback((key, value) => {
    console.log('🔧 VisualizationSettings.updateSetting called:', { key, value })
    
    // Валидируем настройку
    if (!validateSetting(key, value)) {
      console.warn(`Invalid value for setting ${key}:`, value)
      alert(`Ошибка валидации для ${key}: ${value}`)
      return false
    }
    
    setSettings(prevSettings => {
      const newSettings = { ...prevSettings, [key]: value }
      console.log('🔧 New settings state:', newSettings)
      
      // Уведомляем слушателей об изменениях
      const treeConfig = mapSettingsToTreeConfig(newSettings)
      console.log('🌲 Generated tree config:', treeConfig)
      console.log('🔧 Number of listeners:', listeners.size)
      
      listeners.forEach((listener, index) => {
        console.log(`📢 Notifying listener ${index}:`, listener)
        try {
          listener(treeConfig, key, value)
          console.log(`✅ Listener ${index} notified successfully`)
        } catch (error) {
          console.error(`❌ Error notifying listener ${index}:`, error)
        }
      })
      
      return newSettings
    })
    
    return true
  }, [listeners])
  
  // Функция обновления нескольких настроек
  const updateSettings = useCallback((updates) => {
    const validUpdates = {}
    
    // Валидируем все обновления
    Object.entries(updates).forEach(([key, value]) => {
      if (validateSetting(key, value)) {
        validUpdates[key] = value
      } else {
        console.warn(`Invalid value for setting ${key}:`, value)
      }
    })
    
    setSettings(prevSettings => {
      const newSettings = { ...prevSettings, ...validUpdates }
      
      // Уведомляем слушателей об изменениях
      const treeConfig = mapSettingsToTreeConfig(newSettings)
      listeners.forEach(listener => listener(treeConfig, null, validUpdates))
      
      return newSettings
    })
  }, [listeners])
  
  // Функция сброса настроек к значениям по умолчанию
  const resetSettings = useCallback(() => {
    const defaultSettings = getDefaultSettings()
    setSettings(defaultSettings)
    
    // Уведомляем слушателей об изменениях
    const treeConfig = mapSettingsToTreeConfig(defaultSettings)
    listeners.forEach(listener => listener(treeConfig, null, defaultSettings))
  }, [listeners])
  
  // Функция подписки на изменения настроек
  const subscribe = useCallback((listener) => {
    setListeners(prev => new Set([...prev, listener]))
    
    // Возвращаем функцию отписки
    return () => {
      setListeners(prev => {
        const newSet = new Set(prev)
        newSet.delete(listener)
        return newSet
      })
    }
  }, [])
  
  // Функция получения настроек определенной категории
  const getSettingsByCategory = useCallback((category) => {
    const categorySettings = {}
    Object.entries(SETTINGS_SCHEMA).forEach(([key, config]) => {
      if (config.category === category) {
        categorySettings[key] = settings[key]
      }
    })
    return categorySettings
  }, [settings])
  
  // Мемоизированная конфигурация для дерева
  const treeConfig = useMemo(() => mapSettingsToTreeConfig(settings), [settings])
  
  // Сохранение настроек в localStorage при изменении
  useEffect(() => {
    saveSettingsToStorage(settings)
  }, [settings])
  
  // Слушаем изменения в других вкладках
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'visualization-settings' && e.newValue) {
        try {
          setSettings(loadSettingsFromStorage()) // Перезагружаем с валидацией
        } catch (error) {
          console.warn('Error parsing settings from storage event:', error)
        }
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])
  
  const value = {
    // Состояние
    settings,
    treeConfig,
    
    // Actions
    updateSetting,
    updateSettings,
    resetSettings,
    subscribe,
    
    // Утилиты
    getSettingsByCategory,
    validateSetting,
    
    // Константы
    SETTING_CATEGORIES,
    SETTINGS_SCHEMA
  }
  
  return (
    <VisualizationSettingsContext.Provider value={value}>
      {children}
    </VisualizationSettingsContext.Provider>
  )
} 