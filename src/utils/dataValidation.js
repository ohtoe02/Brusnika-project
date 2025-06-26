// JSON Schema для валидации структуры дерева
export const treeSchema = {
  type: "object",
  properties: {
    name: {
      type: "string",
      minLength: 1,
      maxLength: 100
    },
    description: {
      type: "string",
      maxLength: 500
    },
    children: {
      type: "array",
      items: {
        $ref: "#"
      }
    },
    metadata: {
      type: "object",
      properties: {
        created: { type: "string" },
        version: { type: "string" },
        author: { type: "string" }
      }
    }
  },
  required: ["name"],
  additionalProperties: true
}

// Валидация файла
export const validateFileType = (file) => {
  const allowedTypes = [
    'application/json',
    'text/csv', 
    'text/plain',
    'application/vnd.ms-excel',
    'text/tab-separated-values'
  ]
  
  const allowedExtensions = ['.json', '.csv', '.txt', '.tsv']
  
  const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'))
  
  return {
    isValidType: allowedTypes.includes(file.type) || allowedExtensions.includes(fileExtension),
    isValidSize: file.size <= 10 * 1024 * 1024, // 10MB
    extension: fileExtension,
    size: file.size
  }
}

// Парсинг CSV в структуру дерева
export const parseCSVToTree = (csvContent) => {
  const lines = csvContent.split('\n').filter(line => line.trim())
  if (lines.length < 2) {
    throw new Error('CSV файл должен содержать заголовки и данные')
  }

  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
  const rows = lines.slice(1).map(line => {
    const values = []
    let current = ''
    let inQuotes = false
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim().replace(/"/g, ''))
        current = ''
      } else {
        current += char
      }
    }
    values.push(current.trim().replace(/"/g, ''))
    return values
  })

  // Создаем структуру дерева из CSV
  const tree = {
    name: 'Imported Tree',
    description: 'Дерево, импортированное из CSV',
    children: []
  }

  // Простой алгоритм для построения дерева из плоской структуры
  const nodeMap = new Map()
  
  rows.forEach((row, index) => {
    const node = {}
    headers.forEach((header, i) => {
      if (row[i] !== undefined) {
        node[header] = row[i]
      }
    })
    
    if (!node.name) {
      node.name = `Node ${index + 1}`
    }
    
    node.children = []
    nodeMap.set(node.name, node)
  })

  // Если есть поле parent, строим иерархию
  if (headers.includes('parent')) {
    nodeMap.forEach((node) => {
      const parentName = node.parent
      if (parentName && nodeMap.has(parentName)) {
        nodeMap.get(parentName).children.push(node)
      } else {
        tree.children.push(node)
      }
    })
  } else {
    // Иначе добавляем все узлы как дочерние к корню
    nodeMap.forEach(node => {
      tree.children.push(node)
    })
  }

  return tree
}

// Парсинг JSON
export const parseJSONToTree = (jsonContent) => {
  try {
    const data = JSON.parse(jsonContent)
    
    // Проверяем базовую структуру
    if (typeof data !== 'object' || data === null) {
      throw new Error('JSON должен содержать объект')
    }

    // Если это массив, оборачиваем в корневой узел
    if (Array.isArray(data)) {
      return {
        name: 'Imported Tree',
        description: 'Дерево, импортированное из JSON массива',
        children: data
      }
    }

    return data
  } catch (error) {
    throw new Error(`Ошибка парсинга JSON: ${error.message}`)
  }
}

// Валидация структуры дерева
export const validateTreeStructure = (tree) => {
  const errors = []
  const warnings = []
  
  const validateNode = (node, path = 'root') => {
    // Проверка обязательных полей
    if (!node.name || typeof node.name !== 'string') {
      errors.push(`${path}: отсутствует поле 'name' или оно не является строкой`)
    }
    
    if (node.name && node.name.trim().length === 0) {
      warnings.push(`${path}: пустое название узла`)
    }
    
    // Проверка типов полей
    if (node.description && typeof node.description !== 'string') {
      warnings.push(`${path}: поле 'description' должно быть строкой`)
    }
    
    if (node.children) {
      if (!Array.isArray(node.children)) {
        errors.push(`${path}: поле 'children' должно быть массивом`)
      } else {
        node.children.forEach((child, index) => {
          validateNode(child, `${path}.children[${index}]`)
        })
      }
    }
  }
  
  validateNode(tree)
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

// Статистика дерева
export const getTreeStatistics = (tree) => {
  let nodeCount = 0
  let maxDepth = 0
  let leafCount = 0
  
  const traverse = (node, depth = 0) => {
    nodeCount++
    maxDepth = Math.max(maxDepth, depth)
    
    if (!node.children || node.children.length === 0) {
      leafCount++
    } else {
      node.children.forEach(child => traverse(child, depth + 1))
    }
  }
  
  traverse(tree)
  
  return {
    nodeCount,
    maxDepth,
    leafCount,
    avgChildrenPerNode: nodeCount > 0 ? (nodeCount - leafCount) / (nodeCount - leafCount || 1) : 0
  }
} 