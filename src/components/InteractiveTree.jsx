import * as d3 from 'd3'
import { useEffect, useRef } from 'react'
import { VISUALIZATION_CONSTANTS } from '../utils/constants'
import { HierarchyUtils } from '../utils/hierarchyUtils'
import { NodeUtils } from '../utils/nodeUtils'

const InteractiveTree = ({ data, width, height, searchQuery }) => {
	const svgRef = useRef(null)
	const containerRef = useRef(null)

	useEffect(() => {
		if (!data || !svgRef.current) return

		const svg = d3.select(svgRef.current)
		svg.selectAll('*').remove()

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

		const treelayout = d3
			.tree()
			.size([
				height - VISUALIZATION_CONSTANTS.NODE_HEIGHT * 2,
				width - VISUALIZATION_CONSTANTS.NODE_PADDING * 2,
			])

		let root = d3.hierarchy(data, d => d.children)
		root.x0 = height / 2
		root.y0 = 0

		// Инициализация сворачивания
		root.descendants().forEach(HierarchyUtils.collapseNode)

		const diagonal = (s, d) => {
			return `M ${s.y} ${s.x}
                    C ${(s.y + d.y) / 2} ${s.x},
                      ${(s.y + d.y) / 2} ${d.x},
                      ${d.y} ${d.x}`
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
			const links = treeData.descendants().slice(1)

			// Увеличиваем горизонтальное расстояние между уровнями
			nodes.forEach(d => {
				d.y = d.depth * VISUALIZATION_CONSTANTS.TREE_LEVEL_SPACING
			})

			// Обновление узлов
			const node = container
				.selectAll('g.node')
				.data(nodes, d => NodeUtils.createNodeId(d))

			// Удаляем узлы, которые больше не должны отображаться
			node
				.exit()
				.transition()
				.duration(VISUALIZATION_CONSTANTS.TRANSITION_DURATION)
				.attr('transform', d => `translate(${source.y},${source.x})`)
				.remove()

			// Добавляем новые узлы
			const nodeEnter = node
				.enter()
				.append('g')
				.attr('class', d => `node ${d._children ? 'collapsed' : ''}`)
				.attr('transform', d => `translate(${source.y0},${source.x0})`)
				.on('click', click)
				.on('mouseover', (event, d) => {
					d3.select(event.currentTarget).classed('highlight', true)
					highlightAncestors(d, true)
				})
				.on('mouseout', (event, d) => {
					d3.select(event.currentTarget).classed('highlight', false)
					highlightAncestors(d, false)
				})

			// Добавляем прямоугольник для фона
			nodeEnter
				.append('rect')
				.attr('width', d => NodeUtils.calculateNodeWidth(d.data.name))
				.attr('height', VISUALIZATION_CONSTANTS.NODE_HEIGHT)
				.attr('x', d => -NodeUtils.calculateNodeWidth(d.data.name) / 2)
				.attr('y', -VISUALIZATION_CONSTANTS.NODE_HEIGHT / 2)
				.attr('rx', 10)
				.attr('ry', 10)

			// Добавляем текст
			nodeEnter
				.append('text')
				.attr('dy', '.35em')
				.attr('text-anchor', 'middle')
				.text(d => d.data.name)
				.classed('search-highlight', d =>
					NodeUtils.matchesSearch(d, searchQuery)
				)

			const nodeUpdate = nodeEnter.merge(node)
			nodeUpdate
				.transition()
				.duration(VISUALIZATION_CONSTANTS.TRANSITION_DURATION)
				.attr('transform', d => `translate(${d.y},${d.x})`)

			// Обновляем классы для отображения состояния свернутости
			nodeUpdate.attr('class', d => `node ${d._children ? 'collapsed' : ''}`)

			// Обновляем связи
			const link = container
				.selectAll('path.link')
				.data(links, d => NodeUtils.createNodeId(d))

			// Удаляем связи, которые больше не должны отображаться
			link
				.exit()
				.transition()
				.duration(VISUALIZATION_CONSTANTS.TRANSITION_DURATION)
				.attr('d', d => {
					const o = { x: source.x, y: source.y }
					return diagonal(o, o)
				})
				.remove()

			const linkEnter = link
				.enter()
				.insert('path', 'g')
				.attr('class', 'link')
				.attr('d', d => {
					const o = { x: source.x0, y: source.y0 }
					return diagonal(o, o)
				})

			const linkUpdate = linkEnter.merge(link)
			linkUpdate
				.transition()
				.duration(VISUALIZATION_CONSTANTS.TRANSITION_DURATION)
				.attr('d', d => diagonal(d, d.parent))

			// Сохраняем старые позиции для перехода
			nodes.forEach(d => {
				d.x0 = d.x
				d.y0 = d.y
			})
		}

		update(root)
	}, [data, width, height, searchQuery])

	return (
		<svg
			ref={svgRef}
			width={width}
			height={height}
			className='interactive-tree'
		/>
	)
}

export default InteractiveTree
