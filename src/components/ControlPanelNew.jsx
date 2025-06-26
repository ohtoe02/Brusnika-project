import { useState } from 'react'
import { useVisualizationSettings } from '../contexts/VisualizationSettingsContext'
import ActionButton from './ActionButton'

// Иконки для вкладок



const GridIcon = () => (
	<svg viewBox='0 0 24 24' fill='currentColor'>
		<path d='M3 3v18h18V3H3zm16 16H5V5h14v14zM11 7h2v2h-2zM7 7h2v2H7zm8 0h2v2h-2zM7 11h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2zM7 15h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2z'/>
	</svg>
)





const PresetsIcon = () => (
	<svg viewBox='0 0 24 24' fill='currentColor'>
		<path d='M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' />
	</svg>
)

const SettingsIcon = () => (
	<svg viewBox='0 0 24 24' fill='currentColor'>
		<path d='M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.63-.07.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.03-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z' />
	</svg>
)

// Предустановленные пресеты
const PRESETS = {
	default: {
		name: 'По умолчанию',
		settings: {
			nodeSize: { width: 50, height: 50 },
			gridEnabled: true,
			gridSize: 20,
			gridOpacity: 0.15,
			gridColor: '#6b7280',
			majorGridEnabled: true
		}
	},
	dark: {
		name: 'Темная тема',
		settings: {
			nodeSize: { width: 50, height: 50 },
			gridEnabled: true,
			gridSize: 20,
			gridOpacity: 0.1,
			gridColor: '#4a5568',
			majorGridEnabled: true
		}
	},
	colorful: {
		name: 'Яркая',
		settings: {
			nodeSize: { width: 60, height: 60 },
			gridEnabled: true,
			gridSize: 25,
			gridOpacity: 0.2,
			gridColor: '#38a169',
			majorGridEnabled: true
		}
	},
	minimal: {
		name: 'Минимализм',
		settings: {
			nodeSize: { width: 40, height: 40 },
			gridEnabled: false,
			gridSize: 15,
			gridOpacity: 0.05,
			gridColor: '#cbd5e0',
			majorGridEnabled: false
		}
	}
}

