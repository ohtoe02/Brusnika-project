import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { TREE_CONFIG } from '../constants/treeConfig'

// Основной store приложения
export const useAppStore = create(
  subscribeWithSelector((set) => ({
    // Данные дерева
    data: null,
    setData: (data) => {
      set({ data })
      // Сохраняем в localStorage
      if (data) {
        try {
          localStorage.setItem('treeData', JSON.stringify(data))
        } catch (error) {
          console.warn('Ошибка сохранения данных:', error)
        }
      }
    },

    // Настройки визуализации
    visualizationType: 'tree',
    setVisualizationType: (type) => set({ visualizationType: type }),

    // Настройки дерева
    treeSettings: TREE_CONFIG,
    setTreeSettings: (settings) => set({ treeSettings: settings }),
    updateTreeSettings: (updates) => set((state) => ({
      treeSettings: { ...state.treeSettings, ...updates }
    })),

    // Поиск
    searchQuery: '',
    setSearchQuery: (query) => set({ searchQuery: query }),
    searchValue: '',
    setSearchValue: (value) => set({ searchValue: value }),
    showSearchBar: false,
    setShowSearchBar: (show) => set({ showSearchBar: show }),

    // UI состояние
    showShortcutsModal: false,
    setShowShortcutsModal: (show) => set({ showShortcutsModal: show }),
    showWelcomeScreen: false,
    setShowWelcomeScreen: (show) => set({ showWelcomeScreen: show }),
    currentPath: null,
    setCurrentPath: (path) => set({ currentPath: path }),

    // Размеры окна
    dimensions: {
      width: window.innerWidth - (window.innerWidth <= 768 ? 16 : 32),
      height: window.innerHeight - (window.innerWidth <= 768 ? 16 : 32),
    },
    setDimensions: (dimensions) => set({ dimensions }),

    // Ref для экземпляра дерева
    treeInstanceRef: { current: null },

    // Состояния загрузки
    isLoading: false,
    setIsLoading: (loading) => set({ isLoading: loading }),
    loadingMessage: '',
    setLoadingMessage: (message) => set({ loadingMessage: message }),
    loadingProgress: 0,
    setLoadingProgress: (progress) => set({ loadingProgress: progress }),

    // Инициализация данных из localStorage
    initializeData: () => {
      try {
        const saved = localStorage.getItem('treeData')
        if (saved) {
          const data = JSON.parse(saved)
          set({ data, showWelcomeScreen: false })
        } else {
          // Если данных нет, показываем Welcome экран
          set({ showWelcomeScreen: true })
        }
      } catch (error) {
        console.warn('Ошибка загрузки сохраненных данных:', error)
        set({ showWelcomeScreen: true })
      }
    },

    // Сброс состояния
    reset: () => set({
      data: null,
      searchQuery: '',
      searchValue: '',
      showSearchBar: false,
      showShortcutsModal: false,
      currentPath: null,
      treeSettings: TREE_CONFIG,
    }),
  }))
)

// Store для уведомлений (Toast)
export const useToastStore = create((set, get) => ({
  toasts: [],
  
  addToast: (toast) => {
    const id = Date.now() + Math.random()
    const newToast = { id, ...toast }
    
    set((state) => ({
      toasts: [...state.toasts, newToast]
    }))

    // Автоматически удаляем через duration
    if (toast.duration !== 0) {
      setTimeout(() => {
        get().removeToast(id)
      }, toast.duration || 3000)
    }

    return id
  },

  removeToast: (id) => set((state) => ({
    toasts: state.toasts.filter(toast => toast.id !== id)
  })),

  clearToasts: () => set({ toasts: [] }),

  // Хелперы для разных типов уведомлений
  showSuccess: (message, options = {}) => get().addToast({
    type: 'success',
    message,
    ...options
  }),

  showError: (message, options = {}) => get().addToast({
    type: 'error',
    message,
    ...options
  }),

  showWarning: (message, options = {}) => get().addToast({
    type: 'warning',
    message,
    ...options
  }),

  showInfo: (message, options = {}) => get().addToast({
    type: 'info',
    message,
    ...options
  }),
}))

// Store для настроек приложения
export const useSettingsStore = create(
  subscribeWithSelector((set, get) => ({
    // Настройки интерфейса
    sidebarCollapsed: false,
    setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

    // Настройки производительности
    performanceMode: false,
    setPerformanceMode: (enabled) => set({ performanceMode: enabled }),
    
    maxNodes: 1000,
    setMaxNodes: (max) => set({ maxNodes: max }),

    // Настройки отладки
    debugMode: false,
    setDebugMode: (enabled) => set({ debugMode: enabled }),

    // Сохранение настроек в localStorage
    saveSettings: () => {
      const settings = {
        sidebarCollapsed: get().sidebarCollapsed,
        performanceMode: get().performanceMode,
        maxNodes: get().maxNodes,
        debugMode: get().debugMode,
      }
      
      try {
        localStorage.setItem('appSettings', JSON.stringify(settings))
      } catch (error) {
        console.warn('Ошибка сохранения настроек:', error)
      }
    },

    // Загрузка настроек из localStorage
    loadSettings: () => {
      try {
        const saved = localStorage.getItem('appSettings')
        if (saved) {
          const settings = JSON.parse(saved)
          set(settings)
        }
      } catch (error) {
        console.warn('Ошибка загрузки настроек:', error)
      }
    },
  }))
)

// Подписываемся на изменения настроек для автосохранения
useSettingsStore.subscribe(
  (state) => state,
  () => {
    useSettingsStore.getState().saveSettings()
  }
) 