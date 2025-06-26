import React, { lazy, Suspense, memo } from 'react'
import { ComponentLoader, TreeSkeleton } from './LoadingSpinner'

// Ленивая загрузка компонентов
const LazyInteractiveTree = lazy(() => 
  import('./InteractiveTree').then(module => ({
    default: module.InteractiveTreeComponent
  }))
)

const LazyRadialTree = lazy(() => import('./RadialTree'))

const LazyVisNetwork = lazy(() => import('./VisNetwork'))

const LazyControlPanel = lazy(() => import('./ControlPanel'))
const LazyControlPanelNew = lazy(() => import('./ControlPanelNew'))

const LazyShortcutHelpModal = lazy(() => import('./ShortcutHelpModal'))

const LazyWelcomeScreen = lazy(() => import('./WelcomeScreen'))

// Обертки с Suspense и fallback
export const InteractiveTreeLazy = memo((props) => (
  <Suspense fallback={
    <ComponentLoader 
      height="h-full" 
      message="Загрузка интерактивного дерева..."
      showSkeleton={true}
    />
  }>
    <LazyInteractiveTree {...props} />
  </Suspense>
))

export const RadialTreeLazy = memo((props) => (
  <Suspense fallback={
    <ComponentLoader 
      height="h-full" 
      message="Загрузка радиального дерева..."
      showSkeleton={true}
    />
  }>
    <LazyRadialTree {...props} />
  </Suspense>
))

export const VisNetworkLazy = memo((props) => (
  <Suspense fallback={
    <ComponentLoader 
      height="h-full" 
      message="Загрузка сетевой визуализации..."
    />
  }>
    <LazyVisNetwork {...props} />
  </Suspense>
))

export const ControlPanelLazy = memo((props) => (
  <Suspense fallback={
    <ComponentLoader 
      height="h-auto" 
      message="Загрузка панели управления..."
    />
  }>
    <LazyControlPanel {...props} />
  </Suspense>
))

export const ControlPanelNewLazy = memo((props) => (
  <Suspense fallback={
    <ComponentLoader 
      height="h-auto" 
      message="Загрузка панели управления..."
    />
  }>
    <LazyControlPanelNew {...props} />
  </Suspense>
))

export const ShortcutHelpModalLazy = memo((props) => (
  <Suspense fallback={null}>
    <LazyShortcutHelpModal {...props} />
  </Suspense>
))

export const WelcomeScreenLazy = memo((props) => (
  <Suspense fallback={
    <ComponentLoader 
      height="h-screen" 
      message="Загрузка экрана приветствия..."
    />
  }>
    <LazyWelcomeScreen {...props} />
  </Suspense>
))

// Хук для предзагрузки компонентов
export const usePreloadComponents = () => {
  const preloadInteractiveTree = () => import('./InteractiveTree')
  const preloadRadialTree = () => import('./RadialTree')
  const preloadVisNetwork = () => import('./VisNetwork')
  const preloadControlPanel = () => import('./ControlPanel')
  const preloadShortcutModal = () => import('./ShortcutHelpModal')
  const preloadWelcomeScreen = () => import('./WelcomeScreen')

  return {
    preloadInteractiveTree,
    preloadRadialTree,
    preloadVisNetwork,
    preloadControlPanel,
    preloadShortcutModal,
    preloadWelcomeScreen,
    preloadAll: () => Promise.all([
      preloadInteractiveTree(),
      preloadRadialTree(),
      preloadVisNetwork(),
      preloadControlPanel(),
      preloadShortcutModal(),
      preloadWelcomeScreen()
    ])
  }
}

// Компонент для предзагрузки на idle
export const ComponentPreloader = memo(() => {
  const { preloadAll } = usePreloadComponents()

  // Предзагружаем компоненты когда браузер свободен
  React.useEffect(() => {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        preloadAll().catch(console.warn)
      })
    } else {
      // Fallback для браузеров без requestIdleCallback
      setTimeout(() => {
        preloadAll().catch(console.warn)
      }, 2000)
    }
  }, [preloadAll])

  return null
})

ComponentPreloader.displayName = 'ComponentPreloader' 