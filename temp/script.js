// Глобальные переменные для сохранения данных и поискового запроса
window.hierarchyData = null
window.searchQuery = ''

// При загрузке файла полностью очищаем контейнер визуализации
document.getElementById('fileInput').addEventListener('change', function(e) {
    const file = e.target.files[0]
    if (file) {
        const reader = new FileReader()
        reader.onload = function(event) {
            const csvData = event.target.result
            const data = d3.csvParse(csvData)
                // Построение иерархии по столбцам CSV:
                // Используем уровни: "ЮЛ", "Локация", "Подразделение", "Отдел", "Группа", "Должность", "ФИО"
                // Если значение пустое, данный уровень пропускается – следующий непустой уровень привязывается напрямую.
            window.hierarchyData = buildHierarchy(data)
            renderVisualization(document.getElementById('visualizationSelect').value)
        }
        reader.readAsText(file, 'UTF-8')
    }
})

// При смене типа визуализации также перерисовываем
document
    .getElementById('visualizationSelect')
    .addEventListener('change', function(e) {
        if (window.hierarchyData) {
            renderVisualization(e.target.value)
        }
    })

// Поиск: сохраняем запрос и перерисовываем визуализацию
document.getElementById('searchButton').addEventListener('click', function() {
    window.searchQuery = document
        .getElementById('searchInput')
        .value.trim()
        .toLowerCase()
    const mode = document.getElementById('visualizationSelect').value
    renderVisualization(mode)
})

// Преобразование CSV-данных в иерархическую структуру
function buildHierarchy(flatData) {
    // Корневой узел
    let root = { name: 'Сотрудники', children: [] }
        // Последовательность уровней
    const levels = [
        'ЮЛ',
        'Локация',
        'Подразделение',
        'Отдел',
        'Группа',
        'Должность',
        'ФИО',
    ]

    flatData.forEach(row => {
        let current = root
        levels.forEach(level => {
                // Если значение существует и не пустое – используем его, иначе пропускаем данный уровень
                let value = row[level] ? row[level].trim() : ''
                if (!value) return // пропускаем уровень
                    // Ищем уже существующий дочерний узел с данным значением
                let child = current.children.find(d => d.name === value)
                if (!child) {
                    child = { name: value, children: [] }
                    current.children.push(child)
                }
                current = child
            })
            // Прикрепляем дополнительные данные к последнему узлу
        current.details = {
            'Номер позиции': row['Номер позиции'],
            'Тип работы': row['Тип работы'],
        }
    })
    return root
}

// Функция очистки контейнера визуализации
function clearVizContainer() {
    d3.select('#vizContainer').html('')
}

// Основная функция рендеринга: каждый раз очищаем контейнер и создаём новый элемент (SVG или карточки)
function renderVisualization(mode) {
    clearVizContainer()
        // Если режим не "summary", создаём новый SVG
    if (mode !== 'summary') {
        d3.select('#vizContainer')
            .append('svg')
            .attr('id', 'vizSVG')
            .attr('width', 1000)
            .attr('height', 800)
    }
    switch (mode) {
        case 'tree':
            renderInteractiveTree(window.hierarchyData)
            break
        case 'radial':
            renderRadialTree(window.hierarchyData)
            break
        case 'treemap':
            renderTreemap(window.hierarchyData)
            break
        case 'sunburst':
            renderSunburst(window.hierarchyData)
            break
        case 'org':
            renderOrgChart(window.hierarchyData)
            break
        case 'summary':
            renderSummaryCards(window.hierarchyData)
            break
        default:
            renderInteractiveTree(window.hierarchyData)
    }
    updateMinimap()
}

