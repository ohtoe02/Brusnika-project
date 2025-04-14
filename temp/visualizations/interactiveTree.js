import {
	DOMUtils,
	HierarchyUtils,
	NodeUtils,
	VISUALIZATION_CONSTANTS,
} from './utils.js'

// Интерактивное дерево с зумированием и увеличенной дистанцией между уровнями
function renderInteractiveTree(rootData) {
	const svg = d3.select('#vizSVG'),
		width = +svg.attr('width'),
		height = +svg.attr('height')

	DOMUtils.clearSVG(svg)
	const container = DOMUtils.createContainer(svg, width, height).attr(
		'transform',
		`translate(${width / 2},${height / 2})`
	)

	const treelayout = d3
		.tree()
		.size([
			height - VISUALIZATION_CONSTANTS.NODE_HEIGHT * 2,
			width - VISUALIZATION_CONSTANTS.NODE_PADDING * 2,
		])

	let root = d3.hierarchy(rootData, d => d.children)
	root.x0 = height / 2
	root.y0 = 0

	// Инициализация сворачивания
	root.descendants().forEach(HierarchyUtils.collapseNode)
	update(root)

	function update(source) {
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
			.data(nodes, d => d.id || (d.id = NodeUtils.createNodeId()))

		// Удаляем узлы, которые больше не должны отображаться
		node
			.exit()
			.transition()
			.duration(VISUALIZATION_CONSTANTS.TRANSITION_DURATION)
			.attr('transform', d => `translate(${source.y},${source.x})`)
			.remove()

		const nodeEnter = DOMUtils.createBaseNode(
			node.enter(),
			click,
			(event, d) => {
				d3.select(event.currentTarget).classed('highlight', true)
				highlightAncestors(d, true)
			},
			(event, d) => {
				d3.select(event.currentTarget).classed('highlight', false)
				highlightAncestors(d, false)
			}
		).attr('transform', d => `translate(${source.y0},${source.x0})`)

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
				NodeUtils.matchesSearch(d, window.searchQuery)
			)

		const nodeUpdate = nodeEnter.merge(node)
		nodeUpdate
			.transition()
			.duration(VISUALIZATION_CONSTANTS.TRANSITION_DURATION)
			.attr('transform', d => `translate(${d.y},${d.x})`)

		// Обновляем классы для отображения состояния свернутости
		nodeUpdate.attr('class', d => `node ${d._children ? 'collapsed' : ''}`)

		// Обновляем связи
		const link = container.selectAll('path.link').data(links, d => d.id)

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

	function diagonal(s, d) {
		return `M ${s.y} ${s.x}
                C ${(s.y + d.y) / 2} ${s.x},
                  ${(s.y + d.y) / 2} ${d.x},
                  ${d.y} ${d.x}`
	}

	function click(event, d) {
		console.log('Click on node:', d.data.name, 'ID:', NodeUtils.createNodeId(d))

		if (d.children) {
			// При сворачивании удаляем все дочерние элементы
			HierarchyUtils.collapseNode(d)
			const descendants = HierarchyUtils.getDescendants(d)
			const descendantIds = descendants.map(node => {
				const id = NodeUtils.createNodeId(node)
				console.log('Descendant:', node.data.name, 'ID:', id)
				return id
			})

			console.log('All descendant IDs:', descendantIds)

			// Проверяем существующие узлы
			const existingNodes = container.selectAll('g.node').nodes()
			console.log(
				'Existing nodes:',
				existingNodes.map(n => ({
					name: n.__data__.data.name,
					id: NodeUtils.createNodeId(n.__data__),
				}))
			)

			// Удаляем узлы
			const removedNodes = container
				.selectAll('g.node')
				.filter(node => {
					const id = NodeUtils.createNodeId(node)
					const matches = descendantIds.includes(id)
					console.log('Node:', node.data.name, 'ID:', id, 'Matches:', matches)
					return matches
				})
				.remove()

			console.log('Removed nodes count:', removedNodes.size())

			// Проверяем существующие связи
			const existingLinks = container.selectAll('path.link').nodes()
			console.log(
				'Existing links:',
				existingLinks.map(l => ({
					source: l.__data__.source.data.name,
					target: l.__data__.target.data.name,
					targetId: NodeUtils.createNodeId(l.__data__.target),
				}))
			)

			// Удаляем связи
			const removedLinks = container
				.selectAll('path.link')
				.filter(link => {
					const id = NodeUtils.createNodeId(link.target)
					const matches = descendantIds.includes(id)
					console.log(
						'Link target:',
						link.target.data.name,
						'ID:',
						id,
						'Matches:',
						matches
					)
					return matches
				})
				.remove()

			console.log('Removed links count:', removedLinks.size())
		} else {
			HierarchyUtils.expandNode(d)
		}
		update(d)
	}

	function highlightAncestors(d, highlight) {
		let current = d
		while (current) {
			container
				.selectAll('g.node')
				.filter(n => n === current)
				.classed('highlight', highlight)
			current = current.parent
		}
	}
}
