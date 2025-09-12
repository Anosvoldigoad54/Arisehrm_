'use client'

import React, { useState, useEffect } from 'react'

interface NumberTickerProps {
  value: number
  formatValue?: (value: number) => string
  duration?: number
  decimals?: number
}

export const NumberTicker: React.FC<NumberTickerProps> = ({
  value,
  formatValue,
  duration = 1000,
  decimals = 0
}) => {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    let startTime: number
    let animationFrame: number

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Easing function for smooth animation
      const easeOutCubic = 1 - Math.pow(1 - progress, 3)
      
      const currentValue = easeOutCubic * value
      setDisplayValue(currentValue)

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }

    animationFrame = requestAnimationFrame(animate)

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
    }
  }, [value, duration])

  const formattedValue = formatValue 
    ? formatValue(displayValue) 
    : displayValue.toFixed(decimals)

  return <span>{formattedValue}</span>
}

export default NumberTicker
