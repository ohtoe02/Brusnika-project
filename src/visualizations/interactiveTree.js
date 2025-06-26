// Оптимизированные импорты D3 - только нужные модули
import { hierarchy } from 'd3-hierarchy'
import { tree } from 'd3-hierarchy' 
import { select } from 'd3-selection'
import { zoom, zoomIdentity, zoomTransform } from 'd3-zoom'
import { transition } from 'd3-transition'
import { easeQuadInOut } from 'd3-ease'

// Создаем объект d3 для совместимости с существующим кодом
const d3 = {
    hierarchy,
    tree,
    select,
    zoom,
    zoomIdentity,
    zoomTransform,
    transition,
    easeQuadInOut
}
import { TREE_CONFIG } from '../constants/treeConfig'
import { DOMUtils } from '../utils/domUtils'

export class InteractiveTree {
    constructor(
        svg,
        data,
        width,
        height,
        searchQuery = '',
        margin,
        settings = {},
        theme = 'light'
    ) {
        this.svg = svg
        this.data = data
        this.width = width
        this.height = height
        this.searchQuery = searchQuery
        this.margin = margin
        this.settings = {...TREE_CONFIG, ...settings }
        this.theme = theme
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
        // Очищаем tooltip таймер если есть
        if (this.tooltipTimer) {
            clearTimeout(this.tooltipTimer)
            this.tooltipTimer = null
        }
        
        DOMUtils.clearSVG(this.svg)
    }

    createContainer() {
        this.container = DOMUtils.createZoomContainer(
            this.svg,
            this.width,
            this.height,
            this.margin
        )
        
        // Создаем градиенты для узлов
        this.createGradients()
        
        this.linkGroup = this.container.append('g').attr('class', 'links')
        this.nodeGroup = this.container.append('g').attr('class', 'nodes')
        this.badgeGroup = this.container.append('g').attr('class', 'badges')
    }

    createGradients() {
        // Создаем defs для градиентов
        const defs = this.svg.select('defs').empty() 
            ? this.svg.append('defs') 
            : this.svg.select('defs')

        // Градиент для корневого узла
        const rootGradient = defs.append('linearGradient')
            .attr('id', 'rootGradient')
            .attr('x1', '0%')
            .attr('y1', '0%')
            .attr('x2', '100%')
            .attr('y2', '100%')

        rootGradient.append('stop')
            .attr('offset', '0%')
            .attr('stop-color', '#667eea')

        rootGradient.append('stop')
            .attr('offset', '100%')
            .attr('stop-color', '#764ba2')

        // Градиент для наведения
        const hoverGradient = defs.append('linearGradient')
            .attr('id', 'hoverGradient')
            .attr('x1', '0%')
            .attr('y1', '0%')
            .attr('x2', '100%')
            .attr('y2', '100%')

        hoverGradient.append('stop')
            .attr('offset', '0%')
            .attr('stop-color', '#eff6ff')

        hoverGradient.append('stop')
            .attr('offset', '100%')
            .attr('stop-color', '#dbeafe')
    }

