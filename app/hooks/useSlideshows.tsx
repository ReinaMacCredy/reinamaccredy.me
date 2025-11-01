'use client'

import { useEffect } from 'react'
import { registerSlideshows } from '../features/slideshowRegister'
import type { ScrollEvents } from '../types/core'
import { withErrorHandling } from '../lib/utils/hookUtils'

export function useSlideshows(scrollEvents: ScrollEvents | null): void {
  useEffect(() => {
    if (!scrollEvents) return
    withErrorHandling('registerSlideshows', () => {
      registerSlideshows({ scrollEvents })
    })
  }, [scrollEvents])
}

