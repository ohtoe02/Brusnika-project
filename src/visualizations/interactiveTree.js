import * as d3 from 'd3'
import { TREE_CONFIG } from '../constants/treeConfig'
import { DOMUtils } from '../utils/domUtils'
import { TreeUtils } from '../utils/treeUtils'

export class InteractiveTree {
	constructor(
		svg,
		data,
		width,
		height,
		searchQuery = '',
		margin,
		settings = {}
	) {
		this.svg = svg
		this.data = data
		this.width = width
		this.height = height
		this.searchQuery = searchQuery
		this.margin = margin
		this.settings = { ...TREE_CONFIG, ...settings }

		this.init()
	}

	init() {
		this.cleanup()
		this.createContainer()
		this.setupZoom()
		this.createHierarchy()
		this.render()
	}

	cleanup() {
		DOMUtils.clearSVG(this.svg)
	}

	createContainer() {
		this.container = DOMUtils.createZoomContainer(
			this.svg,
			this.width,
			this.height,
			this.margin
		)
		this.linkGroup = this.container.append('g').attr('class', 'links')
		this.nodeGroup = this.container.append('g').attr('class', 'nodes')
	}

	setupZoom() {
		this.zoom = d3
			.zoom()
			.scaleExtent(this.settings.zoom.extent)
			.on('zoom', event => {
				if (this.container) {
					this.container.attr('transform', event.transform)
				}
			})

		this.svg
			.call(this.zoom)
			.call(
				this.zoom.transform,
				d3.zoomIdentity
					.translate(this.margin.left + 50, this.margin.top + this.height * 0.5)
					.scale(this.settings.zoom.initialScale)
			)
	}

	createHierarchy() {
		this.root = d3.hierarchy(this.data, d => d.children)
		this.root.descendants().forEach(d => {
			if (d.children) {
				d._children = d.children
				d.children = null
			}
		})
	}

	createTreeLayout() {
		return d3
			.tree()
			.nodeSize([this.settings.nodeSize.height, this.settings.nodeSize.width])
			.separation((a, b) => {
				if (a.parent === b.parent) {
					return 1.5
				}
				return 2
			})
	}

	update() {
		const treeLayout = this.createTreeLayout()
		const treeData = treeLayout(this.root)

		const totalNodes = Math.max(1, this.root.descendants().length)
		const newScale = TreeUtils.calculateOptimalScale(totalNodes)

		const bounds = TreeUtils.calculateTreeBounds(this.root.descendants())
		const centerX = (bounds.minX + bounds.maxX) / 2
		const centerY = (bounds.minY + bounds.maxY) / 2

		this.updateZoom(newScale)
		this.updateLinks(treeData)
		this.updateNodes(treeData)
	}

	updateZoom(newScale) {
		if (this.svg && this.container) {
			const translateX = this.margin.left + 50
			const translateY = this.margin.top + this.height * 0.5

			this.svg
				.transition()
				.duration(this.settings.zoom.animationDuration)
				.call(
					this.zoom.transform,
					d3.zoomIdentity.translate(translateX, translateY).scale(newScale)
				)
		}
	}

	updateLinks(treeData) {
		this.linkGroup.selectAll('*').remove()

		this.linkGroup
			.selectAll('path')
			.data(treeData.links())
			.join('path')
			.attr('class', 'link')
			.attr('d', d => this.createLinkPath(d))
			.attr('fill', 'none')
			.attr('stroke', this.settings.colors.link)
			.attr('stroke-width', '2px')
	}