    createGrid(theme = 'light') {
        if (!this.settings.grid.enabled) return

        // Получаем defs или создаем если нет
        const defs = this.svg.select('defs').empty() 
            ? this.svg.append('defs') 
            : this.svg.select('defs')

        // Используем переданную тему или определяем автоматически
        const currentTheme = theme || (document.documentElement.classList.contains('dark') ? 'dark' : 'light')
        
        const gridConfig = this.settings.grid
        const gridSize = gridConfig.size
        
        // Создаем паттерн для обычной сетки
        const gridPattern = defs.append('pattern')
            .attr('id', 'grid')
            .attr('width', gridSize)
            .attr('height', gridSize)
            .attr('patternUnits', 'userSpaceOnUse')

        // Добавляем горизонтальные линии
        gridPattern.append('path')
            .attr('d', `M ${gridSize} 0 L 0 0 0 ${gridSize}`)
            .attr('fill', 'none')
            .attr('stroke', gridConfig.color[currentTheme])
            .attr('stroke-width', gridConfig.strokeWidth)
            .attr('opacity', gridConfig.opacity[currentTheme])

        // Создаем паттерн для основной сетки (каждая 5-я линия)
        if (gridConfig.majorGrid.enabled) {
            const majorGridSize = gridSize * gridConfig.majorGrid.interval
            
            const majorGridPattern = defs.append('pattern')
                .attr('id', 'majorGrid')
                .attr('width', majorGridSize)
                .attr('height', majorGridSize)
                .attr('patternUnits', 'userSpaceOnUse')

            // Сначала добавляем обычную сетку как фон
            majorGridPattern.append('rect')
                .attr('width', majorGridSize)
                .attr('height', majorGridSize)
                .attr('fill', 'url(#grid)')

            // Добавляем основные линии
            majorGridPattern.append('path')
                .attr('d', `M ${majorGridSize} 0 L 0 0 0 ${majorGridSize}`)
                .attr('fill', 'none')
                .attr('stroke', gridConfig.color[currentTheme])
                .attr('stroke-width', gridConfig.majorGrid.strokeWidth)
                .attr('opacity', gridConfig.majorGrid.opacity[currentTheme])
        }

        // Создаем действительно бесконечную сетку
        // Используем очень большие размеры, которые покроют любой возможный зум и панорамирование
        const infiniteSize = 50000 // Размер достаточный для покрытия любого разумного использования
        
        this.gridBackground = this.container.insert('rect', ':first-child')
            .attr('class', 'grid-background')
            .attr('x', -infiniteSize / 2)
            .attr('y', -infiniteSize / 2)
            .attr('width', infiniteSize)
            .attr('height', infiniteSize)
            .attr('fill', gridConfig.majorGrid.enabled ? 'url(#majorGrid)' : 'url(#grid)')
            .attr('pointer-events', 'none') // Не перехватываем события мыши
    }

    setupZoom() {
        // Сохраняем zoom behavior для использования в других методах
        this.zoomBehavior = d3.zoom()
            .scaleExtent([0.1, 3])
            .on('zoom', event => {
                this.container.attr('transform', event.transform)
            })

        this.svg.call(this.zoomBehavior)

        // Центрируем дерево
        const initialTransform = d3.zoomIdentity
            .translate(this.width / 2, this.height / 6)
            .scale(0.6)

        this.svg.call(this.zoomBehavior.transform, initialTransform)
    }

    createHierarchy() {
        this.root = d3.hierarchy(this.data, d => d.children)
        this.root.descendants().forEach(d => {
                if (d.children) {
                    d._children = d.children
                    d.children = null
                }
            })
            // Раскрываем только первый уровень для лучшей читаемости
        if (this.root._children) {
            this.root.children = this.root._children
            this.root._children = null
        }
        this.restoreTreeState()
    }

    createTreeLayout() {
        const totalNodes = this.root.descendants().length

        // Предварительно рассчитываем ширину всех узлов
        this.root.descendants().forEach(d => {
            d.nodeWidth = this.calculateNodeWidth(
                d.data.name,
                d._children ? true : false
            )
        })

        // Адаптивное расстояние в зависимости от количества узлов
        const baseSpacing = Math.max(
            100,
            Math.min(180, 1000 / Math.sqrt(totalNodes))
        )

        return d3
            .tree()
            .size([this.height - 100, this.width - 200])
            .nodeSize([baseSpacing, 250]) // Увеличиваем горизонтальное расстояние
            .separation((a, b) => {
                // Учитываем фактическую ширину узлов
                const aWidth = a.nodeWidth || 150
                const bWidth = b.nodeWidth || 150
                const maxWidth = Math.max(aWidth, bWidth)

                // Базовый коэффициент от ширины узлов
                const widthFactor = Math.max(1.0, maxWidth / 150)

                if (a.parent === b.parent) {
                    // Одинаковый родитель - минимальное расстояние с учетом ширины
                    return Math.max(1.4, widthFactor * 0.8)
                } else {
                    // Разные родители - больше пространства
                    return Math.max(2.8, widthFactor * 1.2)
                }
            })
    }

