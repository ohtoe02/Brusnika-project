import * as d3 from 'd3'
import { useEffect, useRef } from 'react'
import { VISUALIZATION_CONSTANTS } from '../utils/constants'
import { HierarchyUtils } from '../utils/hierarchyUtils'
import { NodeUtils } from '../utils/nodeUtils'

const RadialTree = ({ data, width, height, searchQuery }) => {
	const svgRef = useRef(null)
	const containerRef = useRef(null)

	useEffect(() => {
		if (!data || !svgRef.current) return

		const svg = d3.select(svgRef.current)
		svg.selectAll('*').remove()

		const radius =
			Math.min(width, height) / 2 -
			VISUALIZATION_CONSTANTS.RADIAL_RADIUS_PADDING

		const container = svg
			.append('g')
			.attr('class', 'zoom-container')
			.attr('transform', `translate(${width / 2},${height / 2})`)
			.attr('ref', containerRef)

		svg.call(
			d3.zoom().on('zoom', event => {
				container.attr('transform', event.transform)
			})
		)

		const treelayout = d3.tree().size([360, radius])
		let root = d3.hierarchy(data, d => d.children)

		// Инициализация сворачивания
		root.descendants().forEach(HierarchyUtils.collapseNode)
		root = treelayout(root)

		const project = (x, y) => {
			const angle = ((x - 90) / 180) * Math.PI
			return [y * Math.cos(angle), y * Math.sin(angle)]
		}

		const click = (event, d) => {
			if (d.children) {
				// При сворачивании удаляем все дочерние элементы
				HierarchyUtils.collapseNode(d)
				const descendants = HierarchyUtils.getDescendants(d)
				const descendantIds = descendants.map(node => {
					const id = NodeUtils.createNodeId(node)
					return id
				})

				// Удаляем узлы
				container
					.selectAll('g.node')
					.filter(node => {
						const id = NodeUtils.createNodeId(node)
						return descendantIds.includes(id)
					})
					.remove()

				// Удаляем связи
				container
					.selectAll('path.link')
					.filter(link => {
						const id = NodeUtils.createNodeId(link.target)
						return descendantIds.includes(id)
					})
					.remove()
			} else {
				HierarchyUtils.expandNode(d)
			}
			update(d)
		}

		const highlightAncestors = (d, highlight) => {
			let current = d
			while (current) {
				container
					.selectAll('g.node')
					.filter(n => n === current)
					.classed('highlight', highlight)
				current = current.parent
			}
		}

		const update = source => {
			const treeData = treelayout(root)
			const nodes = treeData.descendants()
			const links = treeData.links()

			// Обновляем позиции узлов
			container
				.selectAll('.node')
				.data(nodes, d => NodeUtils.createNodeId(d))
				.transition()
				.duration(VISUALIZATION_CONSTANTS.TRANSITION_DURATION)
				.attr('transform', d => 'translate(' + project(d.x, d.y) + ')')

			// Обновляем связи
			container
				.selectAll('.link')
				.data(links, d => NodeUtils.createNodeId(d.target))
				.transition()
				.duration(VISUALIZATION_CONSTANTS.TRANSITION_DURATION)
				.attr('d', d => {
					return (
						'M' +
						project(d.source.x, d.source.y) +
						'C' +
						project(d.source.x, (d.source.y + d.target.y) / 2) +
						' ' +
						project(d.target.x, (d.source.y + d.target.y) / 2) +
						' ' +
						project(d.target.x, d.target.y)
					)
				})

			// Обновляем узлы
			const node = container
				.selectAll('.node')
				.data(nodes, d => NodeUtils.createNodeId(d))

			// Удаляем старые узлы
			node.exit().remove()

			// Добавляем новые узлы
			const nodeEnter = node
				.enter()
				.append('g')
				.attr('class', d => `node ${d._children ? 'collapsed' : ''}`)
				.attr('transform', d => 'translate(' + project(d.x, d.y) + ')')
				.on('click', click)
				.on('mouseover', (event, d) => {
					d3.select(event.currentTarget).classed('highlight', true)
					highlightAncestors(d, true)
				})
				.on('mouseout', (event, d) => {
					d3.select(event.currentTarget).classed('highlight', false)
					highlightAncestors(d, false)
				})

			nodeEnter.append('circle').attr('r', 4).attr('class', 'nodeCircle')

			// Фильтруем текст: отображаем его только если узел находится достаточно далеко от центра
			nodeEnter
				.append('text')
				.attr('class', 'node-text')
				.attr('dy', '0.35em')
				.attr('text-anchor', 'middle')
				.text(d => d.data.name)
				.classed('search-highlight', d =>
					NodeUtils.matchesSearch(d, searchQuery)
				)
		}

		update(root)
	}, [data, width, height, searchQuery])

	return (
		<svg ref={svgRef} width={width} height={height} className='radial-tree' />
	)
}

export default RadialTree
