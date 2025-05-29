import { useState, useEffect } from "react";
import { motion, useAnimation } from "framer-motion"; // Import useAnimation
import { Link } from "react-router-dom";
import {
  PlusCircle,
  MapPin,
  Clock,
  Utensils,
  ThumbsUp,
  Filter,
  Search,
  ArrowRight,
  AlertTriangle,
  Users,
} from "lucide-react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-hot-toast";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function IndividualDashboard() {
  const [foodItems, setFoodItems] = useState([]);
  const [recentSwaps, setRecentSwaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [userStats, setUserStats] = useState({
    itemsShared: 0,
    itemsReceived: 0,
    rating: 0,
    trustScore: 0,
    dailyCount: 0,
    weeklyCount: 0,
    monthlyCount: 0,
  });
  const [isRequesting, setIsRequesting] = useState(false);
  const [frequentPartners, setFrequentPartners] = useState([]);

  const { user } = useAuth();
  const controls = useAnimation(); // Animation controls for the progress circle

  const fetchDashboardData = async () => {
    try {
      setError("");
      setLoading(true);
      const headers = {
        "x-auth-token": localStorage.getItem("token"),
      };

      // Fetch current user
      const userResponse = await axios.get(`${API_BASE_URL}/api/auth/me`, {
        headers,
      });
      setCurrentUser(userResponse.data.user);

      // Fetch food items
      try {
        const foodResponse = await axios.get(
          `${API_BASE_URL}/api/food-items?includeExpired=false&status=available`,
          { headers }
        );
        if (foodResponse.data?.success) {
          setFoodItems(foodResponse.data.data.foodItems);
        } else {
          setError(
            foodResponse.data?.message || "Failed to load food items"
          );
        }
      } catch (foodError) {
        setError(
          foodError.response?.data?.message || "Failed to load food items"
        );
      }

      // Fetch swaps
      const swapsResponse = await axios.get(
        `${API_BASE_URL}/api/swaps/my-swaps`,
        { headers }
      );
      if (swapsResponse.data?.success) {
        const swaps = swapsResponse.data.data.swaps;
        setRecentSwaps(swaps);

        // Calculate time-based stats
        const now = new Date();
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        const dailyCount = swaps.filter(
          (swap) => new Date(swap.createdAt) >= oneDayAgo
        ).length;
        const weeklyCount = swaps.filter(
          (swap) => new Date(swap.createdAt) >= oneWeekAgo
        ).length;
        const monthlyCount = swaps.filter(
          (swap) => new Date(swap.createdAt) >= oneMonthAgo
        ).length;

        // Calculate most frequent swap partners
        const partnerCounts = {};
        swaps.forEach((swap) => {
          // Determine if current user is requester or provider
          const partnerId =
            swap.requester?._id === userResponse.data.user._id
              ? swap.provider?._id
              : swap.requester?._id;

          const partnerDetails =
            swap.requester?._id === userResponse.data.user._id
              ? swap.provider
              : swap.requester;

          if (partnerId && partnerDetails) {
            if (!partnerCounts[partnerId]) {
              partnerCounts[partnerId] = {
                user: partnerDetails,
                count: 1,
              };
            } else {
              partnerCounts[partnerId].count += 1;
            }
          }
        });

        // Sort partners by swap count and take the top ones
        const topPartners = Object.values(partnerCounts)
          .sort((a, b) => b.count - a.count)
          .slice(0, 6);

        setFrequentPartners(topPartners);

        // Set user stats
        if (userResponse.data.user) {
          const newTrustScore = typeof userResponse.data.user.trustScore === "number"
            ? userResponse.data.user.trustScore
            : 0;
          setUserStats({
            itemsShared: userResponse.data.user.itemsShared || 0,
            itemsReceived: userResponse.data.user.itemsReceived || 0,
            rating:
              userResponse.data.user.ratingCount > 0
                ? (
                    userResponse.data.user.rating /
                    userResponse.data.user.ratingCount
                  ).toFixed(1)
                : 0,
            trustScore: newTrustScore,
            dailyCount,
            weeklyCount,
            monthlyCount,
          });

          // Animate the progress circle
          controls.start({
            strokeDasharray: `${newTrustScore * 2.83} 283`, // 2.83 is approx (2 * pi * 45) / 100
            transition: {
              duration: 1.5, // Slower start
              ease: [0.1, 0.7, 0.3, 0.9], // Custom cubic bezier for gradual start, faster middle, slow end
              // Alternative: ease: "easeInOut" for a smoother overall feel
            },
          });
        }
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError(
        error.response?.data?.message || "Failed to load dashboard data"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // controls dependency removed as it causes re-fetch loop

  const handleSwapRequest = async (foodItemId) => {
    try {
      setIsRequesting(true);
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
        }
      );

      if (response.data.success) {
        toast.success("Swap request sent successfully!");
        fetchDashboardData(); // Re-fetch data to update lists/stats
      }
    } catch (error) {
      console.error("Error requesting swap:", error);
      toast.error(error.response?.data?.message || "Failed to request swap");
    } finally {
      setIsRequesting(false);
    }
  };

  // Filter food items based on search query
  const filteredFoodItems = foodItems.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Format date to relative time (e.g., "2 days ago")
  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return "Just now";

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60)
      return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24)
      return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30)
      return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;

    const diffInMonths = Math.floor(diffInDays / 30);
    return `${diffInMonths} month${diffInMonths > 1 ? "s" : ""} ago`;
  };

  // Framer Motion Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1, // Stagger children appearance
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  const listContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08, // Faster stagger for list items
      },
    },
  };

  const listItemVariants = {
    hidden: { x: -15, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.3, ease: "easeOut" },
    },
  };

  return (
    <motion.div
      className="w-full px-4 py-4"
      initial="hidden"
      animate="visible"
      variants={containerVariants} // Apply container variants to the root
    >
      {error && (
        <motion.div
          className="p-4 bg-red-100 text-red-700 rounded-lg mb-4"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {error}
        </motion.div>
      )}

      {/* Welcome Message */}
      <motion.div className="mb-6" variants={itemVariants}>
        <h2 className="text-xl font-semibold">
          Welcome back, {currentUser?.firstName || "User"}
        </h2>

      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Trust Score / Wallet Balance Card */}
          <motion.div
            className="bg-black text-white rounded-lg p-6"
            variants={itemVariants}
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-medium">Food Sharing Balance</h3>
              <Link
                to="/add-food-item"
                className="bg-white text-black text-sm font-medium py-2 px-4 rounded flex items-center hover:bg-gray-200 transition-colors"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Food Item
              </Link>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-4xl font-bold">
                  {userStats.itemsShared} items
                </h2>
                <p className="mt-1 text-gray-300">Items Shared So Far</p>
              </div>
            </div>
          </motion.div>

          {/* Feature Cards */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-4 gap-4"
            variants={listContainerVariants} // Use list container for staggering cards
          >
            {/* Trust Score */}
            <motion.div
              className="bg-white p-4 rounded-lg shadow-sm border border-gray-100"
              variants={listItemVariants} // Use list item for individual card animation
            >
              <div className="mb-2 p-2 bg-gray-100 rounded-md w-8 h-8 flex items-center justify-center">
                <span className="text-lg">📊</span>
              </div>
              <h3 className="font-medium">Trust Score</h3>
              <p className="text-xs text-gray-500 my-1">
                Your community trust rating is growing daily
              </p>
              <p className="font-bold mt-2">{userStats.trustScore}%</p>
            </motion.div>

            {/* Items Received */}
            <motion.div
              className="bg-white p-4 rounded-lg shadow-sm border border-gray-100"
              variants={listItemVariants}
            >
              <div className="mb-2 p-2 bg-gray-100 rounded-md w-8 h-8 flex items-center justify-center">
                <span className="text-lg">🥕</span>
              </div>
              <h3 className="font-medium">Items Received</h3>
              <p className="text-xs text-gray-500 my-1">
                Foods you've received from the community
              </p>
              <p className="font-bold mt-2">{userStats.itemsReceived}</p>
            </motion.div>

            {/* Food Categories */}
            <motion.div
              className="bg-white p-4 rounded-lg shadow-sm border border-gray-100"
              variants={listItemVariants}
            >
              <div className="mb-2 p-2 bg-gray-100 rounded-md w-8 h-8 flex items-center justify-center">
                <span className="text-lg">🍎</span>
              </div>
              <h3 className="font-medium">Food Categories</h3>
              <p className="text-xs text-gray-500 my-1">
                Most common foods you share & receive
              </p>
              <p className="font-bold mt-2">Vegetables</p>{" "}
              {/* Placeholder - Needs logic */}
            </motion.div>

            {/* User Rating */}
            <motion.div
              className="bg-white p-4 rounded-lg shadow-sm border border-gray-100"
              variants={listItemVariants}
            >
              <div className="mb-2 p-2 bg-gray-100 rounded-md w-8 h-8 flex items-center justify-center">
                <span className="text-lg">⭐</span>
              </div>
              <h3 className="font-medium">Your Rating</h3>
              <p className="text-xs text-gray-500 my-1">
                How the community rates your interactions
              </p>
              <p className="font-bold mt-2">{userStats.rating || "New"}/5</p>
            </motion.div>
          </motion.div>

          {/* Available Food Items Section */}
          <motion.div
            className="bg-white rounded-lg shadow-sm p-6"
            variants={itemVariants}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Available Food Nearby</h3>
              <Link
                to="/food-items"
                className="text-sm text-black flex items-center hover:underline"
              >
                View All <ArrowRight className="ml-1 h-4 w-4" />
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
              <motion.div
                className="text-center py-12"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">
                  No food items found
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  {searchQuery
                    ? "Try adjusting your search query"
                    : "There are no food items available at the moment"}
                </p>
              </motion.div>
            ) : (
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
                variants={listContainerVariants} // Stagger food items
                initial="hidden"
                animate="visible"
              >
                {filteredFoodItems.map((item) => (
                  <motion.div
                    key={item._id}
                    className="flex flex-col md:flex-row border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow h-full"
                    variants={listItemVariants} // Animate each food item
                  >
                    <div className="w-full md:w-2/5 h-36 md:h-36 flex-shrink-0 overflow-hidden">
                      <img
                        src={
                          item.images && item.images.length > 0
                            ? typeof item.images[0] === "string"
                              ? item.images[0]
                              : item.images[0].url || ""
                            : "/placeholder.svg?height=300&width=300"
                        }
                        alt={item.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            "/placeholder.svg?height=300&width=300";
                        }}
                      />
                    </div>
                    <div className="flex-1 p-3 flex flex-col">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-base">
                            {item.title}
                          </h3>
                          <p className="text-gray-600 text-xs mt-1 line-clamp-2">
                            {item.description}
                          </p>
                        </div>
                        {item.owner?.rating && (
                          <div className="flex items-center space-x-1 bg-gray-100 px-2 py-1 rounded text-xs">
                            <ThumbsUp className="h-3 w-3" />
                            <span>
                              {item.owner.ratingCount > 0
                                ? (
                                    item.owner.rating / item.owner.ratingCount
                                  ).toFixed(1)
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
                                  `${item.location.coordinates[1].toFixed(
                                    2
                                  )}, ${item.location.coordinates[0].toFixed(
                                    2
                                  )}`) ||
                                "Unknown location"}
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

                      <div className="mt-auto pt-2 flex items-center justify-between">
                        {" "}
                        {/* Use mt-auto to push to bottom */}
                        <div className="flex items-center">
                          <img
                            src={
                              item.owner?.profileImage ||
                              "/placeholder.svg?height=40&width=40"
                            }
                            alt={item.owner?.firstName || "User"}
                            className="h-5 w-5 rounded-full mr-1"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src =
                                "/placeholder.svg?height=40&width=40";
                            }}
                          />
                          <span className="text-xs truncate max-w-[60px]">
                            {item.owner?.firstName} {item.owner?.lastName}
                          </span>
                        </div>
                        {currentUser && item.owner?._id !== currentUser._id && (
                          <motion.button
                            className="px-2 py-1 bg-black text-white text-xs rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={() => handleSwapRequest(item._id)}
                            disabled={isRequesting}
                            whileTap={{ scale: 0.95 }} // Add tap animation
                          >
                            {isRequesting ? "Requesting..." : "Request"}
                          </motion.button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {filteredFoodItems.length > 0 && (
              <div className="mt-4 text-center">
                <button className="text-black hover:underline text-sm font-medium">
                  Load more
                </button>
              </div>
            )}
          </motion.div>

          {/* Transactions Section */}
          <motion.div
            className="bg-white rounded-lg shadow-sm p-6"
            variants={itemVariants}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Recent Transactions</h3>
              <button className="text-sm text-blue-600 hover:underline flex items-center">
                See all <ArrowRight className="h-4 w-4 ml-1" />
              </button>
            </div>

            <motion.div
              className="space-y-4"
              variants={listContainerVariants}
              initial="hidden"
              animate="visible"
            >
              {loading ? (
                <div className="flex justify-center py-8">
                  <Clock className="animate-spin h-6 w-6 text-gray-400" />
                </div>
              ) : recentSwaps.length > 0 ? (
                recentSwaps.slice(0, 4).map((swap) => (
                  <motion.div
                    key={swap._id}
                    className="flex items-center justify-between border-b pb-4 last:border-b-0" // Remove border from last item
                    variants={listItemVariants}
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden mr-3 flex-shrink-0">
                        <img
                          src={
                            swap.requester?._id === currentUser?._id
                              ? swap.provider?.profileImage ||
                                "/placeholder.svg"
                              : swap.requester?.profileImage ||
                                "/placeholder.svg"
                          }
                          alt="User"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/placeholder.svg";
                          }}
                        />
                      </div>
                      <div>
                        <p className="font-medium">
                          {swap.status === "completed"
                            ? "Food received"
                            : "Food requested"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {swap.requester?._id === currentUser?._id
                            ? `From ${
                                swap.provider?.firstName || "User"
                              } ${swap.provider?.lastName || ""}`.trim()
                            : `To ${
                                swap.requester?.firstName || "User"
                              } ${swap.requester?.lastName || ""}`.trim()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right ml-2">
                      <p
                        className={`font-medium truncate ${
                          swap.status === "completed"
                            ? "text-green-600"
                            : "text-blue-600"
                        }`}
                      >
                        {swap.foodItem?.title || "Food Item"}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatRelativeTime(swap.createdAt)}
                      </p>
                    </div>
                  </motion.div>
                ))
              ) : (
                <motion.p
                  className="text-center py-4 text-gray-500"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  No recent transactions
                </motion.p>
              )}
            </motion.div>
          </motion.div>
        </div>

        {/* Right Column (1/3) */}
        <div className="space-y-6">
          {/* Trust Score Progress Circle */}
          <motion.div
            className="bg-white rounded-lg shadow-sm p-6"
            variants={itemVariants}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Food Exchange Stats</h3>
              <div className="text-sm text-gray-500">Monthly</div>
            </div>
            <div className="flex justify-center">
              <div className="relative h-40 w-40">
                <svg
                  className="h-full w-full"
                  viewBox="0 0 100 100"
                  style={{ transform: "rotate(-90deg)" }} // Rotate SVG instead of circle for easier animation start
                >
                  {/* Background Circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#e6e6e6"
                    strokeWidth="10"
                  />
                  {/* Progress Arc - Animated */}
                  <motion.circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#000"
                    strokeWidth="10"
                    strokeLinecap="round" // Make the line end rounded
                    initial={{ strokeDasharray: "0 283" }} // Start at 0
                    animate={controls} // Use animation controls
                    // strokeDasharray is set via controls in useEffect
                    // strokeDashoffset="0" // Not needed when starting from 0 dasharray
                    // transform="rotate(-90 50 50)" // Rotation applied to SVG container
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-2xl font-bold">
                    {userStats.trustScore}%
                  </span>
                  <span className="text-xs text-gray-500">Trust Score</span>
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-black rounded-sm mr-1"></div>
                <span className="text-sm">Received</span>{" "}
                {/* This label seems incorrect based on circle color */}
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gray-200 rounded-sm mr-1"></div>
                <span className="text-sm">Sent</span>{" "}
                {/* This label seems incorrect based on circle color */}
              </div>
            </div>
            <div className="mt-6 grid grid-cols-3 text-center">
              <div>
                <div className="text-sm text-gray-500">Daily</div>
                <div className="font-bold">{userStats.dailyCount}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Weekly</div>
                <div className="font-bold">{userStats.weeklyCount}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Monthly</div>
                <div className="font-bold">{userStats.monthlyCount}</div>
              </div>
            </div>
          </motion.div>

          {/* Most Frequent Swap Partners */}
          <motion.div
            className="bg-white rounded-lg shadow-sm p-6"
            variants={itemVariants}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">
                Most Frequent Swap Partners
              </h3>
              <Users className="h-5 w-5 text-gray-400" />
            </div>

            {loading ? (
              <div className="flex justify-center py-8">
                <Clock className="animate-spin h-6 w-6 text-gray-400" />
              </div>
            ) : frequentPartners.length > 0 ? (
              <motion.div
                className="space-y-4"
                variants={listContainerVariants}
                initial="hidden"
                animate="visible"
              >
                {frequentPartners.map((partner) => (
                  <motion.div
                    key={partner.user._id}
                    className="flex items-center justify-between"
                    variants={listItemVariants}
                  >
                    <div className="flex items-center overflow-hidden mr-2">
                      <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden mr-3 flex-shrink-0">
                        <img
                          src={
                            partner.user.profileImage ||
                            "/placeholder.svg?height=40&width=40"
                          }
                          alt={`${partner.user.firstName} ${
                            partner.user.lastName || ""
                          }`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src =
                              "/placeholder.svg?height=40&width=40";
                          }}
                        />
                      </div>
                      <div className="overflow-hidden">
                        <p className="font-medium truncate">
                          {partner.user.firstName} {partner.user.lastName || ""}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {partner.user.location?.city || "Local user"}
                        </p>
                      </div>
                    </div>
                    <div className="bg-gray-100 rounded-full h-7 w-7 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-medium">
                        {partner.count}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                className="text-center py-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <p className="text-gray-500">
                  No swap partners yet. Start exchanging food to build your
                  network!
                </p>
                <Link
                  to="/location"
                  className="inline-block mt-3 px-4 py-2 bg-black text-white text-sm rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Browse Food Items
                </Link>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
