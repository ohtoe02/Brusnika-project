// Сворачивание узла
const collapseNode = d => {
    if (d.children) {
        d._children = d.children
        d.children = null
    }
}

// Разворачивание узла
const expandNode = d => {
    if (d._children) {
        d.children = d._children
        d._children = null
    }
}

// Получение всех потомков узла
const getDescendants = d => {
    const descendants = []
    const traverse = node => {
        descendants.push(node)
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