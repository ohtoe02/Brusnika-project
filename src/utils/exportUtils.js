/**
 * Утилиты для экспорта визуализации
 */

/**
 * Конвертирует современные CSS цвета в совместимые с экспортом
 * @param {string} svgData - SVG данные в виде строки
 * @returns {string} Обработанные SVG данные
 */
function convertModernColorsInSVG(svgData) {
    // Заменяем oklch и другие современные цветовые функции
    return svgData
        .replace(/oklch\([^)]+\)/g, '#3b82f6') // Заменяем oklch на синий
        .replace(/color-mix\([^)]+\)/g, '#6b7280') // Заменяем color-mix на серый
        .replace(/lab\([^)]+\)/g, '#374151') // Заменяем lab на темно-серый
        .replace(/lch\([^)]+\)/g, '#1f2937') // Заменяем lch на очень темный
}

/**
 * Экспортирует SVG в PNG
 * @param {SVGElement} svgElement - SVG элемент для экспорта
 * @param {string} filename - Имя файла
 * @param {number} scale - Масштаб экспорта (по умолчанию 2 для высокого качества)
 */
export function exportToPNG(
    svgElement,
    filename = 'visualization.png',
    scale = 2
) {
    return new Promise((resolve, reject) => {
        try {
            // Получаем размеры SVG
            const svgRect = svgElement.getBoundingClientRect()
            const width = svgRect.width * scale
            const height = svgRect.height * scale

            // Создаем canvas
            const canvas = document.createElement('canvas')
            canvas.width = width
            canvas.height = height
            const ctx = canvas.getContext('2d')

            // Устанавливаем светло-серый фон для лучшего контраста
            ctx.fillStyle = '#f8fafc'
            ctx.fillRect(0, 0, width, height)

            // Сериализуем SVG и конвертируем современные цвета
            let svgData = new XMLSerializer().serializeToString(svgElement)
            svgData = convertModernColorsInSVG(svgData)
            
            const svgBlob = new Blob([svgData], {
                type: 'image/svg+xml;charset=utf-8',
            })
            const url = URL.createObjectURL(svgBlob)

            // Создаем изображение
            const img = new Image()
            img.onload = () => {
                // Рисуем изображение на canvas с масштабированием
                ctx.drawImage(img, 0, 0, width, height)

                // Создаем ссылку для скачивания
                canvas.toBlob(blob => {
                    const downloadUrl = URL.createObjectURL(blob)
                    const link = document.createElement('a')
                    link.href = downloadUrl
                    link.download = filename
                    document.body.appendChild(link)
                    link.click()
                    document.body.removeChild(link)

                    // Очищаем URL
                    URL.revokeObjectURL(url)
                    URL.revokeObjectURL(downloadUrl)
                    resolve()
                }, 'image/png')
            }

            img.onerror = (error) => {
                URL.revokeObjectURL(url)
                console.error('Ошибка загрузки изображения для PNG экспорта:', error)
                reject(new Error('Ошибка загрузки изображения. Возможно, используются неподдерживаемые CSS цвета.'))
            }

            img.src = url
        } catch (error) {
            console.error('Ошибка экспорта PNG:', error)
            reject(error)
        }
    })
}

/**
 * Экспортирует SVG в SVG файл
 * @param {SVGElement} svgElement - SVG элемент для экспорта
 * @param {string} filename - Имя файла
 */
export function exportToSVG(svgElement, filename = 'visualization.svg') {
    try {
        // Клонируем SVG для обработки
        const clonedSvg = svgElement.cloneNode(true)

        // Добавляем стили напрямую в SVG
        const styles = getComputedStyles(svgElement)
        addStylesToSVG(clonedSvg, styles)

        // Сериализуем SVG
        const svgData = new XMLSerializer().serializeToString(clonedSvg)
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })

        // Создаем ссылку для скачивания
        const url = URL.createObjectURL(svgBlob)
        const link = document.createElement('a')
        link.href = url
        link.download = filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        // Очищаем URL
        URL.revokeObjectURL(url)
    } catch (error) {
        console.error('Ошибка экспорта SVG:', error)
        throw error
    }
}

/**
 * Получает вычисленные стили для SVG элементов
 * @param {SVGElement} svgElement - SVG элемент
 * @returns {Object} Объект со стилями
 */
function getComputedStyles(svgElement) {
    const styles = {}
    const elements = svgElement.querySelectorAll('*')

    elements.forEach((element, index) => {
        const computedStyle = window.getComputedStyle(element)
        const elementStyles = {}

        // Копируем важные стили
        const importantProps = [
            'fill',
            'stroke',
            'stroke-width',
            'font-family',
            'font-size',
            'font-weight',
            'opacity',
            'transform',
        ]

        importantProps.forEach(prop => {
            const value = computedStyle.getPropertyValue(prop)
            if (value && value !== 'none') {
                elementStyles[prop] = value
            }
        })

        if (Object.keys(elementStyles).length > 0) {
            styles[`element-${index}`] = {
                element,
                styles: elementStyles,
            }
        }
    })

    return styles
}

/**
 * Добавляет стили напрямую в SVG элементы
 * @param {SVGElement} svgElement - SVG элемент
 * @param {Object} styles - Объект со стилями
 */
function addStylesToSVG(svgElement, styles) {
    Object.values(styles).forEach(({ element, styles: elementStyles }) => {
        const targetElement = svgElement.querySelector(
            element.tagName +
            ':nth-child(' +
            (Array.from(element.parentNode.children).indexOf(element) + 1) +
            ')'
        )

        if (targetElement) {
            Object.entries(elementStyles).forEach(([prop, value]) => {
                targetElement.style[prop] = value
            })
        }
    })
}

/**
 * Создает кнопку экспорта для добавления в интерфейс
 * @param {SVGElement} svgElement - SVG элемент для экспорта
 * @param {string} containerSelector - Селектор контейнера для кнопки
 */
export function createExportButton(
    svgElement,
    containerSelector = '.control-panel'
) {
    const container = document.querySelector(containerSelector)
    if (!container) return

    // Создаем контейнер для кнопок экспорта
    const exportContainer = document.createElement('div')
    exportContainer.className = 'export-controls'
    exportContainer.innerHTML = `
        <div class="export-buttons">
            <button class="export-btn export-png" title="Экспорт в PNG">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                </svg>
                PNG
            </button>
            <button class="export-btn export-svg" title="Экспорт в SVG">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                </svg>
                SVG
            </button>
        </div>
    `

    // Добавляем обработчики событий
    const pngBtn = exportContainer.querySelector('.export-png')
    const svgBtn = exportContainer.querySelector('.export-svg')

    pngBtn.addEventListener('click', async() => {
        try {
            pngBtn.disabled = true
            pngBtn.textContent = 'Экспорт...'
            await exportToPNG(svgElement)
            pngBtn.textContent = 'PNG'
        } catch (error) {
            console.error('Ошибка экспорта PNG:', error)
            alert('Ошибка экспорта в PNG')
        } finally {
            pngBtn.disabled = false
        }
    })

    svgBtn.addEventListener('click', () => {
        try {
            exportToSVG(svgElement)
        } catch (error) {
            console.error('Ошибка экспорта SVG:', error)
            alert('Ошибка экспорта в SVG')
        }
    })

    container.appendChild(exportContainer)
    return exportContainer
}