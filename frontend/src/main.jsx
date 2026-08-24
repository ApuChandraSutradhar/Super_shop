import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// 1. CartProvider Import করুন

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 2. App কে CartProvider দিয়ে র‍্যাপ করুন */}
    <App />
  </React.StrictMode>,
)
