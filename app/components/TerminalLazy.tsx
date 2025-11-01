'use client'

import React, { Suspense, lazy } from 'react'
import type { ScrollEvents } from '../types/core'

const TerminalLoader = lazy(() => import('../hooks/useTerminal').then(module => ({
  default: function TerminalLoaderInner({ scrollEvents }: { scrollEvents: ScrollEvents | null }) {
    module.useTerminal(scrollEvents)
    return null
  }
})))

interface TerminalLazyProps {
  scrollEvents: ScrollEvents | null
}

export function TerminalLazy({ scrollEvents }: TerminalLazyProps): React.ReactElement | null {
  if (!scrollEvents) return null
  
  return (
    <Suspense fallback={null}>
      <TerminalLoader scrollEvents={scrollEvents} />
    </Suspense>
  )
}

