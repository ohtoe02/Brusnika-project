// Сворачивание узла
const collapseNode = d => {
    if (d.children) {
        // Сохраняем дочерние узлы
        d._children = d.children
            // Очищаем children, чтобы скрыть дочерние узлы
        d.children = null
            // Устанавливаем флаг collapsed
        d.collapsed = true
    }
}

// Разворачивание узла
const expandNode = d => {
    if (d._children) {
        // Восстанавливаем дочерние узлы
        d.children = d._children
            // Очищаем временное хранилище
        d._children = null
            // Сбрасываем флаг collapsed
        d.collapsed = false
    }
}

// Получение всех потомков узла
const getDescendants = d => {
    const descendants = []
    const traverse = node => {
        if (node !== d) {
            // Исключаем сам узел из списка потомков
            descendants.push(node)
        }
        if (node.children) {
            node.children.forEach(traverse)
        }
    }
    traverse(d)
    return descendants
}

export const HierarchyUtils = {
    collapseNode,
    expandNode,
    getDescendants,
}