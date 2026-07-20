import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// AIME_PREVIEW_DISABLE_SW
if (import.meta.env.DEV && 'serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((regs) => regs.forEach((r) => r.unregister())).catch(() => {})
}

ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>)
