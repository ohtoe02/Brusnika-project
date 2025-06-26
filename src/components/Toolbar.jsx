import { forwardRef } from 'react'

/**
 * Toolbar - компонент панели инструментов для группировки ActionButton
 * Основан на лучших практиках Carbon Design System и Salesforce Lightning
 */
const Toolbar = forwardRef(({
  children,
  position = 'top-left',
  orientation = 'horizontal',
  spacing = 'md',
  background = 'glass',
  className = '',
  'aria-label': ariaLabel = 'Панель инструментов',
  ...props
}, ref) => {

  // Стили для позиционирования
  const positionStyles = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2',
    'center': 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2',
    'relative': ''
  }

  // Стили для ориентации
  const orientationStyles = {
    horizontal: 'flex-row',
    vertical: 'flex-col'
  }

  // Стили для расстояний
  const spacingStyles = {
    xs: orientation === 'horizontal' ? 'gap-1' : 'gap-1',
    sm: orientation === 'horizontal' ? 'gap-1.5' : 'gap-1.5',
    md: orientation === 'horizontal' ? 'gap-2' : 'gap-2',
    lg: orientation === 'horizontal' ? 'gap-3' : 'gap-3',
    xl: orientation === 'horizontal' ? 'gap-4' : 'gap-4'
  }

  // Стили для фона
  const backgroundStyles = {
    glass: `
      bg-white/80 dark:bg-neutral-800/80
      backdrop-blur-md backdrop-saturate-150
      border border-neutral-200/50 dark:border-neutral-700/50
      shadow-lg shadow-neutral-900/10 dark:shadow-neutral-900/30
    `,
    solid: `
      bg-white dark:bg-neutral-800
      border border-neutral-200 dark:border-neutral-700
      shadow-lg
    `,
    floating: `
      bg-white dark:bg-neutral-800
      border border-neutral-200 dark:border-neutral-700
      shadow-xl shadow-neutral-900/20 dark:shadow-neutral-900/40
      ring-1 ring-neutral-900/5 dark:ring-neutral-100/5
    `,
    minimal: `
      bg-transparent
    `,
    dark: `
      bg-neutral-900/90 dark:bg-neutral-900/90
      backdrop-blur-md
      border border-neutral-700/50
      shadow-lg
    `
  }

  // Базовые стили
  const baseStyles = `
    flex items-center
    rounded-xl
    p-2
    transition-all duration-300 ease-in-out
    z-50
  `

  // Стили для позиционирования (fixed или relative)
  const positionType = position === 'relative' ? 'relative' : 'fixed'

  // Объединяем все стили
  const toolbarClasses = `
    ${positionType}
    ${positionStyles[position]}
    ${baseStyles}
    ${orientationStyles[orientation]}
    ${spacingStyles[spacing]}
    ${backgroundStyles[background]}
    ${className}
  `.trim().replace(/\s+/g, ' ')

  return (
    <div
      ref={ref}
      className={toolbarClasses}
      role="toolbar"
      aria-label={ariaLabel}
      {...props}
    >
      {children}
    </div>
  )
})

/**
 * ToolbarGroup - компонент для группировки связанных кнопок внутри Toolbar
 */
const ToolbarGroup = forwardRef(({
  children,
  separator = false,
  className = '',
  'aria-label': ariaLabel,
  ...props
}, ref) => {
  
  const groupClasses = `
    flex items-center gap-1
    ${separator ? 'border-r border-neutral-300 dark:border-neutral-600 pr-2 mr-2' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ')

  return (
    <div
      ref={ref}
      className={groupClasses}
      role="group"
      aria-label={ariaLabel}
      {...props}
    >
      {children}
    </div>
  )
})

/**
 * ToolbarSeparator - разделитель для Toolbar
 */
const ToolbarSeparator = ({ orientation = 'vertical', className = '' }) => {
  const separatorClasses = orientation === 'vertical' 
    ? `w-px h-6 bg-neutral-300 dark:bg-neutral-600 ${className}`
    : `h-px w-6 bg-neutral-300 dark:bg-neutral-600 ${className}`

  return (
    <div
      className={separatorClasses}
      role="separator"
      aria-orientation={orientation}
    />
  )
}

Toolbar.displayName = 'Toolbar'
ToolbarGroup.displayName = 'ToolbarGroup'
ToolbarSeparator.displayName = 'ToolbarSeparator'

// Экспортируем компоненты
Toolbar.Group = ToolbarGroup
Toolbar.Separator = ToolbarSeparator

export default Toolbar
export { ToolbarGroup, ToolbarSeparator } 