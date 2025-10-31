'use client'

import { useEffect } from 'react'
import { registerSlideshows } from '../features/slideshowRegister'
import type { ScrollEvents } from '../types/core'

export function useSlideshows(scrollEvents: ScrollEvents | null): void {
  useEffect(() => {
    if (!scrollEvents) return
    
    try {
      registerSlideshows({ scrollEvents })
    } catch (error) {
      console.error('[bootstrap] registerSlideshows failed:', error)
    }
  }, [scrollEvents])
}

