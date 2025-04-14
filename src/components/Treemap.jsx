import * as d3 from 'd3'
import { useEffect, useRef } from 'react'
import { renderTreemap } from '../visualizations/treemap'

function Treemap({ data, width, height, searchQuery }) {
	const svgRef = useRef(null)

	useEffect(() => {
		if (!data || !svgRef.current) return

		const svg = d3.select(svgRef.current)
		renderTreemap(svg, data, width, height, searchQuery)

		return () => {
			svg.selectAll('*').remove()
		}
	}, [data, width, height, searchQuery])

	return (
		<svg
			ref={svgRef}
			width={width}
			height={height}
			style={{ maxWidth: '100%', height: 'auto' }}
		/>
	)
}

export default Treemap
