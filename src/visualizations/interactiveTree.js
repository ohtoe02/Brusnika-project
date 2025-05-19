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
        this.settings = {...TREE_CONFIG, ...settings }
        this.currentPath = null
        this.onPathChange = null

        this.init()
    }

    setOnPathChange(callback) {
        this.onPathChange = callback
    }

    getPathToNode(node) {
        const path = []
        let current = node
        while (current) {
            path.unshift(current)
            current = current.parent
        }
        return path
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
        console.log('[InteractiveTree] update вызван')
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

        nodes.each(function(d) {
            DOMUtils.createNodeRect(
                d3.select(this),
                d,
                this.searchQuery,
                this.settings
            )
        })

        nodes.each(function(d) {
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
        this.highlightPath(d)
        this.highlightParents(d)

        // Обновляем путь и вызываем callback
        this.currentPath = this.getPathToNode(d)
        if (this.onPathChange) {
            this.onPathChange(this.currentPath)
        }
    }

    handleNodeMouseOut(event, d) {
        d3.select(event.currentTarget).classed('highlight', false)
        this.unhighlightPath(d)
        this.unhighlightParents(d)

        // Очищаем путь
        this.currentPath = null
        if (this.onPathChange) {
            this.onPathChange(null)
        }
    }

    highlightPath(d) {
        const path = this.getPathToNode(d)
        path.forEach(node => {
            this.nodeGroup
                .selectAll('g')
                .filter(n => n === node)
                .classed('path-highlight', true)
        })
    }

    unhighlightPath(d) {
        const path = this.getPathToNode(d)
        path.forEach(node => {
            this.nodeGroup
                .selectAll('g')
                .filter(n => n === node)
                .classed('path-highlight', false)
        })
    }

    highlightParents(d) {
        let current = d.parent
        while (current) {
            this.nodeGroup
                .selectAll('g')
                .filter(n => n === current)
                .classed('parent-highlight', true)
            current = current.parent
        }
    }

    unhighlightParents(d) {
        let current = d.parent
        while (current) {
            this.nodeGroup
                .selectAll('g')
                .filter(n => n === current)
                .classed('parent-highlight', false)
            current = current.parent
        }
    }

    render() {
        this.update()
    }

    updateSettings(newSettings) {
        this.settings = {...this.settings, ...newSettings }
        this.update()
    }

    // Вспомогательная функция: ищет путь до узла по имени в исходных данных
    findPathInData(data, nodeName, path = []) {
        if (!data) return null
        path.push(data)
        if (data.name && data.name.toLowerCase().includes(nodeName.toLowerCase())) {
            return [...path]
        }
        if (data.children) {
            for (const child of data.children) {
                const result = this.findPathInData(child, nodeName, path)
                if (result) return result
            }
        }
        path.pop()
        return null
    }

    revealPathToNode(nodeName) {
        if (!this.root) return
            // 1. Найти путь до узла в исходных данных
        const path = this.findPathInData(this.data, nodeName, [])
        console.log('[InteractiveTree] revealPathToNode: path:', path)
        if (!path || path.length === 0) return
            // 2. Раскрыть все узлы на этом пути в d3.hierarchy
        let d3Node = this.root
        for (let i = 1; i < path.length; i++) {
            const name = path[i].name
                // Найти d3-узел среди _children или children
            let next = null
            if (d3Node._children) {
                next = d3Node._children.find(child => child.data.name === name)
                if (next) {
                    d3Node.children = d3Node._children
                    d3Node._children = null
                }
            }
            if (!next && d3Node.children) {
                next = d3Node.children.find(child => child.data.name === name)
            }
            if (!next) break
            d3Node = next
        }
        // 3. Обновить дерево и подсветить найденный узел
        this.update()
        setTimeout(() => {
            this.nodeGroup.selectAll('g').classed('found', false)
            this.nodeGroup
                .selectAll('g')
                .filter(n => n.data.name.toLowerCase().includes(nodeName.toLowerCase()))
                .classed('found', true)
            setTimeout(() => {
                this.nodeGroup.selectAll('g').classed('found', false)
            }, 2000)
        }, 100)
    }
}