import React, { useState, useCallback, useEffect } from 'react'
import { HiOutlineCheckCircle, HiOutlineExclamationTriangle, HiOutlineInformationCircle, HiOutlinePlay } from 'react-icons/hi2'

export default function DataValidator({ data, onValidationComplete }) {
  const [validationResults, setValidationResults] = useState(null)
  const [isValidating, setIsValidating] = useState(false)

  // Правила валидации
  const validationRules = [
    {
      id: 'structure',
      name: 'Структура данных',
      description: 'Проверка базовой структуры дерева',
      validate: (data) => {
        const errors = []
        const warnings = []
        
        if (!data) {
          errors.push('Данные отсутствуют')
          return { valid: false, errors, warnings }
        }

        if (typeof data !== 'object') {
          errors.push('Данные должны быть объектом')
          return { valid: false, errors, warnings }
        }

        if (!data.name && !data.children) {
          errors.push('Корневой узел должен содержать поле "name" или "children"')
        }

        return { valid: errors.length === 0, errors, warnings }
      }
    },
    {
      id: 'nodes',
      name: 'Валидация узлов',
      description: 'Проверка структуры узлов дерева',
      validate: (data) => {
        const errors = []
        const warnings = []
        let nodeCount = 0

        const validateNode = (node, path = 'root') => {
          nodeCount++

          if (!node.name || typeof node.name !== 'string') {
            errors.push(`Узел ${path}: отсутствует или некорректное поле "name"`)
          }

          if (node.name && node.name.trim().length === 0) {
            warnings.push(`Узел ${path}: пустое название`)
          }

          if (node.description && typeof node.description !== 'string') {
            warnings.push(`Узел ${path}: некорректный тип поля "description"`)
          }

          if (node.children) {
            if (!Array.isArray(node.children)) {
              errors.push(`Узел ${path}: поле "children" должно быть массивом`)
            } else {
              node.children.forEach((child, index) => {
                validateNode(child, `${path}.children[${index}]`)
              })
            }
          }
        }

        validateNode(data)

        if (nodeCount > 1000) {
          warnings.push(`Большое количество узлов (${nodeCount}). Это может влиять на производительность`)
        }

        return { valid: errors.length === 0, errors, warnings, nodeCount }
      }
    }
  ]

  // Запуск валидации
  const runValidation = useCallback(async () => {
    if (!data) {
      setValidationResults(null)
      return
    }

    setIsValidating(true)
    
    try {
      const results = []
      
      for (const rule of validationRules) {
        await new Promise(resolve => setTimeout(resolve, 100))
        
        const result = rule.validate(data)
        results.push({
          ...rule,
          ...result,
          timestamp: new Date().toISOString()
        })
      }

      const finalResults = {
        timestamp: new Date().toISOString(),
        rules: results,
        summary: {
          totalRules: results.length,
          passed: results.filter(r => r.valid && r.errors.length === 0).length,
          warnings: results.reduce((acc, r) => acc + r.warnings.length, 0),
          errors: results.reduce((acc, r) => acc + r.errors.length, 0),
          isValid: results.every(r => r.valid)
        }
      }

      setValidationResults(finalResults)
      onValidationComplete?.(finalResults)
      
    } catch (error) {
      console.error('Ошибка валидации:', error)
    } finally {
      setIsValidating(false)
    }
  }, [data, onValidationComplete])

  // Автоматическая валидация при изменении данных
  useEffect(() => {
    if (data) {
      runValidation()
    }
  }, [data, runValidation])

  const getSeverityIcon = (errors, warnings) => {
    if (errors > 0) {
      return <HiOutlineExclamationTriangle className="w-5 h-5 text-red-500" />
    } else if (warnings > 0) {
      return <HiOutlineInformationCircle className="w-5 h-5 text-yellow-500" />
    } else {
      return <HiOutlineCheckCircle className="w-5 h-5 text-green-500" />
    }
  }

  const getSeverityColor = (errors, warnings) => {
    if (errors > 0) return 'red'
    if (warnings > 0) return 'yellow'
    return 'green'
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <HiOutlineInformationCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Нет данных для валидации
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Загрузите или создайте данные дерева для проведения валидации
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Валидация данных
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Проверка структуры и качества данных дерева
          </p>
        </div>

        <button
          onClick={runValidation}
          disabled={isValidating}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isValidating ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
          ) : (
            <HiOutlinePlay className="w-4 h-4 mr-2" />
          )}
          {isValidating ? 'Выполняется...' : 'Запустить валидацию'}
        </button>
      </div>

      {validationResults && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Сводка результатов
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {validationResults.summary.totalRules}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Всего правил
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {validationResults.summary.passed}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Пройдено
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {validationResults.summary.warnings}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Предупреждений
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {validationResults.summary.errors}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Ошибок
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 rounded-md bg-gray-50 dark:bg-gray-700">
            <div className="flex items-center">
              {getSeverityIcon(validationResults.summary.errors, validationResults.summary.warnings)}
              <span className="ml-2 font-medium text-gray-900 dark:text-white">
                {validationResults.summary.isValid ? 'Данные прошли валидацию' : 'Обнаружены проблемы'}
              </span>
            </div>
          </div>
        </div>
      )}

      {validationResults && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Детальные результаты
          </h3>
          
          {validationResults.rules.map((rule) => {
            const severity = getSeverityColor(rule.errors.length, rule.warnings.length)
            
            return (
              <div
                key={rule.id}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    {getSeverityIcon(rule.errors.length, rule.warnings.length)}
                    
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        {rule.name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {rule.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className={`px-2 py-1 rounded text-xs font-medium ${
                    severity === 'red' 
                      ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                      : severity === 'yellow'
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                      : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                  }`}>
                    {rule.valid ? 'Пройдено' : 'Ошибка'}
                  </div>
                </div>

                {rule.errors.length > 0 && (
                  <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
                    <h5 className="text-sm font-medium text-red-900 dark:text-red-400 mb-2">
                      Ошибки ({rule.errors.length})
                    </h5>
                    <ul className="text-sm text-red-800 dark:text-red-300 space-y-1">
                      {rule.errors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {rule.warnings.length > 0 && (
                  <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
                    <h5 className="text-sm font-medium text-yellow-900 dark:text-yellow-400 mb-2">
                      Предупреждения ({rule.warnings.length})
                    </h5>
                    <ul className="text-sm text-yellow-800 dark:text-yellow-300 space-y-1">
                      {rule.warnings.map((warning, index) => (
                        <li key={index}>• {warning}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {rule.nodeCount && (
                  <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                    Узлов: {rule.nodeCount}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {isValidating && (
        <div className="text-center py-8">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Выполняется валидация данных...
          </p>
        </div>
      )}
    </div>
  )
}
