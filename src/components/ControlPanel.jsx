import * as d3 from 'd3'
import { useEffect, useState } from 'react'
import './ControlPanel.css'

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

const SettingsIcon = () => (
	<svg viewBox='0 0 24 24' fill='currentColor'>
		<path d='M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.63-.07.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.03-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z' />
	</svg>
)

const ControlPanel = ({
	onDataChange,
	onSearchQueryChange,
	onVisualizationTypeChange,
	onTreeSettingsChange,
}) => {
	const [isSettingsOpen, setIsSettingsOpen] = useState(false)
	const [activeTab, setActiveTab] = useState('layout')
	const [settings, setSettings] = useState({
		nodeSize: 20,
		nodeSpacing: 100,
		levelHeight: 150,
		showDetails: true,
		highlightParents: true,
		animationDuration: 500,
		nodeColor: '#3498db',
		lineColor: '#95a5a6',
		lineWidth: 2,
		showLabels: true,
		labelSize: 12,
		labelColor: '#2c3e50',
		layoutType: 'vertical',
		curveType: 'bezier',
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

	const handleChange = (key, value) => {
		const newSettings = { ...settings, [key]: value }
		setSettings(newSettings)
		onTreeSettingsChange(newSettings)
	}

	const tabs = [
		{ id: 'layout', label: 'Расположение', icon: <LayoutIcon /> },
		{ id: 'style', label: 'Стиль', icon: <StyleIcon /> },
		{ id: 'labels', label: 'Метки', icon: <LabelIcon /> },
		{ id: 'animation', label: 'Анимация', icon: <AnimationIcon /> },
	]

	const renderLayoutSettings = () => (
		<>
			<div className='setting-group'>
				<label>
					Тип расположения:
					<select
						value={settings.layoutType}
						onChange={e => handleChange('layoutType', e.target.value)}
					>
						<option value='vertical'>Вертикальное</option>
						<option value='horizontal'>Горизонтальное</option>
						<option value='radial'>Радиальное</option>
					</select>
				</label>
			</div>

			<div className='setting-group'>
				<label>
					Тип линий:
					<select
						value={settings.curveType}
						onChange={e => handleChange('curveType', e.target.value)}
					>
						<option value='bezier'>Кривые Безье</option>
						<option value='straight'>Прямые</option>
						<option value='step'>Ступенчатые</option>
					</select>
				</label>
			</div>

			<div className='setting-group'>
				<label>
					Размер узла:
					<input
						type='range'
						min='10'
						max='50'
						value={settings.nodeSize}
						onChange={e => handleChange('nodeSize', parseInt(e.target.value))}
					/>
					<span>{settings.nodeSize}px</span>
				</label>
			</div>

			<div className='setting-group'>
				<label>
					Расстояние между узлами:
					<input
						type='range'
						min='50'
						max='200'
						value={settings.nodeSpacing}
						onChange={e =>
							handleChange('nodeSpacing', parseInt(e.target.value))
						}
					/>
					<span>{settings.nodeSpacing}px</span>
				</label>
			</div>

			<div className='setting-group'>
				<label>
					Высота уровня:
					<input
						type='range'
						min='100'
						max='300'
						value={settings.levelHeight}
						onChange={e =>
							handleChange('levelHeight', parseInt(e.target.value))
						}
					/>
					<span>{settings.levelHeight}px</span>
				</label>
			</div>
		</>
	)

	const renderStyleSettings = () => (
		<>
			<div className='setting-group'>
				<label>
					Цвет узлов:
					<input
						type='color'
						value={settings.nodeColor}
						onChange={e => handleChange('nodeColor', e.target.value)}
					/>
				</label>
			</div>

			<div className='setting-group'>
				<label>
					Цвет линий:
					<input
						type='color'
						value={settings.lineColor}
						onChange={e => handleChange('lineColor', e.target.value)}
					/>
				</label>
			</div>

			<div className='setting-group'>
				<label>
					Толщина линий:
					<input
						type='range'
						min='1'
						max='5'
						value={settings.lineWidth}
						onChange={e => handleChange('lineWidth', parseInt(e.target.value))}
					/>
					<span>{settings.lineWidth}px</span>
				</label>
			</div>
		</>
	)

	const renderLabelSettings = () => (
		<>
			<div className='setting-group'>
				<label>
					<input
						type='checkbox'
						checked={settings.showLabels}
						onChange={e => handleChange('showLabels', e.target.checked)}
					/>
					Показывать метки
				</label>
			</div>

			{settings.showLabels && (
				<>
					<div className='setting-group'>
						<label>
							Размер меток:
							<input
								type='range'
								min='8'
								max='20'
								value={settings.labelSize}
								onChange={e =>
									handleChange('labelSize', parseInt(e.target.value))
								}
							/>
							<span>{settings.labelSize}px</span>
						</label>
					</div>

					<div className='setting-group'>
						<label>
							Цвет меток:
							<input
								type='color'
								value={settings.labelColor}
								onChange={e => handleChange('labelColor', e.target.value)}
							/>
						</label>
					</div>
				</>
			)}
		</>
	)

	const renderAnimationSettings = () => (
		<>
			<div className='setting-group'>
				<label>
					<input
						type='checkbox'
						checked={settings.showDetails}
						onChange={e => handleChange('showDetails', e.target.checked)}
					/>
					Показывать детали
				</label>
			</div>

			<div className='setting-group'>
				<label>
					<input
						type='checkbox'
						checked={settings.highlightParents}
						onChange={e => handleChange('highlightParents', e.target.checked)}
					/>
					Подсвечивать родителей
				</label>
			</div>

			<div className='setting-group'>
				<label>
					Длительность анимации:
					<input
						type='range'
						min='100'
						max='1000'
						step='100'
						value={settings.animationDuration}
						onChange={e =>
							handleChange('animationDuration', parseInt(e.target.value))
						}
					/>
					<span>{settings.animationDuration}ms</span>
				</label>
			</div>
		</>
	)

	const renderContent = () => {
		switch (activeTab) {
			case 'layout':
				return renderLayoutSettings()
			case 'style':
				return renderStyleSettings()
			case 'labels':
				return renderLabelSettings()
			case 'animation':
				return renderAnimationSettings()
			default:
				return null
		}
	}

	const handleFileUpload = event => {
		const file = event.target.files[0]
		if (file) {
			const reader = new FileReader()
			reader.onload = e => {
				const csvData = e.target.result
				const parsedData = d3.csvParse(csvData)
				const hierarchyData = buildHierarchy(parsedData)
				onDataChange(hierarchyData)
			}
			reader.readAsText(file, 'UTF-8')
		}
	}

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

	return (
		<div className='control-panel'>
			<div className='control-panel-header'>
				<h2>Управление визуализацией</h2>
				<button
					className='settings-toggle'
					onClick={() => setIsSettingsOpen(!isSettingsOpen)}
				>
					{isSettingsOpen ? 'Скрыть настройки' : 'Показать настройки'}
					<SettingsIcon />
				</button>
			</div>
			{isSettingsOpen && (
				<div className='control-panel-content'>
					<div className='control-group'>
						<label className='file-upload'>
							<input type='file' onChange={handleFileUpload} accept='.csv' />
							<span>Загрузить CSV</span>
						</label>
					</div>
					<div className='control-group'>
						<input
							type='text'
							onChange={e => onSearchQueryChange(e.target.value)}
							placeholder='Поиск...'
							className='search-input'
						/>
					</div>
					<div className='control-group'>
						<select
							onChange={e => onVisualizationTypeChange(e.target.value)}
							className='visualization-select'
						>
							<option value='tree'>Древовидная</option>
							<option value='radial'>Радиальная</option>
						</select>
					</div>
					<div className='settings-section'>
						<div className='settings-header'>
							<h3 className='settings-title'>Настройки дерева</h3>
						</div>
						<div className='settings-tabs'>
							{tabs.map(tab => (
								<div
									key={tab.id}
									className={`settings-tab ${
										activeTab === tab.id ? 'active' : ''
									}`}
									onClick={() => setActiveTab(tab.id)}
								>
									{tab.icon}
									{tab.label}
								</div>
							))}
						</div>
						<div className='settings-content'>{renderContent()}</div>
					</div>
				</div>
			)}
		</div>
	)
}

export default ControlPanel