// 1. Интерактивное дерево с зумированием и увеличенной дистанцией между уровнями
function renderInteractiveTree(rootData) {
    const svg = d3.select('#vizSVG'),
        width = +svg.attr('width'),
        height = +svg.attr('height'),
        margin = { top: 20, right: 90, bottom: 30, left: 90 }

    // Зум-контейнер
    const container = svg
        .append('g')
        .attr('class', 'zoom-container')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
    svg.call(
        d3.zoom().on('zoom', event => {
            container.attr('transform', event.transform)
        })
    )

    const treelayout = d3
        .tree()
        .size([
            height - margin.top - margin.bottom,
            width - margin.left - margin.right,
        ])
    let i = 0
    let root = d3.hierarchy(rootData, d => d.children)
    root.x0 = (height - margin.top - margin.bottom) / 2
    root.y0 = 0
    if (root.children) root.children.forEach(collapse)
    update(root)

    function collapse(d) {
        if (d.children) {
            d._children = d.children
            d._children.forEach(collapse)
            d.children = null
        }
    }

    function update(source) {
        const treeData = treelayout(root)
        const nodes = treeData.descendants()
        const links = treeData.descendants().slice(1)

        // Увеличиваем горизонтальное расстояние между уровнями
        nodes.forEach(d => {
            d.y = d.depth * 220
        })

        // Обновление узлов
        const node = container
            .selectAll('g.node')
            .data(nodes, d => d.id || (d.id = ++i))

        const nodeEnter = node
            .enter()
            .append('g')
            .attr('class', d => `node ${d._children ? 'collapsed' : ''}`)
            .attr('transform', d => `translate(${source.y0},${source.x0})`)
            .on('click', click)
            .on('mouseover', function(event, d) {
                d3.select(this).classed('highlight', true)
                highlightAncestors(d, true)
            })
            .on('mouseout', function(event, d) {
                d3.select(this).classed('highlight', false)
                highlightAncestors(d, false)
            })

        // Добавляем прямоугольник для фона
        nodeEnter
            .append('rect')
            .attr('width', d => {
                const textWidth = d.data.name.length * 8 + 20
                return Math.max(textWidth, 50)
            })
            .attr('height', 30)
            .attr('x', d => {
                const textWidth = d.data.name.length * 8 + 20
                return -Math.max(textWidth, 50) / 2
            })
            .attr('y', -15)
            .attr('rx', 10)
            .attr('ry', 10)
            .style('fill', '#fff')
            .style('stroke', '#999')
            .style('stroke-width', 2)

        // Добавляем текст
        nodeEnter
            .append('text')
            .attr('dy', '.35em')
            .attr('text-anchor', 'middle')
            .text(d => d.data.name)
            .style('fill', d => {
                if (
                    window.searchQuery &&
                    d.data.name.toLowerCase().includes(window.searchQuery)
                ) {
                    return 'red'
                }
                return 'black'
            })

        const nodeUpdate = nodeEnter.merge(node)
        nodeUpdate
            .transition()
            .duration(200)
            .attr('transform', d => `translate(${d.y},${d.x})`)

        // Обновляем классы для отображения состояния свернутости
        nodeUpdate
            .attr('class', d => `node ${d._children ? 'collapsed' : ''}`)
            .select('rect')
            .style('fill', d => (d._children ? '#e6f3ff' : '#fff'))
            .style('stroke', d => (d._children ? '#4a90e2' : '#999'))

        // Обновляем связи
        const link = container.selectAll('path.link').data(links, d => d.id)

        const linkEnter = link
            .enter()
            .insert('path', 'g')
            .attr('class', 'link')
            .attr('d', d => {
                const o = { x: source.x0, y: source.y0 }
                return diagonal(o, o)
            })

        const linkUpdate = linkEnter.merge(link)
        linkUpdate
            .transition()
            .duration(200)
            .attr('d', d => diagonal(d, d.parent))

        link
            .exit()
            .transition()
            .duration(200)
            .attr('d', d => {
                const o = { x: source.x, y: source.y }
                return diagonal(o, o)
            })
            .remove()

        // Сохраняем старые позиции для перехода
        nodes.forEach(d => {
            d.x0 = d.x
            d.y0 = d.y
        })
    }

    function diagonal(s, d) {
        return `M ${s.y} ${s.x}
                C ${(s.y + d.y) / 2} ${s.x},
                  ${(s.y + d.y) / 2} ${d.x},
                  ${d.y} ${d.x}`
    }

    function click(event, d) {
        if (d.children) {
            d._children = d.children
            d.children = null
        } else {
            d.children = d._children
            d._children = null
        }
        update(d)
    }

    function highlightAncestors(d, highlight) {
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

// 2. Радиальное дерево с зумированием и фильтрацией текста
function renderRadialTree(rootData) {
    const svg = d3.select('#vizSVG'),
        width = +svg.attr('width'),
        height = +svg.attr('height'),
        radius = Math.min(width, height) / 2 - 50
    svg.selectAll('*').remove()

    const container = svg
        .append('g')
        .attr('class', 'zoom-container')
        .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')')
    svg.call(
        d3.zoom().on('zoom', event => {
            container.attr('transform', event.transform)
        })
    )

    const treelayout = d3.tree().size([360, radius])
    let root = d3.hierarchy(rootData, d => d.children)
    root = treelayout(root)
    const links = root.links()
    const nodes = root.descendants()

    container
        .selectAll('.link')
        .data(links)
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

    const node = container
        .selectAll('.node')
        .data(nodes)
        .enter()
        .append('g')
        .attr('class', 'node')
        .attr('transform', d => 'translate(' + project(d.x, d.y) + ')')
        .on('mouseover', function(event, d) {
            highlightAncestorsRadial(d, true)
        })
        .on('mouseout', function(event, d) {
            highlightAncestorsRadial(d, false)
        })

    node
        .append('circle')
        .attr('r', 4)
        .style('fill', d => (d.children ? 'lightsteelblue' : '#fff'))
        .attr('cursor', 'pointer')

    // Фильтруем текст: отображаем его только если узел находится достаточно далеко от центра
    node
        .append('text')
        .filter(d => d.y > 30)
        .attr('dy', '.31em')
        .attr('text-anchor', d => (d.x < 180 ? 'start' : 'end'))
        .attr('transform', d =>
            d.x < 180 ? 'translate(12)' : 'rotate(180)translate(-12)'
        )
        .text(d => d.data.name)
        .style('fill', d => {
            if (
                window.searchQuery &&
                d.data.name.toLowerCase().includes(window.searchQuery)
            ) {
                return 'red'
            }
            return 'black'
        })

    function project(x, y) {
        const angle = ((x - 90) / 180) * Math.PI
        return [y * Math.cos(angle), y * Math.sin(angle)]
    }

    function highlightAncestorsRadial(d, highlight) {
        let current = d
        while (current) {
            container
                .selectAll('.node')
                .filter(n => n === current)
                .select('circle')
                .classed('highlight', highlight)
            current = current.parent
        }
    }
}

// 3. Treemap с зумированием и условным выводом текста по размеру прямоугольника
function renderTreemap(rootData) {
    const svg = d3.select('#vizSVG'),
        width = +svg.attr('width'),
        height = +svg.attr('height')

    const container = svg.append('g').attr('class', 'zoom-container')
    svg.call(
        d3.zoom().on('zoom', event => {
            container.attr('transform', event.transform)
        })
    )

    let root = d3.hierarchy(rootData).sum(d => 1)
    d3.treemap().size([width, height]).padding(5)(root) // padding увеличен для расстояния между ячейками

    const nodes = root.descendants()
    const cell = container
        .selectAll('g')
        .data(nodes)
        .enter()
        .append('g')
        .attr('transform', d => 'translate(' + d.x0 + ',' + d.y0 + ')')
    cell
        .append('rect')
        .attr('width', d => d.x1 - d.x0)
        .attr('height', d => d.y1 - d.y0)
        .style('fill', d => (d.children ? 'lightsteelblue' : '#fff'))
        .style('stroke', '#ccc')
        .on('mouseover', function(event, d) {
            d3.select(this).classed('highlight', true)
        })
        .on('mouseout', function(event, d) {
            d3.select(this).classed('highlight', false)
        })
        // Добавляем текст только если ширина прямоугольника позволяет разместить его
    cell
        .append('text')
        .attr('dx', 4)
        .attr('dy', function(d) {
            return (d.y1 - d.y0) / 2 + 4
        })
        .text(d => {
            const rectWidth = d.x1 - d.x0
            return rectWidth < 50 ? '' : d.data.name
        })
        .attr('font-size', '12px')
        .style('fill', 'black')
}

// 4. Sunburst диаграмма с зумированием
function renderSunburst(rootData) {
    const svg = d3.select('#vizSVG'),
        width = +svg.attr('width'),
        height = +svg.attr('height'),
        radius = Math.min(width, height) / 2
    svg.selectAll('*').remove()

    const container = svg
        .append('g')
        .attr('class', 'zoom-container')
        .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')')
    svg.call(
        d3.zoom().on('zoom', event => {
            container.attr('transform', event.transform)
        })
    )

    svg.attr('viewBox', [-width / 2, -height / 2, width, height])
    let root = d3.hierarchy(rootData).sum(d => 1)
    d3.partition().size([2 * Math.PI, radius])(root)
    const arc = d3
        .arc()
        .startAngle(d => d.x0)
        .endAngle(d => d.x1)
        .innerRadius(d => d.y0)
        .outerRadius(d => d.y1)
    container
        .selectAll('path')
        .data(root.descendants())
        .enter()
        .append('path')
        .attr('display', d => (d.depth ? null : 'none'))
        .attr('d', arc)
        .style('stroke', '#fff')
        .style('fill', d => (d.children ? 'lightsteelblue' : '#fff'))
        .on('mouseover', function(event, d) {
            d3.select(this).classed('highlight', true)
        })
        .on('mouseout', function(event, d) {
            d3.select(this).classed('highlight', false)
        })
}

