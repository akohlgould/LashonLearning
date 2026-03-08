import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import Header from './components/Header'
import FlashcardsPage from './pages/FlashcardsPage'

function App() {
  return (
    <>
      <Header />
      <FlashcardsPage />    
    </>
  )
}

export default App
