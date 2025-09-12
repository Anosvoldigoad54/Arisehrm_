// Common Components Index
export { default as MetricCard } from './MetricCard'
export { default as StatusChip } from './StatusChip'
export { default as ResponsiveTable } from './ResponsiveTable'
export { default as ResponsiveContainer } from './ResponsiveContainer'
export { default as ResponsiveDialog } from './ResponsiveDialog'
export { default as ErrorBoundary } from './ErrorBoundary'
export { default as RLSNotice } from './RLSNotice'
export { default as CountUp } from './CountUp'
export { default as NumberTicker } from './NumberTicker'
export { default as AnimatedNotifications } from './AnimatedNotifications'

// Responsive Wrappers
export {
  ResponsivePageWrapper,
  DashboardPageWrapper,
  FormPageWrapper,
  GridPageWrapper,
  ResponsiveCardGrid
} from './ResponsivePageWrapper'

// Design System Utilities
export { useDesignSystem } from './DesignSystemUtils'

// Re-export responsive hook for convenience
export { useResponsive } from '../../hooks/useResponsive'
