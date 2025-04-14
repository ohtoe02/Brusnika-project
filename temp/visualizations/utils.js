// Константы для визуализаций
export const VISUALIZATION_CONSTANTS = {
    NODE_HEIGHT: 30,
    NODE_PADDING: 20,
    MIN_NODE_WIDTH: 50,
    TRANSITION_DURATION: 200,
    TREE_LEVEL_SPACING: 220,
    RADIAL_RADIUS_PADDING: 50,
    TREEMAP_PADDING: 1,
}

// Общие функции для работы с узлами
export const NodeUtils = {
    // Создание уникального ID для узла
    createNodeId: (() => {
        let counter = 0
        const idMap = new Map()
        return node => {
            if (!node.id) {
                const key = node.data.name + (node.parent ? node.parent.id : '')
                if (idMap.has(key)) {
                    node.id = idMap.get(key)
                } else {
                    node.id = ++counter
                    idMap.set(key, node.id)
                }
            }
            return node.id
        }
    })(),

    // Проверка на соответствие поисковому запросу
    matchesSearch: (node, searchQuery) =>
        searchQuery &&
        node.data.name.toLowerCase().includes(searchQuery.toLowerCase()),

    // Расчет ширины узла на основе текста
    calculateNodeWidth: text => {
        const textWidth = text.length * 8 + VISUALIZATION_CONSTANTS.NODE_PADDING
        return Math.max(textWidth, VISUALIZATION_CONSTANTS.MIN_NODE_WIDTH)
    },
}

// Общие функции для работы с DOM
export const DOMUtils = {
    // Создание контейнера для визуализации
    createContainer: (svg, width, height) => {
        const container = svg.append('g').attr('class', 'zoom-container')

        svg.call(
            d3.zoom().on('zoom', event => {
                container.attr('transform', event.transform)
            })
        )

        return container
    },

    // Очистка SVG
    clearSVG: svg => svg.selectAll('*').remove(),

    // Создание базового узла
    createBaseNode: (enter, onClick, onMouseOver, onMouseOut) => {
        return enter
            .append('g')
            .attr('class', d => `node ${d._children ? 'collapsed' : ''}`)
            .on('click', onClick)
            .on('mouseover', onMouseOver)
            .on('mouseout', onMouseOut)
    },
}

// Функции для работы с иерархией
export const HierarchyUtils = {
    // Сворачивание узла
    collapseNode: d => {
        if (d.children) {
            d._children = d.children
            d.children = null
        }
    },

    // Разворачивание узла
    expandNode: d => {
        if (d._children) {
            d.children = d._children
            d._children = null
        }
    },

    // Получение всех потомков узла
    getDescendants: d => {
        const descendants = []
        const traverse = node => {
            descendants.push(node)
            if (node.children) {
                node.children.forEach(traverse)
            }
        }
        traverse(d)
        return descendants
    },
}