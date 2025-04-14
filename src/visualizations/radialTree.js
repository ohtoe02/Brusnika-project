import * as d3 from 'd3'
import { HierarchyUtils } from '../utils/hierarchyUtils'
import { NodeUtils } from '../utils/nodeUtils'

export const renderRadialTree = (svg, data, width, height, searchQuery) => {
    // Очищаем SVG
    svg.selectAll('*').remove()

    // Создаем контейнер
    const container = svg
        .append('g')
        .attr('transform', `translate(${width / 2},${height / 2})`)

    // Создаем радиальную иерархию
    const root = d3.hierarchy(data)
    const tree = d3
        .tree()
        .size([2 * Math.PI, Math.min(width, height) / 2 - 100])
        .separation((a, b) => (a.parent === b.parent ? 1 : 2) / a.depth)

    // Инициализируем сворачивание узлов
    root.descendants().forEach(d => {
        if (d.children) {
            HierarchyUtils.collapseNode(d)
        }
    })

    // Обновляем дерево
    const update = () => {
        const nodes = tree(root).descendants()
        const links = tree(root).links()

        // Отрисовка связей
        container
            .selectAll('.link')
            .data(links)
            .join('path')
            .attr('class', 'link')
            .attr(
                'd',
                d3
                .linkRadial()
                .angle(d => d.x)
                .radius(d => d.y)
            )

        // Отрисовка узлов
        const node = container
            .selectAll('.node')
            .data(nodes)
            .join('g')
            .attr(
                'class',
                d => `node ${d.children ? 'node--internal' : 'node--leaf'}`
            )
            .attr(
                'transform',
                d => `
                translate(${d.y * Math.cos(d.x - Math.PI / 2)},
                ${d.y * Math.sin(d.x - Math.PI / 2)})
            `
            )

        // Добавляем круги для узлов
        node
            .append('circle')
            .attr('r', 4.5)
            .attr('class', d => {
                let classes = 'node-circle'
                if (NodeUtils.matchesSearch(d, searchQuery)) {
                    classes += ' search-highlight'
                }
                return classes
            })

        // Добавляем текст
        node
            .append('text')
            .attr('dy', '0.31em')
            .attr('x', d => (d.x < Math.PI ? 6 : -6))
            .attr('text-anchor', d => (d.x < Math.PI ? 'start' : 'end'))
            .attr('transform', d => (d.x >= Math.PI ? 'rotate(180)' : null))
            .text(d => d.data.name)
            .attr('class', d => {
                let classes = 'node-text'
                if (NodeUtils.matchesSearch(d, searchQuery)) {
                    classes += ' search-highlight'
                }
                return classes
            })

        // Обработчики событий
        node.on('click', (event, d) => {
            if (d.children) {
                HierarchyUtils.collapseNode(d)
            } else if (d._children) {
                HierarchyUtils.expandNode(d)
            }
            update()
        })

        // Подсветка при наведении
        node.on('mouseover', (event, d) => {
            highlightAncestors(d)
        })

        node.on('mouseout', () => {
            container.selectAll('.node').classed('highlight', false)
        })
    }

    // Функция подсветки предков
    const highlightAncestors = d => {
        container.selectAll('.node').classed('highlight', false)

        let current = d
        while (current) {
            container
                .selectAll(`.node[data-id="${NodeUtils.createNodeId(current)}"]`)
                .classed('highlight', true)
            current = current.parent
        }
    }

    // Первоначальный рендеринг
    update()
}