'use client'

import { useEffect } from 'react'
import { initReorder } from '../features/reorder'

export function useReorder(): void {
  useEffect(() => {
    try {
      initReorder()
    } catch (error) {
      console.error('[bootstrap] initReorder failed:', error)
    }
  }, [])
}

