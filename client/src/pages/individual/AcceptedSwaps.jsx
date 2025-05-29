import React from 'react';
import { CheckCircle, MessageCircle, RefreshCw } from 'lucide-react'; // Add RefreshCw

export default function AcceptedSwaps({ swaps = [], user, onComplete, onOpenChat, formatDate, onRefresh }) {

     const getImageUrl = (item) => {
        if (item?.images && item.images.length > 0) {
            const image = item.images[0];
            return typeof image === 'string' ? image : image.url;
        }
        return "/placeholder.svg?height=50&width=50"; // Default placeholder
    };

    const isUserRequesterForAny = user?._id && swaps.some(swap => swap.requester?._id === user?._id);

    return (
        <div className="space-y-4">
             <div className="flex justify-between items-center mb-4">
                 <h2 className="text-xl font-semibold">Accepted Swaps</h2>
                  <button
                    onClick={onRefresh} // Call the refresh handler passed as prop
                    className="flex items-center text-blue-600 hover:text-blue-800 text-sm p-1 rounded hover:bg-blue-50"
                    title="Refresh Accepted Swaps"
                >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Refresh
                </button>
            </div>

            {swaps && swaps.length > 0 ? (
                <>
                    <div className="bg-blue-50 text-blue-800 p-3 rounded-md mb-4 text-sm border border-blue-200">
                        <p>
                            <span className="font-medium">Next Steps:</span> Coordinate pickup/delivery via Chat. Once the swap is physically complete, the <span className="font-medium">Requester</span> should mark it as "Completed".
                        </p>
                        {isUserRequesterForAny && (
                            <p className="mt-1">
                                <span className="font-medium">You are the Requester</span> for one or more swaps below. Please click "Complete" after receiving the food item.
                            </p>
                        )}
                    </div>
                    {swaps.map((swap) => {
                         const isRequester = user?._id === swap.requester?._id;
                         const canComplete = isRequester; // Only requester can complete

                        return (
                            <div key={swap._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors duration-150 ease-in-out">
                                <div className="flex justify-between items-start flex-wrap sm:flex-nowrap gap-4">
                                    <div className="flex items-start flex-grow">
                                        <div className="mr-3 flex-shrink-0">
                                            <img
                                                src={getImageUrl(swap.foodItem)}
                                                alt={swap.foodItem?.title || "Food"}
                                                className="w-12 h-12 sm:w-16 sm:h-16 rounded-md object-cover border border-gray-100"
                                                onError={(e) => { e.target.onerror = null; e.target.src = "/placeholder.svg?height=50&width=50"; }}
                                            />
                                        </div>
                                        <div className="flex-grow">
                                            <h3 className="font-medium text-base sm:text-lg text-gray-800">
                                                {swap.foodItem?.title || "Food Item"}
                                            </h3>
                                            <p className="text-sm text-gray-600 mt-1">
                                                With: <span className="font-medium">{swap.otherUserName || 'User'}</span>
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                ({isRequester ? "You are Requester" : "You are Provider"})
                                            </p>
                                             <p className="text-xs text-gray-500 mt-1">
                                                Accepted on: {formatDate(swap.updatedAt)} {/* Assuming updatedAt reflects acceptance */}
                                            </p>
                                        </div>
                                    </div>
                                     {/* Buttons */}
                                     <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-shrink-0 w-full sm:w-auto">
                                         <button
                                            onClick={() => onOpenChat(swap)}
                                            className="flex items-center justify-center px-3 py-1.5 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200 text-sm font-medium transition duration-150 ease-in-out"
                                            title="Open chat"
                                        >
                                            <MessageCircle className="h-4 w-4 mr-1.5" />
                                            Chat
                                        </button>
                                        <button
                                            onClick={() => canComplete && onComplete(swap._id)}
                                            disabled={!canComplete}
                                            className={`flex items-center justify-center px-3 py-1.5 rounded-md text-sm font-medium transition duration-150 ease-in-out ${
                                                canComplete
                                                ? "bg-green-500 text-white hover:bg-green-600 cursor-pointer"
                                                : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                            }`}
                                            title={canComplete ? "Mark swap as completed" : "Only the requester can mark as completed"}
                                        >
                                            <CheckCircle className="h-4 w-4 mr-1.5" />
                                            Complete
                                        </button>
                                    </div>
                                </div>
                            </div>
                         );
                    })}
                </>
            ) : (
                <p className="text-gray-500 text-center py-8">No swaps currently accepted and awaiting completion.</p>
            )}
        </div>
    );
}