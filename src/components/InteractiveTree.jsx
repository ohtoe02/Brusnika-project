import * as d3 from 'd3'
import { useEffect, useMemo, useRef, useState } from 'react'
import { TREE_CONFIG } from '../constants/treeConfig'
import '../styles/foundHighlight.css'
import { InteractiveTree } from '../visualizations/interactiveTree'
import { MiniMap } from './MiniMap'

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

export const InteractiveTreeComponent = ({
	data,
	width,
	height,
	searchQuery = '',
	settings = {},
}) => {
	const svgRef = useRef(null)
	const treeRef = useRef(null)
	const [currentPath, setCurrentPath] = useState(null)
	const containerRef = useRef(null)

	// Глубокое объединение дефолтных параметров и пользовательских
	const mergedSettings = useMemo(
		() => deepMerge(TREE_CONFIG, settings),
		[settings]
	)

	useEffect(() => {
		if (!svgRef.current || !data) return

		const margin = { top: 20, right: 20, bottom: 20, left: 20 }
		const svg = d3.select(svgRef.current)

		// Создаем новый экземпляр InteractiveTree только при изменении данных или размеров
		treeRef.current = new InteractiveTree(
			svg,
			data,
			width - margin.left - margin.right,
			height - margin.top - margin.bottom,
			'',
			margin,
			mergedSettings
		)

		// Сохраняем ссылку глобально для поиска
		window.interactiveTreeInstance = treeRef.current

		treeRef.current.setOnPathChange(setCurrentPath)

		const zoomContainer = svg.select('.zoom-container')
		const gridSize = 50
		const gridGroup = zoomContainer.append('g').attr('class', 'grid').lower()

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
			if (treeRef.current) {
				treeRef.current.cleanup()
			}
			window.interactiveTreeInstance = null
		}
	}, [data, width, height, mergedSettings])

	// Добавить useEffect для обновления настроек без ререндера
	useEffect(() => {
		if (
			treeRef.current &&
			typeof treeRef.current.updateSettings === 'function'
		) {
			treeRef.current.updateSettings(deepMerge(TREE_CONFIG, settings))
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [settings])

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
