import axios from "axios"

// Set base URL for API requests
axios.defaults.baseURL = process.env.REACT_APP_API_URL || "http://localhost:5000"

// Add a request interceptor to include auth token
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers["x-auth-token"] = token
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Add a response interceptor to handle errors
axios.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token")
      window.location.href = "/auth"
    }
    return Promise.reject(error)
  },
)

export default axios

