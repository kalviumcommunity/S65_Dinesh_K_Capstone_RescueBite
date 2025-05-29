import axios from "axios"

axios.defaults.baseURL = process.env.REACT_APP_API_URL || "http://localhost:5000"

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

axios.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token")
      window.location.href = "/auth"
    }
    return Promise.reject(error)
  },
)

export default axios
