import { createContext, useState, useEffect, useContext } from "react"
import axios from "axios"

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem("token"))
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Set auth token
  const setAuthToken = (token) => {
    if (token) {
      axios.defaults.headers.common["x-auth-token"] = token
      localStorage.setItem("token", token)
    } else {
      delete axios.defaults.headers.common["x-auth-token"]
      localStorage.removeItem("token")
    }
  }

  // Load user
  const loadUser = async () => {
    if (token) {
      setAuthToken(token)

      try {
        const res = await axios.get("/api/auth/me")
        setUser(res.data.user)
        setIsAuthenticated(true)
      } catch (err) {
        setToken(null)
        setUser(null)
        setIsAuthenticated(false)
        setAuthToken(null)
      }
    }

    setLoading(false)
  }

  // Register user
  const register = async (formData) => {
    try {
      const res = await axios.post("/api/auth/register", formData)
      localStorage.setItem("token", res.data.token)
      setToken(res.data.token)
      await loadUser()
      return { success: true }
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed")
      return { success: false, error: err.response?.data?.message || "Registration failed" }
    }
  }

  // Login user
  const login = async (email, password) => {
    try {
      const res = await axios.post("/api/auth/login", { email, password })

      setToken(res.data.token)
      setAuthToken(res.data.token)
      await loadUser()

      return { success: true }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials")
      return { success: false, error: err.response?.data?.message || "Invalid credentials" }
    }
  }

  // Logout user
  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
    setIsAuthenticated(false)
    // Add redirect
    window.location.href = '/auth'
  }

  // Update user profile
  const updateProfile = async (profileData) => {
    try {
      const res = await axios.put("/api/users/profile", profileData)
      setUser(res.data.data)
      return { success: true, data: res.data.data }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile")
      return { success: false, error: err.response?.data?.message || "Failed to update profile" }
    }
  }

  // Clear errors
  const clearError = () => {
    setError(null)
  }

  useEffect(() => {
    loadUser()
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        loading,
        error,
        register,
        login,
        logout,
        updateProfile,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

