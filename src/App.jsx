import * as d3 from 'd3'
import { useCallback, useEffect, useState } from 'react'
import './App.css'
import ControlPanel from './components/ControlPanel'
import { InteractiveTreeComponent } from './components/InteractiveTree'
import RadialTree from './components/RadialTree'
import VisNetwork from './components/VisNetwork'
import { TREE_CONFIG } from './constants/treeConfig'

// Глубокое слияние объектов
function deepMerge(target, source) {
	const output = { ...target }
	if (typeof target === 'object' && typeof source === 'object') {
		for (const key in source) {
			if (
				source[key] &&
				typeof source[key] === 'object' &&
				!Array.isArray(source[key])
			) {
				output[key] = deepMerge(target[key] || {}, source[key])
			} else {
				output[key] = source[key]
			}
		}
	}
	return output
}

// Маппинг treeSettings -> options для vis-network
function mapTreeSettingsToVisOptions(settings) {
	return {
		nodes: {
			color: settings.nodeColor || '#3498db',
			font: {
				color: settings.labelColor || '#2c3e50',
				size: settings.labelSize || 12,
			},
			size: settings.nodeSize?.width || 25,
		},
		edges: {
			color: settings.lineColor || '#95a5a6',
			width: settings.lineWidth || 2,
		},
		layout: {
			improvedLayout: true,
		},
		physics: {
			enabled: true,
		},
	}
}

function App() {
	// При инициализации читаем data из localStorage
	const [data, setData] = useState(() => {
		try {
			const saved = localStorage.getItem('treeData')
			return saved ? JSON.parse(saved) : null
		} catch (e) {
			return null
		}
	})
	const [searchQuery, setSearchQuery] = useState('')
	const [visualizationType, setVisualizationType] = useState('tree')
	const [treeSettings, setTreeSettings] = useState(TREE_CONFIG)
	const [dimensions, setDimensions] = useState({
		width: window.innerWidth,
		height: window.innerHeight,
	})

	useEffect(() => {
		const handleResize = () => {
			setDimensions({
				width: window.innerWidth,
				height: window.innerHeight,
			})
		}

		window.addEventListener('resize', handleResize)
		return () => window.removeEventListener('resize', handleResize)
	}, [])

	// Сохраняем data в localStorage при каждом изменении
	useEffect(() => {
		if (data) {
			try {
				localStorage.setItem('treeData', JSON.stringify(data))
			} catch (e) {
				/* ignore */
			}
		}
	}, [data])

	const handleFileUpload = useCallback(event => {
		const file = event.target.files[0]
		if (file) {
			const reader = new FileReader()
			reader.onload = e => {
				const csvData = e.target.result
				const parsedData = d3.csvParse(csvData)
				const hierarchyData = buildHierarchy(parsedData)
				setData(hierarchyData)
			}
			reader.readAsText(file, 'UTF-8')
		}
	}, [])

	const buildHierarchy = flatData => {
		// Корневой узел
		const root = { name: 'Сотрудники', children: [] }
		// Последовательность уровней
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
				// Если значение существует и не пустое – используем его, иначе пропускаем данный уровень
				let value = row[level] ? row[level].trim() : ''
				if (!value) return // пропускаем уровень
				// Ищем уже существующий дочерний узел с данным значением
				let child = current.children.find(d => d.name === value)
				if (!child) {
					child = { name: value, children: [] }
					current.children.push(child)
				}
				current = child
			})
			// Прикрепляем дополнительные данные к последнему узлу
			current.details = {
				'Номер позиции': row['Номер позиции'],
				'Тип работы': row['Тип работы'],
			}
		})
		return root
	}

	// Обновление настроек с глубоким слиянием
	const handleTreeSettingsChange = newSettings => {
		setTreeSettings(prev => deepMerge(prev, newSettings))
	}

	// Пример данных для vis-network (можно заменить на реальные)
	const networkData = {
		nodes: [
			{ id: 1, label: 'Node 1' },
			{ id: 2, label: 'Node 2' },
			{ id: 3, label: 'Node 3' },
			{ id: 4, label: 'Node 4' },
			{ id: 5, label: 'Node 5' },
		],
		edges: [
			{ from: 1, to: 3 },
			{ from: 1, to: 2 },
			{ from: 2, to: 4 },
			{ from: 2, to: 5 },
		],
	}
	const networkOptions = mapTreeSettingsToVisOptions(treeSettings)

	return (
		<div className='App'>
			<ControlPanel
				data={data}
				onDataChange={setData}
				onSearchQueryChange={setSearchQuery}
				onVisualizationTypeChange={setVisualizationType}
				onTreeSettingsChange={handleTreeSettingsChange}
			/>
			<div className='visualization-container'>
				{visualizationType === 'tree' ? (
					<InteractiveTreeComponent
						data={data}
						width={dimensions.width}
						height={dimensions.height}
						searchQuery={searchQuery}
						settings={treeSettings}
					/>
				) : visualizationType === 'radial' ? (
					<RadialTree
						data={data}
						width={dimensions.width}
						height={dimensions.height}
						searchQuery={searchQuery}
						settings={treeSettings}
					/>
				) : (
					<VisNetwork data={networkData} options={networkOptions} />
				)}
			</div>
			{/* <VisNetwork data={networkData} options={networkOptions} /> */}
		</div>
	)
}

export default App
