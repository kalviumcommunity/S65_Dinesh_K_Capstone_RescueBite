import React from 'react';
import { Star, RefreshCw } from 'lucide-react'; // Add RefreshCw

// Renamed component to RatingComponent
export default function RatingComponent({ pendingReviews = [], user, onRate, formatDate, onRefresh }) {

     const getImageUrl = (item) => {
        if (item?.images && item.images.length > 0) {
            const image = item.images[0];
            return typeof image === 'string' ? image : image.url;
        }
        return "/placeholder.svg?height=50&width=50"; // Default placeholder
    };

     const getPartnerImageUrl = (swap) => {
        const isRequester = user?._id === swap.requester?._id;
        const partner = isRequester ? swap.provider : swap.requester;
        return partner?.profileImage || "/placeholder.svg";
     }

     const getPartnerName = (swap) => {
        const isRequester = user?._id === swap.requester?._id;
        const partner = isRequester ? swap.provider : swap.requester;
        return partner?.fullName || "Swap Partner";
     }


    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
                 <h2 className="text-xl font-semibold">Rate Your Swaps</h2>
                <button
                    onClick={onRefresh} // Call the refresh handler passed as prop
                    className="flex items-center text-blue-600 hover:text-blue-800 text-sm p-1 rounded hover:bg-blue-50"
                    title="Refresh Pending Reviews"
                >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Refresh
                </button>
            </div>

            {pendingReviews && pendingReviews.length > 0 ? (
                <>
                    <div className="bg-yellow-50 text-yellow-800 p-3 rounded-md mb-4 text-sm border border-yellow-200">
                        <p>
                            <span className="font-medium">Share Your Feedback:</span> Please rate your experience with the other user for the completed swaps below. Your feedback helps build trust in the community!
                        </p>
                    </div>
                    {pendingReviews.map((swap) => {
                        const partnerName = getPartnerName(swap);

                       return (
                            <div key={swap._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors duration-150 ease-in-out">
                                <div className="flex items-start space-x-3 sm:space-x-4">
                                    {/* Food Item Image */}
                                    <div className="flex-shrink-0">
                                         <img
                                            src={getImageUrl(swap.foodItem)}
                                            alt={swap.foodItem?.title || "Food"}
                                            className="w-12 h-12 sm:w-16 sm:h-16 rounded-md object-cover border border-gray-100"
                                            onError={(e) => { e.target.onerror = null; e.target.src = "/placeholder.svg?height=50&width=50"; }}
                                        />
                                    </div>

                                    {/* Details and Rate Button */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between flex-wrap gap-2 items-start">
                                             <div>
                                                 <h3 className="font-medium text-base sm:text-lg text-gray-800">
                                                    {swap.foodItem?.title || 'Food Item'}
                                                </h3>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    Swap with: <span className="font-medium">{partnerName}</span>
                                                </p>
                                                 <p className="text-xs text-gray-500 mt-1">
                                                    Completed on: {formatDate(swap.updatedAt || swap.createdAt)}
                                                </p>
                                            </div>
                                            <div className="flex-shrink-0 mt-2 sm:mt-0">
                                                <button
                                                    onClick={() => onRate(swap)} // Pass the whole swap object to the handler
                                                    className="flex items-center px-3 py-1.5 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 text-sm font-medium transition duration-150 ease-in-out"
                                                >
                                                    <Star className="h-4 w-4 mr-1.5" />
                                                    Rate Now
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </>
            ) : (
                <div className="text-center py-8">
                    <p className="text-gray-500">No completed swaps awaiting your review.</p>
                    <p className="text-sm text-gray-400 mt-1">You're all caught up!</p>
                </div>
            )}
        </div>
    );
}