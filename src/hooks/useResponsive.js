import { useState, useEffect } from 'react'

export const useResponsive = () => {
  const [screenSize, setScreenSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  })

  const [breakpoint, setBreakpoint] = useState('lg')

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      
      setScreenSize({ width, height })
      
      // Определяем breakpoint согласно TailwindCSS
      if (width < 640) {
        setBreakpoint('sm')
      } else if (width < 768) {
        setBreakpoint('md') 
      } else if (width < 1024) {
        setBreakpoint('lg')
      } else if (width < 1280) {
        setBreakpoint('xl')
      } else {
        setBreakpoint('2xl')
      }
    }

    // Вызываем сразу для установки начального состояния
    handleResize()

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return {
    ...screenSize,
    breakpoint,
    isMobile: breakpoint === 'sm',
    isTablet: breakpoint === 'md',
    isDesktop: breakpoint === 'lg' || breakpoint === 'xl' || breakpoint === '2xl',
    isSmallScreen: breakpoint === 'sm' || breakpoint === 'md'
  }
}