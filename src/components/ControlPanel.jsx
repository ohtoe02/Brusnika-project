import * as d3 from 'd3'
import { useState } from 'react'
import './ControlPanel.css'
import TreeSettings from './TreeSettings.jsx'

const ControlPanel = ({
	onDataChange,
	onSearchQueryChange,
	onVisualizationTypeChange,
	onTreeSettingsChange,
}) => {
	const [isSettingsOpen, setIsSettingsOpen] = useState(false)

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
		<div className='control-panel'>
			<div className='control-panel-header'>
				<h2>Управление визуализацией</h2>
				<button
					className='settings-toggle'
					onClick={() => setIsSettingsOpen(!isSettingsOpen)}
				>
					{isSettingsOpen ? 'Скрыть настройки' : 'Показать настройки'}
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
					<TreeSettings onSettingsChange={onTreeSettingsChange} />
				</div>
			)}
		</div>
	)
}

export default ControlPanel
