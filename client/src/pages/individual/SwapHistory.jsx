import React from 'react';
import { CheckCircle } from 'lucide-react'; // Only icon needed here potentially

export default function SwapHistory({ transactions = [], user, formatDate, getSwapStatusBadge }) {

    const getImageUrl = (item) => {
        if (item?.images && item.images.length > 0) {
            const image = item.images[0];
            return typeof image === 'string' ? image : image.url;
        }
        return "/placeholder.svg?height=50&width=50"; // Default placeholder
    };

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Swap History</h2>
            {transactions && transactions.length > 0 ? (
                transactions.map((transaction) => {
                    const status = getSwapStatusBadge(transaction.status);
                    const isUserProvider = user?._id === transaction.provider?._id;
                    const interactionLabel = isUserProvider ? "Shared with:" : "Received from:";

                    return (
                        <div key={transaction._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors duration-150 ease-in-out">
                            <div className="flex justify-between items-start flex-wrap sm:flex-nowrap gap-4">
                                <div className="flex items-start flex-grow">
                                    <div className="mr-3 flex-shrink-0">
                                        <img
                                            src={getImageUrl(transaction.foodItem)}
                                            alt={transaction.foodItem?.title || "Food"}
                                            className="w-12 h-12 sm:w-16 sm:h-16 rounded-md object-cover border border-gray-100"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = "/placeholder.svg?height=50&width=50";
                                            }}
                                        />
                                    </div>
                                    <div className="flex-grow">
                                        <div className="flex items-center flex-wrap gap-2 mb-1">
                                            <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${status.color}`}>
                                                {status.text}
                                            </span>
                                            <h3 className="font-medium text-base sm:text-lg text-gray-800">
                                                {transaction.foodItem?.title || 'Food Item'}
                                            </h3>
                                        </div>
                                        <p className="text-sm text-gray-600 mt-1">
                                            {interactionLabel} <span className="font-medium">{transaction.otherUserName || 'User'}</span>
                                        </p>
                                        {transaction.status === 'completed' && transaction.updatedAt && (
                                            <p className="text-xs text-green-600 mt-1 flex items-center">
                                                <CheckCircle className="h-3 w-3 mr-1" />
                                                Completed on {formatDate(transaction.updatedAt)}
                                            </p>
                                        )}
                                         {transaction.status === 'rejected' && transaction.updatedAt && (
                                            <p className="text-xs text-red-600 mt-1 flex items-center">
                                                Rejected on {formatDate(transaction.updatedAt)}
                                            </p>
                                        )}
                                         {transaction.status === 'cancelled' && transaction.updatedAt && (
                                            <p className="text-xs text-gray-500 mt-1 flex items-center">
                                                Cancelled on {formatDate(transaction.updatedAt)}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="text-right text-xs text-gray-500 flex-shrink-0 mt-2 sm:mt-0">
                                    <p>Requested on:</p>
                                    <p>{formatDate(transaction.createdAt)}</p>
                                </div>
                            </div>
                        </div>
                    );
                })
            ) : (
                <div className="text-center py-8">
                    <p className="text-gray-500">No past swaps found in your history.</p>
                    <p className="text-sm text-gray-400 mt-1">
                        Completed, cancelled, or rejected swaps will appear here.
                    </p>
                </div>
            )}
        </div>
    );
}