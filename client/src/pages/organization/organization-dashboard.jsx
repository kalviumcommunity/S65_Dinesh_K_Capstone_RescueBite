import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import {
    PlusCircle,
    DollarSign,
    ShoppingBag,
    Utensils,
    Users,
    ArrowRight,
    Filter,
    Search,
    Clock,
    AlertTriangle,
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function OrganizationDashboard() {
    // State for data
    const [searchQuery, setSearchQuery] = useState("");
    const [inventoryItems, setInventoryItems] = useState([]);
    const [dashboardStats, setDashboardStats] = useState({
        inventoryCount: 0,
        revenue: 0,
        customersServed: 0,
        donationsMade: 0
    });
    const [expiringItems, setExpiringItems] = useState([]);
    const [recentDonations, setRecentDonations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch data on component mount
    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const token = localStorage.getItem('token');
            if (!token) {
                setError("You must be logged in to view this page");
                setLoading(false);
                return;
            }
            
            // Debug log to verify user credentials
            try {
                const tokenPayload = JSON.parse(atob(token.split('.')[1]));
                console.log("Token payload:", tokenPayload);
                
                if (tokenPayload.accountType !== 'organization') {
                    setError("This dashboard is only for organization accounts");
                    setLoading(false);
                    return;
                }
            } catch (tokenError) {
                console.error("Error parsing token:", tokenError);
                setError("Invalid authentication token");
                setLoading(false);
                return;
            }
            
            const headers = {
                'x-auth-token': token
            };
            
            // Attempt to fetch stats
            let dashboardData = {
                inventoryCount: 0,
                stats: {
                    revenue: 0,
                    customersServed: 0,
                    donationsMade: 0
                },
                expiringItems: [],
                recentDonations: []
            };
            
            try {
                console.log("Fetching dashboard stats...");
                const statsResponse = await axios.get(
                    `${API_BASE_URL}/api/organizations/dashboard-stats`, 
                    { headers }
                );
                
                if (statsResponse.data.success) {
                    console.log("Dashboard stats fetched successfully:", statsResponse.data);
                    dashboardData = statsResponse.data.data;
                }
            } catch (statsError) {
                console.error("Error fetching dashboard stats:", statsError);
                toast.error("Failed to load dashboard statistics");
            }
            
            // Set stats from API or default empty values
            setDashboardStats({
                inventoryCount: dashboardData.inventoryCount || 0,
                revenue: dashboardData.stats?.revenue || 0,
                customersServed: dashboardData.stats?.customersServed || 0,
                donationsMade: dashboardData.stats?.donationsMade || 0
            });
            
            setExpiringItems(dashboardData.expiringItems || []);
            setRecentDonations(dashboardData.recentDonations || []);
            
            // Fetch inventory items separately
            try {
                console.log("Fetching inventory items...");
                const inventoryResponse = await axios.get(
                    `${API_BASE_URL}/api/organizations/food/food-items`, 
                    { headers }
                );
                
                if (inventoryResponse.data.success) {
                    console.log("Inventory items fetched successfully:", inventoryResponse.data);
                    setInventoryItems(inventoryResponse.data.data.foodItems || []);
                }
            } catch (inventoryError) {
                console.error("Error fetching inventory:", inventoryError);
                toast.error("Failed to load inventory items");
                setInventoryItems([]);
            }
        } catch (err) {
            console.error("Dashboard data fetch error:", err);
            setError("Failed to load dashboard data");
        } finally {
            setLoading(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { duration: 0.4 },
        },
    };
    
    // Function to format date
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };
    
    // Calculate time remaining until expiration
    const getTimeRemaining = (expiresAt) => {
        if (!expiresAt) return "Unknown";
        
        const now = new Date();
        const expiration = new Date(expiresAt);
        const diff = expiration - now;

        if (diff <= 0) return "Expired";

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        if (days > 0) return `${days} day${days > 1 ? "s" : ""}`;
        return `${hours} hour${hours > 1 ? "s" : ""}`;
    };
    
    // Filter inventory items based on search query
    const filteredInventoryItems = inventoryItems.filter(item => 
        item.title?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex-1 h-full min-h-screen w-full flex items-center justify-center">
                <div className="text-center">
                    <Clock className="h-12 w-12 mx-auto animate-spin text-gray-400" />
                    <p className="mt-4 text-gray-600">Loading dashboard data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex-1 h-full min-h-screen w-full flex items-center justify-center">
                <div className="text-center max-w-md mx-auto p-6 bg-red-50 rounded-lg">
                    <AlertTriangle className="h-12 w-12 mx-auto text-red-500" />
                    <h2 className="mt-4 text-xl font-bold text-red-700">Error Loading Dashboard</h2>
                    <p className="mt-2 text-red-600">{error}</p>
                    <button 
                        onClick={() => fetchDashboardData()}
                        className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 h-full min-h-screen w-full">
            <div className="space-y-6 p-4 md:p-6 w-full">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 w-full">
                    <div>
                        <h1 className="text-2xl font-bold">
                            Restaurant Dashboard
                        </h1>
                        <p className="text-gray-600">
                            Manage your surplus food inventory
                        </p>
                    </div>

                    <Link to="/organization/add-food-item" className="inline-flex items-center justify-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add New Item
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full">
                    <motion.div
                        className="bg-white p-4 rounded-lg shadow-sm flex items-center"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                            <ShoppingBag className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">
                                Total Inventory
                            </p>
                            <p className="text-2xl font-bold">{dashboardStats.inventoryCount} items</p>
                        </div>
                    </motion.div>

                    <motion.div
                        className="bg-white p-4 rounded-lg shadow-sm flex items-center"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                    >
                        <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mr-4">
                            <DollarSign className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">
                                Revenue Saved
                            </p>
                            <p className="text-2xl font-bold">${dashboardStats.revenue.toFixed(2)}</p>
                        </div>
                    </motion.div>

                    <motion.div
                        className="bg-white p-4 rounded-lg shadow-sm flex items-center"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                    >
                        <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center mr-4">
                            <Users className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">
                                Customers Served
                            </p>
                            <p className="text-2xl font-bold">{dashboardStats.customersServed}</p>
                        </div>
                    </motion.div>

                    <motion.div
                        className="bg-white p-4 rounded-lg shadow-sm flex items-center"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.3 }}
                    >
                        <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center mr-4">
                            <Utensils className="h-6 w-6 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">
                                Donations Made
                            </p>
                            <p className="text-2xl font-bold">{dashboardStats.donationsMade}</p>
                        </div>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 w-full">
                    <motion.div
                        className="bg-white p-6 rounded-lg shadow-sm md:col-span-9 w-full"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold">
                                Current Inventory
                            </h2>
                            <Link
                                to="/inventory"
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
                                    placeholder="Search inventory..."
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                />
                            </div>
                            <button className="p-2 border border-gray-300 rounded-md hover:bg-gray-50">
                                <Filter className="h-5 w-5" />
                            </button>
                        </div>

                        <motion.div
                            className="overflow-x-auto w-full"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            {filteredInventoryItems.length > 0 ? (
                                <table className="w-full table-fixed">
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
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredInventoryItems.map((item) => (
                                            <motion.tr
                                                key={item._id}
                                                variants={itemVariants}
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="h-10 w-10 flex-shrink-0">
                                                            <img
                                                                className="h-10 w-10 rounded-full object-cover"
                                                                src={(item.images && item.images.length > 0) 
                                                                    ? item.images[0] 
                                                                    : "/placeholder.svg"}
                                                                alt={item.title}
                                                                onError={(e) => {
                                                                    e.target.onerror = null;
                                                                    e.target.src = "/placeholder.svg";
                                                                }}
                                                            />
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {item.title}
                                                            </div>
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
                                                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                            getTimeRemaining(item.expiresAt) === "Expired"
                                                                ? "bg-red-100 text-red-800"
                                                                : getTimeRemaining(item.expiresAt).includes("hour") || 
                                                                  getTimeRemaining(item.expiresAt) === "1 day"
                                                                  ? "bg-yellow-100 text-yellow-800"
                                                                  : "bg-green-100 text-green-800"
                                                        }`}
                                                    >
                                                        {getTimeRemaining(item.expiresAt)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {item.isFree ? (
                                                        <span className="text-green-600 font-medium">Free</span>
                                                    ) : (
                                                        <div className="flex flex-col">
                                                            <span className="line-through">
                                                                ${item.originalPrice?.toFixed(2) || item.price?.toFixed(2)}
                                                            </span>
                                                            <span className="text-green-600 font-medium">
                                                                ${item.price?.toFixed(2)}
                                                            </span>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex space-x-2">
                                                        <Link 
                                                            to={`/organization/edit-food-item/${item._id}`}
                                                            className="text-black hover:text-gray-700"
                                                        >
                                                            Edit
                                                        </Link>
                                                        <button 
                                                            className="text-red-600 hover:text-red-800"
                                                            disabled={item.status === 'reserved'}
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="text-center py-8">
                                    <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <AlertTriangle className="h-8 w-8 text-gray-400" />
                                    </div>
                                    <p className="text-gray-500 mb-2">No food items found</p>
                                    <p className="text-sm text-gray-400">
                                        {searchQuery ? "Try adjusting your search" : "Add your first food item to get started"}
                                    </p>
                                    <Link
                                        to="/organization/add-food-item"
                                        className="mt-4 inline-flex items-center text-blue-600 hover:underline"
                                    >
                                        <PlusCircle className="mr-2 h-4 w-4" />
                                        Add Food Item
                                    </Link>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>

                    <motion.div
                        className="md:col-span-3 space-y-6 w-full"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                    >
                        <div className="bg-white p-6 rounded-lg shadow-sm w-full">
                            <h2 className="text-lg font-semibold mb-4">
                                Expiring Soon
                            </h2>
                            <div className="space-y-3">
                                {expiringItems && expiringItems.length > 0 ? (
                                    expiringItems.map((item) => (
                                        <div
                                            key={item._id}
                                            className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                                        >
                                            <div className="flex items-center">
                                                <img
                                                    src={(item.images && item.images.length > 0) 
                                                        ? item.images[0] 
                                                        : "/placeholder.svg"}
                                                    alt={item.title}
                                                    className="h-10 w-10 rounded-full object-cover mr-3"
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = "/placeholder.svg";
                                                    }}
                                                />
                                                <div>
                                                    <p className="font-medium">
                                                        {item.title}
                                                    </p>
                                                    <p className="text-xs text-red-600">
                                                        Expires in {getTimeRemaining(item.expiresAt)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-sm font-medium">
                                                {item.quantity} {item.quantityUnit}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500 text-center py-4">
                                        No items expiring soon
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-sm w-full">
                            <h2 className="text-lg font-semibold mb-4">
                                Recent Donations
                            </h2>
                            {recentDonations && recentDonations.length > 0 ? (
                                <div className="space-y-3">
                                    {recentDonations.map((donation) => (
                                        <div
                                            key={donation._id}
                                            className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                                        >
                                            <div>
                                                <p className="font-medium">
                                                    {donation.foodItem?.title || "Unknown Item"}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    to {donation.recipient?.name || "Anonymous recipient"}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {formatDate(donation.donatedAt)}
                                                </p>
                                            </div>
                                            <span className="text-sm font-medium">
                                                {donation.quantity || 0} items
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-center py-4">
                                    No recent donations
                                </p>
                            )}

                            <div className="mt-4">
                                <Link
                                    to="/donations"
                                    className="text-sm text-black flex items-center justify-center hover:underline"
                                >
                                    View all donations{" "}
                                    <ArrowRight className="ml-1 h-4 w-4" />
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
