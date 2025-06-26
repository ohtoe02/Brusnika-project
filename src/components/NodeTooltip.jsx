import { useState, useEffect } from 'react'
import { MdInfo, MdAccountTree, MdLayers } from 'react-icons/md'
import { FiUsers, FiFolder, FiFile } from 'react-icons/fi'

const NodeTooltip = ({ node, position, isVisible, onClose }) => {
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })

    useEffect(() => {
        if (position && isVisible) {
            // Вычисляем оптимальную позицию tooltip с учетом границ экрана
            const tooltipWidth = 280
            const tooltipHeight = 150
            const margin = 10

            let x = position.x + 15 // Смещение от курсора
            let y = position.y - tooltipHeight / 2

            // Проверяем правую границу экрана
            if (x + tooltipWidth > window.innerWidth - margin) {
                x = position.x - tooltipWidth - 15
            }

            // Проверяем верхнюю и нижнюю границы
            if (y < margin) {
                y = margin
            } else if (y + tooltipHeight > window.innerHeight - margin) {
                y = window.innerHeight - tooltipHeight - margin
            }

            setTooltipPosition({ x, y })
        }
    }, [position, isVisible])

    // Обработчик клавиши Escape для закрытия tooltip
    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === 'Escape' && isVisible) {
                onClose()
            }
        }

        if (isVisible) {
            document.addEventListener('keydown', handleEscape)
            return () => document.removeEventListener('keydown', handleEscape)
        }
    }, [isVisible, onClose])

    if (!isVisible || !node) return null

    // Определяем тип узла для иконки
    const getNodeIcon = () => {
        if (node.depth === 0) return <MdAccountTree className="text-blue-500" />
        if (node.children || node._children) return <FiFolder className="text-yellow-500" />
        return <FiFile className="text-gray-500" />
    }

    // Получаем информацию о детях
    const getChildrenInfo = () => {
        const totalChildren = (node.children?.length || 0) + (node._children?.length || 0)
        const visibleChildren = node.children?.length || 0
        const hiddenChildren = node._children?.length || 0

        return { totalChildren, visibleChildren, hiddenChildren }
    }

    const childrenInfo = getChildrenInfo()

    // Определяем статус узла
    const getNodeStatus = () => {
        if (node.depth === 0) return 'Корневой узел'
        if (childrenInfo.totalChildren === 0) return 'Листовой узел'
        if (childrenInfo.hiddenChildren > 0) return 'Свернутый узел'
        return 'Развернутый узел'
    }

    return (
        <>
            {/* Backdrop для закрытия tooltip */}
            <div 
                className="fixed inset-0 z-40 pointer-events-auto"
                onClick={onClose}
                style={{ background: 'transparent' }}
            />
            
            {/* Tooltip */}
            <div
                className="fixed z-50 pointer-events-auto"
                style={{
                    left: `${tooltipPosition.x}px`,
                    top: `${tooltipPosition.y}px`,
                }}
                onClick={(e) => e.stopPropagation()} // Предотвращаем закрытие при клике на tooltip
            >
                <div className="
                    bg-white dark:bg-neutral-800 
                    border border-neutral-200 dark:border-neutral-600
                    rounded-lg shadow-xl
                    p-4 max-w-xs
                    ui-element tooltip-enter-active
                    backdrop-blur-sm
                ">
                    {/* Заголовок с иконкой */}
                    <div className="flex items-start gap-3 mb-3">
                        <div className="flex-shrink-0 mt-0.5">
                            {getNodeIcon()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm leading-tight">
                                {node.data.name}
                            </h3>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                                {getNodeStatus()}
                            </p>
                        </div>
                    </div>

                    {/* Информация об узле */}
                    <div className="space-y-2">
                        {/* Уровень и глубина */}
                        <div className="flex items-center gap-2 text-xs">
                            <MdLayers className="text-purple-500 flex-shrink-0" />
                            <span className="text-neutral-600 dark:text-neutral-400">
                                Уровень {node.depth} • Глубина {node.depth + 1}
                            </span>
                        </div>

                        {/* Информация о детях */}
                        {childrenInfo.totalChildren > 0 && (
                            <div className="flex items-center gap-2 text-xs">
                                <FiUsers className="text-green-500 flex-shrink-0" />
                                <span className="text-neutral-600 dark:text-neutral-400">
                                    {childrenInfo.totalChildren} дочерних узлов
                                    {childrenInfo.hiddenChildren > 0 && (
                                        <span className="text-amber-600 dark:text-amber-400">
                                            {' '}({childrenInfo.hiddenChildren} скрыто)
                                        </span>
                                    )}
                                </span>
                            </div>
                        )}

                        {/* Дополнительная информация из данных */}
                        {node.data.description && (
                            <div className="pt-2 border-t border-neutral-200 dark:border-neutral-600">
                                <div className="flex items-start gap-2">
                                    <MdInfo className="text-blue-500 flex-shrink-0 mt-0.5" size={12} />
                                    <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                                        {node.data.description}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Метаданные */}
                        {(node.data.type || node.data.size || node.data.modified) && (
                            <div className="pt-2 border-t border-neutral-200 dark:border-neutral-600">
                                <div className="grid grid-cols-2 gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                                    {node.data.type && (
                                        <div>
                                            <span className="font-medium">Тип:</span> {node.data.type}
                                        </div>
                                    )}
                                    {node.data.size && (
                                        <div>
                                            <span className="font-medium">Размер:</span> {node.data.size}
                                        </div>
                                    )}
                                    {node.data.modified && (
                                        <div className="col-span-2">
                                            <span className="font-medium">Изменен:</span> {node.data.modified}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Подсказка для взаимодействия */}
                    <div className="mt-3 pt-2 border-t border-neutral-200 dark:border-neutral-600">
                        <p className="text-xs text-neutral-400 dark:text-neutral-500 text-center">
                            {childrenInfo.totalChildren > 0 
                                ? 'Кликните для сворачивания/разворачивания'
                                : 'Листовой узел'
                            }
                        </p>
                    </div>
                </div>

                {/* Стрелка tooltip */}
                <div className="absolute top-1/2 -left-2 transform -translate-y-1/2">
                    <div className="w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-neutral-200 dark:border-r-neutral-600"></div>
                    <div className="w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-white dark:border-r-neutral-800 absolute -top-4 left-px"></div>
                </div>
            </div>
        </>
    )
}

export default NodeTooltip 