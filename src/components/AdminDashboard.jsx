import React, { useState, useEffect } from 'react'
import { 
    HiOutlineDocumentText,
    HiOutlineChartBarSquare,
    HiAdjustmentsHorizontal,
    HiOutlineCog6Tooth,
    HiOutlineSparkles,
    HiOutlineFolder,
    HiOutlineFolderOpen,
    HiOutlineChartBar,
    HiOutlineSquares2X2
} from 'react-icons/hi2'
import { useAppStore } from '../store/appStore'
import { useTheme } from '../contexts/ThemeContext'

// Компонент для отображения статистической карточки
const StatCard = ({ title, value, icon: Icon, description, gradient }) => {
    const { theme } = useTheme()
    
    return (
        <div className={`relative overflow-hidden rounded-xl p-6 transition-all duration-300 ${theme === 'dark' ? 'bg-[#23272f]' : 'bg-white'}`}>
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <p className={`text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {title}
                    </p>
                    <p className={`text-3xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {value.toLocaleString()}
                    </p>
                    {description && (
                        <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                            {description}
                        </p>
                    )}
                </div>
                <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
            </div>
        </div>
    )
}

// Компонент для отображения структуры дерева
const TreeStructureView = ({ data, depth = 0, maxDepth = 3 }) => {
    const { theme } = useTheme()
    const [expanded, setExpanded] = useState(depth < 2)
    
    if (!data || depth > maxDepth) return null
    
    const hasChildren = data.children && data.children.length > 0
    const IconComponent = expanded ? HiOutlineFolderOpen : HiOutlineFolder
    
    return (
        <div className={`${depth > 0 ? 'ml-4' : ''}`}>
            <div 
                className={`
                    flex items-center gap-2 p-2 rounded-lg cursor-pointer
                    transition-all duration-200
                    ${theme === 'dark' ? 'hover:bg-[#23272f]' : 'hover:bg-gray-100'}
                `}
                onClick={() => hasChildren && setExpanded(!expanded)}
            >
                {hasChildren && (
                    <IconComponent className={`w-4 h-4 ${
                        theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                    }`} />
                )}
                <span className={`text-sm ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                    {data.name}
                </span>
                {hasChildren && (
                    <span className={`text-xs ml-auto ${
                        theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                    }`}>
                        ({data.children.length})
                    </span>
                )}
            </div>
            {expanded && hasChildren && (
                <div className="mt-1">
                    {data.children.map((child, index) => (
                        <TreeStructureView 
                            key={child.id || index} 
                            data={child} 
                            depth={depth + 1}
                            maxDepth={maxDepth}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

// Основной компонент Dashboard
const AdminDashboard = () => {
    const { treeData } = useAppStore()
    const { theme } = useTheme()
    const [stats, setStats] = useState({
        totalNodes: 0,
        maxDepth: 0,
        leafNodes: 0,
        branchNodes: 0,
        avgChildren: 0
    })
    
    // Функция для рекурсивного анализа дерева
    const analyzeTree = (node, depth = 0) => {
        let analysis = {
            totalNodes: 1,
            maxDepth: depth,
            leafNodes: !node.children || node.children.length === 0 ? 1 : 0,
            branchNodes: node.children && node.children.length > 0 ? 1 : 0,
            childrenCount: node.children ? node.children.length : 0
        }
        
        if (node.children) {
            node.children.forEach(child => {
                const childAnalysis = analyzeTree(child, depth + 1)
                analysis.totalNodes += childAnalysis.totalNodes
                analysis.maxDepth = Math.max(analysis.maxDepth, childAnalysis.maxDepth)
                analysis.leafNodes += childAnalysis.leafNodes
                analysis.branchNodes += childAnalysis.branchNodes
                analysis.childrenCount += childAnalysis.childrenCount
            })
        }
        
        return analysis
    }
    
    useEffect(() => {
        if (treeData) {
            const analysis = analyzeTree(treeData)
            const avgChildren = analysis.branchNodes > 0 
                ? (analysis.childrenCount / analysis.branchNodes).toFixed(2) 
                : 0
                
            setStats({
                totalNodes: analysis.totalNodes,
                maxDepth: analysis.maxDepth,
                leafNodes: analysis.leafNodes,
                branchNodes: analysis.branchNodes,
                avgChildren: parseFloat(avgChildren)
            })
        }
    }, [treeData])
    
    // Данные для статистических карточек
    const statCards = [
        {
            title: 'Всего узлов',
            value: stats.totalNodes,
            icon: HiOutlineDocumentText,
            description: 'Общее количество элементов',
            gradient: 'from-blue-500 to-blue-600'
        },
        {
            title: 'Глубина дерева',
            value: stats.maxDepth,
            icon: HiOutlineSquares2X2,
            description: 'Максимальный уровень вложенности',
            gradient: 'from-purple-500 to-purple-600'
        },
        {
            title: 'Листовые узлы',
            value: stats.leafNodes,
            icon: HiOutlineChartBarSquare,
            description: 'Узлы без потомков',
            gradient: 'from-green-500 to-green-600'
        },
        {
            title: 'Узлы-ветви',
            value: stats.branchNodes,
            icon: HiAdjustmentsHorizontal,
            description: 'Узлы с потомками',
            gradient: 'from-orange-500 to-orange-600'
        }
    ]
    
    return (
        <div className={`p-6 min-h-screen ${theme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-[#fafafa]'}`}>
            <div className="max-w-7xl mx-auto">
                {/* Заголовок */}
                <div className="mb-8">
                    <h1 className={`text-3xl font-bold mb-2 ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                        Панель управления
                    </h1>
                    <p className={`${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                        Статистика и структура дерева визуализации
                    </p>
                </div>
                
                {/* Статистические карточки */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {statCards.map((card) => (
                        <StatCard 
                            key={card.title}
                            {...card}
                        />
                    ))}
                </div>
                
                {/* Основная секция с информацией о дереве */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Структура дерева */}
                    <div className={`
                        lg:col-span-2 rounded-xl p-6 
                        ${theme === 'dark' ? 'bg-[#23272f]' : 'bg-white'}
                    `}>
                        <h2 className={`text-xl font-semibold mb-4 flex items-center gap-2 ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                            <HiOutlineFolder className={`w-5 h-5 ${
                                theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                            }`} />
                            Структура дерева
                        </h2>
                        
                        {treeData ? (
                            <div className={`
                                max-h-[400px] overflow-y-auto pr-2
                                ${theme === 'dark' ? '' : ''}
                            `}>
                                <TreeStructureView data={treeData} />
                            </div>
                        ) : (
                            <div className={`text-center py-12 ${
                                theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                            }`}>
                                <HiOutlineDocumentText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                <p>Нет данных для отображения</p>
                                <p className="text-sm mt-2">Загрузите данные через главный экран</p>
                            </div>
                        )}
                    </div>
                    
                    {/* Дополнительная информация */}
                    <div className={`
                        rounded-xl p-6 
                        ${theme === 'dark' ? 'bg-[#23272f]' : 'bg-white'}
                    `}>
                        <h2 className={`text-xl font-semibold mb-4 flex items-center gap-2 ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                            <HiOutlineChartBar className={`w-5 h-5 ${
                                theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
                            }`} />
                            Детальная статистика
                        </h2>
                        
                        <div className="space-y-4">
                            <div className={`p-4 rounded-lg ${
                                theme === 'dark' ? 'bg-[#181c23]' : 'bg-gray-50'
                            }`}>
                                <div className="flex justify-between items-center mb-2">
                                    <span className={`text-sm font-medium ${
                                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                                    }`}>
                                        Среднее количество потомков
                                    </span>
                                    <span className={`text-lg font-bold ${
                                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                                    }`}>
                                        {stats.avgChildren}
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div 
                                        className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600"
                                        style={{ width: `${(stats.avgChildren / 10) * 100}%` }}
                                    />
                                </div>
                            </div>
                            
                            <div className={`p-4 rounded-lg ${
                                theme === 'dark' ? 'bg-[#181c23]' : 'bg-gray-50'
                            }`}>
                                <div className="flex justify-between items-center mb-2">
                                    <span className={`text-sm font-medium ${
                                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                                    }`}>
                                        Соотношение листьев/ветвей
                                    </span>
                                    <span className={`text-lg font-bold ${
                                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                                    }`}>
                                        {stats.branchNodes > 0 
                                            ? (stats.leafNodes / stats.branchNodes).toFixed(2)
                                            : '0'
                                        }
                                    </span>
                                </div>
                                <div className="flex gap-2 mt-2">
                                    <div className="flex-1">
                                        <div className={`text-xs ${
                                            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                                        }`}>Листья</div>
                                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                                            <div 
                                                className="h-2 rounded-full bg-gradient-to-r from-green-500 to-green-600"
                                                style={{ 
                                                    width: `${stats.totalNodes > 0 
                                                        ? (stats.leafNodes / stats.totalNodes) * 100 
                                                        : 0}%` 
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <div className={`text-xs ${
                                            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                                        }`}>Ветви</div>
                                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                                            <div 
                                                className="h-2 rounded-full bg-gradient-to-r from-orange-500 to-orange-600"
                                                style={{ 
                                                    width: `${stats.totalNodes > 0 
                                                        ? (stats.branchNodes / stats.totalNodes) * 100 
                                                        : 0}%` 
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Информация о корневом узле */}
                            {treeData && (
                                <div className={`p-4 rounded-lg ${
                                    theme === 'dark' ? 'bg-[#181c23]' : 'bg-gray-50'
                                }`}>
                                    <h3 className={`text-sm font-medium mb-2 ${
                                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                                    }`}>
                                        Корневой узел
                                    </h3>
                                    <p className={`text-lg font-semibold ${
                                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                                    }`}>
                                        {treeData.name}
                                    </p>
                                    <p className={`text-sm mt-1 ${
                                        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                                    }`}>
                                        Прямых потомков: {treeData.children ? treeData.children.length : 0}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AdminDashboard 