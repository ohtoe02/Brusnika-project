import * as d3 from 'd3'
import { useEffect, useRef } from 'react'

function Treemap({ data, width, height }) {
	const svgRef = useRef(null)

	useEffect(() => {
		if (!data || !svgRef.current) return

		const svg = d3.select(svgRef.current)
		svg.selectAll('*').remove()

		// Базовая реализация treemap
		const root = d3
			.hierarchy(data)
			.sum(d => (d.children ? 0 : 1))
			.sort((a, b) => b.value - a.value)

		const treemap = d3.treemap().size([width, height]).padding(1)

		treemap(root)

		const leaf = svg
			.selectAll('g')
			.data(root.leaves())
			.join('g')
			.attr('transform', d => `translate(${d.x0},${d.y0})`)

		leaf
			.append('rect')
			.attr('fill', '#3498db')
			.attr('fill-opacity', 0.6)
			.attr('width', d => d.x1 - d.x0)
			.attr('height', d => d.y1 - d.y0)

		leaf
			.append('text')
			.attr('x', 4)
			.attr('y', 14)
			.text(d => d.data.name)
			.attr('font-size', '12px')
			.attr('fill', 'white')
	}, [data, width, height])

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
