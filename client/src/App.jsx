import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import { FoodProvider } from "./context/FoodContext"
import { SwapProvider } from "./context/SwapContext"
import PrivateRoute from "./components/routing/PrivateRoute"
import LandingPage from "./pages/landing-page"
import AuthPage from "./pages/auth-page"
import DashboardLayout from "./components/dashboard-layout"
import IndividualDashboard from "./pages/individual/individual-dashboard"
import LocationPage from "./pages/individual/location-page"
import ProfilePage from "./pages/individual/profile-page"
import SecretDonorPage from "./pages/secret-donor-page"
import FoodItemForm from "./pages/individual/food-item-form"
import Settings from './pages/Settings'

function App() {
  return (
    <AuthProvider>
      <FoodProvider>
        <SwapProvider>
          <Router>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/auth/signup" element={<AuthPage />} />
              <Route path="/auth/login" element={<AuthPage />} />
              <Route path="/donor" element={<SecretDonorPage />} />

              {/* Customer routes with dashboard layout */}
              <Route
                path="/"
                element={
                  <PrivateRoute>
                    <DashboardLayout userType="customer" />
                  </PrivateRoute>
                }
              >
                <Route path="/customer" element={<IndividualDashboard />} />
                <Route path="/location" element={<LocationPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/add-food-item" element={<FoodItemForm />} />
                <Route path="/edit-food-item/:id" element={<FoodItemForm />} />
              </Route>

              {/* Restaurant routes with dashboard layout */}
              <Route
                path="/"
                element={
                  <PrivateRoute>
                    <DashboardLayout />
                  </PrivateRoute>
                }
              >
                
              </Route>

              {/* Add this route at the top of your Routes */}
              <Route path="/" element={<Navigate to="/customer" replace />} />

              <Route path="/settings" element={<Settings />} />

            </Routes>
          </Router>
        </SwapProvider>
      </FoodProvider>
    </AuthProvider>
  )
}

export default App

