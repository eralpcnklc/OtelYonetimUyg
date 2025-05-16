import { useState } from 'react'
import Login from './components/LogIn/Login'
import MainPage from './components/MainPage/MainPage'
import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';


function App() {
  

  return (
    <div>
      <Router>
        <Routes>
          <Route path="/" element={<Login/>} />
          <Route path="/MainPage" element={<MainPage/>} />
        </Routes>
      </Router>
    </div>
      
     
  )
}

export default App
