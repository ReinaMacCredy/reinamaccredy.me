'use client'

import { useEffect } from 'react'
import { initDeferredImages } from '../features/deferredImages'
import type { ScrollEvents } from '../types/core'

export function useDeferredImages(scrollEvents: ScrollEvents | null): void {
  useEffect(() => {
    if (!scrollEvents) return
    
    try {
      initDeferredImages({ scrollEvents })
    } catch (error) {
      console.error('[bootstrap] initDeferredImages failed:', error)
    }
  }, [scrollEvents])
}

