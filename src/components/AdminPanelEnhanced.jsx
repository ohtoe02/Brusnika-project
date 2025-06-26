import React from 'react'
import { Routes, Route, NavLink } from 'react-router-dom'
import {
    HiOutlineCog6Tooth,
    HiOutlineChartBarSquare,
    HiOutlineDocumentText,
    HiAdjustmentsHorizontal,
    HiOutlineHome,
    HiOutlineSparkles,
    HiOutlineQuestionMarkCircle,
    HiOutlineArrowLeftOnRectangle
} from 'react-icons/hi2'
import { useTheme } from '../contexts/ThemeContext'

import DataManager from './DataManager'
import VisualizationSettings from './VisualizationSettings'
import Analytics from './Analytics'
import AdminDashboard from './AdminDashboard'

// Системные настройки с улучшенным UI
const SystemSettings = () => {
    const { theme } = useTheme()
    
    return (
        <div className={`p-6 min-h-screen ${theme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-[#fafafa]'}`}>
            <div className="max-w-4xl mx-auto">
                <div className={`rounded-xl p-8 text-center ${theme === 'dark' ? 'bg-[#23272f]' : 'bg-white'}`}>
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${theme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-100'}`}>
                        <HiOutlineCog6Tooth className={`w-8 h-8 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                    </div>
                    <h1 className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Системные настройки</h1>
                    <p className={`mb-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Этот раздел находится в разработке. Скоро здесь появятся дополнительные настройки системы.</p>
                    <div className={`${theme === 'dark' ? 'bg-blue-900/20 text-blue-300' : 'bg-blue-50 text-blue-700'} inline-flex items-center gap-2 px-4 py-2 rounded-lg`}>
                        <HiOutlineSparkles className="w-4 h-4" />
                        <span className="text-sm font-medium">Скоро появится</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

// Основной компонент улучшенной админ панели
const AdminPanelEnhanced = () => {
    const { theme } = useTheme()
    
    return (
        <div className={`min-h-screen flex ${theme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-[#fafafa]'}`}>
            {/* Боковая панель */}
            <div className={`w-64 min-h-screen ${theme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-[#fafafa]'} border-r border-[#23272f]`}>
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                            <span className="text-white font-bold text-sm">B</span>
                        </div>
                        <div>
                            <h2 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Brusnika</h2>
                            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Admin Panel</p>
                        </div>
                    </div>
                    
                    <nav className="space-y-2">
                        <NavLink 
                            to="/admin" 
                            end
                            className={({ isActive }) => `
                                w-full flex items-center gap-3 px-4 py-3 rounded-xl
                                transition-all duration-200
                                ${isActive ? (theme === 'dark' ? 'bg-[#23272f] text-white' : 'bg-white text-blue-700') : (theme === 'dark' ? 'text-gray-300 hover:bg-[#23272f]' : 'text-gray-700 hover:bg-gray-100')}
                            `}
                        >
                            <HiOutlineHome className="w-5 h-5 flex-shrink-0" />
                            <span className="font-medium">Дашборд</span>
                        </NavLink>
                        
                        <NavLink 
                            to="/admin/data"
                            className={({ isActive }) => `
                                w-full flex items-center gap-3 px-4 py-3 rounded-xl
                                transition-all duration-200
                                ${isActive ? (theme === 'dark' ? 'bg-[#23272f] text-white' : 'bg-white text-blue-700') : (theme === 'dark' ? 'text-gray-300 hover:bg-[#23272f]' : 'text-gray-700 hover:bg-gray-100')}
                            `}
                        >
                            <HiOutlineDocumentText className="w-5 h-5 flex-shrink-0" />
                            <span className="font-medium">Данные</span>
                        </NavLink>
                        
                        <NavLink 
                            to="/admin/visualization"
                            className={({ isActive }) => `
                                w-full flex items-center gap-3 px-4 py-3 rounded-xl
                                transition-all duration-200
                                ${isActive ? (theme === 'dark' ? 'bg-[#23272f] text-white' : 'bg-white text-blue-700') : (theme === 'dark' ? 'text-gray-300 hover:bg-[#23272f]' : 'text-gray-700 hover:bg-gray-100')}
                            `}
                        >
                            <HiAdjustmentsHorizontal className="w-5 h-5 flex-shrink-0" />
                            <span className="font-medium">Визуализация</span>
                        </NavLink>
                        
                        <NavLink 
                            to="/admin/analytics"
                            className={({ isActive }) => `
                                w-full flex items-center gap-3 px-4 py-3 rounded-xl
                                transition-all duration-200
                                ${isActive ? (theme === 'dark' ? 'bg-[#23272f] text-white' : 'bg-white text-blue-700') : (theme === 'dark' ? 'text-gray-300 hover:bg-[#23272f]' : 'text-gray-700 hover:bg-gray-100')}
                            `}
                        >
                            <HiOutlineChartBarSquare className="w-5 h-5 flex-shrink-0" />
                            <span className="font-medium">Аналитика</span>
                        </NavLink>
                        
                        <NavLink 
                            to="/admin/system"
                            className={({ isActive }) => `
                                w-full flex items-center gap-3 px-4 py-3 rounded-xl
                                transition-all duration-200
                                ${isActive ? (theme === 'dark' ? 'bg-[#23272f] text-white' : 'bg-white text-blue-700') : (theme === 'dark' ? 'text-gray-300 hover:bg-[#23272f]' : 'text-gray-700 hover:bg-gray-100')}
                            `}
                        >
                            <HiOutlineCog6Tooth className="w-5 h-5 flex-shrink-0" />
                            <span className="font-medium">Система</span>
                        </NavLink>
                    </nav>

                    {/* Выход на полотно */}
                    <div className="mt-6">
                        <NavLink
                            to="/"
                            className={() => `
                                w-full flex items-center gap-3 px-4 py-3 rounded-xl
                                transition-all duration-200
                                ${theme === 'dark' ? 'text-gray-300 hover:bg-[#23272f]' : 'text-gray-700 hover:bg-gray-100'}
                            `}
                        >
                            <HiOutlineArrowLeftOnRectangle className="w-5 h-5 flex-shrink-0" />
                            <span className="font-medium">Вернуться к дереву</span>
                        </NavLink>
                    </div>
                </div>
            </div>
            
            {/* Основной контент */}
            <div className="flex-1">
                <Routes>
                    <Route index element={<AdminDashboard />} />
                    <Route path="data" element={<DataManager />} />
                    <Route path="visualization" element={<VisualizationSettings />} />
                    <Route path="analytics" element={<Analytics />} />
                    <Route path="system" element={<SystemSettings />} />
                </Routes>
            </div>
        </div>
    )
}

export default AdminPanelEnhanced 