import React from 'react'

// Система динамической загрузки D3 модулей
class D3Loader {
  constructor() {
    this.cache = new Map()
    this.loadingPromises = new Map()
  }

  // Загрузка модулей с кешированием
  async loadModule(moduleName) {
    if (this.cache.has(moduleName)) {
      return this.cache.get(moduleName)
    }

    if (this.loadingPromises.has(moduleName)) {
      return this.loadingPromises.get(moduleName)
    }

    const loadPromise = this.importModule(moduleName)
    this.loadingPromises.set(moduleName, loadPromise)

    try {
      const module = await loadPromise
      this.cache.set(moduleName, module)
      this.loadingPromises.delete(moduleName)
      return module
    } catch (error) {
      this.loadingPromises.delete(moduleName)
      throw error
    }
  }

  // Импорт конкретного модуля
  async importModule(moduleName) {
    switch (moduleName) {
      case 'hierarchy':
        return import('d3-hierarchy')
      case 'selection':
        return import('d3-selection')
      case 'zoom':
        return import('d3-zoom')
      case 'transition':
        return import('d3-transition')
      case 'ease':
        return import('d3-ease')
      case 'scale':
        return import('d3-scale')
      case 'shape':
        return import('d3-shape')
      case 'color':
        return import('d3-color')
      case 'interpolate':
        return import('d3-interpolate')
      case 'force':
        return import('d3-force')
      default:
        throw new Error(`Unknown D3 module: ${moduleName}`)
    }
  }

  // Предзагрузка основных модулей
  async preloadCore() {
    const coreModules = ['hierarchy', 'selection', 'zoom', 'transition', 'ease']
    return Promise.all(coreModules.map(module => this.loadModule(module)))
  }

  // Предзагрузка всех модулей
  async preloadAll() {
    const allModules = [
      'hierarchy', 'selection', 'zoom', 'transition', 'ease',
      'scale', 'shape', 'color', 'interpolate', 'force'
    ]
    return Promise.all(allModules.map(module => this.loadModule(module)))
  }

  // Создание D3 объекта из загруженных модулей
  async createD3Object(requiredModules = []) {
    const modules = await Promise.all(
      requiredModules.map(module => this.loadModule(module))
    )

    const d3 = {}
    
    requiredModules.forEach((moduleName, index) => {
      const module = modules[index]
      Object.assign(d3, module)
    })

    return d3
  }

  // Очистка кеша
  clearCache() {
    this.cache.clear()
    this.loadingPromises.clear()
  }

  // Получение статистики
  getStats() {
    return {
      cached: this.cache.size,
      loading: this.loadingPromises.size,
      modules: Array.from(this.cache.keys())
    }
  }
}

// Синглтон экземпляр
const d3Loader = new D3Loader()

// Экспортируемые функции
export const loadD3Module = (moduleName) => d3Loader.loadModule(moduleName)
export const preloadD3Core = () => d3Loader.preloadCore()
export const preloadD3All = () => d3Loader.preloadAll()
export const createD3 = (modules) => d3Loader.createD3Object(modules)
export const clearD3Cache = () => d3Loader.clearCache()
export const getD3Stats = () => d3Loader.getStats()

// Хук для использования в React компонентах
export const useD3 = (requiredModules = []) => {
  const [d3, setD3] = React.useState(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(null)

  React.useEffect(() => {
    if (requiredModules.length === 0) {
      setLoading(false)
      return
    }

    let mounted = true

    const loadD3 = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const d3Object = await createD3(requiredModules)
        
        if (mounted) {
          setD3(d3Object)
          setLoading(false)
        }
      } catch (err) {
        if (mounted) {
          setError(err)
          setLoading(false)
        }
      }
    }

    loadD3()

    return () => {
      mounted = false
    }
  }, [requiredModules.join(',')])

  return { d3, loading, error }
}

// Утилита для предзагрузки в фоне
export const backgroundPreload = () => {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      preloadD3Core().catch(console.warn)
    })
  } else {
    setTimeout(() => {
      preloadD3Core().catch(console.warn)
    }, 1000)
  }
}

export default d3Loader 