import { useState, useRef, useEffect } from 'react'
import { 
    MdExpandMore, 
    MdExpandLess, 
    MdFileDownload, 
    MdZoomIn,
    MdZoomOut,
    MdCenterFocusStrong,
    MdRefresh,
    MdClose,
    MdChevronLeft,
    MdChevronRight
} from 'react-icons/md'
import { 
    HiOutlineDocumentArrowDown,
    HiOutlineArrowsPointingOut,
    HiOutlineArrowsPointingIn,
    HiOutlineMagnifyingGlassPlus,
    HiOutlineMagnifyingGlassMinus,
    HiOutlineArrowPath
} from 'react-icons/hi2'
import { BsFiletypeJson, BsFiletypeSvg, BsFiletypePng } from 'react-icons/bs'
import { useTheme } from '../contexts/ThemeContext'


const TreeToolbar = ({ 
    treeInstance, 
    onExpandAll, 
    onCollapseAll, 
    onReset,
    onZoomIn,
    onZoomOut,
    onCenter,
    className = ''
}) => {
    const { theme } = useTheme()
    const [isExporting, setIsExporting] = useState(false)
    const [exportDropdownOpen, setExportDropdownOpen] = useState(false)
    const [isCollapsed, setIsCollapsed] = useState(false)
    const exportRef = useRef(null)

    // Закрытие dropdown при клике вне
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (exportRef.current && !exportRef.current.contains(event.target)) {
                setExportDropdownOpen(false)
            }
        }

        if (exportDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside)
            return () => document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [exportDropdownOpen])



        // Экспорт в PNG напрямую из SVG (без html2canvas)
    const exportToPNG = async () => {
        if (!treeInstance) return
        
        setIsExporting(true)
        
        try {
            const svgElement = treeInstance.svg.node()
            
            // Получаем размеры SVG
            const svgRect = svgElement.getBoundingClientRect()
            const scale = 2 // Высокое качество
            const width = svgRect.width * scale
            const height = svgRect.height * scale
            
            // Создаем canvas
            const canvas = document.createElement('canvas')
            canvas.width = width
            canvas.height = height
            const ctx = canvas.getContext('2d')
            
            // Прозрачный фон (альфа-канал)
            ctx.clearRect(0, 0, width, height)
            
            // Клонируем SVG и обрабатываем стили
            const clonedSvg = svgElement.cloneNode(true)
            
                         // Получаем цвета в зависимости от текущей темы
             const getThemeColors = () => {
                 if (theme === 'dark') {
                     return {
                         nodeBackground: '#374151',
                         nodeBorder: '#60a5fa',
                         nodeText: '#f3f4f6',
                         linkStroke: '#6b7280',
                         rootBackground: '#1e40af',
                         rootBorder: '#3b82f6',
                         rootText: '#ffffff',
                         leafBackground: '#1f2937',
                         leafBorder: '#4b5563',
                         leafText: '#d1d5db',
                         collapsedBackground: '#111827',
                         collapsedBorder: '#6b7280',
                         collapsedText: '#9ca3af',
                         badgeBackground: '#f59e0b',
                         badgeBorder: '#374151',
                         badgeText: '#ffffff'
                     }
                 } else {
                     return {
                         nodeBackground: '#ffffff',
                         nodeBorder: '#2563eb',
                         nodeText: '#1f2937',
                         linkStroke: '#cbd5e1',
                         rootBackground: '#4f46e5',
                         rootBorder: '#4c51bf',
                         rootText: '#ffffff',
                         leafBackground: '#f8fafc',
                         leafBorder: '#cbd5e1',
                         leafText: '#6b7280',
                         collapsedBackground: '#f1f5f9',
                         collapsedBorder: '#64748b',
                         collapsedText: '#64748b',
                         badgeBackground: '#f59e0b',
                         badgeBorder: '#ffffff',
                         badgeText: '#ffffff'
                     }
                 }
             }
             
             const colors = getThemeColors()
             
             // Добавляем встроенные стили для корректного отображения
             const styleElement = document.createElementNS('http://www.w3.org/2000/svg', 'style')
             styleElement.textContent = `
                 .node-rect { 
                     fill: ${colors.nodeBackground} !important; 
                     stroke: ${colors.nodeBorder} !important; 
                     stroke-width: 2px !important; 
                     filter: drop-shadow(0 2px 8px rgba(37, 99, 235, 0.15)) !important;
                 }
                 .node-text { 
                     fill: ${colors.nodeText} !important; 
                     font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important; 
                     font-size: 14px !important; 
                     font-weight: 500 !important; 
                     text-rendering: optimizeLegibility !important;
                 }
                 .link { 
                     fill: none !important; 
                     stroke: ${colors.linkStroke} !important; 
                     stroke-width: 2px !important; 
                 }
                 /* Корневой узел */
                 .root-node .node-rect {
                     fill: ${colors.rootBackground} !important;
                     stroke: ${colors.rootBorder} !important;
                     stroke-width: 3px !important;
                 }
                 .root-node .node-text {
                     fill: ${colors.rootText} !important;
                     font-weight: 700 !important;
                     font-size: 16px !important;
                 }
                 /* Листовые узлы */
                 .node--leaf .node-rect {
                     fill: ${colors.leafBackground} !important;
                     stroke: ${colors.leafBorder} !important;
                 }
                 .node--leaf .node-text {
                     fill: ${colors.leafText} !important;
                 }
                 /* Свернутые узлы */
                 .collapsed .node-rect {
                     fill: ${colors.collapsedBackground} !important;
                     stroke: ${colors.collapsedBorder} !important;
                 }
                 .collapsed .node-text {
                     fill: ${colors.collapsedText} !important;
                 }
                 /* Кнопки сворачивания */
                 .badge-circle {
                     fill: ${colors.badgeBackground} !important;
                     stroke: ${colors.badgeBorder} !important;
                     stroke-width: 2px !important;
                 }
                 .badge-count-bg {
                     fill: ${colors.collapsedBackground} !important;
                     stroke: ${colors.badgeBorder} !important;
                     stroke-width: 1.5px !important;
                 }
                 .badge-icon, .badge-count-text {
                     fill: ${colors.badgeText} !important;
                     font-family: monospace !important;
                     font-weight: bold !important;
                 }
             `
             clonedSvg.insertBefore(styleElement, clonedSvg.firstChild)
             
             // Принудительно применяем стили к элементам
             const applyStylesToElements = (svg) => {
                 // Узлы
                 const nodeRects = svg.querySelectorAll('.node-rect, rect')
                 nodeRects.forEach(rect => {
                     if (!rect.getAttribute('fill') || rect.getAttribute('fill') === 'none') {
                         rect.setAttribute('fill', '#ffffff')
                         rect.setAttribute('stroke', '#2563eb')
                         rect.setAttribute('stroke-width', '2')
                     }
                 })
                 
                 // Текст
                 const nodeTexts = svg.querySelectorAll('.node-text, text')
                 nodeTexts.forEach(text => {
                     if (!text.getAttribute('fill') || text.getAttribute('fill') === 'none') {
                         text.setAttribute('fill', '#1f2937')
                     }
                 })
                 
                 // Связи
                 const links = svg.querySelectorAll('.link, path')
                 links.forEach(link => {
                     if (!link.getAttribute('stroke') || link.getAttribute('stroke') === 'none') {
                         link.setAttribute('stroke', '#cbd5e1')
                         link.setAttribute('stroke-width', '2')
                         link.setAttribute('fill', 'none')
                     }
                 })
             }
             
             applyStylesToElements(clonedSvg)
            
            // Устанавливаем размеры для клонированного SVG
            clonedSvg.setAttribute('width', svgRect.width)
            clonedSvg.setAttribute('height', svgRect.height)
            clonedSvg.setAttribute('viewBox', `0 0 ${svgRect.width} ${svgRect.height}`)
            
            // Сериализуем SVG и конвертируем современные цвета
            let svgData = new XMLSerializer().serializeToString(clonedSvg)
            
            // Заменяем современные CSS цвета на совместимые
            svgData = svgData
                .replace(/oklch\([^)]+\)/g, '#3b82f6')
                .replace(/color-mix\([^)]+\)/g, '#6b7280')
                .replace(/lab\([^)]+\)/g, '#374151')
                .replace(/lch\([^)]+\)/g, '#1f2937')
            
            // Создаем Blob и URL для изображения
            const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
            const url = URL.createObjectURL(svgBlob)
            
            // Создаем изображение и рисуем на canvas
            const img = new Image()
            
            img.onload = () => {
                // Рисуем изображение на canvas с масштабированием
                ctx.drawImage(img, 0, 0, width, height)
                
                // Создаем ссылку для скачивания
                canvas.toBlob(blob => {
                    const downloadUrl = URL.createObjectURL(blob)
                    const link = document.createElement('a')
                    link.href = downloadUrl
                    link.download = `tree-visualization-${new Date().toISOString().slice(0, 10)}.png`
                    document.body.appendChild(link)
                    link.click()
                    document.body.removeChild(link)
                    
                    // Очищаем URL
                    URL.revokeObjectURL(url)
                    URL.revokeObjectURL(downloadUrl)
                    
                    setIsExporting(false)
                    setExportDropdownOpen(false)
                }, 'image/png')
            }
            
            img.onerror = (error) => {
                console.error('Ошибка загрузки SVG для PNG экспорта:', error)
                URL.revokeObjectURL(url)
                alert('Ошибка создания изображения. Попробуйте экспорт в SVG формате.')
                setIsExporting(false)
                setExportDropdownOpen(false)
            }
            
            img.src = url
            
        } catch (error) {
            console.error('Ошибка экспорта PNG:', error)
            alert('Ошибка экспорта PNG. Попробуйте экспорт в SVG формате.')
            setIsExporting(false)
            setExportDropdownOpen(false)
        }
    }

    // Экспорт в SVG
    const exportToSVG = () => {
        if (!treeInstance) return
        
        try {
            const svgElement = treeInstance.svg.node()
            const svgData = new XMLSerializer().serializeToString(svgElement)
            const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
            
            const link = document.createElement('a')
            link.download = `tree-visualization-${new Date().toISOString().slice(0, 10)}.svg`
            link.href = URL.createObjectURL(svgBlob)
            link.click()
            
            URL.revokeObjectURL(link.href)
        } catch (error) {
            console.error('Ошибка экспорта SVG:', error)
        } finally {
            setExportDropdownOpen(false)
        }
    }

    // Экспорт в JSON
    const exportToJSON = () => {
        if (!treeInstance || !treeInstance.root) return
        
        try {
            const treeState = treeInstance.saveTreeState()
            const exportData = {
                timestamp: new Date().toISOString(),
                treeData: treeInstance.root.data,
                expandedNodes: treeState,
                settings: treeInstance.settings
            }
            
            const jsonBlob = new Blob([JSON.stringify(exportData, null, 2)], { 
                type: 'application/json' 
            })
            
            const link = document.createElement('a')
            link.download = `tree-data-${new Date().toISOString().slice(0, 10)}.json`
            link.href = URL.createObjectURL(jsonBlob)
            link.click()
            
            URL.revokeObjectURL(link.href)
        } catch (error) {
            console.error('Ошибка экспорта JSON:', error)
        } finally {
            setExportDropdownOpen(false)
        }
    }

    const handleExpandAll = () => {
        if (treeInstance && typeof treeInstance.expandAll === 'function') {
            treeInstance.expandAll()
        } else if (onExpandAll) {
            onExpandAll()
        }
    }

    const handleCollapseAll = () => {
        if (treeInstance && typeof treeInstance.collapseAll === 'function') {
            treeInstance.collapseAll()
        } else if (onCollapseAll) {
            onCollapseAll()
        }
    }

    // Современная кнопка с улучшенным дизайном
    const ToolbarButton = ({ 
        icon: IconComponent, // eslint-disable-line
        onClick, 
        tooltip, 
        disabled = false,
        isActive = false,
        isPrimary = false,
        children 
    }) => (
        <button
            onClick={onClick}
            disabled={disabled || isExporting}
            className={`
                group relative w-12 h-12 rounded-xl transition-all duration-200 ease-out
                flex items-center justify-center
                ${disabled || isExporting 
                    ? 'opacity-40 cursor-not-allowed' 
                    : 'hover:scale-105 active:scale-95 cursor-pointer'
                }
                ${isPrimary
                    ? 'bg-blue-500/20 border-blue-400/30 text-blue-300 hover:bg-blue-500/30 hover:border-blue-400/50'
                    : isActive 
                    ? 'bg-white/20 border-white/40 text-white' 
                    : 'bg-white/8 border-white/15 text-white/80 hover:bg-white/15 hover:border-white/25 hover:text-white'
                }
                border backdrop-blur-sm
                focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-1 focus:ring-offset-transparent
            `}
            title={tooltip}
        >
            <IconComponent className="w-5 h-5 flex-shrink-0" />
            {children}
            
            {/* Tooltip */}
            <div className="absolute right-full mr-3 px-3 py-2 bg-gray-900/95 text-white text-sm rounded-lg 
                           opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none
                           whitespace-nowrap z-50 shadow-lg border border-gray-700/50 backdrop-blur-sm">
                {tooltip}
                <div className="absolute left-full top-1/2 -translate-y-1/2 w-0 h-0 
                               border-l-4 border-l-gray-900/95 border-t-4 border-t-transparent 
                               border-b-4 border-b-transparent"></div>
            </div>
        </button>
    )

    // Компактная группа кнопок
    const ButtonGroup = ({ children, className: groupClassName = '' }) => (
        <div className={`flex flex-col gap-2 ${groupClassName}`}>
            {children}
        </div>
    )

    // Разделитель
    const Divider = () => (
        <div className="h-px bg-white/8 my-2"></div>
    )

    return (
        <>
            {/* Современная компактная вертикальная панель справа */}
            <div className={`fixed right-8 top-1/2 -translate-y-1/2 z-40 ${className}`}>
                <div className={`
                    flex flex-col gap-3 p-4 
                    bg-gray-900/40 backdrop-blur-2xl border border-white/10 
                    rounded-2xl shadow-2xl
                    transition-all duration-300 ease-out
                    ${isCollapsed ? 'w-16' : 'w-20'}
                `}>
                    
                    {/* Кнопка сворачивания/разворачивания */}
                    <div className="flex justify-center mb-2">
                        <button
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className="w-10 h-8 rounded-lg bg-white/8 hover:bg-white/15 
                                     border border-white/15 hover:border-white/25
                                     flex items-center justify-center text-white/60 hover:text-white/80
                                     transition-all duration-200"
                            title={isCollapsed ? 'Развернуть панель' : 'Свернуть панель'}
                        >
                            {isCollapsed ? (
                                <MdChevronLeft className="w-4 h-4" />
                            ) : (
                                <MdChevronRight className="w-4 h-4" />
                            )}
                        </button>
                    </div>

                    {!isCollapsed && (
                        <>
                            {/* Основная группа: Управление структурой */}
                            <ButtonGroup>
                                <ToolbarButton
                                    icon={HiOutlineArrowsPointingOut}
                                    onClick={handleExpandAll}
                                    tooltip="Развернуть все"
                                />
                                
                                <ToolbarButton
                                    icon={HiOutlineArrowsPointingIn}
                                    onClick={handleCollapseAll}
                                    tooltip="Свернуть все"
                                />
                            </ButtonGroup>

                            <Divider />

                            {/* Группа: Навигация и масштаб */}
                            <ButtonGroup>
                                <ToolbarButton
                                    icon={HiOutlineMagnifyingGlassPlus}
                                    onClick={onZoomIn}
                                    tooltip="Увеличить"
                                    disabled={!onZoomIn}
                                />
                                
                                <ToolbarButton
                                    icon={HiOutlineMagnifyingGlassMinus}
                                    onClick={onZoomOut}
                                    tooltip="Уменьшить"
                                    disabled={!onZoomOut}
                                />
                                
                                <ToolbarButton
                                    icon={MdCenterFocusStrong}
                                    onClick={onCenter}
                                    tooltip="По центру"
                                    disabled={!onCenter}
                                />
                            </ButtonGroup>

                            <Divider />

                            {/* Группа: Действия */}
                            <ButtonGroup>
                                <ToolbarButton
                                    icon={HiOutlineArrowPath}
                                    onClick={onReset}
                                    tooltip="Сбросить"
                                    disabled={!onReset}
                                />
                                
                                {/* Экспорт с выпадающим меню */}
                                <div className="relative" ref={exportRef}>
                                    <ToolbarButton
                                        icon={HiOutlineDocumentArrowDown}
                                        onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
                                        tooltip="Экспорт"
                                        isActive={exportDropdownOpen}
                                        isPrimary={true}
                                    />

                                    {/* Современное компактное выпадающее меню */}
                                    {exportDropdownOpen && (
                                        <div className="absolute right-full mr-3 top-0 
                                                       bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 
                                                       rounded-xl shadow-2xl py-2 z-50 min-w-[200px]
                                                       animate-in slide-in-from-right-2 duration-200">
                                            
                                            <div className="px-3 py-2 text-xs font-medium text-gray-400 border-b border-gray-700/30">
                                                Экспорт
                                            </div>
                                            
                                            <button
                                                onClick={exportToPNG}
                                                disabled={isExporting}
                                                className="w-full px-3 py-2.5 text-left text-sm text-white hover:bg-white/10 
                                                         flex items-center gap-3 disabled:opacity-50 transition-colors group"
                                            >
                                                <BsFiletypePng className="text-green-400 w-5 h-5 flex-shrink-0" />
                                                <div>
                                                    <div className="font-medium text-sm">PNG</div>
                                                    <div className="text-xs text-gray-400">Изображение</div>
                                                </div>
                                            </button>
                                            
                                            <button
                                                onClick={exportToSVG}
                                                disabled={isExporting}
                                                className="w-full px-3 py-2.5 text-left text-sm text-white hover:bg-white/10 
                                                         flex items-center gap-3 disabled:opacity-50 transition-colors group"
                                            >
                                                <BsFiletypeSvg className="text-purple-400 w-5 h-5 flex-shrink-0" />
                                                <div>
                                                    <div className="font-medium text-sm">SVG</div>
                                                    <div className="text-xs text-gray-400">Векторный</div>
                                                </div>
                                            </button>
                                            
                                            <button
                                                onClick={exportToJSON}
                                                disabled={isExporting}
                                                className="w-full px-3 py-2.5 text-left text-sm text-white hover:bg-white/10 
                                                         flex items-center gap-3 disabled:opacity-50 transition-colors group"
                                            >
                                                <BsFiletypeJson className="text-yellow-400 w-5 h-5 flex-shrink-0" />
                                                <div>
                                                    <div className="font-medium text-sm">JSON</div>
                                                    <div className="text-xs text-gray-400">Данные</div>
                                                </div>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </ButtonGroup>
                        </>
                    )}
                </div>
            </div>

            {/* Улучшенный индикатор загрузки экспорта */}
            {isExporting && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
                    <div className="bg-gray-900/95 rounded-2xl p-6 flex flex-col items-center gap-3 shadow-2xl border border-gray-700/50 backdrop-blur-xl">
                        <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                        <div className="text-white font-medium text-sm">Экспорт...</div>
                    </div>
                </div>
            )}
        </>
    )
}

export default TreeToolbar 