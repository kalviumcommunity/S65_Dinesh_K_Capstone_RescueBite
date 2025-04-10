import { createContext, useState, useContext } from "react"
import axios from "axios"

const FoodContext = createContext()

export const FoodProvider = ({ children }) => {
  const [foodItems, setFoodItems] = useState([])
  const [foodItem, setFoodItem] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
  })

  // Get all food items
  const getFoodItems = async (params = {}) => {
    setLoading(true)

    try {
      const queryParams = new URLSearchParams()

      // Add pagination
      queryParams.append("page", params.page || 1)
      queryParams.append("limit", params.limit || 10)

      // Add filters
      if (params.category) queryParams.append("category", params.category)
      if (params.dietary) queryParams.append("dietary", params.dietary)
      if (params.isFree) queryParams.append("isFree", params.isFree)
      if (params.search) queryParams.append("search", params.search)
      if (params.lat) queryParams.append("lat", params.lat)
      if (params.lng) queryParams.append("lng", params.lng)
      if (params.distance) queryParams.append("distance", params.distance)
      if (params.sortBy) queryParams.append("sortBy", params.sortBy)
      if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder)

      const res = await axios.get(`/api/food-items?${queryParams.toString()}`)

      setFoodItems(res.data.data.foodItems)
      setPagination({
        currentPage: res.data.data.currentPage,
        totalPages: res.data.data.totalPages,
        total: res.data.data.total,
      })

      setLoading(false)
      return res.data.data
    } catch (err) {
      setError(err.response?.data?.message || "Error fetching food items")
      setLoading(false)
      return { success: false, error: err.response?.data?.message || "Error fetching food items" }
    }
  }

  // Get a single food item
  const getFoodItem = async (id) => {
    setLoading(true)

    try {
      const res = await axios.get(`/api/food-items/${id}`)
      setFoodItem(res.data.data)
      setLoading(false)
      return res.data.data
    } catch (err) {
      setError(err.response?.data?.message || "Error fetching food item")
      setLoading(false)
      return { success: false, error: err.response?.data?.message || "Error fetching food item" }
    }
  }

  // Create a new food item
  const createFoodItem = async (foodItemData) => {
    setLoading(true)

    try {
      const res = await axios.post("/api/food-items", foodItemData)
      setLoading(false)
      return { success: true, data: res.data.data }
    } catch (err) {
      setError(err.response?.data?.message || "Error creating food item")
      setLoading(false)
      return { success: false, error: err.response?.data?.message || "Error creating food item" }
    }
  }

  // Update a food item
  const updateFoodItem = async (id, foodItemData) => {
    setLoading(true)

    try {
      const res = await axios.put(`/api/food-items/${id}`, foodItemData)
      setLoading(false)
      return { success: true, data: res.data.data }
    } catch (err) {
      setError(err.response?.data?.message || "Error updating food item")
      setLoading(false)
      return { success: false, error: err.response?.data?.message || "Error updating food item" }
    }
  }

  // Delete a food item
  const deleteFoodItem = async (id) => {
    setLoading(true)

    try {
      await axios.delete(`/api/food-items/${id}`)
      setLoading(false)
      return { success: true }
    } catch (err) {
      setError(err.response?.data?.message || "Error deleting food item")
      setLoading(false)
      return { success: false, error: err.response?.data?.message || "Error deleting food item" }
    }
  }

  // Get food items by user
  const getUserFoodItems = async (userId, params = {}) => {
    setLoading(true)

    try {
      const queryParams = new URLSearchParams()

      // Add pagination
      queryParams.append("page", params.page || 1)
      queryParams.append("limit", params.limit || 10)

      // Add status filter
      if (params.status) queryParams.append("status", params.status)

      const res = await axios.get(`/api/food-items/user/${userId}?${queryParams.toString()}`)

      setFoodItems(res.data.data.foodItems)
      setPagination({
        currentPage: res.data.data.currentPage,
        totalPages: res.data.data.totalPages,
        total: res.data.data.total,
      })

      setLoading(false)
      return res.data.data
    } catch (err) {
      setError(err.response?.data?.message || "Error fetching user food items")
      setLoading(false)
      return { success: false, error: err.response?.data?.message || "Error fetching user food items" }
    }
  }

  // Clear errors
  const clearError = () => {
    setError(null)
  }

  return (
    <FoodContext.Provider
      value={{
        foodItems,
        foodItem,
        loading,
        error,
        pagination,
        getFoodItems,
        getFoodItem,
        createFoodItem,
        updateFoodItem,
        deleteFoodItem,
        getUserFoodItems,
        clearError,
      }}
    >
      {children}
    </FoodContext.Provider>
  )
}

export const useFood = () => useContext(FoodContext)

