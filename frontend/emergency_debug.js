// EMERGENCY AUTH DEBUG SCRIPT
// Copy and paste this entire script into browser console to debug the login issue

console.log('🚨 EMERGENCY AUTH DEBUG ACTIVE');

// Track all navigation changes
let navigationLog = [];
const originalPushState = history.pushState;
const originalReplaceState = history.replaceState;
const originalReload = location.reload;

history.pushState = function(...args) {
  console.log('🔄 NAVIGATION PUSH:', args[2], new Error().stack);
  navigationLog.push({type: 'push', url: args[2], timestamp: Date.now(), stack: new Error().stack});
  return originalPushState.apply(this, arguments);
};

history.replaceState = function(...args) {
  console.log('🔄 NAVIGATION REPLACE:', args[2], new Error().stack);
  navigationLog.push({type: 'replace', url: args[2], timestamp: Date.now(), stack: new Error().stack});
  return originalReplaceState.apply(this, arguments);
};

location.reload = function() {
  console.log('🔄 PAGE RELOAD TRIGGERED!', new Error().stack);
  navigationLog.push({type: 'reload', timestamp: Date.now(), stack: new Error().stack});
  return originalReload.apply(this, arguments);
};

// Track auth context changes
let authStateLog = [];
const logAuthState = () => {
  const authData = {
    timestamp: Date.now(),
    url: window.location.href,
    pathname: window.location.pathname,
    sessionFlags: {
      auth_in_progress: sessionStorage.getItem('auth_in_progress'),
      login_in_progress: sessionStorage.getItem('login_in_progress'),
      shouldNavigateToDashboard: sessionStorage.getItem('shouldNavigateToDashboard'),
      pendingNavigation: sessionStorage.getItem('pendingNavigation')
    }
  };
  authStateLog.push(authData);
  console.log('📊 Auth State:', authData);
  return authData;
};

// Log every 500ms
const authMonitor = setInterval(logAuthState, 500);

// Track React Router navigation
window.addEventListener('popstate', (e) => {
  console.log('🔄 POPSTATE:', e, window.location.href);
  logAuthState();
});

// Track form submissions
document.addEventListener('submit', (e) => {
  console.log('📝 FORM SUBMIT:', e.target, e.target.action);
  logAuthState();
});

// Monitor useEffect and component renders
let renderCount = 0;
const originalUseEffect = React?.useEffect;
if (originalUseEffect) {
  React.useEffect = function(...args) {
    console.log('⚛️ useEffect called:', ++renderCount, args[1]?.length || 'no deps');
    return originalUseEffect.apply(this, arguments);
  };
}

// Monitor route changes
window.addEventListener('beforeunload', (e) => {
  console.log('🔄 BEFORE UNLOAD - Navigation Log:', navigationLog);
  console.log('📊 Auth State Log:', authStateLog);
});

console.log('✅ Emergency debugging active. Now try to login.');
console.log('📋 Use these commands to check logs:');
console.log('- navigationLog: see all navigation events');
console.log('- authStateLog: see auth state changes');
console.log('- clearInterval(' + authMonitor + '): stop monitoring');

// Expose debugging functions
window.emergencyDebug = {
  navigationLog,
  authStateLog,
  clearMonitor: () => clearInterval(authMonitor),
  getLastAuth: () => authStateLog[authStateLog.length - 1],
  getLastNav: () => navigationLog[navigationLog.length - 1]
};
