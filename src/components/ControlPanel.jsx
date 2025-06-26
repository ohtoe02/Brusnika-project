import * as d3 from 'd3'
import { useEffect, useRef, useState } from 'react'
import ActionButton from './ActionButton'

// Иконки для вкладок
const LayoutIcon = () => (
	<svg viewBox='0 0 24 24' fill='currentColor'>
		<path d='M3 3h18v18H3V3zm2 2v14h14V5H5z' />
	</svg>
)

const StyleIcon = () => (
	<svg viewBox='0 0 24 24' fill='currentColor'>
		<path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z' />
	</svg>
)

const GridIcon = () => (
	<svg viewBox='0 0 24 24' fill='currentColor'>
		<path d='M3 3v18h18V3H3zm16 16H5V5h14v14zM11 7h2v2h-2zM7 7h2v2H7zm8 0h2v2h-2zM7 11h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2zM7 15h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2z'/>
	</svg>
)

const LabelIcon = () => (
	<svg viewBox='0 0 24 24' fill='currentColor'>
		<path d='M17.63 5.84C17.27 5.33 16.67 5 16 5L5 5.01C3.9 5.01 3 5.9 3 7v10c0 1.1.9 1.99 2 1.99L16 19c.67 0 1.27-.33 1.63-.84L22 12l-4.37-6.16z' />
	</svg>
)

const AnimationIcon = () => (
	<svg viewBox='0 0 24 24' fill='currentColor'>
		<path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z' />
		<path d='M12 6v6l4 2-4 2v6' />
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
			nodeColor: '#3498db',
			lineColor: '#95a5a6',
			lineWidth: 2,
			nodeSize: { width: 50, height: 50 },
			labelSize: 12,
			labelColor: '#2c3e50',
			animationDuration: 500,
			showLabels: true,
			showDetails: true,
			highlightParents: true,
			gridEnabled: true,
			gridSize: 20,
			gridOpacity: 0.15
		}
	},
	dark: {
		name: 'Темная тема',
		settings: {
			nodeColor: '#2d3748',
			lineColor: '#4a5568',
			lineWidth: 2,
			nodeSize: { width: 50, height: 50 },
			labelSize: 12,
			labelColor: '#e2e8f0',
			animationDuration: 500,
			showLabels: true,
			showDetails: true,
			highlightParents: true,
			gridEnabled: true,
			gridSize: 20,
			gridOpacity: 0.1
		}
	},
	colorful: {
		name: 'Яркая',
		settings: {
			nodeColor: '#e53e3e',
			lineColor: '#38a169',
			lineWidth: 3,
			nodeSize: { width: 60, height: 60 },
			labelSize: 14,
			labelColor: '#2d3748',
			animationDuration: 300,
			showLabels: true,
			showDetails: true,
			highlightParents: true,
			gridEnabled: true,
			gridSize: 25,
			gridOpacity: 0.2
		}
	},
	minimal: {
		name: 'Минимализм',
		settings: {
			nodeColor: '#f7fafc',
			lineColor: '#cbd5e0',
			lineWidth: 1,
			nodeSize: { width: 40, height: 40 },
			labelSize: 11,
			labelColor: '#4a5568',
			animationDuration: 750,
			showLabels: true,
			showDetails: false,
			highlightParents: false,
			gridEnabled: false,
			gridSize: 15,
			gridOpacity: 0.05
		}
	}
}

// Функция построения иерархии из плоских данных
const buildHierarchy = flatData => {
	const root = { name: 'Сотрудники', children: [] }
	const levels = [
		'ЮЛ',
		'Локация',
		'Подразделение',
		'Отдел',
		'Группа',
		'Должность',
		'ФИО',
	]
	flatData.forEach(row => {
		let current = root
		levels.forEach(level => {
			let value = row[level] ? row[level].trim() : ''
			if (!value) return
			let child = current.children.find(d => d.name === value)
			if (!child) {
				child = { name: value, children: [] }
				current.children.push(child)
			}
			current = child
		})
		current.details = {
			'Номер позиции': row['Номер позиции'],
			'Тип работы': row['Тип работы'],
		}
	})
	return root
}