    update() {
        const treeLayout = this.createTreeLayout()
        const treeData = treeLayout(this.root)

        this.updateLinks(treeData)
        this.updateNodes(treeData)
        this.saveTreeState()
    }

    updateLinks(treeData) {
        this.linkGroup.selectAll('*').remove()

        const links = this.linkGroup
            .selectAll('path')
            .data(treeData.links())
            .join('path')
            .attr('class', 'link')
            .attr('d', d => this.createBezierPath(d))
            .attr('fill', 'none')
            .attr('stroke', this.settings.lineColor || '#cbd5e1')
            .attr('stroke-width', this.settings.lineWidth || 2)
            .attr('opacity', 0.7)

        return links
    }

    updateNodes(treeData) {
        this.nodeGroup.selectAll('*').remove()
        this.badgeGroup.selectAll('*').remove() // Очищаем группу плашек

        const nodes = this.nodeGroup
            .selectAll('g')
            .data(treeData.descendants())
            .join('g')
            .attr('class', d => this.getNodeClass(d))
            .attr('transform', d => this.getNodeTransform(d))
            .attr('data-id', d => d.data.id)

        // Создаем узлы без плашек
        nodes.each((d, i, nodeList) => {
            const node = d3.select(nodeList[i])
            this.createEnhancedNode(node, d)
        })

        // Создаем плашки в отдельной группе
        this.createBadges(treeData.descendants())

        this.setupNodeEventHandlers(nodes)
    }

    createBezierPath(d) {
        const source = d.source
        const target = d.target

        // Горизонтальное дерево (источник слева, цель справа)
        const sourceX = source.y
        const sourceY = source.x
        const targetX = target.y
        const targetY = target.x

        // Создаем плавную кривую Безье
        const midX = (sourceX + targetX) / 2

        return `M${sourceX},${sourceY}C${midX},${sourceY} ${midX},${targetY} ${targetX},${targetY}`
    }

    createEnhancedNode(selection, d) {
        const nodeWidth = this.calculateNodeWidth(d.data.name, false) // Убираем учет счетчика из ширины
        const nodeHeight = 40

        // Основной прямоугольник узла
        selection
            .append('rect')
            .attr('width', nodeWidth)
            .attr('height', nodeHeight)
            .attr('x', -nodeWidth / 2)
            .attr('y', -nodeHeight / 2)
            .attr('rx', 8)
            .attr('ry', 8)
            .attr('class', 'node-rect')
            .attr('fill', this.getNodeColor(d))
            .attr('stroke', this.getNodeBorderColor(d))
            .attr('stroke-width', this.getNodeBorderWidth(d))

        // Текст узла - строго по центру (без учета счетчика)
        const text = selection
            .append('text')
            .attr('x', 0) // Строго по центру
            .attr('y', 1)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .attr('class', 'node-text')
            .style('text-rendering', 'optimizeLegibility')
            .text(d.data.name)

        // Дополнительные стили для корневого узла
        if (d.depth === 0) {
            text
                .style('font-weight', '700')
                .style('font-size', '16px')
                .style('fill', '#ffffff')
                .style('text-shadow', '0 1px 3px rgba(0, 0, 0, 0.5)')
        } else {
            // Настройки текста для обычных узлов с учетом темы
            const textColor = this.getTextColor()
            text
                .style('font-weight', '500')
                .style('font-size', '14px')
                .style('fill', textColor)
        }

        // Сохраняем размеры для связей
        d.nodeWidth = nodeWidth
        d.nodeHeight = nodeHeight
    }

    createBadges(nodes) {
        const collapsedNodes = nodes.filter(
            d => d._children && d._children.length > 0
        )

        const badges = this.badgeGroup
            .selectAll('g')
            .data(collapsedNodes)
            .join('g')
            .attr('class', 'badge-group')
            .attr('transform', d => this.getNodeTransform(d))

        badges.each((d, i, badgeList) => {
            const badge = d3.select(badgeList[i])
            this.createBadge(badge, d)
        })
    }

