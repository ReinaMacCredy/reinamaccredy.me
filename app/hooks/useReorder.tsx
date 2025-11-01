'use client'

import { useEffect } from 'react'
import { initReorder } from '../features/reorder'
import { withErrorHandling } from '../lib/utils/hookUtils'

export function useReorder(): void {
  useEffect(() => {
    withErrorHandling('initReorder', () => {
      initReorder()
    })
  }, [])
}

