import React from 'react';
import { Star, Clock } from 'lucide-react';

export default function Reviews({ reviews = [], formatDate }) {

     const getReviewerImageUrl = (reviewer) => {
        return reviewer?.profileImage || "/placeholder.svg"; // Default placeholder
    };

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Reviews ({reviews.length})</h2>
            {reviews && reviews.length > 0 ? (
                reviews.map((review) => (
                    <div key={review._id || Math.random()} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors duration-150 ease-in-out">
                        <div className="flex items-start space-x-3 sm:space-x-4">
                            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full overflow-hidden flex-shrink-0 border border-gray-100">
                                <img
                                    src={getReviewerImageUrl(review.reviewer)}
                                    alt={review.reviewer?.fullName || "Reviewer"}
                                    className="h-full w-full object-cover"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = "/placeholder.svg";
                                    }}
                                />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start flex-wrap gap-2">
                                    <div>
                                        <h3 className="font-medium text-gray-800">
                                            {review.reviewer?.fullName || "Anonymous"}
                                        </h3>
                                        {review.foodItem && (
                                            <p className="text-xs text-gray-500">
                                                Reviewed for: {review.foodItem.title || "Food Item"}
                                            </p>
                                        )}
                                        <div className="flex items-center text-yellow-500 mt-1" title={`${review.rating || 0} out of 5 stars`}>
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className="h-4 w-4" // Slightly larger stars
                                                    fill={i < (review.rating || 0) ? "currentColor" : "none"}
                                                    stroke="currentColor"
                                                    strokeWidth={1.5}
                                                />
                                            ))}
                                            <span className="ml-1.5 text-gray-600 text-xs font-medium">
                                                ({review.rating || 0}/5)
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center text-xs text-gray-500 flex-shrink-0">
                                        <Clock className="h-3 w-3 mr-1" />
                                        <span>{formatDate(review.date)}</span>
                                    </div>
                                </div>
                                <p className="text-sm mt-2 text-gray-700 leading-relaxed">
                                    {review.review || "No comment provided"}
                                </p>
                            </div>
                        </div>
                    </div>
                ))
            ) : (
                <div className="text-center py-8">
                    <p className="text-gray-500">No reviews yet.</p>
                    <p className="text-sm text-gray-400 mt-1">Reviews about you will appear here after completed swaps.</p>
                </div>
            )}
        </div>
    );
}