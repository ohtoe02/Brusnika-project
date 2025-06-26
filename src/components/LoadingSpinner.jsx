import { memo } from 'react'

// Основной спиннер
export const LoadingSpinner = memo(({ size = 'md', variant = 'primary', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8', 
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  }

  const variantClasses = {
    primary: 'border-blue-500 border-t-transparent',
    secondary: 'border-neutral-400 border-t-transparent',
    accent: 'border-purple-500 border-t-transparent'
  }

  return (
    <div 
      className={`
        ${sizeClasses[size]} 
        ${variantClasses[variant]}
        border-2 rounded-full animate-spin
        ${className}
      `}
      role="status"
      aria-label="Загрузка..."
    >
      <span className="sr-only">Загрузка...</span>
    </div>
  )
})

LoadingSpinner.displayName = 'LoadingSpinner'

// Полноэкранный лоадер
export const FullScreenLoader = memo(({ message = 'Загрузка...', showSpinner = true }) => {
  return (
    <div className="
      fixed inset-0 z-50
      bg-white/80 dark:bg-neutral-900/80
      backdrop-blur-sm
      flex items-center justify-center
      transition-all duration-300
    ">
      <div className="
        flex flex-col items-center space-y-4
        bg-white dark:bg-neutral-800
        rounded-2xl shadow-2xl
        px-8 py-6
        border border-neutral-200 dark:border-neutral-700
      ">
        {showSpinner && <LoadingSpinner size="lg" />}
        <p className="text-neutral-700 dark:text-neutral-300 font-medium">
          {message}
        </p>
      </div>
    </div>
  )
})

FullScreenLoader.displayName = 'FullScreenLoader'

// Скелетон для дерева
export const TreeSkeleton = memo(() => {
  return (
    <div className="w-full h-full p-6 space-y-4 animate-pulse">
      {/* Корневой узел */}
      <div className="flex justify-center">
        <div className="w-32 h-8 bg-neutral-300 dark:bg-neutral-600 rounded-lg"></div>
      </div>
      
      {/* Ветки первого уровня */}
      <div className="flex justify-center space-x-8">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex flex-col items-center space-y-2">
            <div className="w-24 h-6 bg-neutral-200 dark:bg-neutral-700 rounded"></div>
            <div className="w-1 h-8 bg-neutral-200 dark:bg-neutral-700"></div>
          </div>
        ))}
      </div>
      
      {/* Ветки второго уровня */}
      <div className="flex justify-center space-x-4">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="flex flex-col items-center space-y-1">
            <div className="w-16 h-4 bg-neutral-100 dark:bg-neutral-800 rounded"></div>
            <div className="w-px h-4 bg-neutral-100 dark:bg-neutral-800"></div>
          </div>
        ))}
      </div>
      
      {/* Индикатор загрузки */}
      <div className="flex justify-center pt-4">
        <LoadingSpinner size="sm" variant="secondary" />
      </div>
    </div>
  )
})

TreeSkeleton.displayName = 'TreeSkeleton'

// Компактный лоадер для компонентов
export const ComponentLoader = memo(({ 
  height = 'h-64', 
  message = 'Загрузка компонента...',
  showSkeleton = false 
}) => {
  return (
    <div className={`
      ${height} w-full
      flex items-center justify-center
      bg-neutral-50 dark:bg-neutral-900
      rounded-xl border border-neutral-200 dark:border-neutral-700
      transition-all duration-300
    `}>
      {showSkeleton ? (
        <TreeSkeleton />
      ) : (
        <div className="flex flex-col items-center space-y-3">
          <LoadingSpinner size="md" variant="primary" />
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            {message}
          </p>
        </div>
      )}
    </div>
  )
})

ComponentLoader.displayName = 'ComponentLoader'

// Лоадер с прогрессом
export const ProgressLoader = memo(({ progress = 0, message = 'Загрузка...', showProgress = true }) => {
  return (
    <div className="
      flex flex-col items-center space-y-4
      p-6 bg-white dark:bg-neutral-800
      rounded-xl shadow-lg
      border border-neutral-200 dark:border-neutral-700
    ">
      <LoadingSpinner size="lg" />
      
      <div className="text-center space-y-2">
        <p className="font-medium text-neutral-900 dark:text-neutral-100">
          {message}
        </p>
        
        {showProgress && (
          <>
            <div className="w-48 h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 transition-all duration-300 ease-out"
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              />
            </div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {Math.round(progress)}%
            </p>
          </>
        )}
      </div>
    </div>
  )
})

ProgressLoader.displayName = 'ProgressLoader' 