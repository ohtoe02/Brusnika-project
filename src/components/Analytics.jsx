import React, { useState, useMemo } from 'react'
import { 
    HiOutlineChartBarSquare,
    HiOutlineClock,
    HiOutlineCursorArrowRipple,
    HiOutlineDocumentArrowDown,
    HiOutlineEye,
    HiArrowPath
} from 'react-icons/hi2'
import { useAppStore, useToastStore } from '../store/appStore'

const Analytics = () => {
    const { treeData } = useAppStore()
    const { addToast } = useToastStore()
    const [selectedTimeRange, setSelectedTimeRange] = useState('7d')
    const [refreshing, setRefreshing] = useState(false)

    // Вычисляем статистику дерева
    const treeStats = useMemo(() => {
        if (!treeData) return null

        const calculateStats = (node, depth = 0, stats = { totalNodes: 0, maxDepth: 0, levels: {} }) => {
            stats.totalNodes++
            stats.maxDepth = Math.max(stats.maxDepth, depth)
            
            if (!stats.levels[depth]) {
                stats.levels[depth] = 0
            }
            stats.levels[depth]++

            if (node.children) {
                node.children.forEach(child => calculateStats(child, depth + 1, stats))
            }
            
            return stats
        }

        return calculateStats(treeData)
    }, [treeData])

    // Данные для графиков
    const chartData = useMemo(() => {
        if (!treeStats) return { levelData: [], performanceData: [], usageData: [] }

        // Данные по уровням дерева
        const levelData = Object.entries(treeStats.levels).map(([level, count]) => ({
            level: `Уровень ${level}`,
            nodes: count,
            percentage: Math.round((count / treeStats.totalNodes) * 100)
        }))

        // Имитация данных производительности
        const performanceData = [
            { time: '00:00', renderTime: 45, interactions: 12 },
            { time: '04:00', renderTime: 38, interactions: 8 },
            { time: '08:00', renderTime: 52, interactions: 25 },
            { time: '12:00', renderTime: 41, interactions: 35 },
            { time: '16:00', renderTime: 47, interactions: 28 },
            { time: '20:00', renderTime: 39, interactions: 15 },
        ]

        // Имитация данных использования
        const usageData = [
            { action: 'Просмотр узлов', count: 145, color: '#3b82f6' },
            { action: 'Поиск', count: 89, color: '#10b981' },
            { action: 'Раскрытие', count: 67, color: '#f59e0b' },
            { action: 'Экспорт', count: 23, color: '#ef4444' },
            { action: 'Настройки', count: 12, color: '#8b5cf6' }
        ]

        return { levelData, performanceData, usageData }
    }, [treeStats])

    // Обновление аналитики
    const handleRefresh = async () => {
        setRefreshing(true)
        try {
            // Имитация обновления данных
            await new Promise(resolve => setTimeout(resolve, 1000))
            addToast('Аналитика обновлена', 'success')
        } catch {
            addToast('Ошибка обновления аналитики', 'error')
        } finally {
            setRefreshing(false)
        }
    }

    // Экспорт CSV данных
    const handleExport = () => {
        if (!treeStats || !chartData) return

        const exportData = [
            ['Метрика', 'Значение'],
            ['Общее количество узлов', treeStats.totalNodes],
            ['Максимальная глубина', treeStats.maxDepth],
            ['Количество уровней', Object.keys(treeStats.levels).length],
            ...chartData.levelData.map(item => [item.level, `${item.nodes} узлов (${item.percentage}%)`]),
            ...chartData.usageData.map(item => [`Действие: ${item.action}`, item.count])
        ]

        const csvContent = exportData.map(row => row.join(',')).join('\n')
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', `tree-analytics-${new Date().toISOString().split('T')[0]}.csv`)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        addToast('Данные экспортированы', 'success')
    }

    // Простой Bar Chart компонент
    const SimpleBarChart = ({ data, title }) => {
        const maxValue = Math.max(...data.map(d => d.nodes))
        
        return (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                    {title}
                </h3>
                <div className="space-y-3">
                    {data.map((item, index) => (
                        <div key={index} className="flex items-center gap-3">
                            <div className="w-20 text-sm text-gray-600 dark:text-gray-400 truncate">
                                {item.level}
                            </div>
                            <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-6 relative">
                                <div 
                                    className="bg-blue-500 h-6 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                                    style={{ width: `${(item.nodes / maxValue) * 100}%` }}
                                >
                                    <span className="text-white text-xs font-medium">
                                        {item.nodes}
                                    </span>
                                </div>
                            </div>
                            <div className="w-12 text-sm text-gray-600 dark:text-gray-400">
                                {item.percentage}%
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    // Простой Line Chart компонент
    const SimpleLineChart = ({ data, title }) => {
        return (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                    {title}
                </h3>
                <div className="grid grid-cols-6 gap-2 h-32">
                    {data.map((item, index) => (
                        <div key={index} className="flex flex-col items-center justify-end">
                            <div 
                                className="w-full bg-green-500 rounded-t transition-all duration-500"
                                style={{ height: `${(item.renderTime / 60) * 100}%` }}
                                title={`${item.time}: ${item.renderTime}ms`}
                            />
                            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                {item.time}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-4 flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded"></div>
                        <span className="text-gray-600 dark:text-gray-400">Время рендера (мс)</span>
                    </div>
                </div>
            </div>
        )
    }

    // Простой Pie Chart компонент
    const SimplePieChart = ({ data, title }) => {
        const total = data.reduce((sum, item) => sum + item.count, 0)
        
        return (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                    {title}
                </h3>
                <div className="space-y-3">
                    {data.map((item, index) => {
                        const percentage = Math.round((item.count / total) * 100)
                        return (
                            <div key={index} className="flex items-center gap-3">
                                <div 
                                    className="w-4 h-4 rounded"
                                    style={{ backgroundColor: item.color }}
                                />
                                <div className="flex-1 flex justify-between">
                                    <span className="text-sm text-gray-700 dark:text-gray-300">
                                        {item.action}
                                    </span>
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                        {item.count} ({percentage}%)
                                    </span>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        )
    }

    if (!treeData) {
        return (
            <div className="p-6">
                <div className="text-center py-12">
                    <HiOutlineChartBarSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        Нет данных для анализа
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                        Загрузите данные дерева, чтобы увидеть аналитику
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="p-6 space-y-6">
            {/* Заголовок */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Аналитика
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Статистика и метрики дерева
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {/* Выбор временного диапазона */}
                    <select
                        value={selectedTimeRange}
                        onChange={(e) => setSelectedTimeRange(e.target.value)}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                        <option value="1d">1 день</option>
                        <option value="7d">7 дней</option>
                        <option value="30d">30 дней</option>
                        <option value="90d">90 дней</option>
                    </select>

                    {/* Экспорт */}
                    <button
                        onClick={handleExport}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                    >
                        <HiOutlineDocumentArrowDown className="w-4 h-4" />
                        Экспорт
                    </button>

                    {/* Обновить */}
                    <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
                    >
                        <HiArrowPath className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                        Обновить
                    </button>
                </div>
            </div>

            {/* Основные метрики */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                            <HiOutlineChartBarSquare className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                Всего узлов
                            </p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {treeStats?.totalNodes || 0}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center">
                        <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                            <HiOutlineEye className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                Глубина
                            </p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {treeStats?.maxDepth || 0}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center">
                        <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                            <HiOutlineClock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                Время рендера
                            </p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                43ms
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                            <HiOutlineCursorArrowRipple className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                Взаимодействия
                            </p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                156
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Графики */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Распределение узлов по уровням */}
                <SimpleBarChart 
                    data={chartData.levelData}
                    title="Распределение узлов по уровням"
                />

                {/* Производительность */}
                <SimpleLineChart 
                    data={chartData.performanceData}
                    title="Производительность"
                />
            </div>

            {/* Нижний ряд графиков */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Действия пользователей */}
                <SimplePieChart 
                    data={chartData.usageData}
                    title="Действия пользователей"
                />

                {/* Активность по времени - простая версия */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                        Активность по времени
                    </h3>
                    <div className="grid grid-cols-6 gap-2 h-32">
                        {chartData.performanceData.map((item, index) => (
                            <div key={index} className="flex flex-col items-center justify-end">
                                <div 
                                    className="w-full bg-purple-500 rounded-t transition-all duration-500 opacity-70"
                                    style={{ height: `${(item.interactions / 40) * 100}%` }}
                                    title={`${item.time}: ${item.interactions} взаимодействий`}
                                />
                                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                    {item.time}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-purple-500 rounded opacity-70"></div>
                            <span className="text-gray-600 dark:text-gray-400">Взаимодействия</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Детальная таблица */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Детальная статистика
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Метрика
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Значение
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Изменение
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                    Общее количество узлов
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                    {treeStats?.totalNodes || 0}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                                    +12%
                                </td>
                            </tr>
                            <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                    Максимальная глубина
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                    {treeStats?.maxDepth || 0}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    0%
                                </td>
                            </tr>
                            <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                    Среднее время рендера
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                    43ms
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                                    +5%
                                </td>
                            </tr>
                            <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                    Количество взаимодействий
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                    156
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                                    +23%
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default Analytics 