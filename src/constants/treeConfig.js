export const TREE_CONFIG = {
    // Размеры узлов
    nodeSize: {
        width: 120,
        height: 40,
        borderRadius: 20,
    },

    // Отступы
    spacing: {
        horizontal: {
            min: 236,
            max: 456,
            base: 236,
        },
        vertical: {
            min: 10,
            base: 13,
        },
    },

    // Настройки зума
    zoom: {
        extent: [0.1, 2],
        initialScale: 0.5,
        animationDuration: 500,
    },

    // Стили
    styles: {
        curveStrength: 0.3,
        highlightParents: true,
        showDetails: true,
    },

    // Цвета
    colors: {
        link: '#cbd5e0',
        linkHighlight: '#4a90e2',
        node: {
            background: '#ffffff',
            border: '#cbd5e0',
            text: '#2d3748',
            highlight: {
                background: '#e6f3ff',
                border: '#4a90e2',
                text: '#4a90e2',
            },
            path: {
                background: '#ffffff',
                border: '#4a90e2',
                text: '#4a90e2',
            },
            collapsed: {
                background: '#f0f9ff',
                border: '#4a90e2',
                text: '#4a90e2',
            },
        },
    },
}