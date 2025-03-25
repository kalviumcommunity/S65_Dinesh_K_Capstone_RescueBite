import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import LandingPage from "./pages/landing-page"
import AuthPage from "./pages/auth-page"
import IndividualDashboard from "./pages/individual/individual-dashboard"
import OrganizationDashboard from "./pages/organization/organization-dashboard"

const App = () => {
  return (
    <Router>
      <Routes>

      <Route path="/" element={<LandingPage />} />
      <Route path="/auth/signup" element={<AuthPage />} />
      <Route path="/auth/login" element={<AuthPage />} />

      <Route path="/customer" element={<IndividualDashboard />} />
      <Route path="/restaurant" element={<OrganizationDashboard />} />

      </Routes>

    </Router>
    
  )
}

export default App