// 5. Классическая диаграмма оргструктуры с зумированием и увеличенной дистанцией между уровнями
function renderOrgChart(rootData) {
    const svg = d3.select('#vizSVG'),
        width = +svg.attr('width'),
        height = +svg.attr('height'),
        margin = { top: 50, right: 150, bottom: 50, left: 150 }

    const container = svg
        .append('g')
        .attr('class', 'zoom-container')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
    svg.call(
        d3.zoom().on('zoom', event => {
            container.attr('transform', event.transform)
        })
    )

    const treelayout = d3
        .tree()
        .size([
            width - margin.left - margin.right,
            height - margin.top - margin.bottom,
        ])
    let root = d3.hierarchy(rootData, d => d.children)
    const treeData = treelayout(root)
    treeData.descendants().forEach(d => {
        d.y = d.depth * 220
    })
    const links = treeData.links()
    container
        .selectAll('path.link')
        .data(links)
        .enter()
        .append('path')
        .attr(
            'd',
            d3
            .linkHorizontal()
            .x(d => d.y)
            .y(d => d.x)
        )
    const node = container
        .selectAll('g.node')
        .data(treeData.descendants())
        .enter()
        .append('g')
        .attr('class', 'node')
        .attr('transform', d => 'translate(' + d.y + ',' + d.x + ')')
    node
        .append('circle')
        .attr('r', 10)
        .style('fill', d => (d.children ? 'lightsteelblue' : '#fff'))
        .on('mouseover', function(event, d) {
            highlightAncestorsOrg(d, true)
        })
        .on('mouseout', function(event, d) {
            highlightAncestorsOrg(d, false)
        })
    node
        .append('text')
        .attr('dy', '.35em')
        .attr('x', d => (d.children ? -15 : 15))
        .attr('text-anchor', d => (d.children ? 'end' : 'start'))
        .text(d => d.data.name)
        .style('fill', d => {
            if (
                window.searchQuery &&
                d.data.name.toLowerCase().includes(window.searchQuery)
            ) {
                return 'red'
            }
            return 'black'
        })

    function highlightAncestorsOrg(d, highlight) {
        let current = d
        while (current) {
            container
                .selectAll('g.node')
                .filter(n => n === current)
                .select('circle')
                .classed('highlight', highlight)
            current = current.parent
        }
    }
}

