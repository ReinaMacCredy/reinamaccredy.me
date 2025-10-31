'use client'

import { useEffect } from 'react'
import { createOnVisible } from '../lib/utils/onvisible'
import { registerEffects } from '../features/onvisibleRegister'
import { registerPageOnVisible } from '../features/onvisiblePageRegister'
import type { ScrollEvents } from '../types/core'

export function useOnVisible(scrollEvents: ScrollEvents | null): void {
  useEffect(() => {
    if (!scrollEvents) return
    
    const onvisible = createOnVisible({ scrollEvents })
    registerEffects({ onvisible })
    registerPageOnVisible({ onvisible })
  }, [scrollEvents])
}

