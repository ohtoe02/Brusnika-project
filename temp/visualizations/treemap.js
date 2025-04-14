import {
    DOMUtils,
    HierarchyUtils,
    NodeUtils,
    VISUALIZATION_CONSTANTS,
} from './utils.js'

// Треемп с зумированием и фильтрацией текста
function renderTreemap(rootData) {
    const svg = d3.select('#vizSVG'),
        width = +svg.attr('width'),
        height = +svg.attr('height')

    DOMUtils.clearSVG(svg)
    const container = DOMUtils.createContainer(svg, width, height)

    const treemap = d3
        .treemap()
        .size([width, height])
        .padding(VISUALIZATION_CONSTANTS.TREEMAP_PADDING)
        .round(true)

    const root = d3
        .hierarchy(rootData)
        .sum(d => d.value || 1)
        .sort((a, b) => b.value - a.value)

    // Инициализация сворачивания
    root.descendants().forEach(HierarchyUtils.collapseNode)
    treemap(root)

    // Обновляем ячейки
    const cell = container
        .selectAll('g')
        .data(root.descendants(), d => d.id || (d.id = NodeUtils.createNodeId()))

    // Удаляем старые ячейки
    cell.exit().remove()

    // Добавляем новые ячейки
    const cellEnter = DOMUtils.createBaseNode(
            cell.enter(),
            click,
            (event, d) => {
                d3.select(event.currentTarget).classed('highlight', true)
                highlightAncestorsTreemap(d, true)
            },
            (event, d) => {
                d3.select(event.currentTarget).classed('highlight', false)
                highlightAncestorsTreemap(d, false)
            }
        )
        .attr('class', 'treemap-cell')
        .attr('transform', d => `translate(${d.x0},${d.y0})`)

    cellEnter
        .append('rect')
        .attr('width', d => d.x1 - d.x0)
        .attr('height', d => d.y1 - d.y0)

    // Фильтруем текст: отображаем его только если прямоугольник достаточно большой
    cellEnter
        .append('text')
        .attr('class', 'cell-text')
        .attr('dy', '0.35em')
        .attr('text-anchor', 'middle')
        .attr('x', d => (d.x1 - d.x0) / 2)
        .attr('y', d => (d.y1 - d.y0) / 2)
        .text(d => d.data.name)
        .classed('search-highlight', d =>
            NodeUtils.matchesSearch(d, window.searchQuery)
        )

    function click(event, d) {
        if (d.children) {
            // При сворачивании удаляем все дочерние элементы
            HierarchyUtils.collapseNode(d)
            const descendants = HierarchyUtils.getDescendants(d)
            container
                .selectAll('g.treemap-cell')
                .filter(cell => descendants.includes(cell))
                .remove()
        } else {
            HierarchyUtils.expandNode(d)
        }
        update(d)
    }

    function update(source) {
        const treemapData = treemap(root)
        const cells = treemapData.descendants()

        // Обновляем ячейки
        container
            .selectAll('g.treemap-cell')
            .data(cells, d => d.id)
            .transition()
            .duration(VISUALIZATION_CONSTANTS.TRANSITION_DURATION)
            .attr('transform', d => `translate(${d.x0},${d.y0})`)

        // Обновляем размеры прямоугольников
        container
            .selectAll('g.treemap-cell rect')
            .data(cells, d => d.id)
            .transition()
            .duration(VISUALIZATION_CONSTANTS.TRANSITION_DURATION)
            .attr('width', d => d.x1 - d.x0)
            .attr('height', d => d.y1 - d.y0)

        // Обновляем позиции текста
        container
            .selectAll('g.treemap-cell text')
            .data(cells, d => d.id)
            .transition()
            .duration(VISUALIZATION_CONSTANTS.TRANSITION_DURATION)
            .attr('x', d => (d.x1 - d.x0) / 2)
            .attr('y', d => (d.y1 - d.y0) / 2)
    }

    function highlightAncestorsTreemap(d, highlight) {
        let current = d
        while (current) {
            container
                .selectAll('g.treemap-cell')
                .filter(n => n === current)
                .classed('highlight', highlight)
            current = current.parent
        }
    }
}