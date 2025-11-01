'use client'

import { useEffect } from 'react'
import { initDeferredImages } from '../features/deferredImages'
import type { ScrollEvents } from '../types/core'
import { logger } from '../lib/utils/logger'

export function useDeferredImages(scrollEvents: ScrollEvents | null): void {
  useEffect(() => {
    if (!scrollEvents) return
    
    try {
      initDeferredImages({ scrollEvents })
    } catch (error) {
      logger.error('[bootstrap] initDeferredImages failed:', error)
    }
  }, [scrollEvents])
}

