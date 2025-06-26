import { useCallback } from 'react'
import { useAppStore, useToastStore, useSettingsStore } from '../store/appStore'

// Хук для работы с данными дерева
export const useTreeData = () => {
  const data = useAppStore(state => state.data)
  const setData = useAppStore(state => state.setData)
  const initializeData = useAppStore(state => state.initializeData)
  
  return { data, setData, initializeData }
}

// Хук для работы с настройками дерева
export const useTreeSettings = () => {
  const treeSettings = useAppStore(state => state.treeSettings)
  const setTreeSettings = useAppStore(state => state.setTreeSettings)
  const updateTreeSettings = useAppStore(state => state.updateTreeSettings)
  
  return { treeSettings, setTreeSettings, updateTreeSettings }
}

// Хук для работы с поиском
export const useSearch = () => {
  const searchQuery = useAppStore(state => state.searchQuery)
  const setSearchQuery = useAppStore(state => state.setSearchQuery)
  const searchValue = useAppStore(state => state.searchValue)
  const setSearchValue = useAppStore(state => state.setSearchValue)
  const showSearchBar = useAppStore(state => state.showSearchBar)
  const setShowSearchBar = useAppStore(state => state.setShowSearchBar)
  const treeInstanceRef = useAppStore(state => state.treeInstanceRef)
  
  // Функция выполнения поиска с уведомлениями
  const performSearch = useCallback((query) => {
    const { showSuccess, showWarning } = useToastStore.getState()
    
    if (query.trim() && treeInstanceRef.current) {
      treeInstanceRef.current.revealPathToNode(query.trim())
      showSuccess(`Поиск: "${query.trim()}"`)
    } else if (query.trim() && !treeInstanceRef.current) {
      showWarning('Дерево не загружено. Сначала загрузите файл.')
    }
  }, [treeInstanceRef])
  
  return {
    searchQuery,
    setSearchQuery,
    searchValue,
    setSearchValue,
    showSearchBar,
    setShowSearchBar,
    performSearch,
    treeInstanceRef
  }
}

// Хук для работы с UI состоянием
export const useUIState = () => {
  const showShortcutsModal = useAppStore(state => state.showShortcutsModal)
  const setShowShortcutsModal = useAppStore(state => state.setShowShortcutsModal)
  const showWelcomeScreen = useAppStore(state => state.showWelcomeScreen)
  const setShowWelcomeScreen = useAppStore(state => state.setShowWelcomeScreen)
  const currentPath = useAppStore(state => state.currentPath)
  const setCurrentPath = useAppStore(state => state.setCurrentPath)
  const visualizationType = useAppStore(state => state.visualizationType)
  const setVisualizationType = useAppStore(state => state.setVisualizationType)
  
  return {
    showShortcutsModal,
    setShowShortcutsModal,
    showWelcomeScreen,
    setShowWelcomeScreen,
    currentPath,
    setCurrentPath,
    visualizationType,
    setVisualizationType
  }
}

// Хук для работы с размерами
export const useDimensions = () => {
  const dimensions = useAppStore(state => state.dimensions)
  const setDimensions = useAppStore(state => state.setDimensions)
  
  return { dimensions, setDimensions }
}

// Хук для работы с уведомлениями
export const useToast = () => {
  const showSuccess = useToastStore(state => state.showSuccess)
  const showError = useToastStore(state => state.showError)
  const showWarning = useToastStore(state => state.showWarning)
  const showInfo = useToastStore(state => state.showInfo)
  
  return { showSuccess, showError, showWarning, showInfo }
}

// Хук для работы с состояниями загрузки
export const useLoading = () => {
  const isLoading = useAppStore(state => state.isLoading)
  const setIsLoading = useAppStore(state => state.setIsLoading)
  const loadingMessage = useAppStore(state => state.loadingMessage)
  const setLoadingMessage = useAppStore(state => state.setLoadingMessage)
  const loadingProgress = useAppStore(state => state.loadingProgress)
  const setLoadingProgress = useAppStore(state => state.setLoadingProgress)

  // Утилитарные функции для управления загрузкой
  const startLoading = useCallback((message = 'Загрузка...') => {
    setIsLoading(true)
    setLoadingMessage(message)
    setLoadingProgress(0)
  }, [setIsLoading, setLoadingMessage, setLoadingProgress])

  const updateProgress = useCallback((progress, message) => {
    setLoadingProgress(progress)
    if (message) setLoadingMessage(message)
  }, [setLoadingProgress, setLoadingMessage])

  const finishLoading = useCallback(() => {
    setIsLoading(false)
    setLoadingMessage('')
    setLoadingProgress(0)
  }, [setIsLoading, setLoadingMessage, setLoadingProgress])

  return {
    isLoading,
    loadingMessage,
    loadingProgress,
    startLoading,
    updateProgress,
    finishLoading
  }
}

// Хук для работы с настройками приложения
export const useAppSettings = () => {
  const settings = useSettingsStore()
  
  return settings
}

// Комплексный хук для инициализации приложения
export const useAppInit = () => {
  const initializeData = useAppStore(state => state.initializeData)
  const loadSettings = useSettingsStore(state => state.loadSettings)
  const setDimensions = useAppStore(state => state.setDimensions)
  
  const initializeApp = useCallback(() => {
    // Инициализируем данные из localStorage
    initializeData()
    
    // Загружаем настройки
    loadSettings()
    
    // Устанавливаем размеры окна
    const updateDimensions = () => {
      const margin = window.innerWidth <= 768 ? 16 : 32
      setDimensions({
        width: window.innerWidth - margin,
        height: window.innerHeight - margin,
      })
    }
    
    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    
    return () => {
      window.removeEventListener('resize', updateDimensions)
    }
  }, [initializeData, loadSettings, setDimensions])
  
  return { initializeApp }
} 