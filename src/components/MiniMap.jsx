import { useState } from 'react'
import { FiHome, FiChevronRight, FiMap, FiEye, FiEyeOff } from 'react-icons/fi'
import { MdLocationOn } from 'react-icons/md'

export const MiniMap = ({ path, treeInstance, onNodeClick }) => {
	const [isExpanded, setIsExpanded] = useState(true)
	
	if (!path || path.length === 0) return null

	// Обработчик клика по элементу пути
	const handlePathClick = (node, index) => {
		if (treeInstance && node) {
			// Центрируем на выбранном узле
			treeInstance.centerOnNode(node)
			
			// Вызываем колбэк если есть
			if (onNodeClick) {
				onNodeClick(node, index)
			}
		}
	}

	// Получаем статистику дерева
	const getTreeStats = () => {
		if (!treeInstance || !treeInstance.root) return null
		
		let totalNodes = 0
		let visibleNodes = 0
		let maxDepth = 0
		
		treeInstance.traverseNodes(treeInstance.root, (node) => {
			totalNodes++
			if (node.children || (!node.children && !node._children)) {
				visibleNodes++
			}
			maxDepth = Math.max(maxDepth, node.depth)
		})
		
		return { totalNodes, visibleNodes, maxDepth }
	}

	const stats = getTreeStats()

	return (
		<div className="
			fixed bottom-4 left-4 z-30
			max-w-lg
			bg-white/95 dark:bg-neutral-800/95
			backdrop-blur-md
			border border-neutral-200 dark:border-neutral-600
			rounded-xl shadow-lg
			transition-all duration-300 ease-in-out
		">
			{/* Заголовок с кнопкой сворачивания */}
			<div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200 dark:border-neutral-600">
				<div className="flex items-center gap-2">
					<FiMap size={16} className="text-primary-600 dark:text-primary-400" />
					<h4 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wide">
						Навигация
					</h4>
				</div>
				
				<button
					onClick={() => setIsExpanded(!isExpanded)}
					className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
				>
					{isExpanded ? (
						<FiEyeOff size={14} className="text-neutral-500" />
					) : (
						<FiEye size={14} className="text-neutral-500" />
					)}
				</button>
			</div>

			{isExpanded && (
				<div className="p-4">
					{/* Статистика дерева */}
					{stats && (
						<div className="mb-3 p-2 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg">
							<div className="grid grid-cols-3 gap-2 text-xs text-neutral-600 dark:text-neutral-400">
								<div className="text-center">
									<div className="font-semibold text-blue-600 dark:text-blue-400">
										{stats.totalNodes}
									</div>
									<div>Всего узлов</div>
								</div>
								<div className="text-center">
									<div className="font-semibold text-green-600 dark:text-green-400">
										{stats.visibleNodes}
									</div>
									<div>Видимых</div>
								</div>
								<div className="text-center">
									<div className="font-semibold text-purple-600 dark:text-purple-400">
										{stats.maxDepth + 1}
									</div>
									<div>Уровней</div>
								</div>
							</div>
						</div>
					)}
					
					{/* Текущий путь */}
					<div className="mb-2">
						<div className="flex items-center gap-2 mb-2">
							<MdLocationOn size={14} className="text-amber-600 dark:text-amber-400" />
							<span className="text-xs font-medium text-neutral-600 dark:text-neutral-400 uppercase tracking-wide">
								Текущий путь
							</span>
						</div>
					</div>
					
					{/* Хлебные крошки с навигацией */}
					<div className="flex items-center gap-2 flex-wrap">
						{path.map((node, index) => (
							<div key={node.data.id || index} className="flex items-center gap-2">
								{/* Кликабельный элемент пути */}
								<button
									onClick={() => handlePathClick(node, index)}
									className={`
										px-3 py-1.5 rounded-lg text-sm font-medium
										transition-all duration-200 ease-in-out
										hover:scale-105 active:scale-95
										focus:outline-none focus:ring-2 focus:ring-primary-500/50
										${index === 0 
											? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md hover:shadow-lg' 
											: index === path.length - 1
											? 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-700 hover:bg-amber-200 dark:hover:bg-amber-900/50'
											: 'bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600'
										}
									`}
									title={`Перейти к узлу: ${node.data.name}`}
								>
									{node.data.name}
								</button>
								
								{/* Разделитель */}
								{index < path.length - 1 && (
									<FiChevronRight 
										size={14} 
										className="text-neutral-400 dark:text-neutral-500 flex-shrink-0" 
									/>
								)}
							</div>
						))}
					</div>
					
					{/* Расширенная информация */}
					<div className="mt-3 pt-2 border-t border-neutral-200 dark:border-neutral-600">
						<div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
							<div className="flex items-center gap-3">
								<span>Глубина: {path.length}</span>
								<div className="w-1 h-1 bg-neutral-300 dark:bg-neutral-600 rounded-full"></div>
								<span>Уровень: {path.length - 1}</span>
							</div>
							
							{/* Индикатор активного узла */}
							<div className="flex items-center gap-1">
								<div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
								<span>Активный узел</span>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}
