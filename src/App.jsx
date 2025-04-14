import * as d3 from 'd3'
import { useCallback, useEffect, useState } from 'react'
import './App.css'
import ControlPanel from './components/ControlPanel'
import { InteractiveTreeComponent } from './components/InteractiveTree'
import RadialTree from './components/RadialTree'

function App() {
	const [data, setData] = useState(null)
	const [searchQuery, setSearchQuery] = useState('')
	const [visualizationType, setVisualizationType] = useState('tree')
	const [treeSettings, setTreeSettings] = useState({
		nodeSize: 20,
		nodeSpacing: 100,
		levelHeight: 150,
		showDetails: true,
		highlightParents: true,
		animationDuration: 500,
	})
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

	return (
		<div className='App'>
			<ControlPanel
				onDataChange={setData}
				onSearchQueryChange={setSearchQuery}
				onVisualizationTypeChange={setVisualizationType}
				onTreeSettingsChange={setTreeSettings}
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
				) : (
					<RadialTree
						data={data}
						width={dimensions.width}
						height={dimensions.height}
						searchQuery={searchQuery}
						settings={treeSettings}
					/>
				)}
			</div>
		</div>
	)
}

export default App