// 6. Сводные карточки: очищается контейнер, затем создаются карточки
function renderSummaryCards(rootData) {
    function countDescendants(d) {
        if (!d.children || d.children.length === 0) return 0
        let count = d.children.length
        d.children.forEach(child => (count += countDescendants(child)))
        return count
    }
    let root = d3.hierarchy(rootData, d => d.children)
    let cards = []
    root.each(d => {
        let count = countDescendants(d.data)
        cards.push({ name: d.data.name, total: count + 1 })
    })
    const container = d3
        .select('#vizContainer')
        .append('div')
        .attr('id', 'cardsContainer')
    const card = container
        .selectAll('div.card')
        .data(cards)
        .enter()
        .append('div')
        .attr('class', 'card')
    card.append('h4').text(d => d.name)
    card.append('p').text(d => 'Количество сотрудников: ' + d.total)
}

// Обновление мини-карты: простое представление дерева
function updateMinimap() {
    d3.select('#minimapSVG').selectAll('*').remove()
    const svg = d3.select('#minimapSVG'),
        width = +svg.attr('width'),
        height = +svg.attr('height')
    if (!window.hierarchyData) return
    const treelayout = d3.tree().size([height, width])
    let root = d3.hierarchy(window.hierarchyData, d => d.children)
    root = treelayout(root)
    const links = root.links()
    svg
        .selectAll('line')
        .data(links)
        .enter()
        .append('line')
        .attr('x1', d => d.source.y)
        .attr('y1', d => d.source.x)
        .attr('x2', d => d.target.y)
        .attr('y2', d => d.target.x)
        .attr('stroke', '#ccc')
    svg
        .selectAll('circle')
        .data(root.descendants())
        .enter()
        .append('circle')
        .attr('cx', d => d.y)
        .attr('cy', d => d.x)
        .attr('r', 2)
        .attr('fill', 'steelblue')
}