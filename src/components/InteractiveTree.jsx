import * as d3 from 'd3'
import { useEffect, useMemo, useRef, useState } from 'react'
import { TREE_CONFIG } from '../constants/treeConfig'
import '../styles/foundHighlight.css'
import { InteractiveTree } from '../visualizations/interactiveTree'
import { MiniMap } from './MiniMap'
import TreeSearch from './TreeSearch'
import TreeToolbar from './TreeToolbar'
import NodeTooltip from './NodeTooltip'
import { useTheme } from '../contexts/ThemeContext'
import { useVisualizationSettings } from '../contexts/VisualizationSettingsContext'
import { useVisualizationSync } from '../hooks/useVisualizationSync'
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts'
import { useResponsive } from '../hooks/useResponsive'

export function InteractiveTreeComponent({
	data,
	width,
	height,
	searchQuery,
	settings = {},
	showSearchBar,
	setShowSearchBar,
	setSearchValue,
	onPathChange,
	treeInstanceRef,
}) {
	const svgRef = useRef(null)
	const [_currentPath, setCurrentPath] = useState(null)
	const [treeInstance, setTreeInstance] = useState(null)
	const [searchResults, setSearchResults] = useState([])
	const [currentResultIndex, setCurrentResultIndex] = useState(-1)
	const [isSearching, setIsSearching] = useState(false)
	
	// Состояние для tooltip
	const [tooltip, setTooltip] = useState({
		isVisible: false,
		node: null,
		position: { x: 0, y: 0 }
	})
	
	// Мобильная адаптивность
	const { isMobile, isTablet } = useResponsive()
	
	const { theme } = useTheme()
	const { treeConfig } = useVisualizationSettings()

	// Объединяем настройки: дефолтные + переданные + из контекста
	const mergedSettings = useMemo(
		() => ({ ...TREE_CONFIG, ...settings, ...treeConfig }),
		[settings, treeConfig]
	)

	useEffect(() => {
		if (!data || !svgRef.current) return

		const svg = d3.select(svgRef.current)
		const margin = { top: 20, right: 90, bottom: 30, left: 90 }

		const tree = new InteractiveTree(
			svg,
			data,
			width,
			height,
			searchQuery,
			margin,
			mergedSettings,
			theme
		)

		// Создаем сетку с текущей темой
		tree.createGrid(theme)

		tree.onPathChange = path => {
			setCurrentPath(path)
			if (onPathChange) {
				onPathChange(path)
			}
		}

		// Сохраняем экземпляр дерева в ref для доступа из поиска
		if (treeInstanceRef) {
			treeInstanceRef.current = tree
		}
		setTreeInstance(tree)

		return () => {
			if (treeInstanceRef && treeInstanceRef.current === tree) {
				treeInstanceRef.current = null
			}
		}
	}, [data, width, height, searchQuery, mergedSettings])

	// Синхронизируем настройки визуализации в реальном времени
	// Перемещаем после создания экземпляра
	useVisualizationSync(treeInstanceRef, !!treeInstance)

	// Принудительно обновляем стили при изменении treeConfig
	useEffect(() => {
		console.log('🔄 treeConfig changed:', treeConfig)
		if (treeInstance && treeConfig) {
			console.log('🔄 Applying treeConfig to existing instance')
			// Применяем только стили для быстрого обновления
			if (typeof treeInstance.updateStyles === 'function') {
				treeInstance.updateStyles(treeConfig)
			} else if (typeof treeInstance.updateSettings === 'function') {
				treeInstance.updateSettings(treeConfig)
			}
		}
	}, [treeInstance, treeConfig])

	// Обновляем настройки дерева при их изменении
	useEffect(() => {
		if (treeInstance) {
			treeInstance.updateSettings(mergedSettings)
		}
	}, [treeInstance, mergedSettings])

	// Обновляем тему при ее изменении
	useEffect(() => {
		if (treeInstance) {
			treeInstance.updateTheme(theme)
		}
	}, [treeInstance, theme])

	// Убираем автоматический поиск при изменении searchValue
	// Поиск теперь происходит только при нажатии Enter в App.jsx

	// Обработка клавиш
	useEffect(() => {
		const handleKeyDown = e => {
			if (e.key === 'Escape' && showSearchBar) {
				setShowSearchBar(false)
				setSearchValue('')
			}
		}

		document.addEventListener('keydown', handleKeyDown)
		return () => document.removeEventListener('keydown', handleKeyDown)
	}, [showSearchBar, setShowSearchBar, setSearchValue])

	// Обработчики для поиска
	const handleSearch = async (query) => {
		if (!treeInstance || !query || query.length < 2) {
			setSearchResults([])
			setCurrentResultIndex(-1)
			if (treeInstance) {
				treeInstance.clearSearchHighlight()
			}
			return
		}

		setIsSearching(true)
		
		try {
			// Небольшая задержка для UX
			await new Promise(resolve => setTimeout(resolve, 200))
			
			const results = treeInstance.searchNodes(query)
			setSearchResults(results)
			
			if (results.length > 0) {
				setCurrentResultIndex(0)
				treeInstance.highlightSearchResults(results, 0)
			} else {
				setCurrentResultIndex(-1)
				treeInstance.clearSearchHighlight()
			}
		} finally {
			setIsSearching(false)
		}
	}

	const handleClearSearch = () => {
		setSearchResults([])
		setCurrentResultIndex(-1)
		if (treeInstance) {
			treeInstance.clearSearchHighlight()
		}
	}

	const handleNavigate = (index) => {
		if (searchResults.length === 0 || index < 0 || index >= searchResults.length) return
		
		setCurrentResultIndex(index)
		if (treeInstance) {
			treeInstance.navigateToSearchResult(searchResults, index)
		}
	}

	// Обработчики для Toolbar
	const handleReset = () => {
		if (treeInstance) {
			// Сбрасываем состояние дерева и масштаб
			treeInstance.collapseAll()
			setTimeout(() => {
				treeInstance.resetZoom()
				treeInstance.centerTree()
			}, 100)
		}
	}

	const handleZoomIn = () => {
		if (treeInstance) {
			treeInstance.zoomIn()
		}
	}

	const handleZoomOut = () => {
		if (treeInstance) {
			treeInstance.zoomOut()
		}
	}

	const handleCenter = () => {
		if (treeInstance) {
			treeInstance.centerTree()
		}
	}

	// Обработчики для tooltip
	const showTooltip = (node, event) => {
		// На мобильных устройствах не показываем tooltip при обычном hover
		if (isMobile) return
		
		setTooltip({
			isVisible: true,
			node: node,
			position: {
				x: event.clientX,
				y: event.clientY
			}
		})
	}

	const hideTooltip = () => {
		setTooltip({
			isVisible: false,
			node: null,
			position: { x: 0, y: 0 }
		})
	}

	// Дополнительная защита от "залипания" tooltip
	useEffect(() => {
		const handleGlobalMouseMove = (event) => {
			// Проверяем, находится ли курсор над SVG элементом дерева
			if (tooltip.isVisible && svgRef.current) {
				const svgRect = svgRef.current.getBoundingClientRect()
				const isOverSvg = (
					event.clientX >= svgRect.left &&
					event.clientX <= svgRect.right &&
					event.clientY >= svgRect.top &&
					event.clientY <= svgRect.bottom
				)
				
				// Если курсор не над SVG, скрываем tooltip
				if (!isOverSvg) {
					hideTooltip()
				}
			}
		}

		const handleGlobalClick = () => {
			// Скрываем tooltip при любом клике
			if (tooltip.isVisible) {
				hideTooltip()
			}
		}

		if (tooltip.isVisible) {
			document.addEventListener('mousemove', handleGlobalMouseMove)
			document.addEventListener('click', handleGlobalClick)
			return () => {
				document.removeEventListener('mousemove', handleGlobalMouseMove)
				document.removeEventListener('click', handleGlobalClick)
			}
		}
	}, [tooltip.isVisible])

	// Настройка tooltip обработчиков при создании дерева
	useEffect(() => {
		if (treeInstance) {
			// Используем новый метод для установки tooltip обработчиков
			treeInstance.setupTooltipHandlers(showTooltip, hideTooltip, isMobile)
		}
	}, [treeInstance, isMobile])

	// Функции для экспорта (для горячих клавиш)
	const handleExportPNG = () => {
		// Найдем TreeToolbar и вызовем его метод экспорта
		if (treeInstance) {
			// Можно добавить прямой вызов экспорта или использовать ref
			console.log('Export PNG triggered by shortcut')
		}
	}

	const handleExportSVG = () => {
		if (treeInstance) {
			console.log('Export SVG triggered by shortcut')
		}
	}

	const handleExportJSON = () => {
		if (treeInstance) {
			console.log('Export JSON triggered by shortcut')
		}
	}

	// Функция для открытия поиска
	const handleOpenSearch = () => {
		setShowSearchBar?.(true)
	}

	// Интеграция горячих клавиш
	useKeyboardShortcuts({
		treeInstance,
		onSearch: handleOpenSearch,
		onExpandAll: () => treeInstance?.expandAll(),
		onCollapseAll: () => treeInstance?.collapseAll(),
		onZoomIn: handleZoomIn,
		onZoomOut: handleZoomOut,
		onCenter: handleCenter,
		onReset: handleReset,
		onExportPNG: handleExportPNG,
		onExportSVG: handleExportSVG,
		onExportJSON: handleExportJSON,
		searchResults,
		currentResultIndex,
		onNavigateSearch: handleNavigate
	})

	// Адаптивная логика для мобильных устройств
	const getMobileLayout = () => {
		if (isMobile) {
			return {
				toolbarPosition: 'bottom-center',
				searchPosition: 'top-center', 
				minimapPosition: 'hidden',
				tooltipDelay: 800, // Больше задержка на мобильных
				showKeyboardHints: false
			}
		} else if (isTablet) {
			return {
				toolbarPosition: 'top-right',
				searchPosition: 'top-left',
				minimapPosition: 'bottom-left',
				tooltipDelay: 600,
				showKeyboardHints: true
			}
		} else {
			return {
				toolbarPosition: 'top-right',
				searchPosition: 'top-left',
				minimapPosition: 'bottom-left',
				tooltipDelay: 500,
				showKeyboardHints: true
			}
		}
	}

	const layout = getMobileLayout()

	// Мобильный обработчик для показа информации об узле
	const showMobileNodeInfo = (node, event) => {
		if (isMobile) {
			// На мобильных показываем tooltip по тапу
			setTooltip({
				isVisible: true,
				node: node,
				position: {
					x: event.touches ? event.touches[0].clientX : event.clientX,
					y: event.touches ? event.touches[0].clientY : event.clientY
				}
			})
			
			// Автоматически скрываем tooltip через 3 секунды на мобильных
			setTimeout(() => {
				hideTooltip()
			}, 3000)
		}
	}

	// Настройка touch событий для мобильных устройств
	useEffect(() => {
		if (treeInstance && isMobile) {
			// Переопределяем обработчики для touch событий
			const originalClick = treeInstance.handleNodeClick.bind(treeInstance)
			
			treeInstance.handleNodeClick = function(event, d) {
				// Двойной тап для сворачивания/разворачивания
				originalClick(event, d)
				
				// Показываем информацию об узле при длинном нажатии
				if (event.type === 'touchend') {
					showMobileNodeInfo(d, event)
				}
			}
		}
	}, [treeInstance, isMobile])

	return (
		<div className='interactive-tree-container relative'>
			{/* Адаптивный Toolbar */}
			{layout.toolbarPosition === 'bottom-center' ? (
				<div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-10">
					<TreeToolbar
						treeInstance={treeInstance}
						onReset={handleReset}
						onZoomIn={handleZoomIn}
						onZoomOut={handleZoomOut}
						onCenter={handleCenter}
						className="flex-row bg-neutral-900/95 backdrop-blur-md"
					/>
				</div>
			) : (
				<div className="absolute top-4 right-4 z-10">
					<TreeToolbar
						treeInstance={treeInstance}
						onReset={handleReset}
						onZoomIn={handleZoomIn}
						onZoomOut={handleZoomOut}
						onCenter={handleCenter}
					/>
				</div>
			)}

			{/* Адаптивный поиск */}
			{layout.searchPosition === 'top-center' ? (
				<div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
					<TreeSearch
						onSearch={handleSearch}
						onClear={handleClearSearch}
						onNavigate={handleNavigate}
						searchResults={searchResults}
						currentResultIndex={currentResultIndex}
						isSearching={isSearching}
					/>
				</div>
			) : (
				<div className="absolute top-4 left-4 z-10">
					<TreeSearch
						onSearch={handleSearch}
						onClear={handleClearSearch}
						onNavigate={handleNavigate}
						searchResults={searchResults}
						currentResultIndex={currentResultIndex}
						isSearching={isSearching}
					/>
				</div>
			)}



			{/* Мобильная подсказка */}
			{isMobile && (
				<div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
					<div className="bg-neutral-800/80 text-white text-sm px-4 py-2 rounded-lg backdrop-blur-sm text-center">
						<p className="opacity-90">
							Тап - выбор узла<br/>
							Двойной тап - сворачивание/разворачивание<br/>
							Долгий тап - информация об узле
						</p>
					</div>
				</div>
			)}

			{/* Node Tooltip */}
			<NodeTooltip
				node={tooltip.node}
				position={tooltip.position}
				isVisible={tooltip.isVisible}
				onClose={hideTooltip}
			/>

			<svg
				ref={svgRef}
				width={width}
				height={height}
				style={{ 
					background: theme === 'dark' ? '#1a1a1a' : '#fafafa',
					transition: 'background 0.3s ease'
				}}
			/>
		</div>
	)
}
