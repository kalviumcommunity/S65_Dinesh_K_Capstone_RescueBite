import { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import {
    Home,
    Map,
    User,
    LogOut,
    Bell,
    ShoppingBag,
    Settings,
    Building2,
    Gift,
    Heart,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export default function DashboardLayout({ userType = "customer" }) {
    const location = useLocation();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState(0);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [acceptedSwaps, setAcceptedSwaps] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const { user } = useAuth();
    const [viewedNotifications, setViewedNotifications] = useState({
        pendingRequests: 0,
        acceptedSwaps: 0,
        pendingReviews: 0
    });
    const [pendingReviews, setPendingReviews] = useState([]);

    const customerNavItems = [
        { href: "/customer", icon: Home },
        { href: "/location", icon: Map },
        { href: "/profile", icon: User },
        { href: "/donor", icon: Heart },
        { href: "/settings", icon: Settings },
    ];

    const restaurantNavItems = [
        { href: "/restaurant", icon: Building2 },
        { href: "/inventory", icon: ShoppingBag },
        { href: "/donations", icon: Gift },
        { href: "/donor", icon: Heart },
        { href: "/settings", icon: Settings },
    ];

    const navItems =
        userType === "customer" ? customerNavItems : restaurantNavItems;

    useEffect(() => {
        const fetchNotificationData = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) return;

                const headers = {
                    "x-auth-token": token,
                };

                // Get user info
                const userResponse = await axios.get(`${API_BASE_URL}/api/auth/me`, { headers });
                if (userResponse.data?.user) {
                    setCurrentUser(userResponse.data.user);
                }

                // Get pending requests
                const pendingResponse = await axios.get(
                    `${API_BASE_URL}/api/swaps/pending`,
                    { headers }
                );
                
                const pendingReqs = pendingResponse.data?.success ? 
                    (pendingResponse.data.data || []) : [];
                    
                setPendingRequests(pendingReqs);

                // Get pending reviews - only count these for notifications
                const completedResponse = await axios.get(
                    `${API_BASE_URL}/api/swaps/my-swaps?status=completed`,
                    { headers }
                );
                
                let pendingReviewItems = [];
                
                if (completedResponse.data?.success && userResponse.data?.user) {
                    const userId = userResponse.data.user._id;
                    const swaps = completedResponse.data.data.swaps || [];
                    
                    // Find swaps needing reviews
                    pendingReviewItems = swaps.filter(swap => {
                        if (userId === swap.requester?._id) {
                            return !swap.providerRating || swap.providerRating === 0;
                        }
                        if (userId === swap.provider?._id) {
                            return !swap.requesterRating || swap.requesterRating === 0;
                        }
                        return false;
                    });
                }
                
                setPendingReviews(pendingReviewItems);

                // Only count pending requests and pending reviews for notifications
                // NOT accepted swaps (these should just be in their tab)
                const totalNotifications = pendingReqs.length + pendingReviewItems.length;
                
                setNotifications(totalNotifications);
            } catch (error) {
                console.error("Error fetching notification data:", error);
            }
        };

        fetchNotificationData();
        const intervalId = setInterval(fetchNotificationData, 30000);
        return () => clearInterval(intervalId);
    }, []);

    const handleNotificationClick = () => {
        // Always navigate to the profile page first
        const targetTab = pendingRequests.length > 0 
            ? "requests" 
            : pendingReviews.length > 0 
                ? "pendingReviews" 
                : "transactions";
        
        // Force a hard navigation to ensure the URL changes are processed
        window.location.href = `/profile?tab=${targetTab}`;
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Static Sidebar - Fixed position */}
            <div className="fixed top-0 left-0 h-full w-16 bg-white border-r border-gray-200 flex flex-col z-10">
                {/* Sidebar Header */}
                <div className="border-b border-gray-200 p-4 py-[18px] flex items-center justify-center">
                    <Link to="/">
                        <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                        >
                            <path
                                d="M12 2L2 7L12 12L22 7L12 2Z"
                                stroke="#000000"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            <path
                                d="M2 17L12 22L22 17"
                                stroke="#000000"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            <path
                                d="M2 12L12 17L22 12"
                                stroke="#000000"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </Link>
                </div>

                {/* Navigation Items */}
                <div className="flex-1 py-6 overflow-y-auto">
                    <ul className="space-y-1 px-2">
                        {navItems.map((item) => (
                            <li key={item.href}>
                                <Link
                                    to={item.href}
                                    className={`flex items-center justify-center p-3 rounded-md transition-colors ${
                                        location.pathname === item.href
                                            ? "bg-gray-100 text-black"
                                            : "text-gray-700 hover:bg-gray-50"
                                    }`}
                                >
                                    <item.icon className="h-5 w-5" />
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Sidebar Footer */}
                <div className="border-t border-gray-200 py-10 flex items-center justify-center">
                    <Link
                        to="/auth/login"
                        className="text-gray-700 hover:text-gray-900 transition-colors"
                    >
                        <LogOut className="h-5 w-5" />
                    </Link>
                </div>
            </div>

            {/* Main Content Area - Add left padding to account for fixed sidebar */}
            <div className="flex-1 flex flex-col ml-16">
                <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                    <div className="flex items-center justify-end px-4 py-3">
                        <div className="flex items-center space-x-4">
                            <div className="relative">
                                <button 
                                    className="p-2 rounded-full hover:bg-gray-100"
                                    onClick={handleNotificationClick}
                                    title={`${pendingRequests.length} pending requests and ${acceptedSwaps.length} accepted swaps`}
                                >
                                    <Bell className="h-5 w-5" />
                                    {notifications > 0 && (
                                        <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                                            {notifications}
                                        </span>
                                    )}
                                </button>
                            </div>

                            <div className="h-8 w-8 rounded-full overflow-hidden bg-gray-200 cursor-pointer" onClick={() => navigate("/profile")}>
                                {currentUser?.profileImage ? (
                                    <img
                                        src={currentUser.profileImage}
                                        alt={currentUser.firstName || "User"}
                                        className="h-full w-full object-cover"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = "/placeholder.svg?height=40&width=40";
                                        }}
                                    />
                                ) : (
                                    <User className="h-5 w-5 text-gray-600 m-auto" />
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-4 md:p-6 overflow-auto">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="w-full max-w-none"
                    >
                        <Outlet />
                    </motion.div>
                </main>
            </div>
        </div>
    );
}
