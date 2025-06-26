import { TREE_CONFIG } from '../constants/treeConfig'

export class DOMUtils {
    /**
     * Создает контейнер для визуализации с поддержкой зумирования
     * @param {d3.Selection} svg - SVG элемент
     * @param {number} width - Ширина
     * @param {number} height - Высота
     * @param {Object} margin - Отступы
     * @returns {d3.Selection} Контейнер
     */
    static createZoomContainer(svg, width, height, margin) {
        return svg
            .append('g')
            .attr('width', width)
            .attr('height', height)
            .attr('transform', `translate(${margin.left},${margin.top})`)
    }

    /**
     * Очищает SVG, сохраняя контейнер зумирования
     * @param {d3.Selection} svg - SVG элемент
     */
    static clearSVG(svg) {
        svg.selectAll('*').remove()
    }

    /**
     * Создает базовый узел с обработчиками событий
     * @param {d3.Selection} enter - Selection для входа
     * @param {Function} onClick - Обработчик клика
     * @param {Function} onMouseOver - Обработчик наведения
     * @param {Function} onMouseOut - Обработчик ухода курсора
     * @returns {d3.Selection} Узел
     */
    static createBaseNode(enter, onClick, onMouseOver, onMouseOut) {
        return enter
            .append('g')
            .attr('class', d => `node ${d._children ? 'collapsed' : ''}`)
            .on('click', onClick)
            .on('mouseover', onMouseOver)
            .on('mouseout', onMouseOut)
    }

    /**
     * Вычисляет ширину узла на основе длины текста
     * @param {string} text - Текст узла
     * @param {Object} settings - Настройки
     * @returns {number} Ширина узла
     */
    static calculateNodeWidth(text, settings = TREE_CONFIG) {
        const baseWidth = text.length * 8
        const padding = 20
        return Math.max(baseWidth + padding, settings.nodeSize.width)
    }

    /**
     * Создает прямоугольник для узла
     * @param {d3.Selection} selection - Узел
     * @param {Object} d - Данные
     * @param {string} searchQuery - Поисковый запрос
     * @param {Object} settings - Настройки
     */
    static createNodeRect(selection, d, searchQuery, settings = TREE_CONFIG) {
        // Вычисляем ширину узла на основе текста
        const nodeWidth = this.calculateNodeWidth(d.data.name, settings)

        const rect = selection
            .append('rect')
            .attr('width', nodeWidth)
            .attr('height', settings.nodeSize.height)
            .attr('rx', settings.nodeSize.borderRadius)
            .attr('ry', settings.nodeSize.borderRadius)
            .attr('class', 'node-rect')

        // Добавляем классы в зависимости от состояния узла
        if (d._children) {
            rect.classed('collapsed', true)
        }

        if (this.isHighlighted(d, searchQuery)) {
            rect.classed('search-highlight', true)
        }

        // Сохраняем ширину узла в данных для использования при отрисовке связей
        d.nodeWidth = nodeWidth

        return rect
    }

    /**
     * Создает текст для узла
     * @param {d3.Selection} selection - Узел
     * @param {Object} d - Данные
     * @param {string} searchQuery - Поисковый запрос
     * @param {Object} settings - Настройки
     */
    static createNodeText(selection, d, searchQuery, settings = TREE_CONFIG) {
        const nodeWidth =
            d.nodeWidth || this.calculateNodeWidth(d.data.name, settings)

        const text = selection
            .append('text')
            .attr('dy', '0.35em')
            .attr('x', nodeWidth / 2)
            .attr('y', settings.nodeSize.height / 2)
            .attr('text-anchor', 'middle')
            .attr('class', 'node-text')
            .text(d.data.name)

        // Добавляем классы в зависимости от состояния узла
        if (d._children) {
            text.classed('collapsed', true)
        }

        if (this.isHighlighted(d, searchQuery)) {
            text.classed('search-highlight', true)
        }

        return text
    }

    static isHighlighted(d, searchQuery) {
        if (!searchQuery) return false
        return d.data.name.toLowerCase().includes(searchQuery.toLowerCase())
    }
}