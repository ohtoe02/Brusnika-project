import { VISUALIZATION_CONSTANTS } from './constants'

// Создание уникального ID для узла
const createNodeId = (() => {
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
})()

// Проверка на соответствие поисковому запросу
const matchesSearch = (node, searchQuery) =>
    searchQuery &&
    node.data.name.toLowerCase().includes(searchQuery.toLowerCase())

// Расчет ширины узла на основе текста
const calculateNodeWidth = text => {
    const textWidth = text.length * 8 + VISUALIZATION_CONSTANTS.NODE_PADDING
    return Math.max(textWidth, VISUALIZATION_CONSTANTS.NODE_WIDTH)
}

export const NodeUtils = {
    createNodeId,
    matchesSearch,
    calculateNodeWidth,
}