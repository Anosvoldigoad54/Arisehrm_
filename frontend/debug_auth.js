// Authentication Debugging Script
// Add this to your browser console to monitor auth state changes in real-time

console.log('🔍 Auth Debugging Script Started')

// Monitor session storage changes
const originalSetItem = Storage.prototype.setItem
const originalRemoveItem = Storage.prototype.removeItem

Storage.prototype.setItem = function(key, value) {
  if (key.includes('auth') || key.includes('login')) {
    console.log(`📝 SessionStorage SET: ${key} = ${value}`)
  }
  return originalSetItem.apply(this, arguments)
}

Storage.prototype.removeItem = function(key) {
  if (key.includes('auth') || key.includes('login')) {
    console.log(`🗑️ SessionStorage REMOVE: ${key}`)
  }
  return originalRemoveItem.apply(this, arguments)
}

// Monitor navigation changes
const originalPushState = history.pushState
const originalReplaceState = history.replaceState

history.pushState = function(...args) {
  console.log('🔄 Navigation PUSH:', args[2])
  return originalPushState.apply(this, arguments)
}

history.replaceState = function(...args) {
  console.log('🔄 Navigation REPLACE:', args[2])
  return originalReplaceState.apply(this, arguments)
}

// Monitor page reloads
window.addEventListener('beforeunload', () => {
  console.log('🔄 Page about to reload/navigate')
})

// Check current auth state
function checkAuthState() {
  const authFlags = {
    auth_in_progress: sessionStorage.getItem('auth_in_progress'),
    login_in_progress: sessionStorage.getItem('login_in_progress'),
    shouldNavigateToDashboard: sessionStorage.getItem('shouldNavigateToDashboard'),
    pendingNavigation: sessionStorage.getItem('pendingNavigation')
  }
  
  console.log('🏷️ Current Auth Flags:', authFlags)
  console.log('🌍 Current URL:', window.location.href)
  
  return authFlags
}

// Run initial check
checkAuthState()

// Set up periodic checks
const authMonitor = setInterval(checkAuthState, 2000)

console.log('✅ Auth debugging active. Use clearInterval(' + authMonitor + ') to stop.')
console.log('💡 Call checkAuthState() manually to see current state')

// Expose utility functions
window.debugAuth = {
  checkState: checkAuthState,
  clearMonitor: () => clearInterval(authMonitor),
  clearAuthFlags: () => {
    sessionStorage.removeItem('auth_in_progress')
    sessionStorage.removeItem('login_in_progress')
    sessionStorage.removeItem('shouldNavigateToDashboard')
    sessionStorage.removeItem('pendingNavigation')
    console.log('🧹 Cleared all auth flags')
  }
}

console.log('🎯 Debug utilities available at window.debugAuth')