// Модальное окно приветствия с drag&drop и загрузкой CSV
const WelcomeModal = ({ onFileLoaded }) => {
	const dropRef = useRef(null)
	const [dragActive, setDragActive] = useState(false)

	const handleDrag = e => {
		e.preventDefault()
		e.stopPropagation()
		if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true)
		else if (e.type === 'dragleave') setDragActive(false)
	}

	const handleDrop = e => {
		e.preventDefault()
		e.stopPropagation()
		setDragActive(false)
		if (e.dataTransfer.files && e.dataTransfer.files[0]) {
			handleFile(e.dataTransfer.files[0])
		}
	}

	const handleFile = file => {
		const reader = new FileReader()
		reader.onload = e => {
			const csvData = e.target.result
			const parsedData = d3.csvParse(csvData)
			const hierarchyData = buildHierarchy(parsedData)
			onFileLoaded(hierarchyData)
		}
		reader.readAsText(file, 'UTF-8')
	}

	const handleInputChange = e => {
		if (e.target.files && e.target.files[0]) {
			handleFile(e.target.files[0])
		}
	}

	return (
		<div
			className={`
				fixed inset-0 z-50 flex items-center justify-center
				bg-neutral-900/50 dark:bg-neutral-900/70 backdrop-blur-sm
				transition-all duration-300 ease-in-out
				${dragActive ? 'bg-primary-500/20' : ''}
			`}
			onDragEnter={handleDrag}
		>
			<div
				className={`
					relative max-w-lg w-full mx-4
					bg-white dark:bg-neutral-800
					border-2 border-dashed border-neutral-300 dark:border-neutral-600
					rounded-2xl shadow-2xl
					p-8 text-center
					transition-all duration-300 ease-in-out
					${dragActive 
						? 'border-primary-500 dark:border-primary-400 bg-primary-50 dark:bg-primary-900/20 scale-105' 
						: 'hover:border-primary-400 dark:hover:border-primary-500'
					}
				`}
				onDragEnter={handleDrag}
				onDragLeave={handleDrag}
				onDragOver={handleDrag}
				onDrop={handleDrop}
				ref={dropRef}
			>
				<div className="mb-6">
					<div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
						<svg width='32' height='32' fill='none' viewBox='0 0 32 32' className="text-white">
						<path
								d='M16 22V10M16 10l-4 4M16 10l4 4'
								stroke='currentColor'
								strokeWidth='2'
							strokeLinecap='round'
							strokeLinejoin='round'
						/>
					</svg>
				</div>
				</div>
				<h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
					Загрузите CSV-файл с иерархией
				</h2>
				<p className="text-neutral-600 dark:text-neutral-400 mb-6">
					Перетащите файл сюда или выберите вручную
				</p>
				<label className="btn-primary cursor-pointer inline-block">
					<input
						type='file'
						accept='.csv'
						onChange={handleInputChange}
						className="hidden"
					/>
					Выбрать файл
				</label>
			</div>
		</div>
	)
}

