import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import Header from './components/Header'
import FlashcardsPage from './pages/FlashcardsPage'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<FlashcardsPage />} />
        <Route path="/wordlist" element={<div>Topics Page</div>} />
      </Routes>
    </Router>
  )
}

export default App
