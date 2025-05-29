import { createContext, useState, useContext } from "react"
import axios from "axios"

const SwapContext = createContext()

export const SwapProvider = ({ children }) => {
  const [swaps, setSwaps] = useState([])
  const [swap, setSwap] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
  })

  const getMySwaps = async (params = {}) => {
    setLoading(true)

    try {
      const queryParams = new URLSearchParams()

      queryParams.append("page", params.page || 1)
      queryParams.append("limit", params.limit || 10)

      if (params.status) queryParams.append("status", params.status)
      if (params.role) queryParams.append("role", params.role)

      const res = await axios.get(`/api/swaps/my-swaps?${queryParams.toString()}`)

      setSwaps(res.data.data.swaps)
      setPagination({
        currentPage: res.data.data.currentPage,
        totalPages: res.data.data.totalPages,
        total: res.data.data.total,
      })

      setLoading(false)
      return res.data.data
    } catch (err) {
      setError(err.response?.data?.message || "Error fetching swaps")
      setLoading(false)
      return { success: false, error: err.response?.data?.message || "Error fetching swaps" }
    }
  }

  const getSwap = async (id) => {
    setLoading(true)

    try {
      const res = await axios.get(`/api/swaps/${id}`)
      setSwap(res.data.data)
      setLoading(false)
      return res.data.data
    } catch (err) {
      setError(err.response?.data?.message || "Error fetching swap")
      setLoading(false)
      return { success: false, error: err.response?.data?.message || "Error fetching swap" }
    }
  }

  const createSwap = async (swapData) => {
    setLoading(true)

    try {
      const res = await axios.post("/api/swaps", swapData)
      setLoading(false)
      return { success: true, data: res.data.data }
    } catch (err) {
      setError(err.response?.data?.message || "Error creating swap request")
      setLoading(false)
      return { success: false, error: err.response?.data?.message || "Error creating swap request" }
    }
  }

  const updateSwapStatus = async (id, status) => {
    setLoading(true)

    try {
      const res = await axios.put(`/api/swaps/${id}/status`, { status })
      setLoading(false)
      return { success: true, data: res.data.data }
    } catch (err) {
      setError(err.response?.data?.message || "Error updating swap status")
      setLoading(false)
      return { success: false, error: err.response?.data?.message || "Error updating swap status" }
    }
  }

  const addReview = async (id, reviewData) => {
    setLoading(true)

    try {
      const res = await axios.put(`/api/swaps/${id}/review`, reviewData)
      setLoading(false)
      return { success: true, data: res.data.data }
    } catch (err) {
      setError(err.response?.data?.message || "Error adding review")
      setLoading(false)
      return { success: false, error: err.response?.data?.message || "Error adding review" }
    }
  }

  const clearError = () => {
    setError(null)
  }

  return (
    <SwapContext.Provider
      value={{
        swaps,
        swap,
        loading,
        error,
        pagination,
        getMySwaps,
        getSwap,
        createSwap,
        updateSwapStatus,
        addReview,
        clearError,
      }}
    >
      {children}
    </SwapContext.Provider>
  )
}

export const useSwap = () => useContext(SwapContext)
