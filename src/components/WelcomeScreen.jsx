import { useState, useRef } from 'react'
import * as d3 from 'd3'
import { FiUpload, FiFileText, FiInfo, FiX } from 'react-icons/fi'
import { BsFiletypeCsv, BsFiletypeXlsx, BsFiletypeJson } from 'react-icons/bs'
import { useToastStore } from '../store/appStore'
import { useTheme } from '../contexts/ThemeContext'

// Функция построения иерархии из плоских данных
const buildHierarchy = (flatData) => {
  const root = { name: 'Организационная структура', children: [] }
  const levels = [
    'ЮЛ',
    'Локация', 
    'Подразделение',
    'Отдел',
    'Группа',
    'Должность',
    'ФИО',
  ]
  
  flatData.forEach(row => {
    let current = root
    levels.forEach(level => {
      let value = row[level] ? row[level].trim() : ''
      if (!value) return
      let child = current.children.find(d => d.name === value)
      if (!child) {
        child = { name: value, children: [] }
        current.children.push(child)
      }
      current = child
    })
    
    // Добавляем детальную информацию
    if (Object.keys(row).length > levels.length) {
      current.details = {}
      Object.keys(row).forEach(key => {
        if (!levels.includes(key) && row[key]) {
          current.details[key] = row[key]
        }
      })
    }
  })
  
  return root
}

