import { useState, useEffect } from 'react'

export function useTypewriter(text, speed = 20) {
  const [displayed, setDisplayed] = useState('')
  const [isDone, setIsDone] = useState(false)

  useEffect(() => {
    setDisplayed('')
    setIsDone(false)
    let i = 0
    const timer = setInterval(() => {
      if (text && i < text.length) {
        setDisplayed(prev => prev + text[i])
        i++
      } else {
        setIsDone(true)
        clearInterval(timer)
      }
    }, speed)
    return () => clearInterval(timer)
  }, [text, speed])

  return { displayed, isDone }
}
