import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App' // or wherever your main App component lives
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)