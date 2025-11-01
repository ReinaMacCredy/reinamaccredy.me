'use client'

import { useEffect } from 'react'
import { initReorder } from '../features/reorder'
import { logger } from '../lib/utils/logger'

export function useReorder(): void {
  useEffect(() => {
    try {
      initReorder()
    } catch (error) {
      logger.error('[bootstrap] initReorder failed:', error)
    }
  }, [])
}

