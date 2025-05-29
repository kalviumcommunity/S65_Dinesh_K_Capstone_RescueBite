import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Search, MapPin, Filter, Clock, Utensils, ThumbsUp, ChevronDown, X } from "lucide-react"
import axios from "axios"
import { toast } from "react-hot-toast"
import Map from "../../components/Maps"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"

export default function LocationPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [selectedItem, setSelectedItem] = useState(null)
  const [foodItems, setFoodItems] = useState([])
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [userLocation, setUserLocation] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError("")
        
        const headers = {
          "x-auth-token": localStorage.getItem("token")
        }
        
        // Fetch food items
        const foodResponse = await axios.get(`${API_BASE_URL}/api/food-items`, { headers })
        if (foodResponse.data?.success) {
          // Process food items to match the format needed for map display
          const processedItems = foodResponse.data.data.foodItems.map(item => ({
            ...item,
            coordinates: item.location?.coordinates 
              ? { lat: item.location.coordinates[1], lng: item.location.coordinates[0] }
              : { lat: 31.224020 + (Math.random() - 0.5) * 0.01, lng: 75.770798 + (Math.random() - 0.5) * 0.01 }, // Random coordinates near Phagwara
            distance: item.location?.address ? `Near ${item.location.address}` : "Location not specified"
          }))
          setFoodItems(processedItems)
        }
        
        // For now, use empty array for restaurants since we don't have that data yet
        setRestaurants([])
        
        // Try to get user's current location
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const userLoc = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
              };
              setUserLocation(userLoc);
            },
            (error) => {
              console.warn("Error getting location:", error);
            }
          );
        }
        
      } catch (error) {
        console.error("Error fetching location data:", error)
        setError(error.response?.data?.message || "Failed to load location data")
        toast.error("Failed to load location data")
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 10, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.3 },
    },
  }

  // Format relative time function copied from individual dashboard
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

  // Filter items based on search query and filter type
  const filteredItems = [...foodItems, ...restaurants].filter((item) => {
    const matchesSearch = (item.title || item.name || "").toLowerCase().includes(searchQuery.toLowerCase())

    if (selectedFilter === "all") return matchesSearch
    if (selectedFilter === "food") return "title" in item && matchesSearch
    if (selectedFilter === "restaurants") return "name" in item && matchesSearch

    return matchesSearch
  })

  const handleMarkerClick = (item) => {
    setSelectedItem(item);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      <div className="border-b bg-white">
        <div className="flex items-center gap-4 p-4 w-full">
          <div className="relative flex-grow" style={{ maxWidth: "67rem" }}>
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search for food or restaurants..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2 flex-shrink-0">
            <div className="relative">
              <button
                className="flex items-center justify-between w-40 px-3 py-2 border border-gray-300 rounded-md bg-white"
                onClick={() => document.getElementById("filter-dropdown").classList.toggle("hidden")}
              >
                <span>
                  {selectedFilter === "all"
                    ? "All Items"
                    : selectedFilter === "food"
                      ? "Food Only"
                      : "Restaurants Only"}
                </span>
                <ChevronDown className="h-4 w-4" />
              </button>

              <div
                id="filter-dropdown"
                className="absolute z-10 mt-1 w-40 bg-white border border-gray-200 rounded-md shadow-lg hidden"
              >
                <div className="py-1">
                  <button
                    className={`block w-full text-left px-4 py-2 text-sm ${
                      selectedFilter === "all" ? "bg-gray-100" : ""
                    }`}
                    onClick={() => {
                      setSelectedFilter("all")
                      document.getElementById("filter-dropdown").classList.add("hidden")
                    }}
                  >
                    All Items
                  </button>
                  <button
                    className={`block w-full text-left px-4 py-2 text-sm ${
                      selectedFilter === "food" ? "bg-gray-100" : ""
                    }`}
                    onClick={() => {
                      setSelectedFilter("food")
                      document.getElementById("filter-dropdown").classList.add("hidden")
                    }}
                  >
                    Food Only
                  </button>
                  <button
                    className={`block w-full text-left px-4 py-2 text-sm ${
                      selectedFilter === "restaurants" ? "bg-gray-100" : ""
                    }`}
                    onClick={() => {
                      setSelectedFilter("restaurants")
                      document.getElementById("filter-dropdown").classList.add("hidden")
                    }}
                  >
                    Restaurants Only
                  </button>
                </div>
              </div>
            </div>

            <button className="p-2 border border-gray-300 rounded-md hover:bg-gray-50">
              <Filter className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 h-full overflow-hidden">
        <div className="flex-1 relative">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <p className="text-gray-600">Loading map data...</p>
            </div>
          ) : error ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <p className="text-red-600">{error}</p>
            </div>
          ) : (
            <div className="absolute inset-0">
              <Map 
                donations={filteredItems} 
                onMarkerClick={handleMarkerClick}
                userLocation={userLocation}
              />
              
              {selectedItem && (
                <div
                  className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white p-3 rounded-lg shadow-lg w-64 z-10"
                >
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium">{selectedItem.title || selectedItem.name}</h3>
                    <button className="text-gray-500 hover:text-gray-700" onClick={() => setSelectedItem(null)}>
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{selectedItem.description}</p>
                  <div className="flex items-center mt-2 text-xs text-gray-500">
                    <MapPin className="h-3 w-3 mr-1" />
                    <span>{selectedItem.location?.address || selectedItem.distance}</span>
                  </div>
                  <button className="mt-2 w-full px-2 py-1 bg-black text-white text-sm rounded-md hover:bg-gray-800">
                    View Details
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="w-80 overflow-y-auto border-l bg-white">
          {loading ? (
            <div className="p-6 text-center">
              <Clock className="animate-spin h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Loading items...</p>
            </div>
          ) : error ? (
            <div className="p-6 text-center text-red-500">
              <p>{error}</p>
            </div>
          ) : (
            <motion.div className="h-full" variants={containerVariants} initial="hidden" animate="visible">
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <motion.div
                    key={item._id || item.id}
                    className={`p-4 hover:bg-gray-50 cursor-pointer border-b ${selectedItem?._id === item._id ? 'bg-gray-100' : ''}`}
                    variants={itemVariants}
                    onClick={() => setSelectedItem(item)}
                  >
                    <div className="flex">
                      <div className="h-20 w-20 rounded-md overflow-hidden flex-shrink-0">
                        <img
                          src={
                            item.images && item.images.length > 0
                              ? (typeof item.images[0] === 'string' 
                                 ? item.images[0] 
                                 : item.images[0].url || '')
                              : "/placeholder.svg?height=200&width=200"
                          }
                          alt={item.title || item.name}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/placeholder.svg?height=200&width=200";
                          }}
                        />
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="flex items-start justify-between">
                          <h3 className="font-medium">{item.title || item.name}</h3>
                          {(item.owner?.rating || item.rating) && (
                            <div className="flex items-center space-x-1 bg-gray-100 px-2 py-1 rounded text-xs">
                              <ThumbsUp className="h-3 w-3" />
                              <span>
                                {item.owner?.ratingCount > 0
                                  ? (item.owner.rating / item.owner.ratingCount).toFixed(1)
                                  : item.rating || "New"}
                              </span>
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{item.description}</p>
                        <div className="mt-2 flex flex-wrap gap-y-1 gap-x-3 text-xs text-gray-500">
                          <div className="flex items-center">
                            <MapPin className="mr-1 h-3 w-3" />
                            <span>
                              {item.location?.address || item.distance || "Location not specified"}
                            </span>
                          </div>
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
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <p>No items found matching your search.</p>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

