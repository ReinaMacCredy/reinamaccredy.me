'use client'

import { useEffect } from 'react'

export function useLifecycle(): void {
  useEffect(() => {
    setTimeout(() => {
      document.body.classList.remove('is-loading')
      document.body.classList.add('is-playing')
      setTimeout(() => {
        document.body.classList.remove('is-playing')
        document.body.classList.add('is-ready')
      }, 1000)
    }, 100)
  }, [])
}