const ControlPanelNew = ({ data }) => {
	// Используем контекст настроек визуализации
	const {
		settings,
		updateSetting,
		updateSettings,
		resetSettings,
		SETTING_CATEGORIES
	} = useVisualizationSettings()

	// Локальное состояние UI
	const [isSettingsOpen, setIsSettingsOpen] = useState(false)
	const [activeTab, setActiveTab] = useState('grid')

	// Функция применения пресета
	const applyPreset = (presetKey) => {
		const preset = PRESETS[presetKey]
		if (!preset) return

		// Обновляем все настройки через контекст
		updateSettings(preset.settings)
	}

	// Обработчики UI событий
	const handleToggle = () => setIsSettingsOpen(!isSettingsOpen)
	const handleClose = () => setIsSettingsOpen(false)
	const handleTabClick = (tabId) => {
		console.log('📋 Tab clicked:', tabId, 'Current activeTab:', activeTab)
		setActiveTab(tabId)
		console.log('📋 Tab should be changed to:', tabId)
	}



	// Рендеринг настроек стиля


	// Рендеринг настроек сетки
	const renderGridSettings = () => (
		<div className="space-y-4">
			<div className="flex justify-between items-center">
				<h4 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wide">
					Сетка
				</h4>
				<button
					onClick={resetSettings}
					className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-200 transition-colors"
					title="Сбросить все настройки"
				>
					Сбросить
				</button>
			</div>
			<div className="space-y-3">
				{/* Показывать сетку */}
				<div className="flex items-center p-3 bg-neutral-50 dark:bg-neutral-700 rounded-lg">
					<label className="flex items-center cursor-pointer">
						<input
							type='checkbox'
							className="w-4 h-4 mr-3 text-primary-600 bg-transparent border-2 border-neutral-300 dark:border-neutral-500 rounded focus:ring-primary-500 dark:focus:ring-primary-400"
							checked={settings.gridEnabled || false}
							onChange={e => updateSetting('gridEnabled', e.target.checked)}
						/>
						<span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
							Показывать сетку
						</span>
					</label>
				</div>
				
				{/* Размер ячейки */}
				<div className={`p-3 bg-neutral-50 dark:bg-neutral-700 rounded-lg ${!settings.gridEnabled ? 'opacity-50' : ''}`}>
					<div className="flex justify-between items-center mb-2">
						<label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
							Размер ячейки:
						</label>
						<span className="text-xs font-mono text-neutral-500 dark:text-neutral-400">
							{settings.gridSize || 20}px
						</span>
					</div>
					<input
						type='range'
						className="w-full h-2 bg-neutral-200 dark:bg-neutral-600 rounded-lg appearance-none cursor-pointer"
						min='5'
						max='100'
						disabled={!settings.gridEnabled}
						value={settings.gridSize || 20}
						onChange={e => updateSetting('gridSize', parseInt(e.target.value))}
					/>
				</div>
				
				{/* Прозрачность */}
				<div className={`p-3 bg-neutral-50 dark:bg-neutral-700 rounded-lg ${!settings.gridEnabled ? 'opacity-50' : ''}`}>
					<div className="flex justify-between items-center mb-2">
						<label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
							Прозрачность:
						</label>
						<span className="text-xs font-mono text-neutral-500 dark:text-neutral-400">
							{Math.round((settings.gridOpacity || 0.15) * 100)}%
						</span>
					</div>
					<input
						type='range'
						className="w-full h-2 bg-neutral-200 dark:bg-neutral-600 rounded-lg appearance-none cursor-pointer"
						min='0'
						max='1'
						step='0.05'
						disabled={!settings.gridEnabled}
						value={settings.gridOpacity || 0.15}
						onChange={e => updateSetting('gridOpacity', parseFloat(e.target.value))}
					/>
				</div>
				
				{/* Цвет сетки */}
				<div className={`flex justify-between items-center p-3 bg-neutral-50 dark:bg-neutral-700 rounded-lg ${!settings.gridEnabled ? 'opacity-50' : ''}`}>
					<label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
						Цвет сетки:
					</label>
					<input
						type='color'
						className="w-8 h-8 rounded border border-neutral-300 dark:border-neutral-600 cursor-pointer"
						disabled={!settings.gridEnabled}
						value={settings.gridColor || '#6b7280'}
						onChange={e => updateSetting('gridColor', e.target.value)}
					/>
				</div>
				
				{/* Основная сетка */}
				<div className={`flex items-center p-3 bg-neutral-50 dark:bg-neutral-700 rounded-lg ${!settings.gridEnabled ? 'opacity-50' : ''}`}>
					<label className="flex items-center cursor-pointer">
						<input
							type='checkbox'
							className="w-4 h-4 mr-3 text-primary-600 bg-transparent border-2 border-neutral-300 dark:border-neutral-500 rounded focus:ring-primary-500 dark:focus:ring-primary-400"
							disabled={!settings.gridEnabled}
							checked={settings.majorGridEnabled || false}
							onChange={e => updateSetting('majorGridEnabled', e.target.checked)}
						/>
						<span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
							Основная сетка
						</span>
					</label>
				</div>
			</div>
		</div>
	)





	// Рендеринг настроек пресетов
	const renderPresetsSettings = () => (
		<div className="space-y-4">
			<h4 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wide">
				Пресеты
			</h4>
			<div className="grid grid-cols-2 gap-2">
				{Object.entries(PRESETS).map(([key, preset]) => (
					<button
						key={key}
						onClick={() => applyPreset(key)}
						className="p-3 text-left bg-neutral-50 dark:bg-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-600 rounded-lg transition-colors border border-transparent hover:border-primary-300 dark:hover:border-primary-600"
					>
						<div className="font-medium text-sm text-neutral-700 dark:text-neutral-300">
							{preset.name}
						</div>
						<div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
							{key === 'default' && 'Стандартные настройки'}
							{key === 'dark' && 'Для темной темы'}
							{key === 'colorful' && 'Яркие цвета'}
							{key === 'minimal' && 'Упрощенный вид'}
						</div>
					</button>
				))}
			</div>
			<div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
				<div className="flex items-start">
					<svg className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
						<path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
					</svg>
					<div>
						<p className="text-sm text-yellow-800 dark:text-yellow-200">
							Применение пресета заменит все текущие настройки
						</p>
					</div>
				</div>
			</div>
		</div>
	)

	// Вкладки настроек
	const tabs = [
		{
			id: 'grid',
			label: 'Сетка',
			icon: GridIcon,
			render: renderGridSettings,
		},
		{
			id: 'presets',
			label: 'Пресеты',
			icon: PresetsIcon,
			render: renderPresetsSettings,
		},
	]

	const getCurrentTabContent = () => {
		const currentTab = tabs.find(tab => tab.id === activeTab)
		return currentTab ? currentTab.render() : renderGridSettings()
	}

	if (!data) {
		return null // Не показываем панель если нет данных
	}

	return (
		<div className="relative">
			<ActionButton
				variant="secondary"
				size="md"
				iconOnly
				icon={SettingsIcon}
				tooltip="Настройки визуализации"
				onClick={handleToggle}
				aria-label="Открыть настройки"
			/>

			{isSettingsOpen && (
				<div className={`
					absolute top-16 left-0 w-96
					bg-white dark:bg-neutral-800
					border border-neutral-200 dark:border-neutral-700
					rounded-xl shadow-xl
					overflow-hidden
					animate-slide-in
					z-50
				`}>
					<div className="flex justify-between items-center p-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white">
						<h3 className="font-semibold">Настройки визуализации</h3>
						<button
							className="w-8 h-8 rounded-full hover:bg-white/20 transition-colors duration-200 flex items-center justify-center"
							onClick={handleClose}
						>
							×
						</button>
					</div>
					
					{/* Навигация по вкладкам */}
					<div className="flex overflow-x-auto bg-neutral-50 dark:bg-neutral-700 border-b border-neutral-200 dark:border-neutral-600">
						{tabs.map((tab) => (
							<button
								key={tab.id}
								onClick={() => handleTabClick(tab.id)}
								className={`
									flex items-center space-x-2 px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap
									${activeTab === tab.id
										? 'text-primary-600 dark:text-primary-400 bg-white dark:bg-neutral-800 border-b-2 border-primary-600 dark:border-primary-400'
										: 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200'
									}
								`}
							>
								<tab.icon />
								<span>{tab.label}</span>
							</button>
						))}
					</div>
					
					<div className="p-4 max-h-96 overflow-y-auto">
						{getCurrentTabContent()}
					</div>
				</div>
			)}
		</div>
	)
}

export default ControlPanelNew 