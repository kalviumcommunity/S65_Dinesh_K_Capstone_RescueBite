import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { PlusCircle, MapPin, Clock, Utensils, ThumbsUp, Filter, Search, ArrowRight, AlertTriangle } from "lucide-react"
import axios from "axios"
import { useAuth } from "../../context/AuthContext"
import { toast } from "react-hot-toast"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"

export default function IndividualDashboard() {
  const [foodItems, setFoodItems] = useState([])
  const [recentSwaps, setRecentSwaps] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [error, setError] = useState("")
  const [currentUser, setCurrentUser] = useState(null)
  const [userStats, setUserStats] = useState({
    itemsShared: 0,
    itemsReceived: 0,
    rating: 0,
    trustScore: 0,
  })
  const [isRequesting, setIsRequesting] = useState(false)

  const { user } = useAuth()

  const fetchDashboardData = async () => {
    try {
      setError("")
      setLoading(true)
      const headers = {
        "x-auth-token": localStorage.getItem("token"),
      }

      // Fetch current user
      const userResponse = await axios.get(`${API_BASE_URL}/api/auth/me`, { headers })
      setCurrentUser(userResponse.data.user)

      // Set user stats
      if (userResponse.data.user) {
        setUserStats({
          itemsShared: userResponse.data.user.itemsShared || 0,
          itemsReceived: userResponse.data.user.itemsReceived || 0,
          rating:
            userResponse.data.user.ratingCount > 0
              ? (userResponse.data.user.rating / userResponse.data.user.ratingCount).toFixed(1)
              : 0,
          trustScore: userResponse.data.user.trustScore || 0,
        })
      }

      // Fetch food items with improved error handling
      try {
        const foodResponse = await axios.get(`${API_BASE_URL}/api/food-items?includeExpired=false&status=available`, { headers })
        if (foodResponse.data?.success) {
          console.log("Food items received:", foodResponse.data.data.foodItems.length);
          // Log each item for debugging
          foodResponse.data.data.foodItems.forEach(item => {
            const expiryDate = new Date(item.expiresAt);
            const now = new Date();
            console.log(`Item: ${item.title}, Expires: ${expiryDate}, Now: ${now}, Is expired: ${expiryDate < now}`);
          });
          setFoodItems(foodResponse.data.data.foodItems);
        } else {
          console.error("Food response was not successful:", foodResponse.data);
          setError(foodResponse.data?.message || "Failed to load food items");
        }
      } catch (foodError) {
        console.error("Error fetching food items:", foodError);
        setError(foodError.response?.data?.message || "Failed to load food items");
      }

      // Fetch swaps
      const swapsResponse = await axios.get(`${API_BASE_URL}/api/swaps/my-swaps`, { headers })
      if (swapsResponse.data?.success) {
        setRecentSwaps(swapsResponse.data.data.swaps)
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      setError(error.response?.data?.message || "Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const handleSwapRequest = async (foodItemId) => {
    try {
      setIsRequesting(true)
      const response = await axios.post(
        `${API_BASE_URL}/api/swaps`,
        {
          foodItemId,
          message: "I'm interested in this item!",
        },
        {
          headers: {
            "x-auth-token": localStorage.getItem("token"),
          },
        },
      )

      if (response.data.success) {
        toast.success("Swap request sent successfully!")
        fetchDashboardData()
      }
    } catch (error) {
      console.error("Error requesting swap:", error)
      toast.error(error.response?.data?.message || "Failed to request swap")
    } finally {
      setIsRequesting(false)
    }
  }

  // Filter food items based on search query
  const filteredFoodItems = foodItems.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Format date to relative time (e.g., "2 days ago")
  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now - date) / 1000)

    if (diffInSeconds < 60) return "Just now"

    const diffInMinutes = Math.floor(diffInSeconds / 60)
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`

    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`

    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 30) return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`

    const diffInMonths = Math.floor(diffInDays / 30)
    return `${diffInMonths} month${diffInMonths > 1 ? "s" : ""} ago`
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.4 },
    },
  }

  return (
    <div className="space-y-6 w-full">
      {error && <div className="p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {currentUser?.firstName || "User"}!</h1>
          <p className="text-gray-600">Find and share food in your community</p>
        </div>

        <Link
          to="/add-food-item"
          className="inline-flex items-center justify-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Food to Share
        </Link>
      </div>

      <div className="flex flex-col gap-6 w-full">
        {/* Food Items Section - Full Width */}
        <motion.div
          className="bg-white p-6 rounded-lg shadow-sm w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Available Food Nearby</h2>
            <Link to="/location" className="text-sm text-black flex items-center hover:underline">
              View Map <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>

          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search for food..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="p-2 border border-gray-300 rounded-md hover:bg-gray-50">
              <Filter className="h-5 w-5" />
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Clock className="animate-spin h-8 w-8 text-gray-400 mr-2" />
              <span className="text-gray-500">Loading food items...</span>
            </div>
          ) : filteredFoodItems.length === 0 ? (
            <div className="text-center py-12">
              <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No food items found</h3>
              <p className="mt-2 text-sm text-gray-500">
                {searchQuery ? "Try adjusting your search query" : "There are no food items available at the moment"}
              </p>
            </div>
          ) : (
            <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-4" variants={containerVariants} initial="hidden" animate="visible">
              {filteredFoodItems.map((item) => (
                <motion.div
                  key={item._id}
                  className="flex flex-col md:flex-row border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow h-full"
                  variants={itemVariants}
                >
                  <div className="w-full md:w-2/5 h-36 md:h-36 flex-shrink-0 overflow-hidden">
                    <img
                      src={
                        item.images && item.images.length > 0
                          ? (typeof item.images[0] === 'string' 
                             ? item.images[0] 
                             : item.images[0].url || '')
                          : "/placeholder.svg?height=300&width=300"
                      }
                      alt={item.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/placeholder.svg?height=300&width=300";
                      }}
                    />
                  </div>
                  <div className="flex-1 p-3 flex flex-col">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-base">{item.title}</h3>
                        <p className="text-gray-600 text-xs mt-1 line-clamp-2">{item.description}</p>
                      </div>
                      {item.owner?.rating && (
                        <div className="flex items-center space-x-1 bg-gray-100 px-2 py-1 rounded text-xs">
                          <ThumbsUp className="h-3 w-3" />
                          <span>
                            {item.owner.ratingCount > 0
                              ? (item.owner.rating / item.owner.ratingCount).toFixed(1)
                              : "New"}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="mt-2 flex flex-wrap gap-y-1 gap-x-2 text-xs text-gray-500">
                      {item.location && (
                        <div className="flex items-center">
                          <MapPin className="mr-1 h-3 w-3" />
                          <span className="truncate max-w-[100px]">
                            {item.location.address || 
                             (item.location.coordinates && 
                              `${item.location.coordinates[1].toFixed(2)}, ${item.location.coordinates[0].toFixed(2)}`) || 
                             'Unknown location'}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center">
                        <Clock className="mr-1 h-3 w-3" />
                        <span>{formatRelativeTime(item.createdAt)}</span>
                      </div>
                      {item.category && (
                        <div className="flex items-center">
                          <Utensils className="mr-1 h-3 w-3" />
                          <span className="capitalize">{item.category}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center">
                        <img
                          src={item.owner?.profileImage || "/placeholder.svg?height=40&width=40"}
                          alt={item.owner?.firstName || "User"}
                          className="h-5 w-5 rounded-full mr-1"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/placeholder.svg?height=40&width=40";
                          }}
                        />
                        <span className="text-xs truncate max-w-[60px]">
                          {item.owner?.firstName} {item.owner?.lastName}
                        </span>
                      </div>
                      {currentUser && item.owner?._id !== currentUser._id && (
                        <button
                          className="px-2 py-1 bg-black text-white text-xs rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={() => handleSwapRequest(item._id)}
                          disabled={isRequesting}
                        >
                          {isRequesting ? "Requesting..." : "Request"}
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {filteredFoodItems.length > 0 && (
            <div className="mt-4 text-center">
              <button className="text-black hover:underline text-sm font-medium">Load more</button>
            </div>
          )}
        </motion.div>

        {/* Recent Swaps Section - Full Width */}
        <motion.div
          className="bg-white p-6 rounded-lg shadow-sm w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <h2 className="text-lg font-semibold mb-4">Recent Swaps</h2>
          {recentSwaps.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {recentSwaps.map((swap) => (
                <div key={swap._id} className="flex items-center p-4 bg-gray-50 rounded-md hover:shadow-sm transition-shadow">
                  <div className="mr-3 h-14 w-14 flex-shrink-0 rounded-md overflow-hidden">
                    <img
                      src={
                        swap.foodItem?.images && swap.foodItem.images.length > 0
                          ? (typeof swap.foodItem.images[0] === 'string' 
                             ? swap.foodItem.images[0] 
                             : swap.foodItem.images[0].url || '')
                          : "/placeholder.svg?height=60&width=60"
                      }
                      alt={swap.foodItem?.title || "Food Item"}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/placeholder.svg?height=60&width=60";
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{swap.foodItem?.title || "Food Item"}</p>
                    <p className="text-sm text-gray-600">
                      with {
                        swap.requester?._id === currentUser?._id 
                          ? (swap.provider?.firstName + " " + (swap.provider?.lastName || ""))
                          : (swap.requester?.firstName + " " + (swap.requester?.lastName || ""))
                      }
                    </p>
                    <p className="text-xs text-gray-500">{formatRelativeTime(swap.createdAt)}</p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      swap.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : swap.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : swap.status === "accepted"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {swap.status.charAt(0).toUpperCase() + swap.status.slice(1)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No recent swaps</p>
          )}
        </motion.div>
      </div>
    </div>
  )
}

