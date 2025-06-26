import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useAppStore } from '../store/appStore'
import { useTheme } from '../contexts/ThemeContext'
import {
    HiOutlineCloudArrowUp,
    HiOutlineCloudArrowDown,
    HiOutlineDocumentDuplicate,
    HiOutlineTrash,
    HiOutlineEye,
    HiOutlinePencilSquare,
    HiOutlineFolderPlus,
    HiOutlineSparkles,
    HiMagnifyingGlass,
    HiAdjustmentsHorizontal,
    HiOutlineDocumentText,
    HiOutlineChevronDown,
    HiOutlineChevronRight,
    HiOutlineExclamationTriangle,
    HiOutlineCheckCircle,
    HiOutlineXCircle,
    HiOutlineXMark
} from 'react-icons/hi2'

// Компонент для дерева данных с возможностью редактирования
const TreeNodeEditor = ({ node, level = 0, onUpdate, onDelete, onAdd }) => {
    const { theme } = useTheme()
    const [isExpanded, setIsExpanded] = useState(true)
    const [isEditing, setIsEditing] = useState(false)
    const [editValue, setEditValue] = useState(node.name)
    
    const handleSave = () => {
        onUpdate(node.id, { ...node, name: editValue })
        setIsEditing(false)
    }
    
    const handleCancel = () => {
        setEditValue(node.name)
        setIsEditing(false)
    }
    
    return (
        <div className="select-none">
            <div 
                className={`flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors ${
                    theme === 'dark' 
                        ? 'hover:bg-gray-700/50' 
                        : 'hover:bg-gray-100/50'
                }`}
                style={{ paddingLeft: `${level * 24 + 8}px` }}
            >
                {node.children && node.children.length > 0 && (
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className={`p-0.5 rounded transition-colors ${
                            theme === 'dark' 
                                ? 'hover:bg-gray-600' 
                                : 'hover:bg-gray-200'
                        }`}
                    >
                        {isExpanded ? (
                            <HiOutlineChevronDown className={`w-4 h-4 ${
                                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                            }`} />
                        ) : (
                            <HiOutlineChevronRight className={`w-4 h-4 ${
                                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                            }`} />
                        )}
                    </button>
                )}
                {!node.children?.length && <div className="w-5" />}
                
                {isEditing ? (
                    <>
                        <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className={`flex-1 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 ${
                                theme === 'dark'
                                    ? 'border-blue-600 bg-gray-800 text-white focus:ring-blue-500'
                                    : 'border-blue-300 bg-white text-gray-900 focus:ring-blue-500'
                            }`}
                            autoFocus
                            onKeyPress={(e) => e.key === 'Enter' && handleSave()}
                            onKeyDown={(e) => e.key === 'Escape' && handleCancel()}
                        />
                        <button
                            onClick={handleSave}
                            className={`p-1 rounded transition-colors ${
                                theme === 'dark'
                                    ? 'text-green-400 hover:bg-green-900/30'
                                    : 'text-green-600 hover:bg-green-100'
                            }`}
                        >
                            <HiOutlineCheckCircle className="w-4 h-4" />
                        </button>
                        <button
                            onClick={handleCancel}
                            className={`p-1 rounded transition-colors ${
                                theme === 'dark'
                                    ? 'text-red-400 hover:bg-red-900/30'
                                    : 'text-red-600 hover:bg-red-100'
                            }`}
                        >
                            <HiOutlineXCircle className="w-4 h-4" />
                        </button>
                    </>
                ) : (
                    <>
                        <span className={`flex-1 text-sm ${
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                            {node.name}
                        </span>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => setIsEditing(true)}
                                className={`p-1 rounded transition-colors ${
                                    theme === 'dark'
                                        ? 'text-blue-400 hover:bg-blue-900/30'
                                        : 'text-blue-600 hover:bg-blue-100'
                                }`}
                                title="Редактировать"
                            >
                                <HiOutlinePencilSquare className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => onAdd(node.id)}
                                className={`p-1 rounded transition-colors ${
                                    theme === 'dark'
                                        ? 'text-green-400 hover:bg-green-900/30'
                                        : 'text-green-600 hover:bg-green-100'
                                }`}
                                title="Добавить потомка"
                            >
                                <HiOutlineFolderPlus className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => onDelete(node.id)}
                                className={`p-1 rounded transition-colors ${
                                    theme === 'dark'
                                        ? 'text-red-400 hover:bg-red-900/30'
                                        : 'text-red-600 hover:bg-red-100'
                                }`}
                                title="Удалить"
                            >
                                <HiOutlineTrash className="w-4 h-4" />
                            </button>
                        </div>
                    </>
                )}
            </div>
            
            {isExpanded && node.children && node.children.map(child => (
                <TreeNodeEditor
                    key={child.id}
                    node={child}
                    level={level + 1}
                    onUpdate={onUpdate}
                    onDelete={onDelete}
                    onAdd={onAdd}
                />
            ))}
        </div>
    )
}

// Компонент статистики данных
const DataStatistics = ({ data }) => {
    const { theme } = useTheme()
    const stats = useMemo(() => {
        if (!data) return { total: 0, depth: 0, leaves: 0, branches: 0 }
        
        const calculateStats = (node, depth = 0) => {
            let stats = {
                total: 1,
                depth: depth,
                leaves: !node.children || node.children.length === 0 ? 1 : 0,
                branches: node.children && node.children.length > 0 ? 1 : 0
            }
            
            if (node.children) {
                node.children.forEach(child => {
                    const childStats = calculateStats(child, depth + 1)
                    stats.total += childStats.total
                    stats.depth = Math.max(stats.depth, childStats.depth)
                    stats.leaves += childStats.leaves
                    stats.branches += childStats.branches
                })
            }
            
            return stats
        }
        
        return calculateStats(data)
    }, [data])
    
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className={`rounded-lg p-4 ${
                theme === 'dark' ? 'bg-blue-900/20' : 'bg-blue-50'
            }`}>
                <p className={`text-sm mb-1 ${
                    theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                }`}>Всего узлов</p>
                <p className={`text-2xl font-bold ${
                    theme === 'dark' ? 'text-blue-300' : 'text-blue-700'
                }`}>{stats.total}</p>
            </div>
            <div className={`rounded-lg p-4 ${
                theme === 'dark' ? 'bg-purple-900/20' : 'bg-purple-50'
            }`}>
                <p className={`text-sm mb-1 ${
                    theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
                }`}>Глубина</p>
                <p className={`text-2xl font-bold ${
                    theme === 'dark' ? 'text-purple-300' : 'text-purple-700'
                }`}>{stats.depth}</p>
            </div>
            <div className={`rounded-lg p-4 ${
                theme === 'dark' ? 'bg-green-900/20' : 'bg-green-50'
            }`}>
                <p className={`text-sm mb-1 ${
                    theme === 'dark' ? 'text-green-400' : 'text-green-600'
                }`}>Листья</p>
                <p className={`text-2xl font-bold ${
                    theme === 'dark' ? 'text-green-300' : 'text-green-700'
                }`}>{stats.leaves}</p>
            </div>
            <div className={`rounded-lg p-4 ${
                theme === 'dark' ? 'bg-orange-900/20' : 'bg-orange-50'
            }`}>
                <p className={`text-sm mb-1 ${
                    theme === 'dark' ? 'text-orange-400' : 'text-orange-600'
                }`}>Ветви</p>
                <p className={`text-2xl font-bold ${
                    theme === 'dark' ? 'text-orange-300' : 'text-orange-700'
                }`}>{stats.branches}</p>
            </div>
        </div>
    )
}

// Основной компонент управления данными
const DataManager = () => {
    const { treeData, setTreeData } = useAppStore()
    const { theme } = useTheme()
    const [searchQuery, setSearchQuery] = useState('')
    const [viewMode, setViewMode] = useState('tree') // tree, json, table
    const [history, setHistory] = useState([])
    const [historyIndex, setHistoryIndex] = useState(-1)
    const [notification, setNotification] = useState(null)
    
    // Добавление данных в историю
    const addToHistory = useCallback((data) => {
        const newHistory = [...history.slice(0, historyIndex + 1), JSON.parse(JSON.stringify(data))]
        setHistory(newHistory)
        setHistoryIndex(newHistory.length - 1)
    }, [history, historyIndex])
    
    // Отмена изменений
    const undo = () => {
        if (historyIndex > 0) {
            setHistoryIndex(historyIndex - 1)
            setTreeData(history[historyIndex - 1])
            showNotification('Изменения отменены', 'info')
        }
    }
    
    // Повтор изменений
    const redo = () => {
        if (historyIndex < history.length - 1) {
            setHistoryIndex(historyIndex + 1)
            setTreeData(history[historyIndex + 1])
            showNotification('Изменения восстановлены', 'info')
        }
    }
    
    // Показ уведомлений
    const showNotification = (message, type = 'info') => {
        setNotification({ message, type })
        setTimeout(() => setNotification(null), 3000)
    }
    
    // Обновление узла
    const updateNode = useCallback((nodeId, updates) => {
        const updateRecursive = (node) => {
            if (node.id === nodeId) {
                return { ...node, ...updates }
            }
            if (node.children) {
                return {
                    ...node,
                    children: node.children.map(updateRecursive)
                }
            }
            return node
        }
        
        const updatedData = updateRecursive(treeData)
        setTreeData(updatedData)
        addToHistory(updatedData)
        showNotification('Узел обновлен', 'success')
    }, [treeData, setTreeData, addToHistory])
    
    // Удаление узла
    const deleteNode = useCallback((nodeId) => {
        const deleteRecursive = (node) => {
            if (node.children) {
                return {
                    ...node,
                    children: node.children.filter(child => child.id !== nodeId).map(deleteRecursive)
                }
            }
            return node
        }
        
        const updatedData = deleteRecursive(treeData)
        setTreeData(updatedData)
        addToHistory(updatedData)
        showNotification('Узел удален', 'success')
    }, [treeData, setTreeData, addToHistory])
    
    // Добавление узла
    const addNode = useCallback((parentId) => {
        const newNode = {
            id: `node-${Date.now()}`,
            name: 'Новый узел',
            children: []
        }
        
        const addRecursive = (node) => {
            if (node.id === parentId) {
                return {
                    ...node,
                    children: [...(node.children || []), newNode]
                }
            }
            if (node.children) {
                return {
                    ...node,
                    children: node.children.map(addRecursive)
                }
            }
            return node
        }
        
        const updatedData = addRecursive(treeData)
        setTreeData(updatedData)
        addToHistory(updatedData)
        showNotification('Узел добавлен', 'success')
    }, [treeData, setTreeData, addToHistory])
    
    // Импорт данных
    const handleImport = (event) => {
        const file = event.target.files[0]
        if (file) {
            const reader = new FileReader()
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result)
                    setTreeData(data)
                    addToHistory(data)
                    showNotification('Данные успешно импортированы', 'success')
                } catch {
                    showNotification('Ошибка при импорте данных', 'error')
                }
            }
            reader.readAsText(file)
        }
    }
    
    // Экспорт данных
    const handleExport = () => {
        const dataStr = JSON.stringify(treeData, null, 2)
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
        
        const exportFileDefaultName = `tree-data-${new Date().toISOString().slice(0, 10)}.json`
        
        const linkElement = document.createElement('a')
        linkElement.setAttribute('href', dataUri)
        linkElement.setAttribute('download', exportFileDefaultName)
        linkElement.click()
        
        showNotification('Данные экспортированы', 'success')
    }
    
    // Фильтрация данных по поиску
    const filteredData = useMemo(() => {
        if (!searchQuery || !treeData) return treeData
        
        const filterRecursive = (node) => {
            const matches = node.name.toLowerCase().includes(searchQuery.toLowerCase())
            const filteredChildren = node.children
                ? node.children.map(filterRecursive).filter(Boolean)
                : []
                
            if (matches || filteredChildren.length > 0) {
                return {
                    ...node,
                    children: filteredChildren
                }
            }
            return null
        }
        
        return filterRecursive(treeData)
    }, [treeData, searchQuery])
    
    // Инициализация истории
    useEffect(() => {
        if (treeData && history.length === 0) {
            setHistory([JSON.parse(JSON.stringify(treeData))])
            setHistoryIndex(0)
        }
    }, [treeData, history.length])
    
    return (
        <div className={`p-6 min-h-screen ${theme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-[#fafafa]'}`}>
            <div className="max-w-7xl mx-auto">
                {/* Заголовок и статистика */}
                <div className="mb-8">
                    <h1 className={`text-3xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Управление данными</h1>
                    <p className={`mb-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Редактирование, импорт и экспорт структуры дерева</p>
                    {treeData && <DataStatistics data={treeData} />}
                </div>
                
                {/* Панель инструментов */}
                <div className={`rounded-xl p-4 mb-6 ${theme === 'dark' ? 'bg-[#23272f]' : 'bg-white'}`}>
                    <div className="flex flex-wrap items-center gap-4">
                        {/* Поиск */}
                        <div className="flex-1 min-w-[300px]">
                            <div className="relative">
                                <HiMagnifyingGlass className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                                    theme === 'dark' ? 'text-gray-400' : 'text-gray-400'
                                }`} />
                                <input
                                    type="text"
                                    placeholder="Поиск узлов..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                                        theme === 'dark'
                                            ? 'border-gray-600 bg-gray-700 text-white focus:ring-blue-500'
                                            : 'border-gray-300 bg-white text-gray-900 focus:ring-blue-500'
                                    }`}
                                />
                            </div>
                        </div>
                        
                        {/* Действия */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={undo}
                                disabled={historyIndex <= 0}
                                className={`px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                                    theme === 'dark'
                                        ? 'text-gray-300 bg-gray-700 hover:bg-gray-600'
                                        : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                                }`}
                            >
                                Отменить
                            </button>
                            <button
                                onClick={redo}
                                disabled={historyIndex >= history.length - 1}
                                className={`px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                                    theme === 'dark'
                                        ? 'text-gray-300 bg-gray-700 hover:bg-gray-600'
                                        : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                                }`}
                            >
                                Повторить
                            </button>
                            
                            <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 mx-2" />
                            
                            <label className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer flex items-center gap-2">
                                <HiOutlineCloudArrowUp className="w-5 h-5" />
                                Импорт
                                <input
                                    type="file"
                                    accept=".json"
                                    onChange={handleImport}
                                    className="hidden"
                                />
                            </label>
                            
                            <button
                                onClick={handleExport}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                            >
                                <HiOutlineCloudArrowDown className="w-5 h-5" />
                                Экспорт
                            </button>
                        </div>
                        
                        {/* Переключатель вида */}
                        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                            <button
                                onClick={() => setViewMode('tree')}
                                className={`px-3 py-1.5 rounded ${
                                    viewMode === 'tree'
                                        ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                                        : 'text-gray-600 dark:text-gray-400'
                                } transition-all`}
                            >
                                Дерево
                            </button>
                            <button
                                onClick={() => setViewMode('json')}
                                className={`px-3 py-1.5 rounded ${
                                    viewMode === 'json'
                                        ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                                        : 'text-gray-600 dark:text-gray-400'
                                } transition-all`}
                            >
                                JSON
                            </button>
                        </div>
                    </div>
                </div>
                
                {/* Основной контент */}
                <div className={`rounded-xl p-6 ${theme === 'dark' ? 'bg-[#23272f]' : 'bg-white'}`}>
                    {!treeData ? (
                        <div className="text-center py-12">
                            <HiOutlineDocumentText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                                Нет данных для отображения
                            </p>
                            <label className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer inline-flex items-center gap-2">
                                <HiOutlineCloudArrowUp className="w-5 h-5" />
                                Импортировать данные
                                <input
                                    type="file"
                                    accept=".json"
                                    onChange={handleImport}
                                    className="hidden"
                                />
                            </label>
                        </div>
                    ) : viewMode === 'tree' ? (
                        <div className="group">
                            <TreeNodeEditor
                                node={filteredData}
                                onUpdate={updateNode}
                                onDelete={deleteNode}
                                onAdd={addNode}
                            />
                        </div>
                    ) : (
                        <pre className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg overflow-auto max-h-[600px] text-sm">
                            <code className="text-gray-700 dark:text-gray-300">
                                {JSON.stringify(filteredData, null, 2)}
                            </code>
                        </pre>
                    )}
                </div>
                
                {/* Уведомления */}
                {notification && (
                    <div className={`fixed bottom-6 right-6 px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-slide-in-up ${
                        notification.type === 'success' ? 'bg-green-600 text-white' :
                        notification.type === 'error' ? 'bg-red-600 text-white' :
                        'bg-blue-600 text-white'
                    }`}>
                        {notification.type === 'success' && <HiOutlineCheckCircle className="w-5 h-5" />}
                        {notification.type === 'error' && <HiOutlineExclamationTriangle className="w-5 h-5" />}
                        {notification.type === 'info' && <HiOutlineSparkles className="w-5 h-5" />}
                        <span>{notification.message}</span>
                    </div>
                )}
            </div>
        </div>
    )
}

export default DataManager 