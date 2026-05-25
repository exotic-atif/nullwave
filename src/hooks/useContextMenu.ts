import { useState, useCallback } from 'react'

interface ContextMenuState {
  isOpen: boolean
  position: { x: number; y: number }
}

export function useContextMenu() {
  const [state, setState] = useState<ContextMenuState>({
    isOpen: false,
    position: { x: 0, y: 0 },
  })

  /** Open from right-click */
  const openContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setState({ isOpen: true, position: { x: e.clientX, y: e.clientY } })
  }, [])

  /** Open from a button click (positions relative to button) */
  const openFromButton = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    setState({
      isOpen: true,
      position: { x: rect.right - 180, y: rect.bottom + 4 },
    })
  }, [])

  const close = useCallback(() => {
    setState((prev) => ({ ...prev, isOpen: false }))
  }, [])

  return {
    isOpen: state.isOpen,
    position: state.position,
    openContextMenu,
    openFromButton,
    close,
  }
}
