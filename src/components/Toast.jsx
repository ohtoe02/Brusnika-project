import { useState, useEffect, useCallback, useMemo, createContext, useContext } from 'react'
import { FiCheck, FiX, FiInfo, FiAlertTriangle, FiXCircle } from 'react-icons/fi'

const Toast = ({ 
  message, 
  type = 'info', 
  duration = 4000, 
  onClose,
  position = 'top-right' 
}) => {
  const [isVisible, setIsVisible] = useState(true)
  const [isExiting, setIsExiting] = useState(false)

  const handleClose = useCallback(() => {
    setIsExiting(true)
    setTimeout(() => {
      setIsVisible(false)
      onClose && onClose()
    }, 300)
  }, [onClose])

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [duration, handleClose])

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <FiCheck size={18} />
      case 'error':
        return <FiXCircle size={18} />
      case 'warning':
        return <FiAlertTriangle size={18} />
      default:
        return <FiInfo size={18} />
    }
  }

  const getStyles = () => {
    const baseStyles = `
      max-w-sm w-full p-4 rounded-xl shadow-xl border
      transition-all duration-300 ease-in-out
      ${isExiting ? 'opacity-0 transform translate-x-2' : 'opacity-100 transform translate-x-0'}
    `

    switch (type) {
      case 'success':
        return `${baseStyles} 
          bg-emerald-50 dark:bg-emerald-900/20 
          border-emerald-200 dark:border-emerald-700
          text-emerald-800 dark:text-emerald-300`
      case 'error':
        return `${baseStyles} 
          bg-red-50 dark:bg-red-900/20 
          border-red-200 dark:border-red-700
          text-red-800 dark:text-red-300`
      case 'warning':
        return `${baseStyles} 
          bg-amber-50 dark:bg-amber-900/20 
          border-amber-200 dark:border-amber-700
          text-amber-800 dark:text-amber-300`
      default:
        return `${baseStyles} 
          bg-blue-50 dark:bg-blue-900/20 
          border-blue-200 dark:border-blue-700
          text-blue-800 dark:text-blue-300`
    }
  }

  const getPositionStyles = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4'
      case 'top-center':
        return 'top-4 left-1/2 transform -translate-x-1/2'
      case 'top-right':
        return 'top-4 right-4'
      case 'bottom-left':
        return 'bottom-4 left-4'
      case 'bottom-center':
        return 'bottom-4 left-1/2 transform -translate-x-1/2'
      case 'bottom-right':
        return 'bottom-4 right-4'
      default:
        return 'top-4 right-4'
    }
  }

  if (!isVisible) return null

  return (
    <div className={`fixed z-50 ${getPositionStyles()}`}>
      <div className={getStyles()}>
        <div className="flex items-start">
          <div className="flex-shrink-0 mr-3 mt-0.5">
            {getIcon()}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">{message}</p>
          </div>
          <button
            onClick={handleClose}
            className="flex-shrink-0 ml-3 opacity-60 hover:opacity-100 transition-opacity duration-200"
          >
            <FiX size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}

// Toast Provider Context

const ToastContext = createContext()

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'info', options = {}) => {
    const id = Date.now() + Math.random()
    const toast = {
      id,
      message,
      type,
      ...options
    }

    setToasts(prev => [...prev, toast])
    return id
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const showSuccess = useCallback((message, options) => addToast(message, 'success', options), [addToast])
  const showError = useCallback((message, options) => addToast(message, 'error', options), [addToast])
  const showWarning = useCallback((message, options) => addToast(message, 'warning', options), [addToast])
  const showInfo = useCallback((message, options) => addToast(message, 'info', options), [addToast])

  const contextValue = useMemo(() => ({
    addToast,
    removeToast,
    showSuccess,
    showError,
    showWarning,
    showInfo
  }), [addToast, removeToast, showSuccess, showError, showWarning, showInfo])

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          {...toast}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </ToastContext.Provider>
  )
}

export default Toast 