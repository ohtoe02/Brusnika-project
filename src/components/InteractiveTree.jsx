import * as d3 from 'd3'
import { useEffect, useRef } from 'react'
import { InteractiveTree } from '../visualizations/interactiveTree'

export const InteractiveTreeComponent = ({
	data,
	width,
	height,
	searchQuery = '',
}) => {
	const svgRef = useRef(null)
	const treeRef = useRef(null)

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

		return () => {
			// Очищаем при размонтировании
			if (treeRef.current) {
				treeRef.current.cleanup()
			}
		}
	}, [data, width, height, searchQuery])

	return (
		<svg
			ref={svgRef}
			width={width}
			height={height}
			style={{ overflow: 'visible' }}
		/>
	)
}
