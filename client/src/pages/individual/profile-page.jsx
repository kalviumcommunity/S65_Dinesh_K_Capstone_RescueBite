import { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { Mail, MapPin, Phone, Calendar, Edit, Upload, MessageCircle, CheckCircle, Shield, Star } from 'lucide-react';
import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import SwapChat from "../../components/SwapChat";

// Import the child components
import SwapHistory from './SwapHistory';
import Reviews from './Reviews';
import SwapRequests from './SwapRequests';
import AcceptedSwaps from './AcceptedSwaps';
import RatingComponent from './Rating';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function ProfilePage() {
    const [user, setUser] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const { id } = useParams(); // id of the profile being viewed (if not own)
    const [activeTab, setActiveTab] = useState("transactions");
    const [editMode, setEditMode] = useState(false);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [selectedSwap, setSelectedSwap] = useState(null); // For chat
    const [showChat, setShowChat] = useState(false);
    const navigate = useNavigate();
    const [acceptedSwaps, setAcceptedSwaps] = useState([]);
    const location = useLocation();
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [selectedSwapForRating, setSelectedSwapForRating] = useState(null);
    const [ratingValue, setRatingValue] = useState(5);
    const [reviewComment, setReviewComment] = useState("");
    const [pendingReviews, setPendingReviews] = useState([]);
    const [calculatedStats, setCalculatedStats] = useState({ shared: 0, received: 0 });
    const [processingReview, setProcessingReview] = useState(false);

    // --- Helper Functions ---
    const calculateSwapStats = (allUserSwaps, userId) => {
        if (!allUserSwaps || !userId) return { shared: 0, received: 0 };
        return allUserSwaps.reduce((stats, swap) => {
            if (swap.status === 'completed') {
                // Compare as strings to avoid object comparison issues
                if (swap.provider?._id?.toString() === userId.toString()) {
                    stats.shared += 1;
                }
                if (swap.requester?._id?.toString() === userId.toString()) {
                    stats.received += 1;
                }
            }
            return stats;
        }, { shared: 0, received: 0 });
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        try {
            return new Date(dateString).toLocaleDateString(undefined, options);
        } catch (e) {
            console.error("Error formatting date:", dateString, e);
            return "Invalid Date";
        }
    };

    const getSwapStatusBadge = (status) => {
        const statusMap = {
            pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending' },
            accepted: { color: 'bg-blue-100 text-blue-800', text: 'Accepted' },
            completed: { color: 'bg-green-100 text-green-800', text: 'Completed' },
            cancelled: { color: 'bg-red-100 text-red-800', text: 'Cancelled' },
            rejected: { color: 'bg-red-100 text-red-800', text: 'Rejected' }
        };
        return statusMap[status] || { color: 'bg-gray-100 text-gray-800', text: 'Unknown' };
    };

    // --- Data Fetching Functions ---
    const fetchAllUserRelatedSwaps = async (headers) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/swaps/my-swaps?limit=1000`, { headers });
            if (response.data.success) {
                return response.data.data.swaps || [];
            } else {
                console.warn("No swap data received or success is false in fetchAllUserRelatedSwaps");
                return [];
            }
        } catch (error) {
            console.error("Error fetching all user-related swaps:", error);
            toast.error("Failed to load swap data for stats.");
            return [];
        }
    };

    const fetchSwapHistory = async (allSwaps, currentUserId, headers) => {
        if (!currentUserId) return;
        try {
            // Filter for history (exclude pending and accepted)
            const historySwaps = allSwaps.filter(swap =>
                !['pending', 'accepted'].includes(swap.status)
            );

            const swapsWithUserNames = historySwaps.map(swap => {
                const isRequester = swap.requester?._id?.toString() === currentUserId.toString();
                const otherUser = isRequester ? swap.provider : swap.requester;
                return {
                    ...swap,
                    otherUserName: otherUser ?
                        `${otherUser.firstName || ''} ${otherUser.lastName || ''}`.trim() ||
                        (otherUser.businessName || "User") :
                        "User"
                };
            });
            setTransactions(swapsWithUserNames);
        } catch (error) {
            console.error("Error processing swap history:", error);
            setTransactions([]);
        }
    };

    const fetchUserReviews = async (userId, headers) => {
        if (!userId) return;
        try {
            const response = await axios.get(
                `${API_BASE_URL}/api/swaps/my-swaps?status=completed&limit=1000`,
                { headers }
            );

            let allReviews = [];
            if (response.data?.success) {
                const swaps = response.data.data.swaps || [];

                swaps.forEach(swap => {
                    // Review *of* the current profile user
                    const isProfileUserProvider = swap.provider?._id === userId;
                    const isProfileUserRequester = swap.requester?._id === userId;

                    if (isProfileUserProvider && swap.providerRating > 0) {
                        const reviewer = swap.requester || {};
                        allReviews.push({
                            _id: `${swap._id}_provider_review`,
                            rating: swap.providerRating || 0,
                            review: swap.providerReview || swap.providerComment || "No comment provided",
                            date: swap.reviewDate || swap.updatedAt || swap.createdAt,
                            reviewer: {
                                _id: reviewer._id || "unknown",
                                fullName: `${reviewer.firstName || ''} ${reviewer.lastName || ''}`.trim() || reviewer.email?.split('@')[0] || "Unknown User",
                                profileImage: reviewer.profileImage || null
                            },
                            foodItem: {
                                _id: swap.foodItem?._id,
                                title: swap.foodItem?.title || "Food Item",
                                images: swap.foodItem?.images || []
                            }
                        });
                    } else if (isProfileUserRequester && swap.requesterRating > 0) {
                        const reviewer = swap.provider || {};
                        allReviews.push({
                            _id: `${swap._id}_requester_review`,
                            rating: swap.requesterRating || 0,
                            review: swap.requesterReview || swap.requesterComment || "No comment provided",
                            date: swap.reviewDate || swap.updatedAt || swap.createdAt,
                            reviewer: {
                                _id: reviewer._id || "unknown",
                                fullName: `${reviewer.firstName || ''} ${reviewer.lastName || ''}`.trim() || reviewer.email?.split('@')[0] || "Unknown User",
                                profileImage: reviewer.profileImage || null
                            },
                            foodItem: {
                                _id: swap.foodItem?._id,
                                title: swap.foodItem?.title || "Food Item",
                                images: swap.foodItem?.images || []
                            }
                        });
                    }
                });

                allReviews.sort((a, b) => new Date(b.date) - new Date(a.date));
                setReviews(allReviews);
            }
        } catch (error) {
            console.error("Error fetching reviews:", error);
            toast.error("Failed to load reviews");
            setReviews([]);
        }
    };

    const fetchPendingRequests = async (headers) => {
        // Only fetch if viewing own profile
        if (id) {
            setPendingRequests([]);
            return;
        }
        try {
            if (!headers['x-auth-token']) {
                console.error("No auth token available for fetching requests");
                return;
            }

            const requestsResponse = await axios.get(
                `${API_BASE_URL}/api/swaps/pending`,
                { headers }
            );

            if (requestsResponse.data?.success) {
                const pendingData = requestsResponse.data.data || [];

                const formattedRequests = pendingData.map(request => {
                    if (request.requester) {
                        if (!request.requester.fullName) {
                            request.requester.fullName = `${request.requester.firstName || ''} ${request.requester.lastName || ''}`.trim() || request.requester.email?.split('@')[0] || `User-${request.requester._id?.substring(0, 6)}`;
                        }
                    }
                    return request;
                });

                setPendingRequests(formattedRequests);
            } else {
                setPendingRequests([]);
            }
        } catch (error) {
            console.error("Error fetching pending requests:", error);
            setPendingRequests([]);
        }
    };

    const fetchAcceptedSwaps = async (currentUserId, headers) => {
        if (!currentUserId) return;
        // Only fetch if viewing own profile
        if (id) {
            setAcceptedSwaps([]);
            return;
        }
        try {
            const response = await axios.get(
                `${API_BASE_URL}/api/swaps/my-swaps?status=accepted`,
                { headers }
            );

            if (response.data.success) {
                const swaps = response.data.data.swaps || [];
                const formattedSwaps = swaps.map(swap => {
                    const isRequester = swap.requester?._id?.toString() === currentUserId.toString();
                    const otherUser = isRequester ? swap.provider : swap.requester;
                    return {
                        ...swap,
                        otherUserName: otherUser ?
                            `${otherUser.firstName || ''} ${otherUser.lastName || ''}`.trim() ||
                            (otherUser.businessName || "User") :
                            "User"
                    };
                });
                setAcceptedSwaps(formattedSwaps);
            } else {
                setAcceptedSwaps([]);
            }
        } catch (error) {
            console.error("Error fetching accepted swaps:", error);
            setAcceptedSwaps([]);
        }
    };

    // Fetch swaps that need reviews
    const fetchPendingReviews = async (currentUserId, headers) => {
        if (!currentUserId || id) {
            setPendingReviews([]);
            return;
        }
        
        try {
            const response = await axios.get(
                `${API_BASE_URL}/api/swaps/my-swaps?status=completed&limit=1000`,
                { headers }
            );

            if (!response.data?.success) {
                setPendingReviews([]);
                return;
            }

            const swaps = response.data.data.swaps || [];
            
            // Filter swaps that actually need a review
            const needsReview = swaps.filter(swap => {
                if (swap.status !== 'completed') return false;

                // Ensure both requester and provider exist
                if (!swap.requester?._id || !swap.provider?._id) return false;

                const isUserRequester = swap.requester._id.toString() === currentUserId.toString();
                const isUserProvider = swap.provider._id.toString() === currentUserId.toString();

                // Only consider swaps where the user is either requester or provider
                if (!isUserRequester && !isUserProvider) return false;

                // If user is requester, check if they need to rate the provider
                if (isUserRequester && (!swap.providerRating || swap.providerRating === 0)) {
                    // Only if provider exists
                    if (!swap.provider) return false;
                    return true;
                }
                
                // If user is provider, check if they need to rate the requester
                if (
                    isUserProvider &&
                    (!swap.requesterRating || swap.requesterRating === 0) &&
                    swap.isSwap && swap.offeredItem // Only allow if it's a true swap
                ) {
                    if (!swap.requester) return false;
                    return true;
                }
                
                return false;
            }).map(swap => {
                // Add detailed info about who to rate
                const isUserRequester = swap.requester._id.toString() === currentUserId.toString();
                const personToRate = isUserRequester ? swap.provider : swap.requester;
                
                return {
                    ...swap,
                    personToRateName: personToRate ? 
                        `${personToRate.firstName || ''} ${personToRate.lastName || ''}`.trim() || 
                        `User-${personToRate._id?.substring(0, 6)}` : 
                        'Swap Partner',
                    personToRateImage: personToRate?.profileImage || null,
                    personToRateId: personToRate?._id || null,
                    ratingAs: isUserRequester ? 'requester' : 'provider',
                    ratingFor: isUserRequester ? 'provider' : 'requester',
                    // Store the exact field names needed for this swap
                    ratingField: isUserRequester ? 'providerRating' : 'requesterRating',
                    reviewField: isUserRequester ? 'providerReview' : 'requesterReview'
                };
            });

            setPendingReviews(needsReview);
        } catch (error) {
            console.error("Error fetching pending reviews:", error);
            setPendingReviews([]);
        }
    };

    // --- Main Data Fetching Orchestrator ---
    const fetchProfileData = async () => {
        setError("");
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
            if (!id) {
                setError("You must be logged in to view your profile.");
                setLoading(false);
                navigate('/login');
                return;
            }
        }

        const headers = token ? { 'x-auth-token': token } : {};

        try {
            // Determine the correct endpoint
            const profileEndpoint = id
                ? `${API_BASE_URL}/api/users/profile/${id}`
                : `${API_BASE_URL}/api/users/me`;

            // Fetch user profile
            const userResponse = await axios.get(profileEndpoint, { headers });

            if (!userResponse.data?.success || !userResponse.data.data) {
                throw new Error(userResponse.data?.message || (id ? "User not found" : "Failed to fetch your profile"));
            }

            const userData = {
                ...userResponse.data.data,
                fullName: `${userResponse.data.data.firstName || ''} ${userResponse.data.data.lastName || ''}`.trim() || userResponse.data.data.email?.split('@')[0] || 'User',
                rating: userResponse.data.data.rating,
                ratingCount: userResponse.data.data.ratingCount,
                itemsShared: userResponse.data.data.itemsShared,
                itemsReceived: userResponse.data.data.itemsReceived,
                trustScore: userResponse.data.data.trustScore
            };
            setUser(userData);
            const currentUserId = userData._id;

            // Fetch all swaps related to the user
            const allSwaps = await fetchAllUserRelatedSwaps(headers);

            // Calculate stats based on ALL completed swaps
            const stats = calculateSwapStats(allSwaps, currentUserId);
            setCalculatedStats(stats);

            // Fetch data for specific tabs
            await fetchSwapHistory(allSwaps, currentUserId, headers);
            await fetchUserReviews(currentUserId, headers);

            // Fetch data relevant only when viewing own profile
            if (!id) {
                await fetchPendingRequests(headers);
                await fetchAcceptedSwaps(currentUserId, headers);
                await fetchPendingReviews(currentUserId, headers);
            } else {
                setPendingRequests([]);
                setAcceptedSwaps([]);
                setPendingReviews([]);
            }

            // Handle initial tab selection
            const params = new URLSearchParams(location.search);
            const tabParam = params.get('tab');
            const validTabs = ['transactions', 'reviews', 'requests', 'accepted', 'pendingReviews'];

            if (tabParam && validTabs.includes(tabParam)) {
                if (id && (tabParam === 'requests' || tabParam === 'accepted' || tabParam === 'pendingReviews')) {
                    setActiveTab('transactions');
                } else {
                    setActiveTab(tabParam);
                }
            } else if (!id && pendingReviews.length > 0) {
                setActiveTab("pendingReviews");
            } else if (!id && pendingRequests.length > 0) {
                setActiveTab("requests");
            } else {
                setActiveTab("transactions");
            }

        } catch (error) {
            console.error("Error fetching profile:", error);
            setError(error.message || "Failed to load profile data");
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    // --- Action Handlers ---
    const handleAcceptRequest = async (requestId) => {
        if (id) return;
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error("Authentication token not found.");
            const headers = { 'x-auth-token': token };

            const response = await axios.put(
                `${API_BASE_URL}/api/swaps/${requestId}/status`,
                { status: 'accepted' },
                { headers }
            );

            if (response.data.success) {
                toast.success("Request accepted!");
                // Refresh relevant data
                fetchPendingRequests(headers);
                fetchAcceptedSwaps(user._id, headers);
                setActiveTab("accepted");
            } else {
                throw new Error(response.data.message || "Failed to accept request");
            }
        } catch (error) {
            console.error("Error accepting request:", error);
            toast.error(error.message || "Failed to accept request");
        }
    };

    const handleDeclineRequest = async (requestId) => {
        if (id) return;
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error("Authentication token not found.");
            const headers = { 'x-auth-token': token };

            const response = await axios.put(
                `${API_BASE_URL}/api/swaps/${requestId}/status`,
                { status: 'rejected' },
                { headers }
            );

            if (response.data.success) {
                toast.success("Request declined");
                // Refresh relevant data
                fetchPendingRequests(headers);
                const allSwaps = await fetchAllUserRelatedSwaps(headers);
                fetchSwapHistory(allSwaps, user._id, headers);
            } else {
                throw new Error(response.data.message || "Failed to decline request");
            }
        } catch (error) {
            console.error("Error declining request:", error);
            toast.error(error.message || "Failed to decline request");
        }
    };

    const handleCompleteSwap = async (swapId) => {
        if (id) return;
        try {
            toast.loading("Completing swap...");
            const token = localStorage.getItem('token');
            if (!token) throw new Error("Authentication token not found.");
            const headers = {
                'x-auth-token': token,
                'Content-Type': 'application/json'
            };

            const response = await axios.put(
                `${API_BASE_URL}/api/swaps/${swapId}/status`,
                JSON.stringify({
                    status: 'completed'
                }),
                { headers }
            );
            toast.dismiss();

            if (response.data.success) {
                toast.success("Swap completed successfully!");
                await fetchProfileData();
                setActiveTab('pendingReviews');
            } else {
                throw new Error(response.data.message || "Error completing swap");
            }
        } catch (error) {
            toast.dismiss();
            console.error("Error completing swap:", error);
            toast.error(error.message || "Failed to complete swap. Please try again.");
        }
    };

    // Fixed rating submission handler to match API expectations
    const handleRatingSubmit = async () => {
        if (!selectedSwapForRating || !user) {
            toast.error("Missing swap information. Please try again.");
            return;
        }
        
        if (processingReview) {
            return; // Prevent multiple submissions
        }
        
        try {
            setProcessingReview(true);
            toast.loading("Submitting your review...");
            
            const token = localStorage.getItem('token');
            if (!token) throw new Error("Authentication token not found.");
            const headers = { 
                'x-auth-token': token,
                'Content-Type': 'application/json'
            };

            const payload = {
                rating: ratingValue,
                review: reviewComment || "No comment provided",
                reviewFor: selectedSwapForRating.ratingFor, // "provider" or "requester"
                accountType: user.accountType // optional, but backend uses it for trust score
            };
            
            console.log("Submitting review with payload:", payload);
            console.log("For swap:", selectedSwapForRating._id);
            
            const response = await axios.put(
                `${API_BASE_URL}/api/swaps/${selectedSwapForRating._id}/review`,
                payload,
                { headers }
            );
            
            toast.dismiss();

            if (response.data.success) {
                toast.success("Your review has been submitted!");
                
                // Update pendingReviews immediately to remove this item
                setPendingReviews(prevReviews => 
                    prevReviews.filter(review => review._id !== selectedSwapForRating._id)
                );
                
                // Close modal and reset form
                setShowRatingModal(false);
                setSelectedSwapForRating(null);
                setRatingValue(5);
                setReviewComment("");
                
                // Refresh all data to ensure consistency
                await fetchProfileData();
            } else {
                throw new Error(response.data.message || "Error submitting review");
            }
        } catch (error) {
            toast.dismiss();
            console.error("Error submitting rating:", error);
            
            // Get the detailed error message from the response if available
            const errorMessage = error.response?.data?.message || error.message || "Failed to submit rating. Please try again.";
            toast.error(errorMessage);
        } finally {
            setProcessingReview(false);
        }
    };

    const handleImageUpload = async (e) => {
        if (id) return;
        const file = e.target.files[0];
        if (file) {
            toast.loading('Uploading image...');
            const formData = new FormData();
            formData.append('profileImage', file);

            try {
                const token = localStorage.getItem('token');
                if (!token) throw new Error("Authentication token not found.");
                const response = await axios.post(
                    `${API_BASE_URL}/api/users/upload-image`,
                    formData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            'x-auth-token': token
                        },
                        timeout: 30000
                    }
                );
                toast.dismiss();

                if (response.data.success && response.data.imageUrl) {
                    setUser(prev => ({ ...prev, profileImage: response.data.imageUrl }));
                    toast.success("Profile image updated successfully");
                } else {
                    throw new Error(response.data.message || "Failed to upload image");
                }
            } catch (error) {
                toast.dismiss();
                console.error("Image upload error:", error);
                toast.error(error.response?.data?.message || error.message || "Failed to upload image");
            }
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        if (id || !user) return;

        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error("Authentication token not found.");
            const headers = { 'x-auth-token': token };

            let locationObj = user.location || { type: "Point", coordinates: [0, 0], address: "" };
            if (locationObj.coordinates && Array.isArray(locationObj.coordinates)) {
                locationObj.coordinates = locationObj.coordinates.map(coord =>
                    typeof coord === 'string' ? parseFloat(coord) || 0 : coord || 0
                );
                if (locationObj.coordinates.length !== 2 || !Number.isFinite(locationObj.coordinates[0]) || !Number.isFinite(locationObj.coordinates[1])) {
                    console.warn("Invalid coordinates provided, resetting.", locationObj.coordinates);
                }
            } else {
                locationObj.coordinates = [0, 0];
            }
            locationObj.address = locationObj.address || "";
            locationObj.type = "Point";

            const updatedData = {
                firstName: user.firstName || "",
                lastName: user.lastName || "",
                phone: user.phone || "",
                bio: user.bio || "",
                location: locationObj,
            };

            const response = await axios.put(
                `${API_BASE_URL}/api/users/profile`,
                updatedData,
                { headers }
            );

            if (response.data.success) {
                const updatedUserData = response.data.data;
                updatedUserData.fullName = `${updatedUserData.firstName || ''} ${updatedUserData.lastName || ''}`.trim() || updatedUserData.email?.split('@')[0] || 'User';
                setUser(updatedUserData);
                setEditMode(false);
                setError("");
                toast.success("Profile updated successfully");
            } else {
                throw new Error(response.data.message || "Failed to update profile");
            }
        } catch (error) {
            console.error("Profile update error:", error);
            const errMsg = error.response?.data?.message || error.message || "Failed to update profile";
            setError(errMsg);
            toast.error(errMsg);
        }
    };

    const handleOpenChat = (swap) => {
        if (!user) return;
        setSelectedSwap(swap);
        setShowChat(true);
    };

    const handleOpenRatingModal = (swap) => {
        if (!swap) {
            toast.error("Cannot load rating form. Missing swap information.");
            return;
        }
        
        // Ensure we have all the necessary information
        if (!swap.personToRateId) {
            toast.error("Missing information about who to rate.");
            return;
        }
        
        setSelectedSwapForRating(swap);
        setRatingValue(5);
        setReviewComment("");
        setShowRatingModal(true);
    };

    // --- useEffect Hooks ---
    useEffect(() => {
        fetchProfileData();

        let intervalId = null;
        if (!id) {
            intervalId = setInterval(async () => {
                const token = localStorage.getItem('token');
                if (token && user?._id) {
                    const headers = { 'x-auth-token': token };
                    await fetchPendingRequests(headers);
                    await fetchPendingReviews(user._id, headers);
                }
            }, 60000);
        }

        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [id, location.search]);

    // Add a secondary effect to refresh data after a tab change
    useEffect(() => {
        if (!loading && user?._id) {
            const token = localStorage.getItem('token');
            if (token) {
                const headers = { 'x-auth-token': token };
                
                // Refresh data specific to the active tab
                if (activeTab === "pendingReviews") {
                    fetchPendingReviews(user._id, headers);
                } else if (activeTab === "requests") {
                    fetchPendingRequests(headers);
                } else if (activeTab === "accepted") {
                    fetchAcceptedSwaps(user._id, headers);
                }
            }
        }
    }, [activeTab, user?._id]);

    // --- Render Logic ---
    if (loading) {
        return <div className="text-center p-8">Loading profile...</div>;
    }

    if (error && !user) {
        return <div className="text-center p-8 text-red-500">{error}</div>;
    }
    if (!user) {
        return <div className="text-center p-8 text-gray-500">Profile not available.</div>;
    }

    const fadeIn = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
    };

    const isOwnProfile = !id;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <motion.div
                className="bg-white rounded-lg shadow-sm overflow-hidden"
                initial="hidden"
                animate="visible"
                variants={fadeIn}
            >
                <div className="md:flex">
                    {/* Profile Sidebar */}
                    <div className="md:w-1/3 lg:w-1/4 bg-gray-50 p-6 border-r border-gray-200">
                        <div className="flex flex-col items-center text-center">
                             {/* Image and Upload */}
                             <div className="relative mb-4 group">
                                <div className="h-32 w-32 rounded-full overflow-hidden border-2 border-gray-200 mx-auto">
                                    <img
                                        src={user?.profileImage ? user.profileImage : "/placeholder.svg"}
                                        alt={user?.fullName}
                                        className="h-full w-full object-cover"
                                        onError={(e) => { e.target.onerror = null; e.target.src = "/placeholder.svg"; }}
                                    />
                                </div>
                                {isOwnProfile && (
                                    <>
                                        <input
                                            type="file"
                                            className="hidden"
                                            id="profileImageInput"
                                            onChange={handleImageUpload}
                                            accept="image/*"
                                        />
                                        <label
                                            htmlFor="profileImageInput"
                                            className="absolute bottom-0 right-0 bg-black bg-opacity-60 text-white p-2 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                                            title="Upload new profile picture"
                                        >
                                            <Upload className="h-4 w-4" />
                                        </label>
                                    </>
                                )}
                             </div>

                            {/* Basic Info */}
                            <h1 className="text-2xl font-bold">{user?.fullName}</h1>

                            <div className="flex items-center mt-1 text-gray-600">
                                <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                                <span className="text-sm truncate" title={user?.location?.address || 'Location not set'}>
                                    {user?.location?.address || 'Location not set'}
                                </span>
                            </div>

                            {/* Trust Score & Rating */}
                            <div className="flex items-center justify-center space-x-4 mt-3">
                                <div className="flex items-center bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full" title="Trust Score">
                                     <Shield className="h-4 w-4 mr-1.5" />
                                     <span className="font-medium">{user?.trustScore ?? 0}</span>
                                 </div>
                                 {user?.ratingCount > 0 && (
                                     <div className="flex items-center bg-yellow-100 text-yellow-800 px-3 py-1.5 rounded-full" title={`Average Rating: ${user?.rating?.toFixed(1)}/5 (${user?.ratingCount} reviews)`}>
                                         <Star className="h-4 w-4 mr-1.5 text-yellow-500" fill="currentColor"/>
                                         <span className="font-medium">{user?.rating?.toFixed(1)}</span>
                                         <span className="text-xs ml-1">({user?.ratingCount})</span>
                                     </div>
                                 )}
                            </div>

                            {/* Bio */}
                            <p className="mt-4 text-sm text-gray-700">
                                {user?.bio || (isOwnProfile ? 'Add a bio to tell others about yourself!' : 'No bio provided')}
                            </p>

                            {/* Stats */}
                            <div className="w-full mt-6 grid grid-cols-2 gap-3">
                                <div className="bg-white p-3 rounded-lg border text-center">
                                    <p className="text-2xl font-bold">
                                        {calculatedStats.shared}
                                    </p>
                                    <p className="text-xs text-gray-600">Items Shared</p>
                                </div>
                                <div className="bg-white p-3 rounded-lg border text-center">
                                    <p className="text-2xl font-bold">
                                         {calculatedStats.received}
                                    </p>
                                    <p className="text-xs text-gray-600">Items Received</p>
                                </div>
                            </div>

                            {/* Contact Info & Member Since */}
                            <div className="w-full mt-6 space-y-3 text-left">
                                <div className="flex items-center text-sm text-gray-700">
                                    <Mail className="h-4 w-4 mr-3 text-gray-500 flex-shrink-0" />
                                    <span className="truncate" title={user?.email}>{user?.email}</span>
                                </div>
                                {user?.phone && (
                                    <div className="flex items-center text-sm text-gray-700">
                                        <Phone className="h-4 w-4 mr-3 text-gray-500 flex-shrink-0" />
                                        <span>{user.phone}</span>
                                    </div>
                                )}
                                <div className="flex items-center text-sm text-gray-700">
                                    <Calendar className="h-4 w-4 mr-3 text-gray-500 flex-shrink-0" />
                                    <span>Member since {formatDate(user?.createdAt)}</span>
                                </div>
                            </div>

                             {/* Edit Button / Form */}
                             {isOwnProfile && (
                                <>
                                    <button
                                        onClick={() => setEditMode(!editMode)}
                                        className="mt-6 w-full px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition duration-150 ease-in-out"
                                    >
                                        <Edit className="h-4 w-4 mr-2 inline" />
                                        {editMode ? "Cancel Editing" : "Edit Profile"}
                                    </button>

                                    {editMode && (
                                        <form onSubmit={handleProfileUpdate} className="w-full mt-4 space-y-3 text-left">
                                            <input type="text" value={user?.firstName || ''} onChange={(e) => setUser({...user, firstName: e.target.value})} className="w-full p-2 border rounded text-sm" placeholder="First Name" />
                                            <input type="text" value={user?.lastName || ''} onChange={(e) => setUser({...user, lastName: e.target.value})} className="w-full p-2 border rounded text-sm" placeholder="Last Name" />
                                            <textarea value={user?.bio || ''} onChange={(e) => setUser({...user, bio: e.target.value})} className="w-full p-2 border rounded text-sm" placeholder="Bio" rows="3" />
                                            <input type="tel" value={user?.phone || ''} onChange={(e) => setUser({...user, phone: e.target.value})} className="w-full p-2 border rounded text-sm" placeholder="Phone Number" />
                                            <input type="text" value={user?.location?.address || ''} onChange={(e) => setUser({...user, location: {...user.location, address: e.target.value}})} className="w-full p-2 border rounded text-sm" placeholder="Location Address" />
                                            <button type="submit" className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition duration-150 ease-in-out">Save Changes</button>
                                            {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
                                        </form>
                                    )}
                                </>
                             )}
                        </div>
                    </div>

                    {/* Profile Content Area */}
                    <div className="md:w-2/3 lg:w-3/4 p-6 md:p-8">
                        {/* Tab Navigation */}
                        <div className="border-b border-gray-200 mb-6">
                             <nav className="flex flex-wrap -mb-px space-x-6 sm:space-x-8" aria-label="Tabs">
                                 <button
                                    className={`whitespace-nowrap py-4 px-1 border-b-2 text-sm font-medium ${activeTab === 'transactions' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                                    onClick={() => setActiveTab('transactions')}
                                 >
                                    Swap History
                                 </button>
                                 <button
                                    className={`whitespace-nowrap py-4 px-1 border-b-2 text-sm font-medium ${activeTab === 'reviews' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                                    onClick={() => setActiveTab('reviews')}
                                 >
                                    Reviews ({reviews.length})
                                 </button>
                                 {/* Tabs only for own profile */}
                                 {isOwnProfile && (
                                     <>
                                         <button
                                            className={`whitespace-nowrap py-4 px-1 border-b-2 text-sm font-medium relative ${activeTab === 'requests' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                                            onClick={() => setActiveTab('requests')}
                                         >
                                            Swap Requests
                                            {pendingRequests.length > 0 && (
                                                <span className="ml-1.5 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                                                    {pendingRequests.length}
                                                </span>
                                            )}
                                         </button>
                                         <button
                                            className={`whitespace-nowrap py-4 px-1 border-b-2 text-sm font-medium relative ${activeTab === 'accepted' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                                            onClick={() => setActiveTab('accepted')}
                                         >
                                            Accepted Swaps
                                            {acceptedSwaps.length > 0 && (
                                                 <span className="ml-1.5 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-blue-100 bg-blue-600 rounded-full">
                                                     {acceptedSwaps.length}
                                                 </span>
                                            )}
                                         </button>
                                         <button
                                            className={`whitespace-nowrap py-4 px-1 border-b-2 text-sm font-medium relative ${activeTab === 'pendingReviews' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                                            onClick={() => setActiveTab('pendingReviews')}
                                         >
                                            Rate & Review
                                            {pendingReviews.length > 0 && (
                                                 <span className="ml-1.5 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-yellow-800 bg-yellow-400 rounded-full">
                                                    {pendingReviews.length}
                                                 </span>
                                            )}
                                         </button>
                                     </>
                                 )}
                             </nav>
                        </div>

                        {/* Tab Content Rendering */}
                        <div className="mt-6">
                             {activeTab === 'transactions' && (
                                <SwapHistory
                                    transactions={transactions}
                                    user={user}
                                    formatDate={formatDate}
                                    getSwapStatusBadge={getSwapStatusBadge}
                                />
                            )}
                            {activeTab === 'reviews' && (
                                <Reviews
                                    reviews={reviews}
                                    formatDate={formatDate}
                                />
                            )}
                             {/* Conditional rendering based on isOwnProfile */}
                             {isOwnProfile && activeTab === 'requests' && (
                                <SwapRequests
                                    requests={pendingRequests}
                                    onAccept={handleAcceptRequest}
                                    onDecline={handleDeclineRequest}
                                    formatDate={formatDate}
                                    onRefresh={() => fetchPendingRequests({ 'x-auth-token': localStorage.getItem('token')})}
                                />
                            )}
                             {isOwnProfile && activeTab === 'accepted' && (
                                <AcceptedSwaps
                                    swaps={acceptedSwaps}
                                    user={user}
                                    onComplete={handleCompleteSwap}
                                    onOpenChat={handleOpenChat}
                                    formatDate={formatDate}
                                    onRefresh={() => fetchAcceptedSwaps(user._id, { 'x-auth-token': localStorage.getItem('token')})}
                                />
                            )}
                             {isOwnProfile && activeTab === 'pendingReviews' && (
                                <RatingComponent
                                    pendingReviews={pendingReviews}
                                    user={user}
                                    onRate={handleOpenRatingModal}
                                    formatDate={formatDate}
                                    onRefresh={() => fetchPendingReviews(user._id, { 'x-auth-token': localStorage.getItem('token')})}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Chat Modal */}
             {showChat && selectedSwap && isOwnProfile && (
                 <div className="fixed inset-0 bg-white/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg w-full max-w-2xl h-[75vh] max-h-[600px] overflow-hidden flex flex-col shadow-xl">
                         <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                             <h3 className="font-medium text-lg">
                                 Chat about "{selectedSwap.foodItem?.title}" with {
                                     user?._id === selectedSwap.provider?._id
                                         ? selectedSwap.requester?.fullName
                                         : selectedSwap.provider?.fullName
                                 }
                             </h3>
                             <button
                                 onClick={() => setShowChat(false)}
                                 className="text-gray-500 hover:text-gray-800 p-1 rounded-full hover:bg-gray-200"
                             >
                                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                 </svg>
                             </button>
                         </div>
                         <div className="flex-1 overflow-auto p-4">
                             <SwapChat
                                 swapId={selectedSwap._id}
                                 otherUserId={
                                     user?._id === selectedSwap.provider?._id
                                         ? selectedSwap.requester?._id
                                         : selectedSwap.provider?._id
                                 }
                                 currentUserId={user?._id}
                             />
                         </div>
                     </div>
                 </div>
             )}

             {/* Rating Modal */}
             {showRatingModal && selectedSwapForRating && isOwnProfile && (
                 <div className="fixed inset-0 bg-white/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                     <div className="bg-white rounded-lg w-full max-w-md p-6 shadow-xl">
                         <div className="flex justify-between items-center mb-4">
                             <h3 className="text-lg font-medium">
                                Rate {selectedSwapForRating.personToRateName || 'Your Swap Partner'}
                                <span> for </span> "{selectedSwapForRating.foodItem?.title || 'Food Item'}"
                             </h3>
                             <button
                                 onClick={() => setShowRatingModal(false)}
                                 className="text-gray-500 hover:text-gray-800 p-1 rounded-full hover:bg-gray-200"
                                 disabled={processingReview}
                             >
                                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                 </svg>
                             </button>
                         </div>

                         <div className="mb-4">
                             <p className="mb-2 text-sm text-gray-600">Your overall rating:</p>
                             <div className="flex justify-center space-x-1 text-yellow-400 text-3xl">
                                 {[1, 2, 3, 4, 5].map((star) => (
                                     <button
                                         key={star}
                                         onClick={() => setRatingValue(star)}
                                         className="focus:outline-none transform hover:scale-110 transition-transform"
                                         aria-label={`Rate ${star} out of 5 stars`}
                                         disabled={processingReview}
                                     >
                                         <Star
                                             className="h-8 w-8"
                                             fill={star <= ratingValue ? "currentColor" : "none"}
                                             stroke={"currentColor"}
                                             strokeWidth={1.5}
                                         />
                                     </button>
                                 ))}
                             </div>
                             <p className="text-center mt-2 text-sm font-medium text-gray-700">
                                {ratingValue === 1 && "Poor"}
                                {ratingValue === 2 && "Fair"}
                                {ratingValue === 3 && "Good"}
                                {ratingValue === 4 && "Very Good"}
                                {ratingValue === 5 && "Excellent"}
                             </p>
                         </div>

                         <div className="mb-4">
                             <label htmlFor="reviewComment" className="block text-sm font-medium text-gray-700 mb-1">
                                Share your experience (optional)
                             </label>
                             <textarea
                                 id="reviewComment"
                                 value={reviewComment}
                                 onChange={(e) => setReviewComment(e.target.value)}
                                 className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-black focus:border-black text-sm"
                                 rows="4"
                                 placeholder="How was the swap experience? Was the other user reliable?"
                                 disabled={processingReview}
                             ></textarea>
                         </div>

                         <div className="flex justify-end space-x-3">
                             <button
                                 onClick={() => setShowRatingModal(false)}
                                 className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100 text-sm font-medium"
                                 disabled={processingReview}
                             >
                                 Cancel
                             </button>
                             <button
                                 onClick={handleRatingSubmit}
                                 className={`px-4 py-2 bg-black text-white rounded hover:bg-gray-800 text-sm font-medium ${processingReview ? 'opacity-70 cursor-not-allowed' : ''}`}
                                 disabled={processingReview}
                             >
                                 {processingReview ? 'Submitting...' : 'Submit Rating'}
                             </button>
                         </div>
                     </div>
                 </div>
             )}
        </div>
    );
}
