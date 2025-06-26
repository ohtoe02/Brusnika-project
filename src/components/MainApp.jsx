import { useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiSearch, FiUpload } from 'react-icons/fi'
import { HiOutlineCog6Tooth } from 'react-icons/hi2'
import ThemeToggle from './ThemeToggle'
import { useTheme } from '../contexts/ThemeContext'
import { VisualizationSettingsProvider } from '../contexts/VisualizationSettingsContext'
import { useResponsive } from '../hooks/useResponsive'
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts'
import { MiniMap } from './MiniMap'
import ActionButton from './ActionButton'
import Toolbar from './Toolbar'
import ErrorBoundary from './ErrorBoundary'

// Новые хуки с Zustand
import { 
  useTreeData, 
  useTreeSettings, 
  useSearch, 
  useUIState, 
  useDimensions,
  useToast,
  useAppInit,
  useLoading
} from '../hooks/useAppState'

// Lazy-loaded компоненты
import {
  InteractiveTreeLazy,
  ControlPanelNewLazy,
  ShortcutHelpModalLazy,
  WelcomeScreenLazy,
  ComponentPreloader
} from './LazyComponents'

// Loading компоненты
import { FullScreenLoader } from './LoadingSpinner'

// D3 предзагрузка
import { backgroundPreload } from '../utils/d3Loader'

