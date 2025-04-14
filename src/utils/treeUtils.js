import { TREE_CONFIG } from '../constants/treeConfig'

export class TreeUtils {
    static calculateNodeSpacing(root, nodeA, nodeB) {
        const levelNodes = root
            .descendants()
            .filter(node => node.depth === nodeA.depth)

        // Находим максимальную ширину текста на уровне
        const maxTextWidth = Math.max(
            ...levelNodes.map(node => {
                const text = node.data.name || ''
                return text.length * 8 // Примерная ширина символа
            })
        )

        // Вычисляем количество дочерних элементов
        const getChildrenCount = node => {
            if (node.children) return node.children.length
            if (node._children) return node._children.length
            return 0
        }

        const maxChildrenCount = Math.max(...levelNodes.map(getChildrenCount))

        // Базовое расстояние с учетом ширины текста и количества дочерних элементов
        const baseSpacing = Math.max(
            TREE_CONFIG.spacing.horizontal.min,
            Math.max(maxTextWidth, maxChildrenCount * TREE_CONFIG.nodeSize.width)
        )

        // Увеличиваем расстояние для узлов с разными родителями
        return nodeA.parent === nodeB.parent ?
            baseSpacing / TREE_CONFIG.nodeSize.width :
            (baseSpacing * 1.5) / TREE_CONFIG.nodeSize.width
    }

    static calculateTreeBounds(nodes) {
        let minX = Infinity,
            maxX = -Infinity
        let minY = Infinity,
            maxY = -Infinity

        nodes.forEach(d => {
            if (
                typeof d.x === 'number' &&
                typeof d.y === 'number' &&
                Number.isFinite(d.x) &&
                Number.isFinite(d.y)
            ) {
                minX = Math.min(minX, d.x)
                maxX = Math.max(maxX, d.x)
                minY = Math.min(minY, d.y)
                maxY = Math.max(maxY, d.y)
            }
        })

        return {
            minX: Number.isFinite(minX) ? minX : 0,
            maxX: Number.isFinite(maxX) ? maxX : 0,
            minY: Number.isFinite(minY) ? minY : 0,
            maxY: Number.isFinite(maxY) ? maxY : 0,
        }
    }

    static calculateOptimalScale(totalNodes) {
        const calculatedScale = 1 / (Math.log2(Math.max(2, totalNodes)) * 0.3)
        return Math.min(1, Math.max(0.2, calculatedScale))
    }
}