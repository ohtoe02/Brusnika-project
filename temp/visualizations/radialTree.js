import {
    DOMUtils,
    HierarchyUtils,
    NodeUtils,
    VISUALIZATION_CONSTANTS,
} from './utils.js'

// Радиальное дерево с зумированием и фильтрацией текста
function renderRadialTree(rootData) {
    const svg = d3.select('#vizSVG'),
        width = +svg.attr('width'),
        height = +svg.attr('height'),
        radius =
        Math.min(width, height) / 2 -
        VISUALIZATION_CONSTANTS.RADIAL_RADIUS_PADDING

    DOMUtils.clearSVG(svg)
    const container = DOMUtils.createContainer(svg, width, height).attr(
        'transform',
        `translate(${width / 2},${height / 2})`
    )

    const treelayout = d3.tree().size([360, radius])
    let root = d3.hierarchy(rootData, d => d.children)

    // Инициализация сворачивания
    root.descendants().forEach(HierarchyUtils.collapseNode)
    root = treelayout(root)

    const links = root.links()
    const nodes = root.descendants()

    // Обновляем связи
    const link = container
        .selectAll('.link')
        .data(links, d => NodeUtils.createNodeId(d.target))

    // Удаляем старые связи
    link.exit().remove()

    // Добавляем новые связи
    link
        .enter()
        .append('path')
        .attr('class', 'link')
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
    const nodeEnter = DOMUtils.createBaseNode(
        node.enter(),
        click,
        (event, d) => {
            d3.select(event.currentTarget).classed('highlight', true)
            highlightAncestorsRadial(d, true)
        },
        (event, d) => {
            d3.select(event.currentTarget).classed('highlight', false)
            highlightAncestorsRadial(d, false)
        }
    ).attr('transform', d => 'translate(' + project(d.x, d.y) + ')')

    nodeEnter.append('circle').attr('r', 4).attr('class', 'nodeCircle')

    // Фильтруем текст: отображаем его только если узел находится достаточно далеко от центра
    nodeEnter
        .append('text')
        .attr('class', 'node-text')
        .attr('dy', '0.35em')
        .attr('text-anchor', 'middle')
        .text(d => d.data.name)
        .classed('search-highlight', d =>
            NodeUtils.matchesSearch(d, window.searchQuery)
        )

    function project(x, y) {
        const angle = ((x - 90) / 180) * Math.PI
        return [y * Math.cos(angle), y * Math.sin(angle)]
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

    function update(source) {
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
    }

    function highlightAncestorsRadial(d, highlight) {
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