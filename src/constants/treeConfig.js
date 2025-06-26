export const TREE_CONFIG = {
    // Размеры узлов
    nodeSize: {
        width: 140,
        height: 40,
        borderRadius: 8,
        minWidth: 100,
        maxWidth: 250,
        padding: 12,
    },

    // Отступы и расстояния
    spacing: {
        horizontal: 200,
        vertical: 80,
        separation: {
            siblings: 1.2,
            cousins: 2.5,
        },
    },

    // Настройки сетки
    grid: {
        enabled: true,
        size: 20, // размер ячейки сетки в пикселях
        strokeWidth: 0.5,
        opacity: {
            light: 0.15,
            dark: 0.1,
        },
        color: {
            light: '#6b7280',
            dark: '#6b7280',
        },
        majorGrid: {
            enabled: true,
            interval: 5, // каждая 5-я линия будет толще
            strokeWidth: 1,
            opacity: {
                light: 0.25,
                dark: 0.2,
            },
        },
        adaptive: {
            enabled: true, // адаптивный размер в зависимости от зума
            minSize: 10,   // минимальный размер ячейки
            maxSize: 50,   // максимальный размер ячейки
        },
    },

    // Настройки зума
    zoom: {
        extent: [0.1, 3],
        initialScale: 0.6,
        initialTransform: {
            x: 0.5, // center horizontally
            y: 0.16, // position from top
        },
        animationDuration: 750,
    },

    // Стили и поведение
    behavior: {
        expandFirstLevel: true,
        highlightParents: true,
        showDetails: true,
        autoExpand: false,
        centerOnSearch: true,
        searchHighlightDuration: 3000,
    },

    // Цветовая схема
    colors: {
        link: '#cbd5e1',
        linkHighlight: '#2563eb',
        linkHover: '#3b82f6',

        node: {
            background: '#ffffff',
            border: '#2563eb',
            text: '#1f2937',
            shadow: 'rgba(37, 99, 235, 0.15)',
        },

        nodeStates: {
            hover: {
                background: '#eff6ff',
                border: '#3b82f6',
                text: '#2563eb',
                shadow: 'rgba(37, 99, 235, 0.25)',
            },
            collapsed: {
                background: '#f1f5f9',
                border: '#64748b',
                text: '#64748b',
            },
            found: {
                background: '#fef3c7',
                border: '#f59e0b',
                text: '#92400e',
                shadow: 'rgba(245, 158, 11, 0.3)',
            },
            parent: {
                background: '#ecfdf5',
                border: '#10b981',
                text: '#047857',
                shadow: 'rgba(16, 185, 129, 0.2)',
            },
            root: {
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: '#4c51bf',
                text: '#ffffff',
                shadow: 'rgba(76, 81, 191, 0.3)',
            },
            leaf: {
                background: '#f8fafc',
                border: '#cbd5e1',
                text: '#6b7280',
            },
        },
    },

    // Анимации
    animations: {
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        nodeHover: 'transform 0.2s ease',
        searchPulse: 'pulse-highlight 2s ease-in-out',
        slideIn: 'slideIn 0.3s ease-out',
    },

    // Типографика
    typography: {
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: {
            normal: 14,
            small: 13,
            large: 16,
        },
        fontWeight: {
            normal: 600,
            bold: 700,
        },
    },
}