const WelcomeScreen = ({ onDataLoaded, onClose, hasExistingData = false }) => {
  const { theme } = useTheme()
  const [dragActive, setDragActive] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const dropRef = useRef(null)
  const fileInputRef = useRef(null)
  const { showSuccess, showError } = useToastStore()

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleFile = async (file) => {
    if (!file) return
    
    setIsLoading(true)
    
    try {
      const fileExtension = file.name.split('.').pop().toLowerCase()
      let hierarchyData
      
      if (fileExtension === 'csv') {
        const csvData = await file.text()
        const parsedData = d3.csvParse(csvData)
        hierarchyData = buildHierarchy(parsedData)
      } else if (fileExtension === 'json') {
        const jsonData = await file.text()
        hierarchyData = JSON.parse(jsonData)
      } else {
        throw new Error('Поддерживаются только CSV и JSON файлы')
      }
      
      showSuccess(`Файл "${file.name}" успешно загружен!`)
      onDataLoaded(hierarchyData)
      
    } catch (error) {
      console.error('Ошибка при загрузке файла:', error)
      showError(`Ошибка загрузки файла: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  const loadSampleData = () => {
    // Загружаем примерные данные
    const sampleData = {
      name: 'Пример организации',
      children: [
        {
          name: 'IT Департамент',
          children: [
            {
              name: 'Разработка',
              children: [
                { name: 'Frontend разработчик', details: { 'Опыт': '3 года', 'Технологии': 'React, Vue' } },
                { name: 'Backend разработчик', details: { 'Опыт': '5 лет', 'Технологии': 'Node.js, Python' } }
              ]
            },
            {
              name: 'QA',
              children: [
                { name: 'Тестировщик', details: { 'Опыт': '2 года', 'Специализация': 'Автотесты' } }
              ]
            }
          ]
        },
        {
          name: 'Маркетинг',
          children: [
            { name: 'Маркетолог', details: { 'Опыт': '4 года', 'Направление': 'Digital' } },
            { name: 'SMM специалист', details: { 'Опыт': '2 года', 'Платформы': 'Instagram, TikTok' } }
          ]
        }
      ]
    }
    
    showSuccess('Загружены примерные данные')
    onDataLoaded(sampleData)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative max-w-4xl w-full mx-4 bg-white dark:bg-neutral-800 rounded-3xl shadow-2xl overflow-hidden">
        {/* Заголовок */}
        <div className="relative bg-[#ff3f00] p-8 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <FiX size={24} />
          </button>
          
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 32 32" className="text-white">
                <path 
                  d="M16 4v24M8 12l8-8 8 8M8 20l8 8 8-8" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  fill="none"
                />
              </svg>
            </div>
            
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {hasExistingData ? "Загрузка новых данных" : "Brusnika Tree Visualization"}
              </h1>
              <p className="text-white">
                {hasExistingData 
                  ? "Интерактивная визуализация оргструктуры компании" 
                  : "Интерактивная визуализация оргструктуры компании"
                }
              </p>
            </div>
          </div>
        </div>

        {/* Основной контент */}
        <div className="p-8">
          {/* Предупреждение о замене данных */}
          {hasExistingData && (
            <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5">
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-amber-800 dark:text-amber-200 mb-1">
                    Внимание!
                  </h4>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    При загрузке нового файла текущие данные будут заменены. Убедитесь, что вы сохранили важную информацию.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className={`grid ${hasExistingData ? 'grid-cols-1' : 'md:grid-cols-2'} gap-8`}>
            {/* Описание сервиса - только для новых пользователей */}
            {!hasExistingData && (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <FiInfo className="text-blue-500" size={24} />
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                  Возможности сервиса
                </h2>
              </div>
              
              <div className="space-y-4 text-neutral-600 dark:text-neutral-300">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p><strong>Интерактивная визуализация</strong> - исследуйте структуру с помощью zoom, pan и навигации</p>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p><strong>Умный поиск</strong> - быстро находите нужные элементы в структуре</p>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p><strong>Гибкие настройки</strong> - настраивайте внешний вид под свои задачи</p>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p><strong>Экспорт данных</strong> - сохраняйте результаты в различных форматах</p>
                </div>
              </div>
            </div>
            )}

            {/* Загрузка файлов */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <FiUpload className="text-green-500" size={24} />
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                  Загрузка данных
                </h2>
              </div>

              {/* Drag & Drop область */}
              <div
                ref={dropRef}
                className={`
                  relative border-2 border-dashed rounded-2xl p-8 text-center
                  transition-all duration-300 cursor-pointer
                  ${dragActive 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-105' 
                    : 'border-neutral-300 dark:border-neutral-600 hover:border-blue-400 dark:hover:border-blue-500'
                  }
                  ${isLoading ? 'pointer-events-none opacity-50' : ''}
                `}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={openFileDialog}
              >
                {isLoading ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                    <p className="text-neutral-600 dark:text-neutral-400">Обработка файла...</p>
                  </div>
                ) : (
                  <>
                    <div className={`w-16 h-16 mx-auto mb-4 ${theme === 'dark' ? 'bg-white/20' : 'bg-neutral-200'} rounded-2xl flex items-center justify-center`}>
                      <FiUpload className="text-white" size={24} />
                    </div>
                    
                    <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                      Перетащите файл сюда
                    </h3>
                    
                    <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                      или нажмите для выбора файла
                    </p>
                    
                    <div className="flex justify-center gap-4 mb-4">
                      <div className="flex items-center gap-1 text-sm text-neutral-500 dark:text-neutral-400">
                        <BsFiletypeCsv className="text-green-500" size={16} />
                        CSV
                      </div>
                      <div className="flex items-center gap-1 text-sm text-neutral-500 dark:text-neutral-400">
                        <BsFiletypeJson className="text-yellow-500" size={16} />
                        JSON
                      </div>
                    </div>
                  </>
                )}
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.json"
                  onChange={handleInputChange}
                  className="hidden"
                />
              </div>

              {/* Дополнительные действия */}
              <div className="mt-6 flex flex-col gap-3">
                <button
                  onClick={loadSampleData}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-xl hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors"
                >
                  <FiFileText size={18} />
                  Загрузить демо данные
                </button>
                
                <p className="text-xs text-neutral-500 dark:text-neutral-400 text-center">
                  Поддерживаемые форматы: CSV (с заголовками), JSON (иерархические данные)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WelcomeScreen 