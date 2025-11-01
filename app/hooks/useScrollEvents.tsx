'use client'

import { useEffect, useState } from 'react'
import { detectClient } from '../lib/utils/client'
import { createScrollEvents } from '../lib/utils/scrollEvents'
import type { ScrollEvents } from '../types/core'

export function useScrollEvents(): ScrollEvents | null {
  const [scrollEvents, setScrollEvents] = useState<ScrollEvents | null>(null)

  useEffect(() => {
    const client = detectClient()
    const isIos = client.os === 'ios'
    
    const events = createScrollEvents({ isIos })
    
    events.init()
    
    try { 
      events.handler() 
    } catch (_) { }
    
    setScrollEvents(events)

    return () => {
      if (events.cleanup) {
        events.cleanup()
      }
    }
  }, [])

  return scrollEvents
}

