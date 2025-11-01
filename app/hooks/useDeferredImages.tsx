'use client'

import { useEffect } from 'react'
import { initDeferredImages } from '../features/deferredImages'
import type { ScrollEvents } from '../types/core'
import { withErrorHandling } from '../lib/utils/hookUtils'

export function useDeferredImages(scrollEvents: ScrollEvents | null): void {
  useEffect(() => {
    if (!scrollEvents) return
    withErrorHandling('initDeferredImages', () => {
      initDeferredImages({ scrollEvents })
    })
  }, [scrollEvents])
}