    createBadge(selection, d) {
        const nodeWidth = this.calculateNodeWidth(d.data.name, false)
        const badgeSize = 24 // Увеличиваем размер для лучшей видимости
        const badgeX = d.nodeWidth / 2 + badgeSize / 2 + 6 // справа от узла
        const badgeY = 0 // по центру вертикально

        // Создаем группу для кнопки с улучшенным дизайном
        const badge = selection.append('g')
            .attr('class', 'collapse-badge-group')
            .attr('transform', `translate(${badgeX}, ${badgeY})`) // справа от узла
            .style('cursor', 'pointer')

        // Фон кнопки с градиентом и тенью
        badge.append('circle')
            .attr('r', badgeSize / 2)
            .attr('fill', '#f59e0b') // Янтарный цвет для контраста
            .attr('stroke', '#ffffff')
            .attr('stroke-width', 2)
            .style('filter', 'drop-shadow(0 2px 6px rgba(245, 158, 11, 0.4))')
            .style('transition', 'all 0.2s ease')
            .attr('class', 'badge-circle')

        // Иконка плюс для свернутых узлов (вместо числа)
        badge.append('text')
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'central')
            .attr('fill', 'white')
            .attr('font-size', '14px')
            .attr('font-weight', 'bold')
            .attr('font-family', 'monospace')
            .text('+')
            .attr('pointer-events', 'none')
            .attr('class', 'badge-icon')

        // Создаем более заметный счетчик с фоном
        const countGroup = badge.append('g')
            .attr('class', 'badge-count-group')
            .attr('transform', `translate(0, ${badgeSize / 2 + 16})`)

        // Фон для счетчика
        countGroup.append('circle')
            .attr('r', 10)
            .attr('fill', '#374151')
            .attr('stroke', '#ffffff')
            .attr('stroke-width', 1.5)
            .attr('class', 'badge-count-bg')
            .style('filter', 'drop-shadow(0 1px 3px rgba(0, 0, 0, 0.3))')

