import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { useFood } from "../../context/FoodContext"
import { useAuth } from "../../context/AuthContext"
import { Clock, Edit, Filter, PlusCircle, Search, Trash2, AlertTriangle } from "lucide-react"

export default function InventoryPage() {
  const { user } = useAuth()
  const { getUserFoodItems, deleteFoodItem, loading, error, pagination } = useFood()

  const [foodItems, setFoodItems] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [isDeleting, setIsDeleting] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null)

  useEffect(() => {
    const fetchFoodItems = async () => {
      if (user && user.id) {
        const params = {
          page: currentPage,
          limit: 10,
        }

        if (statusFilter !== "all") {
          params.status = statusFilter
        }

        const result = await getUserFoodItems(user.id, params)
        if (result && result.foodItems) {
          setFoodItems(result.foodItems)
        }
      }
    }

    fetchFoodItems()
  }, [user, currentPage, statusFilter, getUserFoodItems])

  const handleSearch = (e) => {
    setSearchQuery(e.target.value)
  }

  const handleStatusFilter = (status) => {
    setStatusFilter(status)
    setCurrentPage(1)
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const handleDeleteClick = (item) => {
    setItemToDelete(item)
    setIsDeleting(true)
  }

  const confirmDelete = async () => {
    if (itemToDelete) {
      const result = await deleteFoodItem(itemToDelete._id)
      if (result.success) {
        setFoodItems(foodItems.filter((item) => item._id !== itemToDelete._id))
      }
      setIsDeleting(false)
      setItemToDelete(null)
    }
  }

  const cancelDelete = () => {
    setIsDeleting(false)
    setItemToDelete(null)
  }

  // Filter food items based on search query
  const filteredFoodItems = foodItems.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Calculate time remaining until expiration
  const getTimeRemaining = (expiresAt) => {
    const now = new Date()
    const expiration = new Date(expiresAt)
    const diff = expiration - now

    if (diff <= 0) return "Expired"

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

    if (days > 0) return `${days} day${days > 1 ? "s" : ""}`
    return `${hours} hour${hours > 1 ? "s" : ""}`
  }

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800"
      case "reserved":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-purple-100 text-purple-800"
      case "expired":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Get expiration badge color
  const getExpirationBadgeColor = (expiresAt) => {
    const now = new Date()
    const expiration = new Date(expiresAt)
    const diff = expiration - now

    if (diff <= 0) return "bg-red-100 text-red-800"
    if (diff <= 24 * 60 * 60 * 1000) return "bg-red-100 text-red-800" // 24 hours
    if (diff <= 48 * 60 * 60 * 1000) return "bg-yellow-100 text-yellow-800" // 48 hours
    return "bg-green-100 text-green-800"
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Inventory Management</h1>
          <p className="text-gray-600">Manage your surplus food inventory</p>
        </div>

        <Link
          to="/add-food-item"
          className="inline-flex items-center justify-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Item
        </Link>
      </div>

      {error && <div className="bg-red-50 text-red-600 p-4 rounded-md">{error}</div>}

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search inventory..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => handleStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
              >
                <option value="all">All</option>
                <option value="available">Available</option>
                <option value="reserved">Reserved</option>
                <option value="completed">Completed</option>
                <option value="expired">Expired</option>
              </select>

              <button className="p-2 border border-gray-300 rounded-md hover:bg-gray-50">
                <Filter className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <Clock className="animate-spin h-8 w-8 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">Loading inventory...</p>
          </div>
        ) : filteredFoodItems.length === 0 ? (
          <div className="p-8 text-center">
            <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-500 mb-2">No food items found</p>
            <p className="text-sm text-gray-400">
              {searchQuery ? "Try adjusting your search or filters" : "Add your first food item to get started"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Item
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Quantity
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Expires In
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Price
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredFoodItems.map((item) => (
                  <motion.tr
                    key={item._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={item.images[0] || "/placeholder.svg?height=40&width=40"}
                            alt={item.title}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{item.title}</div>
                          <div className="text-xs text-gray-500 truncate max-w-xs">{item.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {item.quantity} {item.quantityUnit}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getExpirationBadgeColor(
                          item.expiresAt,
                        )}`}
                      >
                        {getTimeRemaining(item.expiresAt)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.isFree ? (
                        <span className="text-green-600 font-medium">Free</span>
                      ) : (
                        <div className="flex flex-col">
                          <span className="line-through">${item.originalPrice.toFixed(2)}</span>
                          <span className="text-green-600 font-medium">${item.price.toFixed(2)}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(
                          item.status,
                        )}`}
                      >
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Link
                          to={`/edit-food-item/${item._id}`}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Edit"
                        >
                          <Edit className="h-5 w-5" />
                        </Link>
                        <button
                          onClick={() => handleDeleteClick(item)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                          disabled={item.status === "reserved"}
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(pagination.currentPage - 1) * 10 + 1}</span> to{" "}
                  <span className="font-medium">{Math.min(pagination.currentPage * 10, pagination.total)}</span> of{" "}
                  <span className="font-medium">{pagination.total}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Previous</span>
                    <svg
                      className="h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>

                  {[...Array(pagination.totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => handlePageChange(i + 1)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        pagination.currentPage === i + 1
                          ? "z-10 bg-black text-white border-black"
                          : "bg-white text-gray-500 hover:bg-gray-50 border-gray-300"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}

                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Next</span>
                    <svg
                      className="h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Confirm Deletion</h3>
            <p className="mb-6">
              Are you sure you want to delete "{itemToDelete?.title}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

