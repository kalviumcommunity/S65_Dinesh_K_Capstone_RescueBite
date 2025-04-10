import { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { Mail, MapPin, Phone, Calendar, Edit, ThumbsUp, Award, Star, Clock, Upload, MessageCircle, CheckCircle, Shield } from 'lucide-react';
import { useParams, Link, useLocation } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import SwapChat from "../../components/SwapChat";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function ProfilePage() {
    const [user, setUser] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const { id } = useParams();
    const [activeTab, setActiveTab] = useState("transactions");
    const [editMode, setEditMode] = useState(false);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [selectedSwap, setSelectedSwap] = useState(null);
    const [showChat, setShowChat] = useState(false);
    const navigate = useNavigate();
    const [acceptedSwaps, setAcceptedSwaps] = useState([]);
    const location = useLocation();
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [selectedSwapForRating, setSelectedSwapForRating] = useState(null);
    const [ratingValue, setRatingValue] = useState(5);
    const [reviewComment, setReviewComment] = useState("");
    const [pendingReviews, setPendingReviews] = useState([]);
    const [swapStats, setSwapStats] = useState({ shared: 0, received: 0 });

    // Helper functions defined before they're used
    const calculateSwapStats = (transactions, userId) => {
        if (!transactions || !userId) return { shared: 0, received: 0 };
        
        return transactions.reduce((stats, swap) => {
            // Only count completed swaps
            if (swap.status !== 'completed') return stats;
            
            // Count as shared if user is the provider
            if (swap.provider?._id === userId) {
                stats.shared += 1;
            }
            
            // Count as received if user is the requester
            if (swap.requester?._id === userId) {
                stats.received += 1;
            }
            
            return stats;
        }, { shared: 0, received: 0 });
    };

    const fetchUserSwaps = async (headers) => {
        try {
            // Get the correct user ID (use user._id, not userId which is undefined)
            const currentUserId = user?._id || (id ? id : null);
            
            if (!currentUserId) {
                console.error("Cannot fetch swaps: User ID is missing");
                return;
            }
            
            console.log("Fetching swaps for user:", currentUserId);
            const response = await axios.get(`${API_BASE_URL}/api/swaps/my-swaps`, { headers });
            
            if (response.data.success) {
                console.log("Swaps fetched successfully:", response.data.data.swaps.length);
                
                // Filter out accepted swaps - they will be shown in the Accepted Swaps tab
                const filteredSwaps = response.data.data.swaps.filter(swap => 
                    swap.status !== 'accepted'
                );
                
                // Make sure the other user name is properly displayed
                const swapsWithUserNames = filteredSwaps.map(swap => {
                    // Compare as strings to avoid object comparison issues
                    const isRequester = swap.requester?._id === currentUserId || 
                                       swap.requester?._id.toString() === currentUserId.toString();
                    const otherUser = isRequester ? swap.provider : swap.requester;
                    
                    return {
                        ...swap,
                        otherUserName: otherUser ? 
                            `${otherUser.firstName || ''} ${otherUser.lastName || ''}`.trim() || 
                            (otherUser.businessName || "User") : 
                            "User"
                    };
                });
                
                console.log("Setting transactions:", swapsWithUserNames.length);
                setTransactions(swapsWithUserNames);
                
                // Calculate swap stats directly
                if (user && user._id) {
                    const { shared, received } = calculateSwapStats(swapsWithUserNames, currentUserId);
                    // Update user state with the calculated values
                    setUser(prevUser => ({
                        ...prevUser,
                        calculatedItemsShared: shared,
                        calculatedItemsReceived: received
                    }));
                }
            } else {
                console.warn("No swaps data received or success is false");
                setTransactions([]);
            }
        } catch (error) {
            console.error("Error fetching user swaps:", error);
            setTransactions([]); // Explicitly set to empty array on error
        }
    };

    const fetchUserReviews = async (userId, headers) => {
        try {
            console.log("Fetching reviews for user:", userId);
            let allReviews = [];
            
            // Get reviews from completed swaps
            const swapsResponse = await axios.get(
                `${API_BASE_URL}/api/swaps/my-swaps?status=completed`,
                { headers }
            );
            
            if (swapsResponse.data?.success) {
                const swaps = swapsResponse.data.data.swaps || [];
                console.log(`Found ${swaps.length} completed swaps to check for reviews`);
                
                // Extract reviews from swaps with enhanced information
                swaps.forEach(swap => {
                    // If this user is the provider and has been reviewed
                    if (swap.provider?._id === userId && swap.providerRating > 0) {
                        const reviewer = swap.requester || {};
                        allReviews.push({
                            _id: `${swap._id}_provider`,
                            rating: swap.providerRating || 0,
                            review: swap.providerReview || swap.providerComment || "No comment provided",
                            date: swap.reviewDate || swap.updatedAt || swap.createdAt,
                            reviewer: {
                                _id: reviewer._id || "unknown",
                                fullName: reviewer.fullName || 
                                        `${reviewer.firstName || ''} ${reviewer.lastName || ''}`.trim() || 
                                        reviewer.email?.split('@')[0] || "Unknown User",
                                profileImage: reviewer.profileImage || null
                            },
                            foodItem: {
                                _id: swap.foodItem?._id,
                                title: swap.foodItem?.title || "Food Item",
                                images: swap.foodItem?.images || []
                            }
                        });
                    }
                    
                    // If this user is the requester and has been reviewed
                    if (swap.requester?._id === userId && swap.requesterRating > 0) {
                        const reviewer = swap.provider || {};
                        allReviews.push({
                            _id: `${swap._id}_requester`,
                            rating: swap.requesterRating || 0,
                            review: swap.requesterReview || swap.requesterComment || "No comment provided",
                            date: swap.reviewDate || swap.updatedAt || swap.createdAt,
                            reviewer: {
                                _id: reviewer._id || "unknown",
                                fullName: reviewer.fullName || 
                                        `${reviewer.firstName || ''} ${reviewer.lastName || ''}`.trim() || 
                                        reviewer.email?.split('@')[0] || "Unknown User",
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
            }
            
            // Sort reviews by date (newest first)
            allReviews.sort((a, b) => new Date(b.date) - new Date(a.date));
            
            console.log(`Setting ${allReviews.length} total reviews for display`);
            setReviews(allReviews);
            
        } catch (error) {
            console.error("Error fetching reviews:", error);
            toast.error("Failed to load reviews");
            setReviews([]);
        }
    };

    const fetchPendingRequests = async (headers) => {
        try {
            console.log("Fetching pending requests...");
            
            // Make sure we have a valid token
            if (!headers['x-auth-token']) {
                console.error("No auth token available for fetching requests");
                return;
            }
            
            // Show loading indicator
            setPendingRequests(prevRequests => {
                // Only show loading if we don't already have data
                if (prevRequests.length === 0) {
                    setLoading(true);
                }
                return prevRequests;
            });
            
            const requestsResponse = await axios.get(
                `${API_BASE_URL}/api/swaps/pending`,
                { headers }
            );

            console.log("Pending requests response:", requestsResponse.data);
            
            if (requestsResponse.data?.success) {
                const pendingData = requestsResponse.data.data || [];
                console.log(`Found ${pendingData.length} pending requests`);
                
                // Process each request to ensure requester name is properly formatted
                const formattedRequests = pendingData.map(request => {
                    // Ensure requester has a fullName property
                    if (request.requester) {
                        // If a fullName already exists, use it
                        if (!request.requester.fullName) {
                            // Otherwise, construct it from first and last name
                            request.requester.fullName = `${request.requester.firstName || ''} ${request.requester.lastName || ''}`.trim();
                            
                            // If that's still empty, try businessName or use the email
                            if (!request.requester.fullName && request.requester.businessName) {
                                request.requester.fullName = request.requester.businessName;
                            } else if (!request.requester.fullName && request.requester.email) {
                                request.requester.fullName = request.requester.email.split('@')[0]; // Use username part of email
                            }
                            
                            // Last resort
                            if (!request.requester.fullName) {
                                request.requester.fullName = "User-" + request.requester._id.substring(0, 6);
                            }
                        }
                    }
                    return request;
                });
                
                setPendingRequests(formattedRequests);
                
                // Auto-switch to requests tab if there are pending requests and we're not already there
                if (formattedRequests.length > 0 && activeTab !== "requests") {
                    console.log("Auto-switching to requests tab");
                    setActiveTab("requests");
                }
            } else {
                console.warn('No pending requests data received');
                setPendingRequests([]);
            }
        } catch (error) {
            console.error("Error fetching pending requests:", error);
            setPendingRequests([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAcceptRequest = async (requestId) => {
        try {
            const headers = {
                'x-auth-token': localStorage.getItem('token')
            };
            
            const response = await axios.put(
                `${API_BASE_URL}/api/swaps/${requestId}/status`,
                { status: 'accepted' },
                { headers }
            );
            
            if (response.data.success) {
                toast.success("Request accepted!");
                
                // Remove the request from pending requests immediately
                setPendingRequests(prev => prev.filter(req => req._id !== requestId));
                
                // Refresh all data to update other sections
                fetchProfileData();
                
                // Automatically switch to accepted tab
                setActiveTab("accepted");
            }
        } catch (error) {
            console.error("Error accepting request:", error);
            toast.error(error.response?.data?.message || "Failed to accept request");
        }
    };

    const handleDeclineRequest = async (requestId) => {
        try {
            const headers = {
                'x-auth-token': localStorage.getItem('token')
            };
            
            const response = await axios.put(
                `${API_BASE_URL}/api/swaps/${requestId}/status`,
                { status: 'rejected' },
                { headers }
            );
            
            if (response.data.success) {
                toast.success("Request declined");
                // Refresh all data
                fetchProfileData();
            }
        } catch (error) {
            console.error("Error declining request:", error);
            toast.error(error.response?.data?.message || "Failed to decline request");
        }
    };

    const fetchAcceptedSwaps = async (headers) => {
        try {
            const currentUserId = user?._id || id;
            
            if (!currentUserId) {
                console.error("Cannot fetch accepted swaps: User ID is missing");
                return;
            }
            
            const response = await axios.get(
                `${API_BASE_URL}/api/swaps/my-swaps?status=accepted`,
                { headers }
            );
                
            if (response.data.success) {
                // Ensure user data is properly extracted and formatted
                const formattedSwaps = response.data.data.swaps.map(swap => {
                    // Compare as strings to avoid object comparison issues
                    const isRequester = swap.requester?._id === currentUserId || 
                                      swap.requester?._id.toString() === currentUserId.toString();
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
            }
        } catch (error) {
            console.error("Error fetching accepted swaps:", error);
        }
    };

    const handleCompleteSwap = async (swapId) => {
        try {
            // Show loading toast first
            toast.loading("Completing swap...");
            
            const headers = {
                'x-auth-token': localStorage.getItem('token'),
                'Content-Type': 'application/json'
            };
            
            // Find the swap in our list
            const swapToComplete = acceptedSwaps.find(swap => swap._id === swapId);
            if (!swapToComplete) {
                toast.dismiss();
                toast.error("Swap not found");
                return;
            }
            
            // Log details for debugging
            console.log("Attempting to complete swap:", {
                swapId: swapId,
                foodItem: swapToComplete.foodItem?.title,
                requesterID: swapToComplete.requester?._id,
                providerID: swapToComplete.provider?._id,
                yourID: user?._id
            });
            
            // Update the status on the server
            const response = await axios.put(
                `${API_BASE_URL}/api/swaps/${swapId}/status`,
                JSON.stringify({ 
                    status: 'completed',
                    userRole: 'requester'
                }),
                { headers }
            );
            
            // Clear loading toast
            toast.dismiss();
            
            // Process the response
            if (response.data.success) {
                toast.success("Swap completed successfully!");
                
                // Update the UI immediately
                setAcceptedSwaps(prevSwaps => prevSwaps.filter(s => s._id !== swapId));
                
                // Refresh data after successful completion
                fetchProfileData();
            } else {
                throw new Error(response.data.message || "Error completing swap");
            }
        } catch (error) {
            // Clear loading toast
            toast.dismiss();
            
            // Log error for debugging
            console.error("Error completing swap:", error);
            console.error("Error details:", {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message
            });
            
            // Show error message
            toast.error(error.response?.data?.message || "Failed to complete swap. Please try again.");
        }
    };

    const fetchPendingReviews = async (headers) => {
        try {
            console.log("Fetching pending reviews for user:", user?._id);
            
            // Get completed swaps
            const response = await axios.get(
                `${API_BASE_URL}/api/swaps/my-swaps?status=completed`,
                { headers }
            );
            
            if (response.data?.success && user) {
                const swaps = response.data.data.swaps || [];
                console.log(`Found ${swaps.length} completed swaps for potential reviews`);
                
                // Filter swaps that need reviews - CRITICAL FIX: ensure you only rate the OTHER person
                // and only if a swap has actually occurred (status completed)
                const needsReview = swaps.filter(swap => {
                    // Only include completed swaps
                    if (swap.status !== 'completed') return false;
                    
                    // Only allow requester to rate provider (not their own food)
                    if (user._id === swap.requester?._id) {
                        // Requester rates provider (the person who gave the food)
                        return (!swap.providerRating || swap.providerRating === 0);
                    }
                    
                    // Don't allow provider to rate their own food item
                    return false;
                });
                
                console.log(`Setting ${needsReview.length} swaps that need reviews`);
                setPendingReviews(needsReview);
            } else {
                console.log("No user data or no successful API response for pending reviews");
                setPendingReviews([]);
            }
        } catch (error) {
            console.error("Error fetching pending reviews:", error);
            setPendingReviews([]);
        }
    };

    const fetchProfileData = async () => {
        try {
            setError("");
            setLoading(true);
            const headers = {
                'x-auth-token': localStorage.getItem('token')
            };

            // Determine the correct endpoint
            const profileEndpoint = id 
                ? `${API_BASE_URL}/api/users/profile/${id}`
                : `${API_BASE_URL}/api/users/me`;

            // Fetch user profile
            const userResponse = await axios.get(profileEndpoint, { headers });
            
            if (!userResponse.data?.success) {
                throw new Error(userResponse.data?.message || "Failed to fetch user profile");
            }
            
            if (!userResponse.data.data) {
                setError(id ? "User not found" : "Please complete your profile setup");
                setLoading(false);
                return;
            }
            
            // Set user data with values directly from API response
            const userData = {
                ...userResponse.data.data,
                fullName: `${userResponse.data.data.firstName || ''} ${userResponse.data.data.lastName || ''}`.trim(),
                // Use exact values from response with no defaults
                rating: userResponse.data.data.rating,
                ratingCount: userResponse.data.data.ratingCount,
                itemsShared: userResponse.data.data.itemsShared,
                itemsReceived: userResponse.data.data.itemsReceived,
                trustScore: userResponse.data.data.trustScore
            };
            
            console.log("User data from API:", {
                itemsShared: userData.itemsShared,
                itemsReceived: userData.itemsReceived,
                rating: userData.rating,
                ratingCount: userData.ratingCount,
                trustScore: userData.trustScore
            });
            
            setUser(userData);

            // IMPORTANT: Fetch swaps immediately after user is set so we have the user ID available
            await fetchUserSwaps(headers);

            // Then fetch other data
            await fetchPendingReviews(headers);
            await fetchUserReviews(userData._id, headers);
            await fetchPendingRequests(headers);
            await fetchAcceptedSwaps(headers);

            // Check URL parameters for tab info
            const params = new URLSearchParams(location.search);
            const tabParam = params.get('tab');
            
            // If no specific tab requested but we have pending reviews, show that tab
            if (!tabParam && pendingReviews.length > 0) {
                console.log(`Found ${pendingReviews.length} pending reviews, setting active tab`);
                setActiveTab("pendingReviews");
            }
        } catch (error) {
            console.error("Error fetching profile:", error);
            setError(error.response?.data?.message || "Failed to load profile data");
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            // Show loading state
            toast.loading('Uploading image...');
            
            const formData = new FormData();
            formData.append('profileImage', file);
            
            try {
                const response = await axios.post(
                    `${API_BASE_URL}/api/users/upload-image`,
                    formData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            'x-auth-token': localStorage.getItem('token')
                        },
                        timeout: 30000 // 30 seconds timeout for upload
                    }
                );
                
                toast.dismiss();
                
                if (response.data.success) {
                    setUser(prev => ({...prev, profileImage: response.data.imageUrl}));
                    toast.success("Profile image updated successfully");
                } else {
                    throw new Error(response.data.message || "Failed to upload image");
                }
            } catch (error) {
                toast.dismiss();
                console.error("Image upload error:", error);
                toast.error(error.response?.data?.message || "Failed to upload image");
            }
        }
    };

    // Improved useEffect to properly fetch data and handle component unmounting
    useEffect(() => {
        let isMounted = true;
        
        // Check for tab parameter in URL to set the active tab
        const params = new URLSearchParams(location.search);
        const tabParam = params.get('tab');
        console.log("URL tab parameter:", tabParam);
        
        if (tabParam && ['transactions', 'reviews', 'requests', 'accepted', 'pendingReviews'].includes(tabParam)) {
            console.log("Setting active tab to:", tabParam);
            setActiveTab(tabParam);
        }
        
        const loadData = async () => {
            try {
                console.log("Loading profile data...");
                await fetchProfileData();
            } catch (err) {
                console.error("Error in profile data loading:", err);
            }
        };
        
        loadData();
        
        // Refresh data every 30 seconds
        const intervalId = setInterval(() => {
            if (isMounted) {
                const headers = {
                    'x-auth-token': localStorage.getItem('token')
                };
                // Only fetch requests, not all data
                fetchPendingRequests(headers);
            }
        }, 30000);
        
        return () => {
            isMounted = false;
            clearInterval(intervalId);
        };
    }, [id, location.search]); // Make sure location.search is a dependency

    // Add a useEffect specifically for the activeTab to properly refresh data when tab changes
    useEffect(() => {
        if (activeTab === "requests") {
            const headers = {
                'x-auth-token': localStorage.getItem('token')
            };
            fetchPendingRequests(headers);
        }
    }, [activeTab]);

    // Add a useEffect specifically for accepted swaps when tab changes
    useEffect(() => {
        if (activeTab === "accepted") {
            const headers = {
                'x-auth-token': localStorage.getItem('token')
            };
            fetchAcceptedSwaps(headers);
        }
    }, [activeTab]);

    // Add this effect to load pending reviews when tab changes
    useEffect(() => {
        if (activeTab === "pendingReviews" && user) {
            console.log("Pending reviews tab is active, fetching reviews...");
            const headers = {
                'x-auth-token': localStorage.getItem('token')
            };
            fetchPendingReviews(headers);
        }
    }, [activeTab, user]);

    // Add this useEffect to update stats when transactions change
    useEffect(() => {
        if (user && user._id && transactions.length > 0) {
            const { shared, received } = calculateSwapStats(transactions, user._id);
            
            // Only update if values have changed
            if (shared !== user.calculatedItemsShared || received !== user.calculatedItemsReceived) {
                setUser(prevUser => ({
                    ...prevUser,
                    calculatedItemsShared: shared,
                    calculatedItemsReceived: received
                }));
            }
        }
    }, [transactions, user?._id]);

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
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

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        try {
            const headers = {
                'x-auth-token': localStorage.getItem('token')
            };

            // Ensure location object is properly formatted
            let locationObj = {
                type: "Point",
                coordinates: [0, 0],
                address: ""
            };
            
            if (user.location) {
                locationObj.address = user.location.address || "";
                if (user.location.coordinates && Array.isArray(user.location.coordinates)) {
                    locationObj.coordinates = user.location.coordinates.map(coord => 
                        typeof coord === 'string' ? parseFloat(coord) : coord
                    );
                }
            }

            const updatedData = {
                firstName: user.firstName || "",
                lastName: user.lastName || "",
                phone: user.phone || "",
                bio: user.bio || "",
                location: locationObj
            };

            console.log("Sending profile update:", updatedData);

            const response = await axios.put(
                `${API_BASE_URL}/api/users/profile`, 
                updatedData,
                { headers }
            );

            if (response.data.success) {
                // Update user with response data and add fullName
                const userData = response.data.data;
                userData.fullName = `${userData.firstName || ''} ${userData.lastName || ''}`.trim();
                setUser(userData);
                setEditMode(false);
                setError("");
                toast.success("Profile updated successfully");
            } else {
                throw new Error(response.data.message || "Failed to update profile");
            }
        } catch (error) {
            console.error("Profile update error:", error);
            setError(error.response?.data?.message || "Failed to update profile");
            toast.error(error.response?.data?.message || "Failed to update profile");
        }
    };

    const handleOpenChat = (swap) => {
        setSelectedSwap(swap);
        setShowChat(true);
    };

    const handleRatingSubmit = async () => {
        try {
            if (!selectedSwapForRating) {
                console.error("No swap selected for rating");
                return;
            }

            const headers = {
                'x-auth-token': localStorage.getItem('token')
            };

            // Show loading toast
            toast.loading("Submitting your review...");
            
            // Determine who to review
            const isRequester = user._id === selectedSwapForRating.requester?._id;
            const reviewFor = isRequester ? "provider" : "requester";
            const personToRate = isRequester ? selectedSwapForRating.provider : selectedSwapForRating.requester;
            
            console.log("Submitting review for:", {
                reviewFor: reviewFor,
                personName: personToRate?.fullName || "User",
                rating: ratingValue,
                comment: reviewComment || "No comment provided"
            });

            // Submit the review
            const response = await axios.put(
                `${API_BASE_URL}/api/swaps/${selectedSwapForRating._id}/review`,
                {
                    rating: parseInt(ratingValue),
                    review: reviewComment || "No comment provided",
                    reviewText: reviewComment || "No comment provided",
                    comment: reviewComment || "No comment provided",
                    reviewFor: reviewFor,
                    accountType: "individual",
                    userId: user._id,
                    userRole: isRequester ? "requester" : "provider"
                },
                { headers }
            );

            // Dismiss loading toast
            toast.dismiss();
            
            if (response.data.success) {
                toast.success(`Thank you for rating ${personToRate?.fullName || "your swap partner"}!`);
                
                // Update the local state immediately
                setPendingReviews(prev => prev.filter(swap => swap._id !== selectedSwapForRating._id));
                
                // Close modal and reset form
                setShowRatingModal(false);
                setSelectedSwapForRating(null);
                setRatingValue(5);
                setReviewComment("");
                
                // Force a full refresh of profile data
                fetchProfileData();
            } else {
                throw new Error(response.data.message || "Error submitting review");
            }
        } catch (error) {
            toast.dismiss();
            console.error("Error submitting rating:", error);
            toast.error("Failed to submit rating. Please try again.");
        }
    };

    if (loading) {
        return <div className="text-center p-8">Loading profile...</div>;
    }

    if (error) {
        return <div className="text-center p-8 text-red-500">{error}</div>;
    }

    const fadeIn = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
    };

    const trustScoreValue = user?.trustScore || 0;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
                className="bg-white rounded-lg shadow-sm overflow-hidden"
                initial="hidden"
                animate="visible"
                variants={fadeIn}
            >
                <div className="md:flex">
                    {/* Profile Sidebar - make it narrower */}
                    <div className="md:w-1/4 bg-gray-50 p-6 border-r">
                        <div className="flex flex-col items-center text-center">
                            <div className="relative mb-4">
                                <div className="h-32 w-32 rounded-full overflow-hidden">
                                    <img
                                        src={user?.profileImage ? user.profileImage : "/placeholder.svg"}
                                        alt={user?.fullName}
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                            </div>

                            <h1 className="text-xl font-bold">
                                {user?.fullName}
                            </h1>
                            <div className="flex items-center mt-1 text-gray-600">
                                <MapPin className="h-4 w-4 mr-1" />
                                <span className="text-sm">
                                    {user?.location?.address || user?.location?.coordinates?.join(', ') || 'Location not set'}
                                </span>
                            </div>

                            <div className="flex items-center justify-center mt-3">
                                <div className="flex items-center bg-gray-100 px-3 py-1.5 rounded-full">
                                    <Shield className="h-4 w-4 mr-1.5 text-blue-500" />
                                    <span className="font-medium">{user?.trustScore || 0}</span>
                                    <span className="text-sm text-gray-600 ml-1">Trust Score</span>
                                </div>
                            </div>

                            <p className="mt-4 text-sm text-gray-600">
                                {user?.bio || 'No bio provided'}
                            </p>

                            <div className="w-full mt-6 grid grid-cols-2 gap-4">
                                <div className="bg-white p-3 rounded-lg border text-center">
                                    <p className="text-2xl font-bold">
                                        {user?.calculatedItemsShared ?? user?.itemsShared ?? 0}
                                    </p>
                                    <p className="text-xs text-gray-600">
                                        Items Shared
                                    </p>
                                </div>
                                <div className="bg-white p-3 rounded-lg border text-center">
                                    <p className="text-2xl font-bold">
                                        {user?.calculatedItemsReceived ?? user?.itemsReceived ?? 0}
                                    </p>
                                    <p className="text-xs text-gray-600">
                                        Items Received
                                    </p>
                                </div>
                            </div>

                            <div className="w-full mt-6 space-y-3">
                                <div className="flex items-center text-sm">
                                    <Mail className="h-4 w-4 mr-3 text-gray-500" />
                                    <span>{user?.email}</span>
                                </div>
                                {user?.phone && (
                                    <div className="flex items-center text-sm">
                                        <Phone className="h-4 w-4 mr-3 text-gray-500" />
                                        <span>{user.phone}</span>
                                    </div>
                                )}
                                <div className="flex items-center text-sm">
                                    <Calendar className="h-4 w-4 mr-3 text-gray-500" />
                                    <span>
                                        Member since {formatDate(user?.createdAt)}
                                    </span>
                                </div>
                            </div>

                            {/* Only show edit button if viewing own profile */}
                            {!id && (
                                <button 
                                    onClick={() => setEditMode(!editMode)}
                                    className="mt-4 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
                                >
                                    <Edit className="h-4 w-4 mr-2 inline" />
                                    {editMode ? "Cancel Editing" : "Edit Profile"}
                                </button>
                            )}

                            {editMode && !id && (
                                <div className="w-full mt-4 space-y-3">
                                    <div className="relative group cursor-pointer">
                                        <input
                                            type="file"
                                            className="hidden"
                                            id="profileImage"
                                            onChange={handleImageUpload}
                                            accept="image/*"
                                        />
                                        <label 
                                            htmlFor="profileImage" 
                                            className="block w-32 h-32 mx-auto rounded-full overflow-hidden border-2 border-dashed border-gray-300 hover:border-black transition-colors"
                                        >
                                            {user?.profileImage ? (
                                                <img
                                                    src={user.profileImage || "/placeholder.svg"}
                                                    alt="Profile"
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Upload className="h-8 w-8 text-gray-400" />
                                                </div>
                                            )}
                                        </label>
                                    </div>
                                    <div className="space-y-2">
                                        <input
                                            type="text"
                                            value={user?.firstName || ''}
                                            onChange={(e) => setUser({...user, firstName: e.target.value})}
                                            className="w-full p-2 border rounded"
                                            placeholder="First Name"
                                        />
                                        <input
                                            type="text"
                                            value={user?.lastName || ''}
                                            onChange={(e) => setUser({...user, lastName: e.target.value})}
                                            className="w-full p-2 border rounded"
                                            placeholder="Last Name"
                                        />
                                    </div>
                                    <textarea
                                        value={user?.bio || ''}
                                        onChange={(e) => setUser({...user, bio: e.target.value})}
                                        className="w-full p-2 border rounded"
                                        placeholder="Bio"
                                        rows="3"
                                    />
                                    <input
                                        type="tel"
                                        value={user?.phone || ''}
                                        onChange={(e) => setUser({...user, phone: e.target.value})}
                                        className="w-full p-2 border rounded"
                                        placeholder="Phone Number"
                                    />
                                    <input
                                        type="text"
                                        value={user?.location?.address || ''}
                                        onChange={(e) => setUser({
                                            ...user, 
                                            location: {
                                                ...user.location,
                                                address: e.target.value
                                            }
                                        })}
                                        className="w-full p-2 border rounded"
                                        placeholder="Location"
                                    />
                                    <button 
                                        onClick={handleProfileUpdate}
                                        className="w-full bg-black text-white py-2 rounded hover:bg-gray-800"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Profile Content - make it wider */}
                    <div className="md:w-3/4 p-6">
                        {/* Tab Navigation - Move the tab navigation here */}
                        <div className="border-b mb-6">
                            <nav className="flex space-x-8">
                                <button
                                    className={`pb-4 text-sm font-medium ${
                                        activeTab === "transactions"
                                            ? "border-b-2 border-black text-black"
                                            : "text-gray-500 hover:text-gray-700"
                                    }`}
                                    onClick={() => {
                                        console.log("Switching to transactions tab");
                                        setActiveTab("transactions");
                                    }}
                                >
                                    Swap History
                                </button>
                                <button
                                    className={`pb-4 text-sm font-medium ${
                                        activeTab === "reviews"
                                            ? "border-b-2 border-black text-black"
                                            : "text-gray-500 hover:text-gray-700"
                                    }`}
                                    onClick={() => {
                                        console.log("Switching to reviews tab");
                                        setActiveTab("reviews");
                                    }}
                                >
                                    Reviews
                                </button>
                                <button
                                    className={`pb-4 text-sm font-medium ${
                                        activeTab === "requests"
                                            ? "border-b-2 border-black text-black"
                                            : "text-gray-500 hover:text-gray-700"
                                    }`}
                                    onClick={() => {
                                        console.log("Switching to requests tab");
                                        setActiveTab("requests");
                                    }}
                                >
                                    Swap Requests
                                    {pendingRequests.length > 0 && (
                                        <span className="ml-1 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                                            {pendingRequests.length}
                                        </span>
                                    )}
                                </button>
                                <button
                                    className={`pb-4 text-sm font-medium ${
                                        activeTab === "accepted"
                                            ? "border-b-2 border-black text-black"
                                            : "text-gray-500 hover:text-gray-700"
                                    }`}
                                    onClick={() => {
                                        console.log("Switching to accepted swaps tab");
                                        setActiveTab("accepted");
                                    }}
                                >
                                    Accepted Swaps
                                    {acceptedSwaps.length > 0 && (
                                        <span className="ml-1 px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full">
                                            {acceptedSwaps.length}
                                        </span>
                                    )}
                                </button>
                                <button
                                    className={`pb-4 text-sm font-medium ${
                                        activeTab === "pendingReviews"
                                            ? "border-b-2 border-black text-black"
                                            : "text-gray-500 hover:text-gray-700"
                                    }`}
                                    onClick={() => {
                                        console.log("Switching to pending reviews tab");
                                        setActiveTab("pendingReviews");
                                        // Force refresh of pending reviews when tab is clicked
                                        if (user) {
                                            const headers = {
                                                'x-auth-token': localStorage.getItem('token')
                                            };
                                            fetchPendingReviews(headers);
                                        }
                                    }}
                                >
                                    Rate & Review
                                    {pendingReviews.length > 0 && (
                                        <span className="ml-1 px-2 py-0.5 bg-yellow-500 text-white text-xs rounded-full">
                                            {pendingReviews.length}
                                        </span>
                                    )}
                                </button>
                            </nav>
                        </div>

                        {/* Tab Content */}
                        <div className="mt-6">
                            {activeTab === "transactions" && (
                                <div className="space-y-4">
                                    <h2 className="text-lg font-semibold">Swap History</h2>
                                    {transactions && transactions.length > 0 ? (
                                        transactions.map((transaction) => {
                                            const status = getSwapStatusBadge(transaction.status);
                                            return (
                                                <div key={transaction._id} className="border rounded-lg p-4 hover:bg-gray-50">
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex items-start">
                                                            <div className="mr-3 flex-shrink-0">
                                                                <img
                                                                    src={
                                                                        transaction.foodItem?.images && transaction.foodItem.images.length > 0
                                                                            ? (typeof transaction.foodItem.images[0] === 'string' 
                                                                                ? transaction.foodItem.images[0] 
                                                                                : transaction.foodItem.images[0].url || '')
                                                                            : "/placeholder.svg?height=50&width=50"
                                                                    }
                                                                    alt={transaction.foodItem?.title || "Food"}
                                                                    className="w-12 h-12 rounded-md object-cover"
                                                                    onError={(e) => {
                                                                        e.target.onerror = null;
                                                                        e.target.src = "/placeholder.svg?height=50&width=50";
                                                                    }}
                                                                />
                                                            </div>
                                                            <div>
                                                                <div className="flex items-center">
                                                                    <span className={`px-2 py-1 text-xs rounded-full ${status.color}`}>
                                                                        {status.text}
                                                                    </span>
                                                                    <h3 className="ml-2 font-medium">
                                                                        {transaction.foodItem?.title || 'Food Item'}
                                                                    </h3>
                                                                </div>
                                                                <p className="text-sm text-gray-600 mt-1">
                                                                    {(user?._id === transaction.provider?._id) ? "To: " : "From: "}
                                                                    <span className="font-medium">{transaction.otherUserName}</span>
                                                                </p>
                                                                {transaction.status === 'completed' && (
                                                                    <p className="text-xs text-green-600 mt-1 flex items-center">
                                                                        <CheckCircle className="h-3 w-3 mr-1" />
                                                                        Completed on {formatDate(transaction.updatedAt)}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="text-right flex items-center">
                                                            {transaction.status === 'accepted' && (
                                                                <>
                                                                    <button 
                                                                        onClick={() => handleOpenChat(transaction)}
                                                                        className="mr-3 text-blue-600 hover:text-blue-800"
                                                                    >
                                                                        <MessageCircle className="h-5 w-5" />
                                                                    </button>
                                                                    {user?._id === transaction.requester?._id && (
                                                                        <button 
                                                                            onClick={() => handleCompleteSwap(transaction._id)}
                                                                            className="mr-3 text-green-600 hover:text-green-800"
                                                                        >
                                                                            <CheckCircle className="h-5 w-5" />
                                                                        </button>
                                                                    )}
                                                                </>
                                                            )}
                                                            <p className="text-xs text-gray-500">
                                                                {formatDate(transaction.createdAt)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="text-center py-8">
                                            <p className="text-gray-500">No swaps found</p>
                                            <p className="text-sm text-gray-400 mt-1">
                                                {error ? 
                                                    "There was an error loading your swap history" : 
                                                    "Your completed food swaps will appear here"}
                                            </p>
                                            <button 
                                                onClick={() => {
                                                    const headers = {
                                                        'x-auth-token': localStorage.getItem('token')
                                                    };
                                                    fetchUserSwaps(headers);
                                                    toast.success("Refreshing swap history...");
                                                }}
                                                className="mt-4 px-4 py-2 bg-black text-white rounded-md text-sm"
                                            >
                                                Refresh History
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                            
                            {activeTab === "reviews" && (
                                <div className="space-y-4">
                                    <h2 className="text-lg font-semibold">Reviews ({reviews.length})</h2>
                                    {reviews && reviews.length > 0 ? (
                                        reviews.map((review) => (
                                            <div key={review._id || Math.random()} className="border rounded-lg p-4 hover:bg-gray-50">
                                                <div className="flex items-start">
                                                    <div className="h-12 w-12 rounded-full overflow-hidden flex-shrink-0">
                                                        <img
                                                            src={review.reviewer?.profileImage || "/placeholder.svg"}
                                                            alt={review.reviewer?.fullName || "Reviewer"}
                                                            className="h-full w-full object-cover"
                                                            onError={(e) => {
                                                                e.target.onerror = null;
                                                                e.target.src = "/placeholder.svg";
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="ml-3 flex-1">
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <h3 className="font-medium">
                                                                    {review.reviewer?.fullName || "Anonymous"}
                                                                </h3>
                                                                {review.foodItem && (
                                                                    <p className="text-xs text-gray-500">
                                                                        For: {review.foodItem.title || "Food Item"}
                                                                    </p>
                                                                )}
                                                                <div className="flex items-center text-yellow-500 mt-1">
                                                                    {[...Array(5)].map((_, i) => (
                                                                        <Star
                                                                            key={i}
                                                                            className="h-3 w-3"
                                                                            fill={i < (review.rating || 0) ? "currentColor" : "none"}
                                                                            stroke="currentColor"
                                                                        />
                                                                    ))}
                                                                    <span className="ml-1 text-gray-600 text-xs">
                                                                        ({review.rating || 0}/5)
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center text-xs text-gray-500">
                                                                <Clock className="h-3 w-3 mr-1" />
                                                                <span>{formatDate(review.date)}</span>
                                                            </div>
                                                        </div>
                                                        <p className="text-sm mt-2">
                                                            {review.review || "No comment provided"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8">
                                            <p className="text-gray-500">No reviews yet</p>
                                            <p className="text-sm text-gray-400 mt-1">Reviews will appear here after completed swaps</p>
                                        </div>
                                    )}
                                </div>
                            )}
                            
                            {activeTab === "requests" && (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h2 className="text-lg font-semibold">Pending Swap Requests</h2>
                                        <button 
                                            onClick={() => {
                                                const headers = {
                                                    'x-auth-token': localStorage.getItem('token')
                                                };
                                                toast.loading("Refreshing requests...");
                                                fetchPendingRequests(headers).then(() => {
                                                    toast.dismiss();
                                                    toast.success("Requests refreshed");
                                                });
                                            }}
                                            className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                            </svg>
                                            Refresh
                                        </button>
                                    </div>
                                    
                                    {pendingRequests.length > 0 ? (
                                        pendingRequests.map((request) => (
                                            <div key={request._id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                                <div className="flex items-start space-x-4">
                                                    <div className="flex-shrink-0">
                                                        <img
                                                            src={request.requester?.profileImage 
                                                                ? request.requester.profileImage
                                                                : "/placeholder.svg"}
                                                            alt={request.requester?.fullName}
                                                            className="h-12 w-12 rounded-full"
                                                        />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex justify-between">
                                                            <div>
                                                                <h3 className="font-medium text-lg">
                                                                    {request.foodItem?.title || 'Food Item'}
                                                                </h3>
                                                                <div className="flex items-center mt-1">
                                                                    <Link 
                                                                        to={`/profile/${request.requester?._id}`}
                                                                        className="text-sm text-blue-600 hover:underline"
                                                                    >
                                                                        {request.requester?.fullName || 'Unknown User'}
                                                                    </Link>
                                                                    <span className="mx-2 text-gray-500">•</span>
                                                                    <span className="text-sm text-gray-500">
                                                                        {formatDate(request.createdAt)}
                                                                    </span>
                                                                </div>
                                                                <p className="text-sm text-gray-600 mt-2">
                                                                    {request.message || "No message provided"}
                                                                </p>
                                                            </div>
                                                            <div className="flex-shrink-0">
                                                                <div className="flex flex-col space-y-2">
                                                                    <button 
                                                                        onClick={() => handleAcceptRequest(request._id)}
                                                                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                                                                    >
                                                                        Accept
                                                                    </button>
                                                                    <button 
                                                                        onClick={() => handleDeclineRequest(request._id)}
                                                                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                                                                    >
                                                                        Decline
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-gray-500 text-center py-4">No pending requests found</p>
                                    )}
                                </div>
                            )}
                            {activeTab === "accepted" && (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h2 className="text-lg font-semibold">Accepted Swaps</h2>
                                        <button 
                                            onClick={() => {
                                                const headers = {
                                                    'x-auth-token': localStorage.getItem('token')
                                                };
                                                fetchAcceptedSwaps(headers);
                                                toast.success("Refreshed accepted swaps");
                                            }}
                                            className="text-blue-600 hover:text-blue-800 text-sm"
                                        >
                                            Refresh
                                        </button>
                                    </div>
                                    
                                    {acceptedSwaps.length > 0 ? (
                                        <>
                                            <div className="bg-blue-50 text-blue-800 p-3 rounded-md mb-4 text-sm">
                                                <p>
                                                    <span className="font-medium">Swap Process:</span> After receiving the food item, the requester should mark the swap as "Completed" to finish the transaction. This will increase both users' trust scores.
                                                </p>
                                                {user?._id && acceptedSwaps.some(swap => swap.requester?._id === user?._id) && (
                                                    <p className="mt-2">
                                                        You are the requester for one or more swaps. Please click "Complete" after receiving the food item.
                                                    </p>
                                                )}
                                            </div>
                                            {acceptedSwaps.map((swap) => (
                                                <div key={swap._id} className="border rounded-lg p-4 hover:bg-gray-50 mb-4">
                                                    <div className="flex justify-between items-center">
                                                        <div className="flex items-center">
                                                            <img
                                                                src={
                                                                    swap.foodItem?.images && swap.foodItem.images.length > 0
                                                                        ? (typeof swap.foodItem.images[0] === 'string' 
                                                                           ? swap.foodItem.images[0] 
                                                                           : swap.foodItem.images[0].url || '')
                                                                        : "/placeholder.svg?height=50&width=50"
                                                                }
                                                                alt={swap.foodItem?.title || "Food"}
                                                                className="w-12 h-12 rounded-md object-cover mr-3"
                                                                onError={(e) => {
                                                                    e.target.onerror = null;
                                                                    e.target.src = "/placeholder.svg?height=50&width=50";
                                                                }}
                                                            />
                                                            <div>
                                                                <p className="font-medium">{swap.foodItem?.title || "Food Item"}</p>
                                                                <p className="text-sm text-gray-600">with {swap.otherUserName}</p>
                                                                <p className="text-xs text-gray-500 mt-1">
                                                                    {user?._id === swap.requester?._id ? "You are the requester" : "You are the provider"}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center">
                                                            <button 
                                                                onClick={() => handleOpenChat(swap)}
                                                                className="flex items-center mr-3 px-3 py-1.5 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200"
                                                            >
                                                                <MessageCircle className="h-4 w-4 mr-1" />
                                                                <span className="text-sm">Chat</span>
                                                            </button>
                                                            
                                                            {/* Always show Complete button, but disable it if not requester */}
                                                            <button
                                                                onClick={() => user?._id === swap.requester?._id && handleCompleteSwap(swap._id)}
                                                                className={`flex items-center px-3 py-1.5 rounded-md ${
                                                                    user?._id === swap.requester?._id 
                                                                        ? "bg-green-500 text-white hover:bg-green-600" 
                                                                        : "bg-gray-200 text-gray-500"
                                                                }`}
                                                                style={{ cursor: user?._id === swap.requester?._id ? 'pointer' : 'not-allowed' }}
                                                            >
                                                                <CheckCircle className="h-4 w-4 mr-1" />
                                                                <span className="text-sm font-medium">Complete</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </>
                                    ) : (
                                        <p className="text-gray-500 text-center py-4">No accepted swaps found</p>
                                    )}
                                </div>
                            )}
                            {activeTab === "pendingReviews" && (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h2 className="text-lg font-semibold">Food to Rate & Review</h2>
                                        <button
                                            onClick={() => {
                                                const headers = {
                                                    'x-auth-token': localStorage.getItem('token')
                                                };
                                                fetchPendingReviews(headers);
                                                toast.success("Refreshed pending reviews");
                                            }}
                                            className="text-blue-600 hover:text-blue-800 text-sm"
                                        >
                                            Refresh Reviews
                                        </button>
                                    </div>
                                    
                                    {/* Show a message if no pending reviews */}
                                    {pendingReviews.length === 0 ? (
                                        <div className="text-center py-8">
                                            <p className="text-gray-500">No completed swaps found to review</p>
                                            <p className="text-sm text-gray-400 mt-1">Complete a swap to be able to leave a review</p>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="bg-yellow-50 text-yellow-800 p-3 rounded-md mb-4 text-sm">
                                                <p>
                                                    <span className="font-medium">Rate Your Experience:</span> Please rate the food providers after receiving their items. Your ratings help build trust in our community.
                                                </p>
                                            </div>
                                            
                                            {pendingReviews.map((swap) => {
                                                // Determine who to review based on user role
                                                const isRequester = user._id === swap.requester?._id;
                                                const isProvider = user._id === swap.provider?._id;
                                                const personToRate = isRequester ? swap.provider : swap.requester;
                                                
                                                return (
                                                    <div key={swap._id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                                        <div className="flex items-start space-x-4">
                                                            <div className="flex-shrink-0">
                                                                <img
                                                                    src={personToRate?.profileImage || "/placeholder.svg"}
                                                                    alt={personToRate?.fullName || "User"}
                                                                    className="h-12 w-12 rounded-full"
                                                                    onError={(e) => {
                                                                        e.target.onerror = null;
                                                                        e.target.src = "/placeholder.svg";
                                                                    }}
                                                                />
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="flex justify-between">
                                                                    <div>
                                                                        <h3 className="font-medium text-lg">
                                                                            {swap.foodItem?.title || 'Food Item'}
                                                                        </h3>
                                                                        <div className="flex items-center mt-1">
                                                                            <span className="text-sm text-blue-600">
                                                                                Rate {personToRate?.fullName || "User"}
                                                                            </span>
                                                                            <span className="mx-2 text-gray-500">•</span>
                                                                            <span className="text-sm text-gray-500">
                                                                                Completed on {formatDate(swap.updatedAt || swap.createdAt)}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                    <button 
                                                                        onClick={() => {
                                                                            setSelectedSwapForRating(swap);
                                                                            setShowRatingModal(true);
                                                                        }}
                                                                        className="px-3 py-1.5 bg-yellow-500 text-white rounded hover:bg-yellow-600 flex items-center"
                                                                    >
                                                                        <Star className="h-4 w-4 mr-1" />
                                                                        Rate Now
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Chat Modal - moved outside motion.div but inside main container */}
            {showChat && selectedSwap && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg w-full max-w-3xl h-3/4 overflow-hidden flex flex-col">
                        <div className="p-4 border-b flex justify-between items-center">
                            <h3 className="font-medium">
                                Chat with {
                                    user?._id === selectedSwap.provider?._id
                                        ? selectedSwap.requester?.fullName
                                        : selectedSwap.provider?.fullName
                                }
                            </h3>
                            <button 
                                onClick={() => setShowChat(false)}
                                className="text-gray-500 hover:text-gray-700"
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
                            />
                        </div>
                    </div>
                </div>
            )}

            {showRatingModal && selectedSwapForRating && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg w-full max-w-md p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium">
                                Rate {
                                    user?._id === selectedSwapForRating.requester?._id
                                        ? selectedSwapForRating.provider?.fullName
                                        : selectedSwapForRating.requester?.fullName
                                }
                            </h3>
                            <button 
                                onClick={() => setShowRatingModal(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        
                        <div className="mb-4">
                            <p className="mb-2 text-sm text-gray-600">How would you rate this food swap?</p>
                            <div className="flex justify-center space-x-2 text-yellow-400 text-2xl">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        onClick={() => setRatingValue(star)}
                                        className="focus:outline-none"
                                    >
                                        <Star
                                            className="h-8 w-8"
                                            fill={star <= ratingValue ? "currentColor" : "none"}
                                            stroke={star <= ratingValue ? "none" : "currentColor"}
                                        />
                                    </button>
                                ))}
                            </div>
                            <p className="text-center mt-1 text-gray-600">
                                {ratingValue === 1 && "Poor"}
                                {ratingValue === 2 && "Fair"}
                                {ratingValue === 3 && "Good"}
                                {ratingValue === 4 && "Very Good"}
                                {ratingValue === 5 && "Excellent"}
                            </p>
                        </div>
                        
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Share your experience (optional)
                            </label>
                            <textarea
                                value={reviewComment}
                                onChange={(e) => setReviewComment(e.target.value)}
                                className="w-full p-2 border rounded focus:ring-1 focus:ring-black focus:border-black"
                                rows="3"
                                placeholder="How was the food? Was it as described? Any other comments..."
                            ></textarea>
                        </div>
                        
                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={() => setShowRatingModal(false)}
                                className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRatingSubmit}
                                className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
                            >
                                Submit Rating
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}