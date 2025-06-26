import * as d3 from 'd3'
import { useEffect, useRef } from 'react'
import { renderRadialTree } from '../visualizations/radialTree'
import { useTheme } from '../contexts/ThemeContext'

function RadialTree({ data, width, height, searchQuery, settings }) {
	const svgRef = useRef(null)
	const { theme } = useTheme()

	useEffect(() => {
		if (!data || !svgRef.current) return

		const svg = d3.select(svgRef.current)
		renderRadialTree(svg, data, width, height, searchQuery, settings)

		return () => {
			svg.selectAll('*').remove()
		}
	}, [data, width, height, searchQuery, settings])

	return (
		<svg
			ref={svgRef}
			width={width}
			height={height}
			style={{ 
				maxWidth: '100%', 
				height: 'auto',
				background: theme === 'dark' ? '#1a1a1a' : '#ffffff',
				transition: 'background 0.3s ease'
			}}
		/>
	)
}

export default RadialTree