	createLinkPath(d) {
		const source = d.source
		const target = d.target

		if (!this.isValidLink(source, target)) {
			console.error('Некорректные координаты для связи:', { source, target })
			return ''
		}

		const sourceWidth =
			source.nodeWidth ||
			DOMUtils.calculateNodeWidth(source.data.name, this.settings)

		const sourceX =
			source.depth * this.settings.spacing.horizontal.base + sourceWidth
		const sourceY = source.x + this.settings.nodeSize.height / 2
		const targetX = target.depth * this.settings.spacing.horizontal.base
		const targetY = target.x + this.settings.nodeSize.height / 2

		const midX = sourceX + (targetX - sourceX) * 0.5
		const curveOffset = (targetX - sourceX) * this.settings.styles.curveStrength
		const controlPoint1X = midX - curveOffset
		const controlPoint1Y = sourceY
		const controlPoint2X = midX + curveOffset
		const controlPoint2Y = targetY

		return `M${sourceX},${sourceY} C${controlPoint1X},${controlPoint1Y} ${controlPoint2X},${controlPoint2Y} ${targetX},${targetY}`
	}

	isValidLink(source, target) {
		return (
			source &&
			target &&
			typeof source.x === 'number' &&
			typeof source.y === 'number' &&
			typeof target.x === 'number' &&
			typeof target.y === 'number'
		)
	}

	updateNodes(treeData) {
		this.nodeGroup.selectAll('*').remove()

		const nodes = this.nodeGroup
			.selectAll('g')
			.data(treeData.descendants())
			.join('g')
			.attr('class', d => this.getNodeClass(d))
			.attr('transform', d => this.getNodeTransform(d))
			.attr('data-id', d => d.data.id)

		nodes.each(function (d) {
			DOMUtils.createNodeRect(
				d3.select(this),
				d,
				this.searchQuery,
				this.settings
			)
		})

		nodes.each(function (d) {
			DOMUtils.createNodeText(
				d3.select(this),
				d,
				this.searchQuery,
				this.settings
			)
		})

		this.setupNodeEventHandlers(nodes)
	}

	getNodeClass(d) {
		let classes = 'node'
		if (d._children) classes += ' collapsed'
		if (d.children) classes += ' node--internal'
		else classes += ' node--leaf'
		return classes
	}

	getNodeTransform(d) {
		if (typeof d.x !== 'number' || typeof d.y !== 'number') {
			console.error('Некорректные координаты узла:', d)
			return 'translate(0,0)'
		}
		const levelOffset = d.depth * this.settings.spacing.horizontal.base
		return `translate(${levelOffset},${d.x})`
	}

	setupNodeEventHandlers(nodes) {
		nodes.on('click', (event, d) => this.handleNodeClick(event, d))
		nodes.on('mouseover', (event, d) => this.handleNodeMouseOver(event, d))
		nodes.on('mouseout', (event, d) => this.handleNodeMouseOut(event, d))
	}

	handleNodeClick(event, d) {
		event.stopPropagation()
		if (d._children) {
			d.children = d._children
			d._children = null
		} else if (d.children) {
			d._children = d.children
			d.children = null
		}
		this.update()
	}

	handleNodeMouseOver(event, d) {
		d3.select(event.currentTarget).classed('highlight', true)
		this.highlightParents(d)
		this.highlightLink(d)
	}

	handleNodeMouseOut(event, d) {
		d3.select(event.currentTarget).classed('highlight', false)
		this.unhighlightParents(d)
		this.unhighlightLink(d)
	}

	highlightParents(d) {
		let parent = d.parent
		while (parent) {
			d3.select(`[data-id="${parent.data.id}"]`).classed('highlight', true)
			parent = parent.parent
		}
	}

	unhighlightParents(d) {
		let parent = d.parent
		while (parent) {
			d3.select(`[data-id="${parent.data.id}"]`).classed('highlight', false)
			parent = parent.parent
		}
	}

	highlightLink(d) {
		if (d.parent) {
			this.linkGroup
				.selectAll('path')
				.filter(link => link.source === d.parent && link.target === d)
				.attr('stroke', this.settings.colors.linkHighlight)
				.attr('stroke-width', '3px')
		}
	}

	unhighlightLink(d) {
		if (d.parent) {
			this.linkGroup
				.selectAll('path')
				.filter(link => link.source === d.parent && link.target === d)
				.attr('stroke', this.settings.colors.link)
				.attr('stroke-width', '2px')
		}
	}

	render() {
		this.update()
	}
}
