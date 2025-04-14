import * as d3 from 'd3'
import { useEffect, useRef, useState } from 'react'
import { InteractiveTree } from '../visualizations/interactiveTree'
import { MiniMap } from './MiniMap'

export const InteractiveTreeComponent = ({
	data,
	width,
	height,
	searchQuery = '',
}) => {
	const svgRef = useRef(null)
	const treeRef = useRef(null)
	const [currentPath, setCurrentPath] = useState(null)
	const containerRef = useRef(null)

	useEffect(() => {
		if (!svgRef.current || !data) return

		const margin = { top: 20, right: 20, bottom: 20, left: 20 }
		const svg = d3.select(svgRef.current)

		// Создаем новый экземпляр InteractiveTree
		treeRef.current = new InteractiveTree(
			svg,
			data,
			width - margin.left - margin.right,
			height - margin.top - margin.bottom,
			searchQuery,
			margin
		)

		// Устанавливаем callback для обновления пути
		treeRef.current.setOnPathChange(setCurrentPath)

		// Получаем контейнер масштабирования из InteractiveTree
		const zoomContainer = svg.select('.zoom-container')

		// Создаем сетку внутри контейнера масштабирования
		const gridSize = 50
		const gridGroup = zoomContainer.append('g').attr('class', 'grid').lower() // Помещаем сетку под другие элементы

		// Создаем горизонтальные линии
		for (let y = -height; y < height * 2; y += gridSize) {
			gridGroup
				.append('line')
				.attr('x1', -width)
				.attr('y1', y)
				.attr('x2', width * 2)
				.attr('y2', y)
				.attr('stroke', 'rgba(74, 144, 226, 0.1)')
				.attr('stroke-width', 1)
		}

		// Создаем вертикальные линии
		for (let x = -width; x < width * 2; x += gridSize) {
			gridGroup
				.append('line')
				.attr('x1', x)
				.attr('y1', -height)
				.attr('x2', x)
				.attr('y2', height * 2)
				.attr('stroke', 'rgba(74, 144, 226, 0.1)')
				.attr('stroke-width', 1)
		}

		return () => {
			// Очищаем при размонтировании
			if (treeRef.current) {
				treeRef.current.cleanup()
			}
		}
	}, [data, width, height, searchQuery])

	return (
		<div ref={containerRef} className='visualization-container'>
			<svg
				ref={svgRef}
				width={width}
				height={height}
				style={{ overflow: 'visible' }}
			/>
			{currentPath && <MiniMap path={currentPath} width={width} height={100} />}
		</div>
	)
}
