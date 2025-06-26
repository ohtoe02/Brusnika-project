import { forwardRef } from 'react'

/**
 * ActionButton - компонент кнопки, основанный на лучших UI/UX практиках
 * Carbon Design System и Salesforce Lightning Design System
 */
const ActionButton = forwardRef(({
  children,
  variant = 'secondary',
  size = 'md',
  disabled = false,
  loading = false,
  icon: IconComponent,
  iconPosition = 'left',
  iconOnly = false,
  tooltip,
  className = '',
  onClick,
  onFocus,
  onBlur,
  onKeyDown,
  'aria-label': ariaLabel,
  'data-testid': testId,
  ...props
}, ref) => {
  
  // Базовые стили компонента
  const baseStyles = `
    inline-flex items-center justify-center
    font-medium text-sm leading-5
    border border-transparent
    transition-all duration-200 ease-in-out
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    relative overflow-hidden
  `

  // Стили для разных вариантов
  const variantStyles = {
    primary: `
      bg-primary-600 hover:bg-primary-700 active:bg-primary-800
      text-white border-primary-600 hover:border-primary-700
      focus:ring-primary-500 dark:focus:ring-primary-400
      shadow-sm hover:shadow-md
    `,
    secondary: `
      bg-white dark:bg-neutral-800 
      text-neutral-700 dark:text-neutral-200
      border-neutral-300 dark:border-neutral-600
      hover:bg-neutral-50 dark:hover:bg-neutral-700
      hover:border-neutral-400 dark:hover:border-neutral-500
      focus:ring-primary-500 dark:focus:ring-primary-400
      shadow-sm hover:shadow-md
    `,
    tertiary: `
      bg-transparent text-primary-600 dark:text-primary-400
      border-transparent
      hover:bg-primary-50 dark:hover:bg-primary-900/20
      hover:text-primary-700 dark:hover:text-primary-300
      focus:ring-primary-500 dark:focus:ring-primary-400
    `,
    ghost: `
      bg-transparent text-neutral-600 dark:text-neutral-300
      border-transparent
      hover:bg-neutral-100 dark:hover:bg-neutral-700
      hover:text-neutral-700 dark:hover:text-neutral-200
      focus:ring-neutral-500 dark:focus:ring-neutral-400
    `,
    danger: `
      bg-red-600 hover:bg-red-700 active:bg-red-800
      text-white border-red-600 hover:border-red-700
      focus:ring-red-500 dark:focus:ring-red-400
      shadow-sm hover:shadow-md
    `,
    success: `
      bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800
      text-white border-emerald-600 hover:border-emerald-700
      focus:ring-emerald-500 dark:focus:ring-emerald-400
      shadow-sm hover:shadow-md
    `
  }

  // Стили для размеров
  const sizeStyles = {
    xs: iconOnly ? 'w-7 h-7 p-1' : 'px-2.5 py-1.5 text-xs',
    sm: iconOnly ? 'w-8 h-8 p-1.5' : 'px-3 py-2 text-sm',
    md: iconOnly ? 'w-10 h-10 p-2.5' : 'px-4 py-2.5 text-sm',
    lg: iconOnly ? 'w-12 h-12 p-3' : 'px-6 py-3 text-base',
    xl: iconOnly ? 'w-14 h-14 p-3.5' : 'px-8 py-4 text-lg'
  }

  // Стили для скругления углов
  const roundedStyles = iconOnly ? 'rounded-full' : 'rounded-lg'

  // Размеры иконок
  const iconSizes = {
    xs: 14,
    sm: 16,
    md: 18,
    lg: 20,
    xl: 24
  }

  // Объединяем все стили
  const buttonClasses = `
    ${baseStyles}
    ${variantStyles[variant]}
    ${sizeStyles[size]}
    ${roundedStyles}
    ${className}
  `.trim().replace(/\s+/g, ' ')

  // Обработчик клика с анимацией ripple
  const handleClick = (e) => {
    if (disabled || loading) return
    
    // Создаем эффект ripple
    const button = e.currentTarget
    const ripple = document.createElement('span')
    const rect = button.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height)
    const x = e.clientX - rect.left - size / 2
    const y = e.clientY - rect.top - size / 2
    
    ripple.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
      background: rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      transform: scale(0);
      animation: ripple 0.6s linear;
      pointer-events: none;
    `
    
    button.appendChild(ripple)
    setTimeout(() => ripple.remove(), 600)
    
    onClick?.(e)
  }

  // Обработчик клавиатуры для доступности
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick(e)
    }
    onKeyDown?.(e)
  }

  // Контент кнопки
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2" />
          {!iconOnly && (children || 'Загрузка...')}
        </div>
      )
    }

    if (iconOnly && IconComponent) {
      return <IconComponent size={iconSizes[size]} />
    }

    if (IconComponent && iconPosition === 'left') {
      return (
        <div className="flex items-center">
          <IconComponent size={iconSizes[size]} className="mr-2" />
          {children}
        </div>
      )
    }

    if (IconComponent && iconPosition === 'right') {
      return (
        <div className="flex items-center">
          {children}
          <IconComponent size={iconSizes[size]} className="ml-2" />
        </div>
      )
    }

    return children
  }

  const buttonElement = (
    <button
      ref={ref}
      className={buttonClasses}
      disabled={disabled || loading}
      onClick={handleClick}
      onFocus={onFocus}
      onBlur={onBlur}
      onKeyDown={handleKeyDown}
      aria-label={ariaLabel}
      data-testid={testId}
      {...props}
    >
      {renderContent()}
    </button>
  )

  // Если есть tooltip, оборачиваем в Tooltip
  if (tooltip) {
    return (
      <div className="relative group inline-block">
        {buttonElement}
        <div className="
          absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2
          px-2 py-1 text-xs text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900
          rounded whitespace-nowrap
          opacity-0 group-hover:opacity-100 group-focus-within:opacity-100
          transition-opacity duration-200 pointer-events-none
          z-50
        ">
          {tooltip}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-neutral-900 dark:border-t-neutral-100" />
        </div>
      </div>
    )
  }

  return buttonElement
})

ActionButton.displayName = 'ActionButton'

export default ActionButton 