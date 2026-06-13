import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// Находим div с id="root" и рендерим туда наше приложение
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
