import React, { useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineChevronRight, HiOutlineChevronDown, HiOutlineCheck, HiOutlineXMark } from 'react-icons/hi2'
import { useAppStore, useToastStore } from '../store/appStore'

export default function TreeEditor() {
  const { data, setData } = useAppStore()
  const { showSuccess, showError } = useToastStore()
  const [expandedNodes, setExpandedNodes] = useState(new Set(['root']))
  const [editingNode, setEditingNode] = useState(null)
  const [showAddForm, setShowAddForm] = useState(null)

  // Форма для редактирования узла
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm()

  // Обновление узла
  const updateNode = useCallback((nodeId, updates) => {
    const updateNodeRecursive = (node) => {
      if ((node.id === nodeId) || (!node.id && nodeId === 'root')) {
        return { ...node, ...updates }
      }
      
      if (node.children) {
        return {
          ...node,
          children: node.children.map(updateNodeRecursive)
        }
      }
      
      return node
    }

    const updatedData = updateNodeRecursive(data)
    setData(updatedData)
  }, [data, setData])

  // Добавление нового узла
  const addNode = useCallback((parentId, newNode) => {
    const addNodeRecursive = (node) => {
      if ((node.id === parentId) || (!node.id && parentId === 'root')) {
        const children = node.children || []
        return {
          ...node,
          children: [...children, {
            id: Date.now().toString(),
            name: newNode.name,
            description: newNode.description || '',
            children: []
          }]
        }
      }
      
      if (node.children) {
        return {
          ...node,
          children: node.children.map(addNodeRecursive)
        }
      }
      
      return node
    }

    const updatedData = addNodeRecursive(data)
    setData(updatedData)
  }, [data, setData])

  // Удаление узла
  const deleteNode = useCallback((nodeId) => {
    if (nodeId === 'root') {
      showError('Нельзя удалить корневой узел')
      return
    }

    const deleteNodeRecursive = (node) => {
      if (node.children) {
        return {
          ...node,
          children: node.children
            .filter(child => child.id !== nodeId)
            .map(deleteNodeRecursive)
        }
      }
      return node
    }

    const updatedData = deleteNodeRecursive(data)
    setData(updatedData)
    showSuccess('Узел удален')
  }, [data, setData, showSuccess, showError])

  // Переключение развернутости узла
  const toggleExpanded = useCallback((nodeId) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev)
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId)
      } else {
        newSet.add(nodeId)
      }
      return newSet
    })
  }, [])

  // Обработка редактирования
  const handleEdit = useCallback((node) => {
    const nodeId = node.id || 'root'
    setEditingNode(nodeId)
    setValue('name', node.name || '')
    setValue('description', node.description || '')
  }, [setValue])

  // Сохранение изменений
  const handleSave = useCallback((formData) => {
    if (!editingNode) return

    updateNode(editingNode, {
      name: formData.name,
      description: formData.description
    })

    setEditingNode(null)
    reset()
    showSuccess('Узел обновлен')
  }, [editingNode, updateNode, reset, showSuccess])

  // Отмена редактирования
  const handleCancel = useCallback(() => {
    setEditingNode(null)
    setShowAddForm(null)
    reset()
  }, [reset])

  // Добавление нового узла
  const handleAdd = useCallback((formData) => {
    if (!showAddForm) return

    addNode(showAddForm, {
      name: formData.name,
      description: formData.description
    })

    setShowAddForm(null)
    reset()
    showSuccess('Узел добавлен')
  }, [showAddForm, addNode, reset, showSuccess])

  // Рендер узла дерева
  const renderNode = useCallback((node, level = 0) => {
    const nodeId = node.id || 'root'
    const isExpanded = expandedNodes.has(nodeId)
    const isEditing = editingNode === nodeId
    const isAddingChild = showAddForm === nodeId
    const hasChildren = node.children && node.children.length > 0

    return (
      <div key={nodeId} className="select-none">
        <div 
          className="flex items-center py-2 px-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md group transition-colors"
          style={{ paddingLeft: `${level * 20 + 12}px` }}
        >
          {hasChildren ? (
            <button
              onClick={() => toggleExpanded(nodeId)}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              {isExpanded ? (
                <HiOutlineChevronDown className="w-4 h-4" />
              ) : (
                <HiOutlineChevronRight className="w-4 h-4" />
              )}
            </button>
          ) : (
            <div className="w-6 h-6" />
          )}

          <div className="flex-1 min-w-0">
            {isEditing ? (
              <form onSubmit={handleSubmit(handleSave)} className="space-y-2">
                <input
                  {...register('name', { required: 'Название обязательно' })}
                  className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Название узла"
                />
                {errors.name && (
                  <p className="text-red-500 text-xs">{errors.name.message}</p>
                )}
                
                <textarea
                  {...register('description')}
                  rows={2}
                  className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Описание (необязательно)"
                />
                
                <div className="flex space-x-2">
                  <button
                    type="submit"
                    className="p-1 text-green-600 hover:text-green-700 transition-colors"
                  >
                    <HiOutlineCheck className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <HiOutlineXMark className="w-4 h-4" />
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {node.name || 'Без названия'}
                  </p>
                  {node.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {node.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setShowAddForm(nodeId)}
                    className="p-1 text-blue-600 hover:text-blue-700 transition-colors"
                    title="Добавить дочерний узел"
                  >
                    <HiOutlinePlus className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={() => handleEdit(node)}
                    className="p-1 text-gray-600 hover:text-gray-700 transition-colors"
                    title="Редактировать"
                  >
                    <HiOutlinePencil className="w-4 h-4" />
                  </button>
                  
                  {nodeId !== 'root' && (
                    <button
                      onClick={() => {
                        if (window.confirm('Удалить этот узел и все его дочерние элементы?')) {
                          deleteNode(nodeId)
                        }
                      }}
                      className="p-1 text-red-600 hover:text-red-700 transition-colors"
                      title="Удалить"
                    >
                      <HiOutlineTrash className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {isAddingChild && (
          <div 
            className="py-2 px-3 bg-blue-50 dark:bg-blue-900/20 border-l-2 border-blue-500"
            style={{ paddingLeft: `${(level + 1) * 20 + 12}px` }}
          >
            <form onSubmit={handleSubmit(handleAdd)} className="space-y-2">
              <input
                {...register('name', { required: 'Название обязательно' })}
                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Название нового узла"
                autoFocus
              />
              {errors.name && (
                <p className="text-red-500 text-xs">{errors.name.message}</p>
              )}
              
              <textarea
                {...register('description')}
                rows={2}
                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Описание (необязательно)"
              />
              
              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Добавить
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        )}

        {isExpanded && hasChildren && (
          <div>
            {node.children.map(child => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    )
  }, [
    expandedNodes, editingNode, showAddForm, toggleExpanded, handleEdit, 
    handleSubmit, handleSave, handleCancel, handleAdd, deleteNode, register, errors
  ])

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">
          Нет данных для редактирования
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Редактор структуры дерева
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Нажмите на узел для редактирования или используйте кнопки действий
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              const allNodeIds = ['root']
              const collectIds = (node) => {
                if (node.children) {
                  node.children.forEach(child => {
                    allNodeIds.push(child.id || Math.random().toString())
                    collectIds(child)
                  })
                }
              }
              collectIds(data)
              setExpandedNodes(new Set(allNodeIds))
            }}
            className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Развернуть все
          </button>
          
          <button
            onClick={() => setExpandedNodes(new Set(['root']))}
            className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Свернуть все
          </button>
        </div>
      </div>

      <div className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
        <div className="p-4">
          {renderNode(data)}
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
          Статистика дерева
        </h3>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-600 dark:text-gray-400">Всего узлов:</span>
            <span className="ml-2 font-medium text-gray-900 dark:text-white">
              {(() => {
                let count = 1
                const countNodes = (node) => {
                  if (node.children) {
                    count += node.children.length
                    node.children.forEach(countNodes)
                  }
                }
                countNodes(data)
                return count
              })()}
            </span>
          </div>
          
          <div>
            <span className="text-gray-600 dark:text-gray-400">Максимальная глубина:</span>
            <span className="ml-2 font-medium text-gray-900 dark:text-white">
              {(() => {
                const getDepth = (node, currentDepth = 1) => {
                  if (!node.children || node.children.length === 0) {
                    return currentDepth
                  }
                  return Math.max(...node.children.map(child => getDepth(child, currentDepth + 1)))
                }
                return getDepth(data)
              })()}
            </span>
          </div>
          
          <div>
            <span className="text-gray-600 dark:text-gray-400">Листовых узлов:</span>
            <span className="ml-2 font-medium text-gray-900 dark:text-white">
              {(() => {
                let leafCount = 0
                const countLeaves = (node) => {
                  if (!node.children || node.children.length === 0) {
                    leafCount++
                  } else {
                    node.children.forEach(countLeaves)
                  }
                }
                countLeaves(data)
                return leafCount
              })()}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
} 