import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { HiOutlineCloudArrowUp, HiOutlineDocumentText, HiOutlineXMark, HiOutlineCheckCircle, HiOutlineExclamationTriangle } from 'react-icons/hi2'
import { useAppStore, useToastStore } from '../store/appStore'

export default function FileUploader() {
  const { setData } = useAppStore()
  const { showSuccess, showError } = useToastStore()
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [isProcessing, setIsProcessing] = useState(false)

  // Валидация файла
  const validateFile = useCallback((file) => {
    const maxSize = 10 * 1024 * 1024 // 10MB
    const allowedTypes = ['application/json', 'text/csv', 'text/plain']
    
    if (file.size > maxSize) {
      return {
        code: 'file-too-large',
        message: `Файл слишком большой. Максимальный размер: 10MB`
      }
    }

    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(json|csv|txt)$/i)) {
      return {
        code: 'file-invalid-type',
        message: 'Поддерживаются только файлы: JSON, CSV, TXT'
      }
    }

    return null
  }, [])

  // Парсинг JSON
  const parseJSON = useCallback((content) => {
    try {
      const parsed = JSON.parse(content)
      
      // Базовая валидация структуры
      if (typeof parsed !== 'object' || parsed === null) {
        throw new Error('JSON должен содержать объект')
      }

      // Проверяем наличие необходимых полей
      if (!parsed.name && !parsed.children && !Array.isArray(parsed)) {
        throw new Error('JSON должен содержать поле "name" или "children", либо быть массивом')
      }

      return parsed
    } catch (error) {
      throw new Error(`Ошибка парсинга JSON: ${error.message}`)
    }
  }, [])

  // Парсинг CSV
  const parseCSV = useCallback((content) => {
    try {
      const lines = content.split('\n').filter(line => line.trim())
      if (lines.length < 2) {
        throw new Error('CSV файл должен содержать заголовки и данные')
      }

      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
      const rows = lines.slice(1)

      // Проверяем наличие обязательных колонок
      const requiredColumns = ['name']
      const missingColumns = requiredColumns.filter(col => !headers.includes(col))
      if (missingColumns.length > 0) {
        throw new Error(`Отсутствуют обязательные колонки: ${missingColumns.join(', ')}`)
      }

      // Парсим строки
      const data = rows.map((row, index) => {
        const values = row.split(',').map(v => v.trim().replace(/"/g, ''))
        const item = {}
        
        headers.forEach((header, i) => {
          item[header] = values[i] || ''
        })

        if (!item.name) {
          throw new Error(`Строка ${index + 2}: отсутствует название`)
        }

        return item
      })

      // Конвертируем в иерархическую структуру
      const tree = {
        name: "Imported Tree",
        description: "Дерево, импортированное из CSV",
        children: data.map(item => ({
          name: item.name,
          description: item.description || '',
          children: []
        }))
      }

      return tree
    } catch (error) {
      throw new Error(`Ошибка парсинга CSV: ${error.message}`)
    }
  }, [])

  // Обработка файлов
  const processFile = useCallback(async (file) => {
    setIsProcessing(true)
    
    try {
             const content = await new Promise((resolve, reject) => {
         const reader = new FileReader()
         reader.onload = (e) => resolve(e.target.result)
         reader.onerror = () => reject(new Error('Ошибка чтения файла'))
         reader.readAsText(file, 'utf-8')
       })

      let parsedData
      const fileExtension = file.name.split('.').pop().toLowerCase()

      switch (fileExtension) {
        case 'json':
          parsedData = parseJSON(content)
          break
        case 'csv':
          parsedData = parseCSV(content)
          break
        case 'txt':
          // Пытаемся определить формат по содержимому
          if (content.trim().startsWith('{') || content.trim().startsWith('[')) {
            parsedData = parseJSON(content)
          } else if (content.includes(',')) {
            parsedData = parseCSV(content)
          } else {
            throw new Error('Неизвестный формат текстового файла')
          }
          break
        default:
          throw new Error('Неподдерживаемый формат файла')
      }

      // Обновляем данные в store
      setData(parsedData)
      
      // Обновляем список загруженных файлов
      setUploadedFiles(prev => prev.map(f => 
        f.file === file 
          ? { ...f, status: 'success', data: parsedData }
          : f
      ))

      showSuccess(`Файл "${file.name}" успешно загружен и обработан`)
      
    } catch (error) {
      // Обновляем статус файла как ошибка
      setUploadedFiles(prev => prev.map(f => 
        f.file === file 
          ? { ...f, status: 'error', error: error.message }
          : f
      ))
      
      showError(error.message)
    } finally {
      setIsProcessing(false)
    }
  }, [setData, parseJSON, parseCSV, showSuccess, showError])

  // Обработка drop
  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    // Обрабатываем отклоненные файлы
    rejectedFiles.forEach(({ file, errors }) => {
      const errorMessages = errors.map(e => e.message).join(', ')
      showError(`Файл "${file.name}" отклонен: ${errorMessages}`)
    })

    // Добавляем принятые файлы в список
    const newFiles = acceptedFiles.map(file => ({
      id: Date.now() + Math.random(),
      file,
      status: 'pending',
      error: null,
      data: null
    }))

    setUploadedFiles(prev => [...prev, ...newFiles])

    // Обрабатываем файлы
    acceptedFiles.forEach(file => {
      processFile(file)
    })
  }, [processFile, showError])

  // Конфигурация dropzone
  const { getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject } = useDropzone({
    onDrop,
    validator: validateFile,
    accept: {
      'application/json': ['.json'],
      'text/csv': ['.csv'],
      'text/plain': ['.txt']
    },
    maxFiles: 5,
    maxSize: 10 * 1024 * 1024 // 10MB
  })

  // Удаление файла из списка
  const removeFile = useCallback((fileId) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId))
  }, [])

  // Стили для dropzone
  const getDropzoneStyle = () => {
    let className = "border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 cursor-pointer "
    
    if (isDragAccept) {
      className += "border-green-400 bg-green-50 dark:bg-green-900/20 "
    } else if (isDragReject) {
      className += "border-red-400 bg-red-50 dark:bg-red-900/20 "
    } else if (isDragActive) {
      className += "border-blue-400 bg-blue-50 dark:bg-blue-900/20 "
    } else {
      className += "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 "
    }
    
    return className
  }

  return (
    <div className="space-y-6">
      {/* Dropzone */}
      <div {...getRootProps({ className: getDropzoneStyle() })}>
        <input {...getInputProps()} />
        <HiOutlineCloudArrowUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        
        {isDragActive ? (
          <div>
            {isDragAccept && (
              <p className="text-green-600 dark:text-green-400 font-medium">
                Отпустите файлы для загрузки
              </p>
            )}
            {isDragReject && (
              <p className="text-red-600 dark:text-red-400 font-medium">
                Некоторые файлы не поддерживаются
              </p>
            )}
          </div>
        ) : (
          <div>
            <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Перетащите файлы сюда или нажмите для выбора
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Поддерживаются: JSON, CSV, TXT (максимум 10MB, до 5 файлов)
            </p>
          </div>
        )}
      </div>

      {/* Список загруженных файлов */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Загруженные файлы ({uploadedFiles.length})
          </h3>
          
          <div className="space-y-2">
            {uploadedFiles.map((fileItem) => (
              <div
                key={fileItem.id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center space-x-3">
                  <HiOutlineDocumentText className="w-5 h-5 text-gray-400" />
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {fileItem.file.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {(fileItem.file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  {/* Статус */}
                  {fileItem.status === 'pending' && isProcessing && (
                    <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  )}
                  
                  {fileItem.status === 'success' && (
                    <HiOutlineCheckCircle className="w-5 h-5 text-green-500" />
                  )}
                  
                  {fileItem.status === 'error' && (
                    <HiOutlineExclamationTriangle className="w-5 h-5 text-red-500" />
                  )}

                  {/* Кнопка удаления */}
                  <button
                    onClick={() => removeFile(fileItem.id)}
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    <HiOutlineXMark className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Инструкции */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
          Поддерживаемые форматы:
        </h4>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <li>• <strong>JSON:</strong> Иерархическая структура с полями name, children</li>
          <li>• <strong>CSV:</strong> Табличные данные с колонками name, description</li>
          <li>• <strong>TXT:</strong> Автоматическое определение формата</li>
        </ul>
      </div>
    </div>
  )
} 