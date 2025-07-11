# Визуализация оргструктуры

## Описание

Интерактивное веб-приложение для визуализации иерархических структур (например, оргструктур компаний) с гибкой настройкой отображения и поддержкой загрузки данных из CSV.

## Основные функции

- Загрузка иерархии из CSV-файла (поддержка русских заголовков)
- Визуализация в виде интерактивного дерева, радиального дерева и treemap
- Поиск по узлам с автоматическим раскрытием пути
- Мини-карта пути до выбранного узла
- Панель управления с настройками:
  - Тип расположения (вертикальное, горизонтальное, радиальное)
  - Стиль узлов и связей (цвет, толщина, форма линий)
  - Анимация (длительность, плавность)
  - Метки (размер, цвет, отображение)
- Сохранение пользовательских настроек в localStorage
- Адаптивная вёрстка, поддержка масштабирования
- **Экспорт визуализации в PNG/SVG** ✨

## Требования

- Node.js >= 18
- npm >= 9
- Современный браузер (Chrome, Firefox, Edge)

## Установка и запуск

```bash
npm install
npm run dev
```

- Для сборки production-версии: `npm run build`
- Для предпросмотра production-сборки: `npm run preview`
- Для проверки стиля кода: `npm run lint`

## Структура проекта

- `src/components/` — основные React-компоненты (панель управления, визуализации, мини-карта)
- `src/visualizations/` — логика построения деревьев на D3.js
- `src/utils/` — утилиты для работы с DOM, деревьями, экспорта, константы
- `src/constants/` — параметры визуализации
- `public/` — статические ресурсы

## Архитектура

- React для UI и управления состоянием
- D3.js для построения и анимации SVG-деревьев
- Настройки визуализации передаются через props и сохраняются в localStorage
- Визуализации реализованы как отдельные компоненты с возможностью расширения


### 🎨 Современный дизайн:

- **Профессиональная цветовая схема** с использованием современных оттенков синего и зеленого
- **Улучшенная типографика** с системными шрифтами и оптимальными размерами
- **Тени и градиенты** для создания глубины и визуальной иерархии
- **Анимации и переходы** для плавного взаимодействия

### 🔍 Читаемость и контраст:

- **Высокий контраст текста** с использованием text-shadow для лучшей читаемости
- **Оптимизированные размеры узлов** — автоматический расчет ширины по содержимому
- **Умное расположение** — адаптивные отступы в зависимости от количества узлов
- **Цветовое кодирование** — разные стили для корневых, листовых и свернутых узлов

### 🎯 Улучшения взаимодействия:

- **Индикаторы свернутых узлов** — круглые бейджи с количеством детей
- **Состояния наведения** — плавные трансформации и подсветка
- **Анимация поиска** — пульсирующая подсветка найденных элементов
- **Улучшенная мини-карта** — компактное отображение пути с эллипсисом

### 🛠️ Техническая оптимизация:

- **Горизонтальная компоновка** — дерево растет слева направо для лучшего использования пространства
- **Плавные кривые Безье** — красивые соединительные линии между узлами
- **Адаптивный зум** — автоматическое позиционирование и масштабирование
- **Отзывчивый дизайн** — корректное отображение на всех размерах экранов

### 📱 Современный интерфейс:

- **Плавающие панели** — настройки и поиск в стиле современных веб-приложений
- **Градиентные кнопки** — красивые элементы управления с hover-эффектами
- **Модальные окна** — стилизованное drag&drop окно загрузки файлов
- **Микро-анимации** — реакция на все действия пользователя
