import { useState, useEffect } from 'react'

export function useCountUp(target, duration = 1500) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (target === undefined || target === null) return;
    const start = performance.now()
    const animate = (now) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3) // easeOutCubic
      setCount(Math.floor(eased * target))
      if (progress < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [target, duration])

  return count
}
