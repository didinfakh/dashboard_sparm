import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Dashboard1 from './Dashboard1'
import Dashboard2 from './Dashboard2'

function Home() {
  return (
    <div>
      <h2>Home Page</h2>
      <p>Welcome to the Home page!</p>
    </div>
  )
}

function About() {
  return (
    <div>
      <h2>About Page</h2>
      <p>This is the About page.</p>
    </div>
  )
}

function App() {
  const [count, setCount] = useState(0)

  return (
    <Router>
     
      <Routes>
        <Route path="/" element={<Dashboard1/>} />
        <Route path="/dashboard2" element={<Dashboard2 />} />
      </Routes>
      
    </Router>
  )
}

export default App