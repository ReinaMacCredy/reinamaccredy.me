'use client'

import { useEffect } from 'react'
import { detectClient } from '../lib/utils/client'
import { applyPlatformFixes } from '../features/platformFixes'

export function usePlatformFixes(): void {
  useEffect(() => {
    const client = detectClient()
    
    applyPlatformFixes({ client })
  }, [])
}

