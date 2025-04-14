/**
 * Константы для визуализаций
 */
export const VISUALIZATION_CONSTANTS = {
    // Размеры узлов
    NODE_WIDTH: 120,
    NODE_HEIGHT: 40,
    FONT_SIZE: 14,

    // Расстояния
    TREE_LEVEL_SPACING: 150,
    TREEMAP_PADDING: 1,

    // Анимации
    TRANSITION_DURATION: 750,

    // Цвета
    NODE_COLORS: {
        default: '#fff',
        highlight: '#fff3e0',
        collapsed: '#e6f3ff',
        border: '#999',
        highlightBorder: '#ff9800',
        text: '#333',
        highlightText: '#ff9800',
    },

    // Связи
    LINK_COLORS: {
        default: '#999',
        highlight: '#4a90e2',
    },

    // Размеры и отступы
    NODE_PADDING: 10,
    RADIAL_RADIUS_PADDING: 50,

    // Шрифты
    FONTS: {
        FAMILY: 'Arial, sans-serif',
        SIZE: '12px',
        WEIGHT: {
            NORMAL: 'normal',
            BOLD: 'bold',
        },
    },

    // Анимации
    TRANSITIONS: {
        DURATION: 200,
        EASE: 'ease',
    },

    // Стили для узлов
    NODE_STYLES: {
        rect: {
            fill: '#ffffff',
            stroke: '#4a90e2',
            'stroke-width': '2px',
            rx: '20px',
            ry: '20px',
            cursor: 'pointer',
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
        },
        text: {
            fill: '#333333',
            'font-family': 'Arial, sans-serif',
            'font-weight': 'normal',
            'font-size': '12px',
            'user-select': 'none',
        },
        highlight: {
            rect: {
                fill: '#e6f2ff',
                stroke: '#2b6cb0',
                'stroke-width': '3px',
                rx: '20px',
                ry: '20px',
                filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.15))',
            },
            text: {
                fill: '#2b6cb0',
                'font-weight': 'bold',
            },
        },
        collapsed: {
            rect: {
                fill: '#f0f0f0',
                stroke: '#718096',
                'stroke-width': '2px',
                rx: '20px',
                ry: '20px',
            },
            text: {
                fill: '#718096',
                'font-style': 'italic',
            },
        },
    },

    // Стили для связей
    LINK_STYLES: {
        normal: {
            stroke: '#cbd5e0',
            'stroke-width': '2px',
            fill: 'none',
        },
        highlight: {
            stroke: '#4a90e2',
            'stroke-width': '3px',
        },
    },
}