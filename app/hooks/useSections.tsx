'use client'

import { useEffect, useRef } from 'react'
import { setupSectionsNavigationReal } from '../features/sections'
import { attachCompatGlobals } from '../lib/compat/globals'
import type { SectionsNavigation } from '../types/core'

export function useSections(): SectionsNavigation | null {
  const sectionsRef = useRef<SectionsNavigation | null>(null)

  useEffect(() => {
    sectionsRef.current = setupSectionsNavigationReal()
    
    attachCompatGlobals({ 
      sections: sectionsRef.current, 
      scrollToTop: sectionsRef.current.scrollToTop 
    })
  }, [])

  return sectionsRef.current
}

