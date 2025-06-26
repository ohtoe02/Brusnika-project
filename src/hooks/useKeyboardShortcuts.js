import { useEffect, useCallback } from 'react'

export const useKeyboardShortcuts = ({ 
    treeInstance, 
    onSearch, 
    onExpandAll, 
    onCollapseAll, 
    onZoomIn, 
    onZoomOut, 
    onCenter, 
    onReset,
    onExportPNG,
    onExportSVG, 
    onExportJSON,
    searchResults = [],
    currentResultIndex = -1,
    onNavigateSearch
}) => {
    const handleKeyDown = useCallback((event) => {
        // Игнорируем если фокус на input элементах
        const isInputFocused = event.target.tagName === 'INPUT' || 
                              event.target.tagName === 'TEXTAREA' || 
                              event.target.isContentEditable

        // Комбинации с Ctrl/Cmd
        if (event.ctrlKey || event.metaKey) {
            switch (event.key.toLowerCase()) {
                case 'f':
                    event.preventDefault()
                    onSearch?.()
                    break
                    
                case 'e':
                    if (event.shiftKey) {
                        event.preventDefault()
                        onExpandAll?.()
                    }
                    break
                    
                case 'w':
                    if (event.shiftKey) {
                        event.preventDefault()
                        onCollapseAll?.()
                    }
                    break
                    
                case '=':
                case '+':
                    event.preventDefault()
                    onZoomIn?.()
                    break
                    
                case '-':
                    event.preventDefault()
                    onZoomOut?.()
                    break
                    
                case '0':
                    event.preventDefault()
                    onCenter?.()
                    break
                    
                case 'r':
                    if (event.shiftKey) {
                        event.preventDefault()
                        onReset?.()
                    }
                    break
                    
                case 's':
                    if (event.shiftKey && event.altKey) {
                        // Ctrl+Shift+Alt+S - Export SVG
                        event.preventDefault()
                        onExportSVG?.()
                    } else if (event.shiftKey) {
                        // Ctrl+Shift+S - Export PNG
                        event.preventDefault()
                        onExportPNG?.()
                    }
                    break
                    
                case 'j':
                    if (event.shiftKey) {
                        event.preventDefault()
                        onExportJSON?.()
                    }
                    break
            }
            return
        }

        // Обычные клавиши (без Ctrl/Cmd)
        if (!isInputFocused) {
            switch (event.key) {
                case 'Escape':
                    // Скрыть все модальные окна и сбросить поиск
                    event.preventDefault()
                    if (treeInstance) {
                        treeInstance.clearSearchHighlight?.()
                    }
                    break
                    
                case 'h':
                    event.preventDefault()
                    onCollapseAll?.()
                    break
                    
                case 'l':
                    event.preventDefault()
                    onExpandAll?.()
                    break
                    
                case 'c':
                    event.preventDefault()
                    onCenter?.()
                    break
                    
                case 'r':
                    event.preventDefault()
                    onReset?.()
                    break
                    
                case '/':
                    event.preventDefault()
                    onSearch?.()
                    break
                    
                // Навигация по результатам поиска
                case 'n':
                    if (searchResults.length > 0) {
                        event.preventDefault()
                        const nextIndex = (currentResultIndex + 1) % searchResults.length
                        onNavigateSearch?.(nextIndex)
                    }
                    break
                    
                case 'p':
                    if (searchResults.length > 0) {
                        event.preventDefault()
                        const prevIndex = currentResultIndex <= 0 
                            ? searchResults.length - 1 
                            : currentResultIndex - 1
                        onNavigateSearch?.(prevIndex)
                    }
                    break
                    
                // Масштабирование
                case '=':
                case '+':
                    event.preventDefault()
                    onZoomIn?.()
                    break
                    
                case '-':
                    event.preventDefault()
                    onZoomOut?.()
                    break
                    
                case '0':
                    event.preventDefault()
                    onCenter?.()
                    break
                    
                // Быстрые действия с деревом
                case 'ArrowUp':
                    if (!isInputFocused && treeInstance) {
                        event.preventDefault()
                        // Переход к родительскому узлу
                        // Можно реализовать логику навигации
                    }
                    break
                    
                case 'ArrowDown':
                    if (!isInputFocused && treeInstance) {
                        event.preventDefault()
                        // Переход к дочернему узлу
                        // Можно реализовать логику навигации
                    }
                    break
                    
                case 'ArrowLeft':
                    if (!isInputFocused && treeInstance) {
                        event.preventDefault()
                        // Свернуть текущий узел
                    }
                    break
                    
                case 'ArrowRight':
                    if (!isInputFocused && treeInstance) {
                        event.preventDefault()
                        // Развернуть текущий узел
                    }
                    break
            }
        }
    }, [
        treeInstance, 
        onSearch, 
        onExpandAll, 
        onCollapseAll, 
        onZoomIn, 
        onZoomOut, 
        onCenter, 
        onReset,
        onExportPNG,
        onExportSVG,
        onExportJSON,
        searchResults,
        currentResultIndex,
        onNavigateSearch
    ])

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [handleKeyDown])

    // Возвращаем список доступных шорткатов для справки
    return {
        shortcuts: {
            search: [
                { keys: 'Ctrl+F', description: 'Открыть поиск' },
                { keys: '/', description: 'Быстрый поиск' },
                { keys: 'n', description: 'Следующий результат' },
                { keys: 'p', description: 'Предыдущий результат' },
                { keys: 'Esc', description: 'Закрыть поиск' }
            ],
            navigation: [
                { keys: 'c', description: 'Центрировать дерево' },
                { keys: 'Ctrl+0', description: 'Центрировать и сбросить масштаб' },
                { keys: '↑↓←→', description: 'Навигация по узлам' }
            ],
            zoom: [
                { keys: '+/=', description: 'Увеличить масштаб' },
                { keys: '-', description: 'Уменьшить масштаб' },
                { keys: 'Ctrl++', description: 'Увеличить (точно)' },
                { keys: 'Ctrl+-', description: 'Уменьшить (точно)' }
            ],
            tree: [
                { keys: 'h', description: 'Свернуть все узлы' },
                { keys: 'l', description: 'Развернуть все узлы' },
                { keys: 'Ctrl+Shift+E', description: 'Развернуть все (точно)' },
                { keys: 'Ctrl+Shift+W', description: 'Свернуть все (точно)' },
                { keys: 'r', description: 'Сбросить дерево' },
                { keys: 'Ctrl+Shift+R', description: 'Полный сброс' }
            ],
            export: [
                { keys: 'Ctrl+Shift+S', description: 'Экспорт PNG' },
                { keys: 'Ctrl+Shift+Alt+S', description: 'Экспорт SVG' },
                { keys: 'Ctrl+Shift+J', description: 'Экспорт JSON' }
            ]
        }
    }
} 