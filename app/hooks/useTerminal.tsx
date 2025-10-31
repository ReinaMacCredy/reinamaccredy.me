'use client'

import { useEffect, useRef } from 'react'
import { detectClient } from '../lib/utils/client'
import { registerTerminalContainer } from '../features/terminalContainer'
import type { ScrollEvents } from '../types/core'

export function useTerminal(scrollEvents: ScrollEvents | null): void {
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!scrollEvents) return
    
    const client = detectClient()
    
    try {
      registerTerminalContainer({ scrollEvents })
    } catch (error) {
      console.error('[bootstrap] registerTerminalContainer failed:', error)
      
      if (client.mobile) {
        retryTimeoutRef.current = setTimeout(() => {
          try {
            registerTerminalContainer({ scrollEvents })
          } catch (retryError) {
            console.error('[bootstrap] terminal retry failed:', retryError)
          }
        }, 1500)
      }
    }
    
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
      }
    }
  }, [scrollEvents])
}

