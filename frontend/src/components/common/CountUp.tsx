import React, { useState, useEffect, useRef } from 'react'
import { CountUpProps } from './types'
import { designTokens } from '../../styles/Theme/tokens'

const CountUp: React.FC<CountUpProps> = ({
  value,
  duration = 2000,
  decimals = 0,
  prefix = '',
  suffix = '',
  separator = ',',
  onComplete,
  sx,
  className,
  ...props
}) => {
  const [currentValue, setCurrentValue] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const animationRef = useRef<number>()
  const startTimeRef = useRef<number>()
  const startValueRef = useRef<number>(0)

  useEffect(() => {
    setIsAnimating(true)
    startTimeRef.current = Date.now()
    startValueRef.current = currentValue

    const animate = () => {
      const now = Date.now()
      const elapsed = now - (startTimeRef.current || 0)
      const progress = Math.min(elapsed / duration, 1)

      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3)
      
      const newValue = startValueRef.current + (value - startValueRef.current) * easeOut
      setCurrentValue(newValue)

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate)
      } else {
        setCurrentValue(value)
        setIsAnimating(false)
        onComplete?.()
      }
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [value, duration, onComplete])

  const formatNumber = (num: number): string => {
    const fixed = num.toFixed(decimals)
    const parts = fixed.split('.')
    
    // Add thousand separators
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, separator)
    
    return parts.join('.')
  }

  const displayValue = formatNumber(currentValue)

  return (
    <span 
      className={className}
      style={{
        transition: isAnimating ? 'none' : `all ${designTokens.animation.duration.normal} ${designTokens.animation.ease.out}`,
        ...(sx as any)
      }}
      {...props}
    >
      {prefix}{displayValue}{suffix}
    </span>
  )
}

export default CountUp