const ControlPanel = ({
	onDataChange,
	onVisualizationTypeChange,
	onTreeSettingsChange,
	data,
}) => {
	const [isSettingsOpen, setIsSettingsOpen] = useState(false)
	const [activeTab, setActiveTab] = useState('layout')
	const [settings, setSettings] = useState({
		nodeSize: { width: 50, height: 50 },
		showDetails: true,
		highlightParents: true,
		animationDuration: 500,
		nodeColor: '#3498db',
		lineColor: '#95a5a6',
		lineWidth: 2,
		showLabels: true,
		labelSize: 12,
		labelColor: '#2c3e50',
		// Новые настройки сетки
		gridEnabled: true,
		gridSize: 20,
		gridOpacity: 0.15,
		gridColor: '#6b7280',
		majorGridEnabled: true,
	})

	useEffect(() => {
		localStorage.setItem('treeSettings', JSON.stringify(settings))
	}, [settings])

	useEffect(() => {
		const savedSettings = localStorage.getItem('treeSettings')
		if (savedSettings) {
			setSettings(JSON.parse(savedSettings))
		}
	}, [])

	// Improved debug logging
	console.log('ControlPanel render:', { activeTab, isSettingsOpen })

	// Маппинг ключей панели управления на вложенные параметры TREE_CONFIG
	const mapKeyToTreeConfig = (key, value, prevSettings) => {
		const updated = { ...prevSettings }
		if (key === 'nodeColor') {
			updated.colors = {
				...(updated.colors ?? {}),
				node: { ...(updated.colors?.node ?? {}), background: value },
			}
		} else if (key === 'lineColor') {
			updated.colors = { ...(updated.colors ?? {}), link: value }
		} else if (key === 'nodeSize') {
			updated.nodeSize = { ...updated.nodeSize, width: value, height: value }
		} else if (key === 'highlightParents') {
			updated.styles = { ...(updated.styles ?? {}), highlightParents: value }
		} else if (key === 'showDetails') {
			updated.styles = { ...(updated.styles ?? {}), showDetails: value }
		} else if (key === 'animationDuration') {
			updated.zoom = { ...(updated.zoom ?? {}), animationDuration: value }
		} else if (key === 'gridEnabled') {
			updated.grid = { ...(updated.grid ?? {}), enabled: value }
		} else if (key === 'gridSize') {
			updated.grid = { ...(updated.grid ?? {}), size: value }
		} else if (key === 'gridOpacity') {
			updated.grid = { 
				...(updated.grid ?? {}), 
				opacity: { 
					light: value, 
					dark: value * 0.7 
				} 
			}
		} else if (key === 'gridColor') {
			updated.grid = { 
				...(updated.grid ?? {}), 
				color: { 
					light: value, 
					dark: value 
				} 
			}
		} else if (key === 'majorGridEnabled') {
			updated.grid = { 
				...(updated.grid ?? {}), 
				majorGrid: { 
					...(updated.grid?.majorGrid ?? {}), 
					enabled: value 
				} 
			}
		} else {
			updated[key] = value
		}
		return updated
	}

	// Функции для работы с пресетами
	const applyPreset = (presetKey) => {
		const preset = PRESETS[presetKey]
		if (!preset) return

		setSettings(preset.settings)
		
		// Применяем все настройки пресета
		Object.entries(preset.settings).forEach(([key, value]) => {
			onTreeSettingsChange(prevSettings =>
				mapKeyToTreeConfig(key, value, prevSettings)
			)
		})
	}

	const resetSettings = () => {
		applyPreset('default')
	}

	const handleChange = (key, value) => {
		console.log('Setting change:', key, value)
		setSettings(prev => ({ ...prev, [key]: value }))
		onTreeSettingsChange(prevSettings =>
			mapKeyToTreeConfig(key, value, prevSettings)
		)
	}

	// Improved tab click handler with debugging
	const handleTabClick = (tabId) => {
		console.log('Tab click:', tabId)
		setActiveTab(tabId)
	}

	// Improved close handler
	const handleClose = () => {
		console.log('Close panel')
		setIsSettingsOpen(false)
	}

	// Improved open handler
	const handleToggle = () => {
		console.log('Toggle panel:', !isSettingsOpen)
		setIsSettingsOpen(!isSettingsOpen)
	}

	const renderLayoutSettings = () => (
		<div className="space-y-4">
			<div className="flex justify-between items-center">
				<h4 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wide">
					Расположение
				</h4>
				<button
					onClick={resetSettings}
					className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-200 transition-colors"
					title="Сбросить все настройки"
				>
					Сбросить
				</button>
			</div>
			<div className="p-3 bg-neutral-50 dark:bg-neutral-700 rounded-lg">
				<label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
					Тип визуализации:
				</label>
				<select 
					className="input w-full"
					onChange={e => onVisualizationTypeChange(e.target.value)}
				>
					<option value='tree'>Дерево</option>
					<option value='radial'>Радиальное дерево</option>
					<option value='network'>Сеть</option>
				</select>
			</div>
		</div>
	)

	const renderStyleSettings = () => (
		<div className="space-y-4">
			<h4 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wide">
				Стиль
			</h4>
			<div className="space-y-3">
				<div className="flex justify-between items-center p-3 bg-neutral-50 dark:bg-neutral-700 rounded-lg">
					<label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
						Цвет узлов:
					</label>
				<input
					type='color'
						className="w-8 h-8 rounded border border-neutral-300 dark:border-neutral-600 cursor-pointer"
					value={settings.nodeColor}
					onChange={e => handleChange('nodeColor', e.target.value)}
				/>
			</div>
				<div className="flex justify-between items-center p-3 bg-neutral-50 dark:bg-neutral-700 rounded-lg">
					<label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
						Цвет связей:
					</label>
				<input
					type='color'
						className="w-8 h-8 rounded border border-neutral-300 dark:border-neutral-600 cursor-pointer"
					value={settings.lineColor}
					onChange={e => handleChange('lineColor', e.target.value)}
				/>
			</div>
				<div className="p-3 bg-neutral-50 dark:bg-neutral-700 rounded-lg">
					<div className="flex justify-between items-center mb-2">
						<label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
							Толщина связей:
						</label>
						<span className="text-xs font-mono text-neutral-500 dark:text-neutral-400">
							{settings.lineWidth}px
						</span>
					</div>
				<input
					type='range'
						className="w-full h-2 bg-neutral-200 dark:bg-neutral-600 rounded-lg appearance-none cursor-pointer"
					min='1'
					max='5'
					value={settings.lineWidth}
					onChange={e => handleChange('lineWidth', parseInt(e.target.value))}
				/>
				</div>

			</div>
		</div>
	)

	const renderLabelSettings = () => (
		<div className="space-y-4">
			<h4 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wide">
				Метки
			</h4>
			<div className="space-y-3">
				<div className="flex items-center p-3 bg-neutral-50 dark:bg-neutral-700 rounded-lg">
					<label className="flex items-center cursor-pointer">
					<input
						type='checkbox'
							className="w-4 h-4 mr-3 text-primary-600 bg-transparent border-2 border-neutral-300 dark:border-neutral-500 rounded focus:ring-primary-500 dark:focus:ring-primary-400"
						checked={settings.showLabels}
						onChange={e => handleChange('showLabels', e.target.checked)}
					/>
						<span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
					Показывать метки
						</span>
				</label>
			</div>
				<div className="p-3 bg-neutral-50 dark:bg-neutral-700 rounded-lg">
					<div className="flex justify-between items-center mb-2">
						<label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
							Размер шрифта:
						</label>
						<span className="text-xs font-mono text-neutral-500 dark:text-neutral-400">
							{settings.labelSize}px
						</span>
					</div>
				<input
					type='range'
						className="w-full h-2 bg-neutral-200 dark:bg-neutral-600 rounded-lg appearance-none cursor-pointer"
					min='8'
					max='20'
					value={settings.labelSize}
					onChange={e => handleChange('labelSize', parseInt(e.target.value))}
				/>
			</div>
				<div className="flex justify-between items-center p-3 bg-neutral-50 dark:bg-neutral-700 rounded-lg">
					<label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
						Цвет текста:
					</label>
				<input
					type='color'
						className="w-8 h-8 rounded border border-neutral-300 dark:border-neutral-600 cursor-pointer"
					value={settings.labelColor}
					onChange={e => handleChange('labelColor', e.target.value)}
				/>
			</div>
				<div className="flex items-center p-3 bg-neutral-50 dark:bg-neutral-700 rounded-lg">
					<label className="flex items-center cursor-pointer">
					<input
						type='checkbox'
							className="w-4 h-4 mr-3 text-primary-600 bg-transparent border-2 border-neutral-300 dark:border-neutral-500 rounded focus:ring-primary-500 dark:focus:ring-primary-400"
						checked={settings.showDetails}
						onChange={e => handleChange('showDetails', e.target.checked)}
					/>
						<span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
					Показывать детали
						</span>
					</label>
				</div>
			</div>
		</div>
	)

	const renderGridSettings = () => (
		<div className="space-y-4">
			<h4 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wide">
				Сетка
			</h4>
			<div className="space-y-3">
				<div className="flex items-center p-3 bg-neutral-50 dark:bg-neutral-700 rounded-lg">
					<label className="flex items-center cursor-pointer">
						<input
							type='checkbox'
							className="w-4 h-4 mr-3 text-primary-600 bg-transparent border-2 border-neutral-300 dark:border-neutral-500 rounded focus:ring-primary-500 dark:focus:ring-primary-400"
							checked={settings.gridEnabled}
							onChange={e => handleChange('gridEnabled', e.target.checked)}
						/>
						<span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
							Показывать сетку
						</span>
					</label>
				</div>
				<div className="p-3 bg-neutral-50 dark:bg-neutral-700 rounded-lg">
					<div className="flex justify-between items-center mb-2">
						<label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
							Размер ячейки:
						</label>
						<span className="text-xs font-mono text-neutral-500 dark:text-neutral-400">
							{settings.gridSize}px
						</span>
					</div>
					<input
						type='range'
						className="w-full h-2 bg-neutral-200 dark:bg-neutral-600 rounded-lg appearance-none cursor-pointer"
						min='10'
						max='50'
						value={settings.gridSize}
						onChange={e => handleChange('gridSize', parseInt(e.target.value))}
						disabled={!settings.gridEnabled}
					/>
				</div>
				<div className="p-3 bg-neutral-50 dark:bg-neutral-700 rounded-lg">
					<div className="flex justify-between items-center mb-2">
						<label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
							Прозрачность:
						</label>
						<span className="text-xs font-mono text-neutral-500 dark:text-neutral-400">
							{Math.round(settings.gridOpacity * 100)}%
						</span>
					</div>
					<input
						type='range'
						className="w-full h-2 bg-neutral-200 dark:bg-neutral-600 rounded-lg appearance-none cursor-pointer"
						min='0.05'
						max='0.5'
						step='0.05'
						value={settings.gridOpacity}
						onChange={e => handleChange('gridOpacity', parseFloat(e.target.value))}
						disabled={!settings.gridEnabled}
					/>
				</div>
				<div className="flex justify-between items-center p-3 bg-neutral-50 dark:bg-neutral-700 rounded-lg">
					<label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
						Цвет сетки:
					</label>
					<input
						type='color'
						className="w-8 h-8 rounded border border-neutral-300 dark:border-neutral-600 cursor-pointer"
						value={settings.gridColor}
						onChange={e => handleChange('gridColor', e.target.value)}
						disabled={!settings.gridEnabled}
					/>
				</div>
				<div className="flex items-center p-3 bg-neutral-50 dark:bg-neutral-700 rounded-lg">
					<label className="flex items-center cursor-pointer">
						<input
							type='checkbox'
							className="w-4 h-4 mr-3 text-primary-600 bg-transparent border-2 border-neutral-300 dark:border-neutral-500 rounded focus:ring-primary-500 dark:focus:ring-primary-400"
							checked={settings.majorGridEnabled}
							onChange={e => handleChange('majorGridEnabled', e.target.checked)}
							disabled={!settings.gridEnabled}
						/>
						<span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
							Основная сетка
						</span>
				</label>
				</div>
			</div>
		</div>
	)

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

	const renderAnimationSettings = () => (
		<div className="space-y-4">
			<h4 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wide">
				Анимация
			</h4>
			<div className="space-y-3">
				<div className="p-3 bg-neutral-50 dark:bg-neutral-700 rounded-lg">
					<div className="flex justify-between items-center mb-2">
						<label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
							Длительность анимации:
						</label>
						<span className="text-xs font-mono text-neutral-500 dark:text-neutral-400">
							{settings.animationDuration}ms
						</span>
					</div>
				<input
					type='range'
						className="w-full h-2 bg-neutral-200 dark:bg-neutral-600 rounded-lg appearance-none cursor-pointer"
					min='100'
					max='2000'
					step='100'
					value={settings.animationDuration}
					onChange={e =>
						handleChange('animationDuration', parseInt(e.target.value))
					}
				/>
			</div>
				<div className="flex items-center p-3 bg-neutral-50 dark:bg-neutral-700 rounded-lg">
					<label className="flex items-center cursor-pointer">
					<input
						type='checkbox'
							className="w-4 h-4 mr-3 text-primary-600 bg-transparent border-2 border-neutral-300 dark:border-neutral-500 rounded focus:ring-primary-500 dark:focus:ring-primary-400"
						checked={settings.highlightParents}
						onChange={e => handleChange('highlightParents', e.target.checked)}
					/>
						<span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
					Подсвечивать родителей
						</span>
				</label>
				</div>
			</div>
		</div>
	)

	// Вкладки настроек
	const tabs = [
		{
			id: 'layout',
			label: 'Расположение',
			icon: LayoutIcon,
			render: renderLayoutSettings,
		},
		{
			id: 'style',
			label: 'Стиль',
			icon: StyleIcon,
			render: renderStyleSettings,
		},
		{
			id: 'grid',
			label: 'Сетка',
			icon: GridIcon,
			render: renderGridSettings,
		},
		{
			id: 'labels',
			label: 'Метки',
			icon: LabelIcon,
			render: renderLabelSettings,
		},
		{
			id: 'animation',
			label: 'Анимация',
			icon: AnimationIcon,
			render: renderAnimationSettings,
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
		return currentTab ? currentTab.render() : renderLayoutSettings()
	}

	if (!data) {
		return <WelcomeModal onFileLoaded={onDataChange} />
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

export default ControlPanel
