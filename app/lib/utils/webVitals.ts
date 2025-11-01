interface LayoutShift extends PerformanceEntry {
  value: number
  hadRecentInput: boolean
  sources: Array<{
    node?: Node
    previousRect: DOMRectReadOnly
    currentRect: DOMRectReadOnly
  }>
}

interface PerformanceEventTiming extends PerformanceEntry {
  processingStart?: number
}

export interface WebVitalsMetric {
  name: string
  value: number
  id: string
  delta: number
  rating: 'good' | 'needs-improvement' | 'poor'
}

type MetricHandler = (metric: WebVitalsMetric) => void

let metricHandlers: MetricHandler[] = []

export function onWebVital(handler: MetricHandler): () => void {
  metricHandlers.push(handler)
  return () => {
    metricHandlers = metricHandlers.filter(h => h !== handler)
  }
}

function reportMetric(metric: WebVitalsMetric): void {
  metricHandlers.forEach(handler => {
    try {
      handler(metric)
    } catch (error) {
    }
  })
}

function getRating(value: number, thresholds: { good: number; poor: number }): 'good' | 'needs-improvement' | 'poor' {
  if (value <= thresholds.good) return 'good'
  if (value <= thresholds.poor) return 'needs-improvement'
  return 'poor'
}

export function initLCP(): void {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return

  try {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1] as PerformanceEntry & { renderTime?: number; loadTime?: number; startTime: number }

      if (lastEntry) {
        const value = lastEntry.renderTime || lastEntry.loadTime || lastEntry.startTime
        reportMetric({
          name: 'LCP',
          value: Math.round(value),
          id: lastEntry.entryType,
          delta: Math.round(value),
          rating: getRating(value, { good: 2500, poor: 4000 })
        })
      }
    })

    observer.observe({ entryTypes: ['largest-contentful-paint'] })
  } catch (error) {
  }
}

export function initFID(): void {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return

  try {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry) => {
        const fidEntry = entry as PerformanceEventTiming
        if (fidEntry.processingStart === undefined) return
        const value = fidEntry.processingStart - fidEntry.startTime

        reportMetric({
          name: 'FID',
          value: Math.round(value),
          id: entry.name,
          delta: Math.round(value),
          rating: getRating(value, { good: 100, poor: 300 })
        })
      })
    })

    observer.observe({ entryTypes: ['first-input'] })
  } catch (error) {
  }
}

export function initCLS(): void {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return

  try {
    let clsValue = 0
    let clsEntries: PerformanceEntry[] = []

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!(entry as LayoutShift).hadRecentInput) {
          const firstSessionEntry = clsEntries[0]
          const lastSessionEntry = clsEntries[clsEntries.length - 1]

          const sessionEntry = entry as LayoutShift
          if (
            sessionEntry &&
            clsEntries.length > 0 &&
            sessionEntry.startTime - lastSessionEntry.startTime < 1000 &&
            sessionEntry.startTime - firstSessionEntry.startTime < 5000
          ) {
            clsValue += (entry as LayoutShift).value
            clsEntries.push(entry)
          } else {
            clsValue = sessionEntry.value
            clsEntries = [entry]
          }
        }
      }

      reportMetric({
        name: 'CLS',
        value: Math.round(clsValue * 1000) / 1000,
        id: 'cls',
        delta: Math.round(clsValue * 1000) / 1000,
        rating: getRating(clsValue, { good: 0.1, poor: 0.25 })
      })
    })

    observer.observe({ entryTypes: ['layout-shift'] })
  } catch (error) {
  }
}

export function initFCP(): void {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return

  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          reportMetric({
            name: 'FCP',
            value: Math.round(entry.startTime),
            id: entry.name,
            delta: Math.round(entry.startTime),
            rating: getRating(entry.startTime, { good: 1800, poor: 3000 })
          })
        }
      }
    })

    observer.observe({ entryTypes: ['paint'] })
  } catch (error) {
  }
}

export function initTTFB(): void {
  if (typeof window === 'undefined' || !('performance' in window)) return

  try {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    if (navigation) {
      const ttfb = navigation.responseStart - navigation.requestStart
      reportMetric({
        name: 'TTFB',
        value: Math.round(ttfb),
        id: 'ttfb',
        delta: Math.round(ttfb),
        rating: getRating(ttfb, { good: 800, poor: 1800 })
      })
    }
  } catch (error) {
  }
}

export function initWebVitals(): void {
  if (typeof window === 'undefined') return

  initLCP()
  initFID()
  initCLS()
  initFCP()
  initTTFB()
}

