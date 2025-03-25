import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import LandingPage from "./pages/landing-page"
import AuthPage from "./pages/auth-page"

const App = () => {
  return (
    <Router>
      <Routes>

      <Route path="/" element={<LandingPage />} />
      <Route path="/auth/signup" element={<AuthPage />} />
      <Route path="/auth/login" element={<AuthPage />} />

      </Routes>

    </Router>
    
  )
}

export default App