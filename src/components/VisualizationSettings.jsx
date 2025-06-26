import React, { useState, useCallback } from 'react'
// import ReactSlider from 'react-slider'
import { 
    HiOutlineSwatch,
    HiAdjustmentsHorizontal,
    HiOutlineEye,
    HiOutlineSparkles,
    HiOutlineArrowPath,
    HiOutlineCheckCircle,
    HiOutlineXCircle,
    HiOutlineInformationCircle,
    HiOutlineCog6Tooth
} from 'react-icons/hi2'
import { useAppStore, useToastStore } from '../store/appStore'
import { useTheme } from '../contexts/ThemeContext'

const VisualizationSettings = () => {
    const { theme } = useTheme()
    const { treeSettings, updateTreeSettings, treeInstanceRef } = useAppStore()
    const { showSuccess, showInfo } = useToastStore()
    
    const [activeTab, setActiveTab] = useState('layout')
    const [previewMode, setPreviewMode] = useState(false)

    // Табы настроек
    const tabs = [
        { id: 'layout', label: 'Макет', icon: HiAdjustmentsHorizontal },
        { id: 'colors', label: 'Цвета', icon: HiOutlineSwatch },
        { id: 'behavior', label: 'Поведение', icon: HiOutlineSparkles },
        { id: 'performance', label: 'Производительность', icon: HiOutlineCog6Tooth },
    ]

    // Обновление настроек с применением к дереву
    const handleSettingsUpdate = useCallback((updates) => {
        updateTreeSettings(updates)
        
        // Применяем изменения к дереву в реальном времени
        if (treeInstanceRef.current && previewMode) {
            treeInstanceRef.current.updateSettings(updates)
        }
    }, [updateTreeSettings, treeInstanceRef, previewMode])

    // Сброс настроек к значениям по умолчанию
    const resetToDefaults = () => {
        const defaultSettings = {
            nodeSize: {
                width: 140,
                height: 40,
                borderRadius: 8,
                padding: 12,
            },
            spacing: {
                horizontal: 200,
                vertical: 80,
                separation: {
                    siblings: 1.2,
                    cousins: 2.5,
                },
            },
            zoom: {
                extent: [0.1, 3],
                initialScale: 0.6,
            }
        }
        
        handleSettingsUpdate(defaultSettings)
        showInfo('Настройки сброшены к значениям по умолчанию')
    }

    // Применение настроек
    const applySettings = () => {
        if (treeInstanceRef.current) {
            treeInstanceRef.current.updateSettings(treeSettings)
            showSuccess('Настройки успешно применены')
        }
    }

    // Компонент слайдера с подписью
    const SettingSlider = ({ label, value, min, max, step = 1, onChange, suffix = '' }) => (
        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {label}
                </label>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                    {value}{suffix}
                </span>
            </div>
            <input
                type="range"
                value={value}
                min={min}
                max={max}
                step={step}
                onChange={(e) => onChange(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer range-slider"
            />
        </div>
    )

    // Компонент выбора цвета (встроенный HTML5 color picker)
    const ColorPicker = ({ label, color, onChange }) => (
        <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {label}
            </label>
            <div className="flex items-center gap-3">
                <input
                    type="color"
                    value={color}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-12 h-10 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                />
                <input
                    type="text"
                    value={color}
                    onChange={(e) => onChange(e.target.value)}
                    className="flex-1 h-10 px-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="#000000"
                />
            </div>
        </div>
    )

    // Рендер контента вкладки "Макет"
    const renderLayoutTab = () => (
        <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                                            <HiAdjustmentsHorizontal className="w-5 h-5" />
                    Размеры узлов
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <SettingSlider
                        label="Ширина узла"
                        value={treeSettings.nodeSize.width}
                        min={100}
                        max={300}
                        step={10}
                        suffix="px"
                        onChange={(value) => handleSettingsUpdate({
                            nodeSize: { ...treeSettings.nodeSize, width: value }
                        })}
                    />
                    <SettingSlider
                        label="Высота узла"
                        value={treeSettings.nodeSize.height}
                        min={30}
                        max={80}
                        step={5}
                        suffix="px"
                        onChange={(value) => handleSettingsUpdate({
                            nodeSize: { ...treeSettings.nodeSize, height: value }
                        })}
                    />
                    <SettingSlider
                        label="Скругление углов"
                        value={treeSettings.nodeSize.borderRadius}
                        min={0}
                        max={20}
                        suffix="px"
                        onChange={(value) => handleSettingsUpdate({
                            nodeSize: { ...treeSettings.nodeSize, borderRadius: value }
                        })}
                    />
                    <SettingSlider
                        label="Внутренний отступ"
                        value={treeSettings.nodeSize.padding}
                        min={4}
                        max={24}
                        suffix="px"
                        onChange={(value) => handleSettingsUpdate({
                            nodeSize: { ...treeSettings.nodeSize, padding: value }
                        })}
                    />
                </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                    Расстояния и отступы
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <SettingSlider
                        label="Горизонтальное расстояние"
                        value={treeSettings.spacing.horizontal}
                        min={100}
                        max={400}
                        step={20}
                        suffix="px"
                        onChange={(value) => handleSettingsUpdate({
                            spacing: { ...treeSettings.spacing, horizontal: value }
                        })}
                    />
                    <SettingSlider
                        label="Вертикальное расстояние"
                        value={treeSettings.spacing.vertical}
                        min={50}
                        max={200}
                        step={10}
                        suffix="px"
                        onChange={(value) => handleSettingsUpdate({
                            spacing: { ...treeSettings.spacing, vertical: value }
                        })}
                    />
                    <SettingSlider
                        label="Расстояние между соседями"
                        value={treeSettings.spacing.separation.siblings}
                        min={0.5}
                        max={3}
                        step={0.1}
                        onChange={(value) => handleSettingsUpdate({
                            spacing: { 
                                ...treeSettings.spacing, 
                                separation: { ...treeSettings.spacing.separation, siblings: value }
                            }
                        })}
                    />
                    <SettingSlider
                        label="Расстояние между ветвями"
                        value={treeSettings.spacing.separation.cousins}
                        min={1}
                        max={5}
                        step={0.1}
                        onChange={(value) => handleSettingsUpdate({
                            spacing: { 
                                ...treeSettings.spacing, 
                                separation: { ...treeSettings.spacing.separation, cousins: value }
                            }
                        })}
                    />
                </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                    Настройки зума
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <SettingSlider
                        label="Минимальный зум"
                        value={treeSettings.zoom.extent[0]}
                        min={0.05}
                        max={1}
                        step={0.05}
                        onChange={(value) => handleSettingsUpdate({
                            zoom: { ...treeSettings.zoom, extent: [value, treeSettings.zoom.extent[1]] }
                        })}
                    />
                    <SettingSlider
                        label="Максимальный зум"
                        value={treeSettings.zoom.extent[1]}
                        min={1}
                        max={10}
                        step={0.5}
                        onChange={(value) => handleSettingsUpdate({
                            zoom: { ...treeSettings.zoom, extent: [treeSettings.zoom.extent[0], value] }
                        })}
                    />
                    <SettingSlider
                        label="Начальный масштаб"
                        value={treeSettings.zoom.initialScale}
                        min={0.1}
                        max={2}
                        step={0.1}
                        onChange={(value) => handleSettingsUpdate({
                            zoom: { ...treeSettings.zoom, initialScale: value }
                        })}
                    />
                </div>
            </div>
        </div>
    )

    // Рендер контента вкладки "Цвета"
    const renderColorsTab = () => (
        <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                    <HiOutlineSwatch className="w-5 h-5" />
                    Цвета узлов
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ColorPicker
                        label="Фон узла"
                        color={treeSettings.colors.node.background}
                        onChange={(color) => handleSettingsUpdate({
                            colors: {
                                ...treeSettings.colors,
                                node: { ...treeSettings.colors.node, background: color }
                            }
                        })}
                    />
                    <ColorPicker
                        label="Граница узла"
                        color={treeSettings.colors.node.border}
                        onChange={(color) => handleSettingsUpdate({
                            colors: {
                                ...treeSettings.colors,
                                node: { ...treeSettings.colors.node, border: color }
                            }
                        })}
                    />
                    <ColorPicker
                        label="Текст узла"
                        color={treeSettings.colors.node.text}
                        onChange={(color) => handleSettingsUpdate({
                            colors: {
                                ...treeSettings.colors,
                                node: { ...treeSettings.colors.node, text: color }
                            }
                        })}
                    />
                </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                    Цвета связей
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ColorPicker
                        label="Обычная связь"
                        color={treeSettings.colors.link}
                        onChange={(color) => handleSettingsUpdate({
                            colors: { ...treeSettings.colors, link: color }
                        })}
                    />
                    <ColorPicker
                        label="Подсвеченная связь"
                        color={treeSettings.colors.linkHighlight}
                        onChange={(color) => handleSettingsUpdate({
                            colors: { ...treeSettings.colors, linkHighlight: color }
                        })}
                    />
                    <ColorPicker
                        label="Связь при наведении"
                        color={treeSettings.colors.linkHover}
                        onChange={(color) => handleSettingsUpdate({
                            colors: { ...treeSettings.colors, linkHover: color }
                        })}
                    />
                </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                    Специальные состояния
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ColorPicker
                        label="Найденный узел"
                        color={treeSettings.colors.nodeStates.found.background}
                        onChange={(color) => handleSettingsUpdate({
                            colors: {
                                ...treeSettings.colors,
                                nodeStates: {
                                    ...treeSettings.colors.nodeStates,
                                    found: { ...treeSettings.colors.nodeStates.found, background: color }
                                }
                            }
                        })}
                    />
                    <ColorPicker
                        label="Родительский узел"
                        color={treeSettings.colors.nodeStates.parent.background}
                        onChange={(color) => handleSettingsUpdate({
                            colors: {
                                ...treeSettings.colors,
                                nodeStates: {
                                    ...treeSettings.colors.nodeStates,
                                    parent: { ...treeSettings.colors.nodeStates.parent, background: color }
                                }
                            }
                        })}
                    />
                </div>
            </div>
        </div>
    )

    // Рендер контента вкладки "Поведение"
    const renderBehaviorTab = () => (
        <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                    <HiOutlineSparkles className="w-5 h-5" />
                    Поведение дерева
                </h3>
                <div className="space-y-4">
                    {Object.entries(treeSettings.behavior).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {key === 'expandFirstLevel' && 'Развернуть первый уровень'}
                                {key === 'highlightParents' && 'Подсвечивать родителей'}
                                {key === 'showDetails' && 'Показывать детали'}
                                {key === 'autoExpand' && 'Автоматическое разворачивание'}
                                {key === 'centerOnSearch' && 'Центрировать при поиске'}
                            </label>
                            <button
                                onClick={() => handleSettingsUpdate({
                                    behavior: { ...treeSettings.behavior, [key]: !value }
                                })}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                    value ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                                }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                        value ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                                />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                    Анимации
                </h3>
                <SettingSlider
                    label="Длительность анимации поиска"
                    value={treeSettings.behavior.searchHighlightDuration}
                    min={1000}
                    max={10000}
                    step={500}
                    suffix="мс"
                    onChange={(value) => handleSettingsUpdate({
                        behavior: { ...treeSettings.behavior, searchHighlightDuration: value }
                    })}
                />
            </div>
        </div>
    )

    // Рендер контента вкладки "Производительность"
    const renderPerformanceTab = () => (
        <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                    <HiOutlineCog6Tooth className="w-5 h-5" />
                    Настройки сетки
                </h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Показывать сетку
                        </label>
                        <button
                            onClick={() => handleSettingsUpdate({
                                grid: { ...treeSettings.grid, enabled: !treeSettings.grid.enabled }
                            })}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                treeSettings.grid.enabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                            }`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                    treeSettings.grid.enabled ? 'translate-x-6' : 'translate-x-1'
                                }`}
                            />
                        </button>
                    </div>

                    {treeSettings.grid.enabled && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <SettingSlider
                                label="Размер ячейки сетки"
                                value={treeSettings.grid.size}
                                min={10}
                                max={50}
                                step={5}
                                suffix="px"
                                onChange={(value) => handleSettingsUpdate({
                                    grid: { ...treeSettings.grid, size: value }
                                })}
                            />
                            <SettingSlider
                                label="Прозрачность сетки"
                                value={treeSettings.grid.opacity.light * 100}
                                min={5}
                                max={50}
                                suffix="%"
                                onChange={(value) => handleSettingsUpdate({
                                    grid: { 
                                        ...treeSettings.grid, 
                                        opacity: { 
                                            light: value / 100, 
                                            dark: (value / 100) * 0.7 
                                        }
                                    }
                                })}
                            />
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                    Анимации
                </h3>
                <SettingSlider
                    label="Длительность анимации зума"
                    value={treeSettings.zoom.animationDuration}
                    min={100}
                    max={2000}
                    step={50}
                    suffix="мс"
                    onChange={(value) => handleSettingsUpdate({
                        zoom: { ...treeSettings.zoom, animationDuration: value }
                    })}
                />
            </div>
        </div>
    )

    return (
        <div className={`min-h-screen p-6 ${theme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-[#fafafa]'}`}>
            <div className="max-w-7xl mx-auto">
                <h1 className={`text-3xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Настройки визуализации</h1>
                {/* Tabs и навигация */}
                <div className="mb-8">
                    <div className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700">
                        <nav className="flex space-x-8 px-6">
                            {tabs.map((tab) => {
                                const Icon = tab.icon
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                            activeTab === tab.id
                                                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                        }`}
                                    >
                                        <Icon className="w-5 h-5 inline mr-2" />
                                        {tab.label}
                                    </button>
                                )
                            })}
                        </nav>
                    </div>
                </div>
                {/* Группы настроек */}
                <div className="space-y-6">
                    {activeTab === 'layout' && renderLayoutTab()}
                    {activeTab === 'colors' && renderColorsTab()}
                    {activeTab === 'behavior' && renderBehaviorTab()}
                    {activeTab === 'performance' && renderPerformanceTab()}
                </div>
                {/* ... остальные элементы ... */}
            </div>
        </div>
    )
}

export default VisualizationSettings 