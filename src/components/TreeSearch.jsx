import { useState, useEffect, useRef } from 'react'
import ActionButton from './ActionButton'

const TreeSearch = ({ 
    onSearch, 
    onClear, 
    onNavigate,
    searchResults = [],
    currentResultIndex = -1,
    isSearching = false 
}) => {
    const [searchValue, setSearchValue] = useState('')
    const [isExpanded, setIsExpanded] = useState(false)
    const inputRef = useRef()

    // Поиск при изменении значения (с задержкой)
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (searchValue.trim()) {
                onSearch(searchValue.trim())
            } else {
                onClear()
            }
        }, 300)

        return () => clearTimeout(timeoutId)
    }, [searchValue, onSearch, onClear])

    // Фокус на поле при раскрытии
    useEffect(() => {
        if (isExpanded && inputRef.current) {
            inputRef.current.focus()
        }
    }, [isExpanded])

    const handleKeyDown = (e) => {
        switch (e.key) {
            case 'Enter':
                e.preventDefault()
                if (searchResults.length > 0) {
                    const nextIndex = (currentResultIndex + 1) % searchResults.length
                    onNavigate(nextIndex)
                }
                break
            case 'Escape':
                setSearchValue('')
                setIsExpanded(false)
                onClear()
                break
            case 'ArrowDown':
                e.preventDefault()
                if (searchResults.length > 0) {
                    const nextIndex = (currentResultIndex + 1) % searchResults.length
                    onNavigate(nextIndex)
                }
                break
            case 'ArrowUp':
                e.preventDefault()
                if (searchResults.length > 0) {
                    const prevIndex = currentResultIndex <= 0 
                        ? searchResults.length - 1 
                        : currentResultIndex - 1
                    onNavigate(prevIndex)
                }
                break
        }
    }

    const toggleSearch = () => {
        if (isExpanded && searchValue) {
            setSearchValue('')
            onClear()
        }
        setIsExpanded(!isExpanded)
    }

    return (
        <div className="tree-search flex items-center gap-2">
            {/* Кнопка поиска */}
            <ActionButton
                variant="secondary"
                size="sm"
                icon={() => (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                        />
                    </svg>
                )}
                onClick={toggleSearch}
                tooltip="Поиск по дереву (Ctrl+F)"
                className={isExpanded ? 'bg-primary-600 text-white' : ''}
            />
            
            {/* Поле поиска с анимацией */}
            <div className={`search-input-container transition-all duration-300 ${
                isExpanded ? 'w-64 opacity-100' : 'w-0 opacity-0 overflow-hidden'
            }`}>
                <div className="relative">
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Найти узел..."
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="w-full px-3 py-1.5 bg-neutral-700 border border-neutral-600 rounded text-white text-sm 
                                 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500
                                 placeholder-neutral-400"
                    />
                    
                    {/* Индикатор загрузки */}
                    {isSearching && (
                        <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
                            <div className="animate-spin h-3 w-3 border border-neutral-400 border-t-primary-500 rounded-full"></div>
                        </div>
                    )}
                    
                    {/* Кнопка очистки */}
                    {searchValue && (
                        <button
                            onClick={() => {
                                setSearchValue('')
                                onClear()
                            }}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 
                                     text-neutral-400 hover:text-white transition-colors"
                        >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>

            {/* Результаты поиска */}
            {isExpanded && searchValue && (
                <div className="search-results flex items-center gap-2 text-sm text-neutral-400">
                    {searchResults.length > 0 ? (
                        <>
                            <span>
                                {currentResultIndex + 1} из {searchResults.length}
                            </span>
                            
                            {/* Навигация по результатам */}
                            <div className="flex gap-1">
                                <ActionButton
                                    variant="ghost"
                                    size="xs"
                                    icon={() => (
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                        </svg>
                                    )}
                                    onClick={() => {
                                        const prevIndex = currentResultIndex <= 0 
                                            ? searchResults.length - 1 
                                            : currentResultIndex - 1
                                        onNavigate(prevIndex)
                                    }}
                                    tooltip="Предыдущий результат (↑)"
                                    disabled={searchResults.length === 0}
                                />
                                
                                <ActionButton
                                    variant="ghost"
                                    size="xs"
                                    icon={() => (
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    )}
                                    onClick={() => {
                                        const nextIndex = (currentResultIndex + 1) % searchResults.length
                                        onNavigate(nextIndex)
                                    }}
                                    tooltip="Следующий результат (↓)"
                                    disabled={searchResults.length === 0}
                                />
                            </div>
                        </>
                    ) : searchValue.length > 2 ? (
                        <span>Нет результатов</span>
                    ) : (
                        <span>Введите минимум 3 символа</span>
                    )}
                </div>
            )}
        </div>
    )
}

export default TreeSearch 