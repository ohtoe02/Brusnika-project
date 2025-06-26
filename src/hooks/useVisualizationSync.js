import { useEffect, useRef, useCallback } from 'react'
import { useVisualizationSettings } from '../contexts/VisualizationSettingsContext'

/**
 * Хук для динамической синхронизации настроек визуализации
 * Обеспечивает мгновенное применение изменений к компонентам визуализации
 */
export const useVisualizationSync = (visualizationInstance, enabled = true) => {
  const { treeConfig, subscribe } = useVisualizationSettings()
  const previousConfigRef = useRef(null)
  const unsubscribeRef = useRef(null)

  // Функция для применения настроек к экземпляру визуализации
  const applySettingsToVisualization = useCallback((config, changedKey = null, changedValue = null) => {
    if (!visualizationInstance?.current || !enabled) return

    const instance = visualizationInstance.current

    try {
      // Отладочная информация
      console.log('🔄 Applying visualization settings:', { config, changedKey, changedValue })

      // Определяем, нужно ли полное обновление или частичное
      const needsFullUpdate = !changedKey || !previousConfigRef.current

      if (needsFullUpdate) {
        // Полное обновление всех настроек
        if (typeof instance.updateSettings === 'function') {
          instance.updateSettings(config)
        } else if (typeof instance.applyConfig === 'function') {
          instance.applyConfig(config)
        }
        console.log('✅ Applied full visualization config update:', config)
      } else {
        // Частичное обновление для оптимизации производительности
        
        // Применяем изменение в зависимости от типа настройки
        switch (changedKey) {
          case 'gridEnabled':
          case 'gridSize':
          case 'gridOpacity':
          case 'gridColor':
          case 'majorGridEnabled':
            // Обновляем только сетку
            if (typeof instance.updateGrid === 'function') {
              instance.updateGrid(config.grid)
            } else if (typeof instance.updateSettings === 'function') {
              instance.updateSettings({ grid: config.grid })
            }
            break



          case 'nodeSize':
            // Обновляем размеры узлов
            if (typeof instance.updateNodeSizes === 'function') {
              instance.updateNodeSizes(config.nodeSize)
            } else if (typeof instance.updateSettings === 'function') {
              instance.updateSettings({ nodeSize: config.nodeSize })
            }
            break



          default:
            // Общее обновление для неизвестных настроек
            console.log('🔄 General settings update for:', changedKey)
            if (typeof instance.updateSettings === 'function') {
              instance.updateSettings(config)
            }
        }

        console.log(`✅ Applied partial visualization update for ${changedKey}:`, changedValue)
      }

      // Принудительная перерисовка если нужно
      if (typeof instance.redraw === 'function') {
        instance.redraw()
      } else if (typeof instance.update === 'function') {
        instance.update()
      }

      // Сохраняем текущую конфигурацию для следующего сравнения
      previousConfigRef.current = { ...config }

    } catch (error) {
      console.error('Error applying visualization settings:', error)
      
      // В случае ошибки пытаемся применить полную конфигурацию
      try {
        if (typeof instance.updateSettings === 'function') {
          instance.updateSettings(config)
        }
      } catch (fallbackError) {
        console.error('Fallback update also failed:', fallbackError)
      }
    }
  }, [visualizationInstance, enabled])

  // Подписываемся на изменения настроек при монтировании
  useEffect(() => {
    console.log('🔄 useVisualizationSync effect running, enabled:', enabled)
    console.log('🔄 visualizationInstance?.current:', !!visualizationInstance?.current)
    
    if (!enabled) {
      console.log('🔄 Sync disabled, skipping subscription')
      return
    }

    // Применяем текущие настройки при инициализации
    if (treeConfig && visualizationInstance?.current) {
      console.log('🔄 Applying initial config:', treeConfig)
      applySettingsToVisualization(treeConfig)
    }

    // Подписываемся на будущие изменения
    console.log('🔄 Subscribing to settings changes...')
    unsubscribeRef.current = subscribe((newConfig, changedKey, changedValue) => {
      console.log('🔄 Settings change received in hook:', { newConfig, changedKey, changedValue })
      applySettingsToVisualization(newConfig, changedKey, changedValue)
    })
    
    console.log('🔄 Subscription created:', !!unsubscribeRef.current)

    // Функция очистки
    return () => {
      console.log('🔄 Cleaning up subscription')
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
        unsubscribeRef.current = null
      }
    }
  }, [subscribe, applySettingsToVisualization, enabled, treeConfig])

  // Очистка при размонтировании
  useEffect(() => {
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
      }
    }
  }, [])

  // Функция для ручного форсированного обновления
  const forceUpdate = useCallback(() => {
    if (visualizationInstance?.current && treeConfig) {
      applySettingsToVisualization(treeConfig)
    }
  }, [visualizationInstance, treeConfig, applySettingsToVisualization])

  // Функция для проверки синхронизации
  const checkSync = useCallback(() => {
    const isConnected = !!(
      visualizationInstance?.current && 
      unsubscribeRef.current &&
      enabled
    )
    
    return {
      isConnected,
      hasInstance: !!visualizationInstance?.current,
      hasSubscription: !!unsubscribeRef.current,
      isEnabled: enabled,
      currentConfig: previousConfigRef.current
    }
  }, [visualizationInstance, enabled])

  return {
    forceUpdate,
    checkSync,
    currentConfig: previousConfigRef.current,
    isConnected: checkSync().isConnected
  }
}

/**
 * Хук для множественной синхронизации (например, для нескольких визуализаций)
 */
export const useMultiVisualizationSync = (visualizationInstances = [], enabled = true) => {
  // Создаем массив хуков для каждого экземпляра
  const syncResults = []
  for (let i = 0; i < visualizationInstances.length; i++) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    syncResults.push(useVisualizationSync(visualizationInstances[i], enabled))
  }

  const forceUpdateAll = useCallback(() => {
    syncResults.forEach(result => result.forceUpdate())
  }, [syncResults])

  const checkSyncAll = useCallback(() => {
    return syncResults.map(result => result.checkSync())
  }, [syncResults])

  return {
    forceUpdateAll,
    checkSyncAll,
    syncResults,
    allConnected: syncResults.every(result => result.isConnected)
  }
}

/**
 * Хук для отладки настроек визуализации
 */
export const useVisualizationDebug = () => {
  const { settings, treeConfig } = useVisualizationSettings()

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      console.group('🎨 Visualization Settings Debug')
      console.log('Raw Settings:', settings)
      console.log('Tree Config:', treeConfig)
      console.log('Settings Categories:', Object.keys(settings).reduce((acc, key) => {
        const category = key.startsWith('grid') ? 'grid' : 
                        key.startsWith('node') ? 'node' :
                        key.startsWith('animation') ? 'animation' : 'other'
        acc[category] = acc[category] || []
        acc[category].push({ key, value: settings[key] })
        return acc
      }, {}))
      console.groupEnd()
    }
  }, [settings, treeConfig])

  return { settings, treeConfig }
} 