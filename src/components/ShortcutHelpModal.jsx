import { FiX, FiCommand, FiSearch, FiSun, FiKey } from 'react-icons/fi'

const ShortcutHelpModal = ({ isOpen, onClose }) => {
  const shortcuts = [
    {
      key: 'Ctrl + K',
      description: 'Открыть поиск',
      icon: <FiSearch size={16} />
    },
    {
      key: 'Ctrl + T',
      description: 'Переключить тему',
      icon: <FiSun size={16} />
    },
    {
      key: 'Escape',
      description: 'Закрыть поиск/модалы',
      icon: <FiX size={16} />
    },
    {
      key: 'Любая буква',
      description: 'Начать поиск',
      icon: <FiKey size={16} />
    }
  ]

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md mx-4">
        <div className="
          bg-white dark:bg-neutral-800 
          border border-neutral-200 dark:border-neutral-700
          rounded-2xl shadow-2xl
          overflow-hidden
          transform transition-all duration-300 ease-out
        ">
          {/* Header */}
          <div className="
            bg-gradient-to-r from-primary-500 to-primary-600
            px-6 py-4 text-white
            flex items-center justify-between
          ">
            <div className="flex items-center space-x-2">
              <FiCommand size={20} />
              <h2 className="text-lg font-semibold">Клавиатурные шорткаты</h2>
            </div>
            <button
              onClick={onClose}
              className="
                p-1 hover:bg-white/20 rounded-lg
                transition-colors duration-200
              "
            >
              <FiX size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="space-y-4">
              {shortcuts.map((shortcut, index) => (
                <div key={index} className="
                  flex items-center justify-between
                  p-3 rounded-lg
                  bg-neutral-50 dark:bg-neutral-700/50
                  border border-neutral-200 dark:border-neutral-600
                ">
                  <div className="flex items-center space-x-3">
                    <div className="
                      w-8 h-8 rounded-lg
                      bg-primary-100 dark:bg-primary-900/30
                      text-primary-600 dark:text-primary-400
                      flex items-center justify-center
                    ">
                      {shortcut.icon}
                    </div>
                    <span className="
                      text-sm text-neutral-700 dark:text-neutral-300
                    ">
                      {shortcut.description}
                    </span>
                  </div>
                  <div className="
                    px-3 py-1 rounded-md
                    bg-neutral-200 dark:bg-neutral-600
                    text-xs font-mono font-medium
                    text-neutral-700 dark:text-neutral-300
                    border border-neutral-300 dark:border-neutral-500
                  ">
                    {shortcut.key}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-600">
              <p className="text-xs text-neutral-500 dark:text-neutral-400 text-center">
                Нажмите <span className="font-mono bg-neutral-200 dark:bg-neutral-700 px-1 rounded">?</span> для повторного отображения этой справки
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ShortcutHelpModal 