function MainApp() {
	const navigate = useNavigate()
	
	// Хуки для управления состоянием через Zustand
	const { data, setData } = useTreeData()
	const { treeSettings, updateTreeSettings } = useTreeSettings()
	const { 
		searchQuery, 
		setSearchQuery,
		searchValue, 
		setSearchValue,
		showSearchBar, 
		setShowSearchBar,
		performSearch,
		treeInstanceRef
	} = useSearch()
	const {
		showShortcutsModal,
		setShowShortcutsModal,
		showWelcomeScreen,
		setShowWelcomeScreen,
		currentPath,
		setCurrentPath
	} = useUIState()
	const { dimensions } = useDimensions()
	const { showSuccess, showInfo } = useToast()
	const { initializeApp } = useAppInit()
	const { isLoading, loadingMessage } = useLoading()

	// Контекстные хуки
	const { theme, toggleTheme } = useTheme()
	const { isMobile, isSmallScreen } = useResponsive()

	// Инициализация приложения
	useEffect(() => {
		const cleanup = initializeApp()
		
		// Предзагружаем D3 модули в фоне
		backgroundPreload()
		
		return cleanup
	}, [initializeApp])



	// Настройка клавиатурных шорткатов
	useKeyboardShortcuts({
		'ctrl+k': {
			action: () => {
				setShowSearchBar(true)
				showInfo('Поиск активирован')
			}
		},
		'ctrl+t': {
			action: () => {
				toggleTheme()
				showSuccess(`Тема изменена на ${theme === 'light' ? 'тёмную' : 'светлую'}`)
			}
		},
		'ctrl+shift+a': {
			action: () => {
				navigate('/admin')
				showInfo('Переход в админ панель')
			}
		},
		'?': {
			action: () => {
				setShowShortcutsModal(true)
			}
		},
		'escape': {
			action: () => {
				if (showSearchBar) {
					setShowSearchBar(false)
					setSearchValue('')
				} else if (showShortcutsModal) {
					setShowShortcutsModal(false)
				}
			}
		}
	})

	// Обработчик ввода текста для автоматического открытия поиска
	useEffect(() => {
		const handler = e => {
			const tag = (e.target.tagName || '').toLowerCase()
			const isInput =
				tag === 'input' ||
				tag === 'textarea' ||
				tag === 'select' ||
				e.target.isContentEditable
			if (isInput) return
			if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
				e.preventDefault()
				setShowSearchBar(true)
				setSearchValue(prev => (prev ? prev + e.key : e.key))
				setTimeout(() => {
					const el = document.querySelector('.float-search-input')
					if (el) el.focus()
				}, 0)
			}
		}
		document.addEventListener('keydown', handler)
		return () => document.removeEventListener('keydown', handler)
	}, [setShowSearchBar, setSearchValue])

	// Обработчик нажатия Enter в поле поиска
	const handleSearchKeyDown = useCallback(e => {
		if (e.key === 'Enter' && searchValue.trim()) {
			performSearch(searchValue.trim())
			setSearchValue('')
			setShowSearchBar(false)
		}
		if (e.key === 'Escape') {
			setShowSearchBar(false)
			setSearchValue('')
		}
	}, [searchValue, performSearch, setSearchValue, setShowSearchBar])



	// Обработчики для WelcomeScreen
	const handleWelcomeDataLoaded = useCallback((newData) => {
		setData(newData)
		setShowWelcomeScreen(false)
		showSuccess('Данные успешно загружены!')
	}, [setData, setShowWelcomeScreen, showSuccess])

	const handleWelcomeClose = useCallback(() => {
		setShowWelcomeScreen(false)
	}, [setShowWelcomeScreen])

	return (
		<VisualizationSettingsProvider>
			<ErrorBoundary>
				<div className="
					h-screen w-screen overflow-hidden
					bg-gradient-to-br from-neutral-50 to-neutral-100
					dark:from-neutral-900 dark:to-neutral-800
					transition-all duration-500 ease-in-out
				">
					{/* Панель инструментов слева */}
					<Toolbar 
						position="top-left" 
						background="glass"
						aria-label="Основные инструменты"
					>
						<Toolbar.Group aria-label="Поиск и навигация">
							{/* Кнопка загрузки данных - всегда доступна */}
							<ActionButton
								variant={data ? "secondary" : "primary"}
								size="md"
								iconOnly
								icon={FiUpload}
								tooltip={data ? "Загрузить новые данные" : "Загрузить данные"}
								onClick={() => setShowWelcomeScreen(true)}
								aria-label={data ? "Загрузить новые данные" : "Загрузить данные"}
							/>
							
							{/* Кнопка поиска - только если есть данные */}
							{data && (
								<ActionButton
									variant="secondary"
									size="md"
									iconOnly
									icon={FiSearch}
									tooltip="Поиск по дереву (Ctrl+K)"
									onClick={() => setShowSearchBar(true)}
									aria-label="Открыть поиск"
								/>
							)}
							
							{/* ControlPanel с настройками - только если есть данные */}
							{data && (
								<ControlPanelNewLazy
									data={data}
									onDataChange={setData}
									onSearchQueryChange={setSearchQuery}
									onTreeSettingsChange={updateTreeSettings}
								/>
							)}
						</Toolbar.Group>
					</Toolbar>
					
					{/* Переключатель темы и админ панель */}
					<Toolbar 
						position="top-right" 
						background="glass"
						aria-label="Настройки интерфейса"
					>
						<Toolbar.Group aria-label="Настройки">
							<ActionButton
								variant="secondary"
								size="md"
								iconOnly
								icon={HiOutlineCog6Tooth}
								tooltip="Админ панель (Ctrl+Shift+A)"
								onClick={() => navigate('/admin')}
								aria-label="Открыть админ панель"
							/>
							<ThemeToggle size="md" />
						</Toolbar.Group>
					</Toolbar>

					{/* Float-поле поиска - адаптивное */}
					{showSearchBar && (
						<div className={`
							fixed z-40
							${isMobile ? 'top-16 left-2 right-2' : 'top-20 left-4 right-4'}
							${isMobile ? 'max-w-none' : 'max-w-md'}
							bg-white dark:bg-neutral-800
							border border-neutral-200 dark:border-neutral-600
							rounded-xl shadow-xl
							animate-slide-in
						`}>
							<div className="relative">
								<input
									autoFocus
									className={`
										w-full ${isMobile ? 'px-3 py-2.5 pr-9 text-sm' : 'px-4 py-3 pr-10'}
										bg-transparent
										text-neutral-900 dark:text-neutral-100
										placeholder-neutral-500 dark:placeholder-neutral-400
										border-none outline-none
										rounded-xl
										float-search-input
									`}
									placeholder={isMobile ? 'Поиск...' : 'Поиск по дереву... (Enter для поиска, Esc для отмены)'}
									value={searchValue}
									onChange={e => setSearchValue(e.target.value)}
									onKeyDown={handleSearchKeyDown}
								/>
								<div className={`absolute right-3 top-1/2 transform -translate-y-1/2`}>
									<FiSearch size={isMobile ? 16 : 18} className="text-neutral-400 dark:text-neutral-500" />
								</div>
							</div>
						</div>
					)}
					
					{/* Путь до узла */}
					{currentPath && (
						<MiniMap 
							path={currentPath} 
							treeInstance={treeInstanceRef?.current}
							onNodeClick={(node) => {
								// Дополнительная логика при клике на узел в MiniMap
								console.log('Clicked on node in MiniMap:', node.data.name)
							}}
						/>
					)}
					
					{/* Основная область визуализации */}
					<div className={`
						relative
						bg-white dark:bg-neutral-800
						border border-neutral-200 dark:border-neutral-700
						${isSmallScreen ? 'rounded-lg m-2 h-[calc(100vh-1rem)]' : 'rounded-2xl m-4 h-[calc(100vh-2rem)]'}
						shadow-2xl overflow-hidden
						transition-all duration-500 ease-in-out
					`}>
						<InteractiveTreeLazy
							data={data}
							width={dimensions.width}
							height={dimensions.height}
							searchQuery={searchQuery}
							settings={treeSettings}
							showSearchBar={showSearchBar}
							setShowSearchBar={setShowSearchBar}
							setSearchValue={setSearchValue}
							onPathChange={setCurrentPath}
							treeInstanceRef={treeInstanceRef}
						/>
					</div>
					
					{/* Полноэкранный лоадер */}
					{isLoading && (
						<FullScreenLoader 
							message={loadingMessage}
							showSpinner={true}
						/>
					)}
					
					{/* Модальное окно справки по шорткатам */}
					<ShortcutHelpModalLazy 
						isOpen={showShortcutsModal}
						onClose={() => setShowShortcutsModal(false)}
					/>
					
					{/* Welcome экран для новых пользователей */}
					{showWelcomeScreen && (
						<WelcomeScreenLazy
							onDataLoaded={handleWelcomeDataLoaded}
							onClose={handleWelcomeClose}
							hasExistingData={!!data}
						/>
					)}
					
					{/* Предзагрузчик компонентов */}
					<ComponentPreloader />
				</div>
			</ErrorBoundary>
		</VisualizationSettingsProvider>
	)
}

export default MainApp 