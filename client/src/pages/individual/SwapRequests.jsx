import React from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw } from 'lucide-react'; // Import refresh icon

export default function SwapRequests({ requests = [], onAccept, onDecline, formatDate, onRefresh }) {

     const getRequesterImageUrl = (requester) => {
        return requester?.profileImage || "/placeholder.svg"; // Default placeholder
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
                 <h2 className="text-xl font-semibold">Pending Swap Requests</h2>
                 <button
                    onClick={onRefresh} // Call the refresh handler passed as prop
                    className="flex items-center text-blue-600 hover:text-blue-800 text-sm p-1 rounded hover:bg-blue-50"
                    title="Refresh Requests"
                >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Refresh
                </button>
            </div>

            {requests && requests.length > 0 ? (
                requests.map((request) => (
                    <div key={request._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors duration-150 ease-in-out">
                        <div className="flex items-start space-x-3 sm:space-x-4">
                             {/* Requester Info */}
                            <div className="flex-shrink-0">
                                <Link to={`/profile/${request.requester?._id}`} title={`View profile of ${request.requester?.fullName}`}>
                                    <img
                                        src={getRequesterImageUrl(request.requester)}
                                        alt={request.requester?.fullName || 'Requester'}
                                        className="h-12 w-12 rounded-full border border-gray-100 hover:opacity-90"
                                         onError={(e) => { e.target.onerror = null; e.target.src = "/placeholder.svg";}}
                                    />
                                </Link>
                            </div>

                            {/* Request Details */}
                            <div className="flex-1 min-w-0"> {/* Added min-w-0 for proper truncation */}
                                <div className="flex justify-between flex-wrap gap-2 items-start">
                                     <div>
                                        <h3 className="font-medium text-base sm:text-lg text-gray-800">
                                            {request.foodItem?.title || 'Your Food Item'}
                                        </h3>
                                        <div className="flex items-center mt-1 flex-wrap">
                                            <Link
                                                to={`/profile/${request.requester?._id}`}
                                                className="text-sm text-blue-600 hover:underline font-medium"
                                            >
                                                {request.requester?.fullName || 'Unknown User'}
                                            </Link>
                                            <span className="mx-1.5 text-gray-400 text-xs">•</span>
                                            <span className="text-xs text-gray-500 whitespace-nowrap">
                                                Requested: {formatDate(request.createdAt)}
                                            </span>
                                        </div>
                                    </div>
                                    {/* Action Buttons on Desktop */}
                                    <div className="hidden sm:flex flex-shrink-0 space-x-2">
                                        <button
                                            onClick={() => onAccept(request._id)}
                                            className="px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium transition duration-150 ease-in-out"
                                        >
                                            Accept
                                        </button>
                                        <button
                                            onClick={() => onDecline(request._id)}
                                            className="px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium transition duration-150 ease-in-out"
                                        >
                                            Decline
                                        </button>
                                    </div>
                                </div>
                                {request.message && (
                                    <p className="text-sm text-gray-600 mt-2 bg-gray-100 p-2 rounded border border-gray-200">
                                        <span className="font-medium">Message:</span> {request.message}
                                    </p>
                                )}
                                {/* Action Buttons on Mobile */}
                                <div className="sm:hidden flex flex-shrink-0 space-x-2 mt-3">
                                     <button
                                        onClick={() => onAccept(request._id)}
                                        className="flex-1 px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium transition duration-150 ease-in-out"
                                    >
                                        Accept
                                    </button>
                                    <button
                                        onClick={() => onDecline(request._id)}
                                        className="flex-1 px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium transition duration-150 ease-in-out"
                                    >
                                        Decline
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))
            ) : (
                <p className="text-gray-500 text-center py-8">No pending requests found for your items.</p>
            )}
        </div>
    );
}