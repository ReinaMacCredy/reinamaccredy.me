'use client'

import { useEffect } from 'react'
import { registerSlideshows } from '../features/slideshowRegister'
import type { ScrollEvents } from '../types/core'
import { logger } from '../lib/utils/logger'

export function useSlideshows(scrollEvents: ScrollEvents | null): void {
  useEffect(() => {
    if (!scrollEvents) return
    
    try {
      registerSlideshows({ scrollEvents })
    } catch (error) {
      logger.error('[bootstrap] registerSlideshows failed:', error)
    }
  }, [scrollEvents])
}

