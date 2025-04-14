import * as d3 from 'd3'
import { useCallback, useState } from 'react'
import './App.css'
import InteractiveTree from './components/InteractiveTree'
import RadialTree from './components/RadialTree'

function App() {
	const [data, setData] = useState(null)
	const [searchQuery, setSearchQuery] = useState('')
	const [visualizationType, setVisualizationType] = useState('tree')

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

	const handleSearch = useCallback(event => {
		setSearchQuery(event.target.value.toLowerCase())
	}, [])

	const handleVisualizationChange = useCallback(event => {
		setVisualizationType(event.target.value)
	}, [])

	return (
		<div className='app'>
			<div className='controls'>
				<input
					type='file'
					id='fileInput'
					accept='.csv'
					onChange={handleFileUpload}
				/>
				<input
					type='text'
					placeholder='Поиск...'
					value={searchQuery}
					onChange={handleSearch}
				/>
				<select value={visualizationType} onChange={handleVisualizationChange}>
					<option value='tree'>Дерево</option>
					<option value='radial'>Радиальное дерево</option>
				</select>
			</div>
			<div className='visualization'>
				{data &&
					(visualizationType === 'tree' ? (
						<InteractiveTree
							data={data}
							width={1000}
							height={800}
							searchQuery={searchQuery}
						/>
					) : (
						<RadialTree
							data={data}
							width={1000}
							height={800}
							searchQuery={searchQuery}
						/>
					))}
			</div>
		</div>
	)
}

export default App
