import React, { useState } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { 
    HiOutlineCog6Tooth,
    HiOutlineChartBarSquare,
    HiOutlineDocumentText,
    HiAdjustmentsHorizontal,
    HiOutlineXMark,
    HiOutlineBars3
} from 'react-icons/hi2'
// import { useTheme } from '../contexts/ThemeContext'
import DataManager from './DataManager'

// Импорт компонентов админ панели
import VisualizationSettings from './VisualizationSettings'
import Analytics from './Analytics'
const SystemSettings = () => (
    <div className="p-6">
        <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            Системные настройки
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
            Этот раздел находится в разработке...
        </p>
    </div>
)

// Главный дашборд админки
const AdminDashboard = () => {
    
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                Админ панель Brusnika Tree
            </h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Статистика */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Всего узлов</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">156</p>
                        </div>
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <HiOutlineDocumentText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Экспортов</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">23</p>
                        </div>
                        <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                            <HiOutlineChartBarSquare className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                    </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Активных тем</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">2</p>
                        </div>
                        <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                            <HiAdjustmentsHorizontal className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                    </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Конфигураций</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">8</p>
                        </div>
                        <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                            <HiOutlineCog6Tooth className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Быстрые действия */}
            <div className="mt-8">
                <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                    Быстрые действия
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-left">
                        <h3 className="font-medium text-blue-900 dark:text-blue-100">Импорт данных</h3>
                        <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">Загрузить новую структуру дерева</p>
                    </button>
                    
                    <button className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors text-left">
                        <h3 className="font-medium text-green-900 dark:text-green-100">Экспорт конфигурации</h3>
                        <p className="text-sm text-green-700 dark:text-green-300 mt-1">Сохранить текущие настройки</p>
                    </button>
                </div>
            </div>
        </div>
    )
}

// Компонент навигационного меню
const AdminSidebar = ({ isOpen, onClose }) => {
    const navigate = useNavigate()
    const location = useLocation()
    
    const menuItems = [
        {
            path: '/admin',
            icon: HiOutlineChartBarSquare,
            label: 'Дашборд',
            exact: true
        },
        {
            path: '/admin/data',
            icon: HiOutlineDocumentText,
            label: 'Управление данными'
        },
        {
            path: '/admin/visualization',
            icon: HiAdjustmentsHorizontal,
            label: 'Настройки визуализации'
        },
        {
            path: '/admin/analytics',
            icon: HiOutlineChartBarSquare,
            label: 'Аналитика'
        },
        {
            path: '/admin/system',
            icon: HiOutlineCog6Tooth,
            label: 'Системные настройки'
        }
    ]
    
    const isActive = (path, exact = false) => {
        if (exact) {
            return location.pathname === path
        }
        return location.pathname.startsWith(path)
    }
    
    return (
        <>
            {/* Overlay для мобильных устройств */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                    onClick={onClose}
                />
            )}
            
            {/* Боковая панель */}
            <div className={`
                fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-900 
                border-r border-gray-200 dark:border-gray-700 z-50
                transform transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                lg:translate-x-0 lg:static lg:z-auto
            `}>
                {/* Заголовок */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        Админ панель
                    </h2>
                    <button
                        onClick={onClose}
                        className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        <HiOutlineXMark className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </button>
                </div>
                
                {/* Навигационное меню */}
                <nav className="p-4 space-y-2">
                    {menuItems.map((item) => {
                        const Icon = item.icon
                        const active = isActive(item.path, item.exact)
                        
                        return (
                            <button
                                key={item.path}
                                onClick={() => {
                                    navigate(item.path)
                                    onClose()
                                }}
                                className={`
                                    w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                                    text-left transition-all duration-200
                                    ${active 
                                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800' 
                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                                    }
                                `}
                            >
                                <Icon className="w-5 h-5 flex-shrink-0" />
                                <span className="font-medium">{item.label}</span>
                            </button>
                        )
                    })}
                </nav>
                
                {/* Информация внизу */}
                <div className="absolute bottom-4 left-4 right-4">
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                            Версия: 1.0.0
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                            Последнее обновление: {new Date().toLocaleDateString()}
                        </p>
                    </div>
                </div>
            </div>
        </>
    )
}

// Основной компонент админ панели
const AdminPanel = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Боковая панель */}
            <AdminSidebar 
                isOpen={sidebarOpen} 
                onClose={() => setSidebarOpen(false)} 
            />
            
            {/* Основной контент */}
            <div className="lg:ml-64">
                {/* Верхняя панель */}
                <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                                <HiOutlineBars3 className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                            </button>
                            
                            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                                Администрирование
                            </h1>
                        </div>
                        
                        <div className="flex items-center gap-4">
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                {new Date().toLocaleDateString('ru-RU', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </div>
                        </div>
                    </div>
                </header>
                
                {/* Контент страниц */}
                <main className="min-h-[calc(100vh-73px)]">
                    <Routes>
                        <Route index element={<AdminDashboard />} />
                        <Route path="data" element={<DataManager />} />
                        <Route path="visualization" element={<VisualizationSettings />} />
                        <Route path="analytics" element={<Analytics />} />
                        <Route path="system" element={<SystemSettings />} />
                    </Routes>
                </main>
            </div>
        </div>
    )
}

export default AdminPanel 