        // Текст счетчика
        countGroup.append('text')
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'central')
            .attr('fill', '#ffffff')
            .attr('font-size', '11px')
            .attr('font-weight', '600')
            .attr('font-family', 'system-ui, -apple-system, sans-serif')
            .text(d._children.length)
            .attr('pointer-events', 'none')
            .attr('class', 'badge-count-text')

        // Улучшенные hover эффекты
        badge.on('mouseenter', function() {
            d3.select(this).select('.badge-circle')
                .transition().duration(150)
                .attr('fill', '#fbbf24')
            d3.select(this).select('.badge-count-bg')
                .transition().duration(150)
                .attr('fill', '#4b5563')
        }).on('mouseleave', function() {
            d3.select(this).select('.badge-circle')
                .transition().duration(150)
                .attr('fill', '#f59e0b')
            d3.select(this).select('.badge-count-bg')
                .transition().duration(150)
                .attr('fill', '#374151')
        })

        // Добавляем клик обработчик прямо на кнопку
        badge.on('click', (event, nodeData) => {
            event.stopPropagation() // Предотвращаем всплытие к узлу
            this.handleNodeClick(event, nodeData)
        })
    }

    calculateNodeWidth(text, hasChildren = false) {
        // Более точный расчет ширины с учетом длинных названий
        const baseWidth = text.length * 7.8 // Чуть увеличили коэффициент
        const padding = hasChildren ? 72 : 56 // Увеличенные отступы
        const minWidth = hasChildren ? 152 : 132

        // Для очень длинных названий увеличиваем максимальную ширину
        const maxWidth = text.length > 30 ? 400 : 312

        const calculatedWidth = Math.max(
            baseWidth + padding,
            minWidth,
            Math.min(baseWidth + padding, maxWidth)
        )

        // Дополнительная корректировка для узлов с очень длинными названиями
        if (text.length > 40) {
            return Math.min(calculatedWidth * 1.1, 450)
        }

        return calculatedWidth
    }

    getNodeClass(d) {
        let classes = 'node'
        if (d._children) classes += ' collapsed'
        if (d.children) classes += ' node--internal'
        else classes += ' node--leaf'
        if (d.depth === 0) classes += ' root-node'
        return classes
    }

    getNodeTransform(d) {
        return `translate(${d.y},${d.x})`
    }

    // Методы для улучшенного цветового кодирования по глубине с поддержкой темы
    getNodeColor(d) {
        // Цветовые схемы для светлой и темной темы
        const lightColors = [
            'url(#rootGradient)',  // Корень - градиент  
            '#ffffff',             // Уровень 1 - белый
            '#f8fafc',             // Уровень 2 - светло-серый
            '#f1f5f9',             // Уровень 3 - серый
            '#e2e8f0',             // Уровень 4 - темно-серый
            '#f3f4f6',             // Уровень 5 - нейтральный
            '#f9fafb',             // Уровень 6 - почти белый
            '#f7fafc',             // Уровень 7 - слабо-серый
        ]
        
        const darkColors = [
            'url(#rootGradient)',  // Корень - градиент  
            '#374151',             // Уровень 1 - темно-серый
            '#1f2937',             // Уровень 2 - очень темный серый
            '#111827',             // Уровень 3 - почти черный
            '#030712',             // Уровень 4 - черный
            '#4b5563',             // Уровень 5 - средне-серый  
            '#6b7280',             // Уровень 6 - светло-серый
            '#9ca3af',             // Уровень 7 - серый
        ]
        
        const depthColors = this.theme === 'dark' ? darkColors : lightColors
        
        // Для листовых узлов - приглушенный цвет
        if (!d.children && !d._children) {
            return this.theme === 'dark' ? '#1f2937' : '#f8fafc'
        }
        
        // Если глубина больше доступных цветов, используем циклический выбор
        const colorIndex = d.depth % depthColors.length
        return depthColors[colorIndex] || (this.theme === 'dark' ? '#374151' : '#ffffff')
    }

    getNodeBorderColor(d) {
        // Цвета границ в зависимости от темы
        const lightBorders = [
            '#4c51bf',   // Корень - индиго
            '#2563eb',   // Уровень 1 - синий
            '#059669',   // Уровень 2 - изумрудный
            '#dc2626',   // Уровень 3 - красный
            '#ca8a04',   // Уровень 4 - янтарный
            '#7c3aed',   // Уровень 5 - фиолетовый
            '#0891b2',   // Уровень 6 - циан
            '#be185d',   // Уровень 7 - розовый
        ]
        
        const darkBorders = [
            '#60a5fa',   // Корень - светло-синий для темной темы
            '#3b82f6',   // Уровень 1 - синий
            '#10b981',   // Уровень 2 - изумрудный
            '#ef4444',   // Уровень 3 - красный
            '#f59e0b',   // Уровень 4 - янтарный
            '#8b5cf6',   // Уровень 5 - фиолетовый
            '#06b6d4',   // Уровень 6 - циан
            '#ec4899',   // Уровень 7 - розовый
        ]
        
        const borderColors = this.theme === 'dark' ? darkBorders : lightBorders
        
        if (d.depth === 0) return borderColors[0]
        if (!d.children && !d._children) {
            return this.theme === 'dark' ? '#6b7280' : '#94a3b8'
        }
        
        const colorIndex = d.depth % borderColors.length
        return borderColors[colorIndex] || (this.theme === 'dark' ? '#6b7280' : '#94a3b8')
    }

    getNodeBorderWidth(d) {
        if (d.depth === 0) return 3      // Толстая окантовка для корня
        if (d._children) return 2        // Средняя для свернутых узлов
        if (!d.children && !d._children) return 1  // Тонкая для листьев
        return 2                         // Средняя для узлов с детьми
    }

    getTextColor() {
        // Цвет текста в зависимости от темы
        if (this.theme === 'dark') {
            // В темной теме - светлый текст
            return '#f3f4f6'
        } else {
            // В светлой теме - темный текст
            return '#1f2937'
        }
    }

    setupNodeEventHandlers(nodes) {
        nodes
            .on('click', (event, d) => this.handleNodeClick(event, d))
            .on('mouseenter', (event, d) => this.handleNodeMouseOver(event, d))
            .on('mouseleave', (event, d) => this.handleNodeMouseOut(event, d))
    }

    // Метод для установки tooltip обработчиков (вызывается из React компонента)
    setupTooltipHandlers(showTooltip, hideTooltip, isMobile = false) {
        // Сохраняем обработчики для интеграции с основными обработчиками
        this.tooltipHandlers = { showTooltip, hideTooltip, isMobile }
    }

    handleNodeClick(event, d) {
        // Скрываем tooltip при клике
        if (this.tooltipHandlers && this.tooltipHandlers.hideTooltip) {
            this.tooltipHandlers.hideTooltip()
        }
        
        if (d.children) {
            d._children = d.children
            d.children = null
        } else if (d._children) {
            d.children = d._children
            d._children = null
        }

        this.update()

        // Обновляем путь
        const path = this.getPathToNode(d)
        this.currentPath = path
        if (this.onPathChange) {
            this.onPathChange(path)
        }
    }

    handleNodeMouseOver(event, d) {
        // Добавляем класс hover
        d3.select(event.currentTarget).classed('node-hover', true)
        
        // Подсвечиваем родительский путь
        this.highlightParents(d)
        
        // Показываем tooltip если настроен
        if (this.tooltipHandlers && !this.tooltipHandlers.isMobile) {
            const { showTooltip } = this.tooltipHandlers
            
            // Отменяем предыдущий таймер если есть
            if (this.tooltipTimer) {
                clearTimeout(this.tooltipTimer)
            }
            
            // Устанавливаем новый таймер
            this.tooltipTimer = setTimeout(() => {
                showTooltip(d, event)
                this.tooltipTimer = null
            }, 500)
        }
    }

    handleNodeMouseOut(event, d) {
        // Убираем класс hover
        d3.select(event.currentTarget).classed('node-hover', false)
        
        // Убираем подсветку родительского пути
        this.unhighlightParents(d)
        
        // Скрываем tooltip если настроен
        if (this.tooltipHandlers) {
            const { hideTooltip } = this.tooltipHandlers
            
            // Отменяем таймер показа tooltip
            if (this.tooltipTimer) {
                clearTimeout(this.tooltipTimer)
                this.tooltipTimer = null
            }
            
            // Скрываем tooltip
            hideTooltip()
        }
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
        
        // Пересоздаем сетку если изменились настройки сетки
        if (newSettings.grid) {
            this.updateGrid()
        }
        
        this.update()
    }

    updateTheme(newTheme) {
        this.theme = newTheme
        
        // Обновляем сетку с новой темой
        this.updateGrid(newTheme)
        
        // Перерисовываем узлы с новыми цветами
        this.update()
    }

    // Метод для эффективного обновления только стилей


    updateGrid(theme) {
        // Удаляем существующую сетку
        if (this.gridBackground) {
            this.gridBackground.remove()
        }
        
        // Удаляем старые паттерны сетки
        this.svg.select('defs').selectAll('#grid, #majorGrid').remove()
        
        // Создаем новую сетку с переданной темой
        this.createGrid(theme)
    }

    revealPathToNode(searchText) {
        if (!searchText || !this.root) return

        const foundNode = this.findNodeByName(this.root, searchText)
        if (!foundNode) return

        // Раскрываем путь до найденного узла
        this.expandPathToNode(foundNode)
        this.update()

        // Центрируем на найденном узле
        this.centerOnNode(foundNode)

        // Подсвечиваем найденный узел
        this.highlightFoundNode(foundNode)

        // Обновляем путь
        const path = this.getPathToNode(foundNode)
        this.currentPath = path
        if (this.onPathChange) {
            this.onPathChange(path)
        }
    }

    findNodeByName(node, searchText) {
        if (node.data.name.toLowerCase().includes(searchText.toLowerCase())) {
            return node
        }

        if (node.children) {
            for (const child of node.children) {
                const found = this.findNodeByName(child, searchText)
                if (found) return found
            }
        }

        if (node._children) {
            for (const child of node._children) {
                const found = this.findNodeByName(child, searchText)
                if (found) return found
            }
        }

        return null
    }

    expandPathToNode(targetNode) {
        let current = targetNode.parent
        while (current) {
            if (current._children) {
                current.children = current._children
                current._children = null
            }
            current = current.parent
        }
    }

    centerOnNode(node) {
        if (!this.zoomBehavior) {
            console.warn('Zoom behavior not initialized')
            return
        }

        // Получаем текущий transform
        const currentTransform = d3.zoomTransform(this.svg.node())

        // Позиция узла в координатах дерева (node.y - горизонтальная, node.x - вертикальная)
        const nodeTreeX = node.y || 0
        const nodeTreeY = node.x || 0
        
        // Желаемый масштаб (увеличиваем для лучшей видимости)
        const targetScale = Math.max(currentTransform.k, 0.8)

        // Вычисляем где должен быть центр экрана в координатах дерева
        const centerX = this.width / 2
        const centerY = this.height / 2
        
        // Вычисляем необходимое смещение
        const translateX = centerX - nodeTreeX * targetScale
        const translateY = centerY - nodeTreeY * targetScale

        // Создаем новый transform
        const newTransform = d3.zoomIdentity
            .translate(translateX, translateY)
            .scale(targetScale)

        // Применяем transform с анимацией
        this.svg
            .transition()
            .duration(750)
            .ease(d3.easeQuadInOut)
            .call(this.zoomBehavior.transform, newTransform)
    }

    highlightFoundNode(node) {
        // Убираем предыдущую подсветку
        this.nodeGroup
            .selectAll('.found-highlight')
            .classed('found-highlight', false)

        // Добавляем подсветку найденному узлу
        this.nodeGroup
            .selectAll('g')
            .filter(d => d === node)
            .classed('found-highlight', true)

        // Убираем подсветку через 3 секунды
        setTimeout(() => {
            this.nodeGroup
                .selectAll('.found-highlight')
                .classed('found-highlight', false)
        }, 3000)
    }

    // Сохраняет массив путей раскрытых узлов в localStorage
    saveTreeState() {
        if (!this.root) return
        const opened = []

        function traverse(node, path) {
            if (node.children && node.children.length > 0) {
                opened.push([...path, node.data.name])
                node.children.forEach(child =>
                    traverse(child, [...path, node.data.name])
                )
            }
            if (node._children && node._children.length > 0) {
                node._children.forEach(child =>
                    traverse(child, [...path, node.data.name])
                )
            }
        }
        traverse(this.root, [])
        try {
            localStorage.setItem('treeOpenedPaths', JSON.stringify(opened))
        } catch {
            /* ignore */
        }
    }

    // Восстанавливает состояние дерева из localStorage
    restoreTreeState() {
        try {
            const saved = localStorage.getItem('treeOpenedPaths')
            if (!saved) return

            const openedPaths = JSON.parse(saved)
            openedPaths.forEach(path => {
                this.expandNodeByPath(path)
            })
        } catch {
            /* ignore */
        }
    }

    expandNodeByPath(path) {
        let current = this.root
        for (const name of path) {
            if (current.data.name === name) {
                if (current._children) {
                    current.children = current._children
                    current._children = null
                }
                continue
            }

            const children = current.children || current._children || []
            const found = children.find(child => child.data.name === name)
            if (!found) break

            if (found._children) {
                found.children = found._children
                found._children = null
            }
            current = found
        }
    }

    // Улучшенные методы поиска и навигации
    searchNodes(searchText) {
        if (!searchText || !this.root || searchText.length < 2) return []
        
        const results = []
        this.traverseNodes(this.root, (node) => {
            if (node.data.name.toLowerCase().includes(searchText.toLowerCase())) {
                results.push(node)
            }
        })
        
        return results
    }

    traverseNodes(node, callback) {
        callback(node)
        
        if (node.children) {
            node.children.forEach(child => this.traverseNodes(child, callback))
        }
        
        if (node._children) {
            node._children.forEach(child => this.traverseNodes(child, callback))
        }
    }

    highlightSearchResults(results, currentIndex = -1) {
        // Убираем предыдущую подсветку
        this.clearSearchHighlight()
        
        results.forEach((node, index) => {
            const nodeElement = this.nodeGroup
                .selectAll('g')
                .filter(d => d === node)
            
            // Основная подсветка для всех результатов
            nodeElement.classed('search-result', true)
            
            // Особая подсветка для текущего результата
            if (index === currentIndex) {
                nodeElement.classed('search-current', true)
                
                // Центрируем на текущем результате
                this.centerOnNode(node)
                
                // Раскрываем путь к узлу
                this.expandPathToNode(node)
                this.update()
            }
        })
    }

    clearSearchHighlight() {
        this.nodeGroup
            .selectAll('g')
            .classed('search-result', false)
            .classed('search-current', false)
    }

    navigateToSearchResult(results, index) {
        if (results.length === 0 || index < 0 || index >= results.length) return
        
        this.highlightSearchResults(results, index)
    }

    // Методы для управления деревом из Toolbar
    expandAll() {
        if (!this.root) return
        
        this.traverseNodes(this.root, (node) => {
            if (node._children) {
                node.children = node._children
                node._children = null
            }
        })
        
        this.update()
    }

    collapseAll() {
        if (!this.root) return
        
        this.traverseNodes(this.root, (node) => {
            if (node.children && node.depth > 0) { // Не сворачиваем корень
                node._children = node.children
                node.children = null
            }
        })
        
        this.update()
    }

    resetZoom() {
        if (!this.zoomBehavior || !this.svg) return
        
        this.svg.transition()
            .duration(750)
            .call(this.zoomBehavior.transform, d3.zoomIdentity)
    }

    zoomIn() {
        if (!this.zoomBehavior || !this.svg) return
        
        this.svg.transition()
            .duration(300)
            .call(this.zoomBehavior.scaleBy, 1.5)
    }

    zoomOut() {
        if (!this.zoomBehavior || !this.svg) return
        
        this.svg.transition()
            .duration(300)
            .call(this.zoomBehavior.scaleBy, 1 / 1.5)
    }

    centerTree() {
        if (!this.root || !this.zoomBehavior || !this.svg) return
        
        // Вычисляем границы дерева
        const nodes = this.treeLayout(this.root).descendants()
        const bounds = {
            minX: d3.min(nodes, d => d.x),
            maxX: d3.max(nodes, d => d.x),
            minY: d3.min(nodes, d => d.y),
            maxY: d3.max(nodes, d => d.y)
        }
        
        const treeWidth = bounds.maxY - bounds.minY
        const treeHeight = bounds.maxX - bounds.minX
        const centerX = (bounds.minY + bounds.maxY) / 2
        const centerY = (bounds.minX + bounds.maxX) / 2
        
        // Вычисляем масштаб для помещения всего дерева
        const scale = Math.min(
            (this.width - 100) / treeWidth,
            (this.height - 100) / treeHeight,
            1.5 // Максимальный масштаб
        )
        
        // Центрируем дерево
        const translateX = this.width / 2 - centerX * scale
        const translateY = this.height / 2 - centerY * scale
        
        this.svg.transition()
            .duration(750)
            .call(
                this.zoomBehavior.transform,
                d3.zoomIdentity.translate(translateX, translateY).scale(scale)
            )
    }
}