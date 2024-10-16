import ReviewModel from '../models/Review.js';
import OrderModel from '../models/Order.js';

class ReviewController {
    // Add Review
    static async addReview(req, res) {
        try {
            const { restaurantId } = req.params; // Extract restaurantId from the route
            const { rating, comment } = req.body; // Extract rating and comment from the request body
            const customerId = req.user.userId; // Assuming req.user is set by authenticateToken middleware

            // Validate input data
            if (!rating || !comment) {
                return res.status(400).json({
                    status: "failed",
                    message: "Rating and comment are required."
                });
            }

            // Ensure the customer has placed an order from this restaurant before reviewing
            const hasOrdered = await OrderModel.findOne({ customerId, restaurantId });
            if (!hasOrdered) {
                return res.status(403).json({
                    status: "failed",
                    message: "You can only review a restaurant after placing an order."
                });
            }

            // Check if the customer has already reviewed the restaurant
            const existingReview = await ReviewModel.findOne({ customerId, restaurantId });
            if (existingReview) {
                return res.status(400).json({
                    status: "failed",
                    message: "You have already reviewed this restaurant."
                });
            }

            // Create a new review
            const newReview = new ReviewModel({
                restaurantId,
                customerId,
                rating,
                comment
            });

            await newReview.save();

            // Return success response
            res.status(201).json({
                status: "success",
                message: "Review added successfully.",
                review: newReview
            });

        } catch (error) {
            console.error("Error adding review:", error);
            res.status(500).json({
                status: "failed",
                message: "Unable to add review due to an internal server error."
            });
        }
    }

    // Get all reviews for a restaurant
    static async getAllReviews(req, res) {
        try {
            const { restaurantId } = req.params;

            // Fetch all reviews for the given restaurant
            const reviews = await ReviewModel.find({ restaurantId }); // Assuming you want to populate customer details like name

            if (!reviews.length) {
                return res.status(404).json({
                    status: "failed",
                    message: "No reviews found for this restaurant."
                });
            }

            // Return all reviews
            res.status(200).json({
                status: "success",
                reviews
            });

        } catch (error) {
            console.error("Error fetching reviews:", error);
            res.status(500).json({
                status: "failed",
                message: "An error occurred while fetching reviews."
            });
        }
    }

    // Update a specific review by its ID
    static async updateReview(req, res) {
        try {
            const { restaurantId, reviewId } = req.params;
            const { rating, comment } = req.body;
            const customerId = req.user.userId;

            // Validate input
            if (!rating || !comment) {
                return res.status(400).json({
                    status: "failed",
                    message: "Rating and comment are required."
                });
            }

            // Find the review and ensure the customer owns it
            const review = await ReviewModel.findOne({ _id: reviewId, restaurantId, customerId });

            if (!review) {
                return res.status(404).json({
                    status: "failed",
                    message: "Review not found or you are not authorized to update this review."
                });
            }

            // Update the review
            review.rating = rating;
            review.comment = comment;
            await review.save();

            res.status(200).json({
                status: "success",
                message: "Review updated successfully.",
                review
            });

        } catch (error) {
            console.error("Error updating review:", error);
            res.status(500).json({
                status: "failed",
                message: "An error occurred while updating the review."
            });
        }
    }

    // Delete a specific review by its ID
    static async deleteReview(req, res) {
        try {
            const { restaurantId, reviewId } = req.params;
            const customerId = req.user.userId;

            // Find the review and ensure the customer owns it
            const review = await ReviewModel.findOne({ _id: reviewId, restaurantId, customerId });

            if (!review) {
                return res.status(404).json({
                    status: "failed",
                    message: "Review not found or you are not authorized to delete this review."
                });
            }

            // Delete the review
            await ReviewModel.deleteOne({ _id: reviewId });

            res.status(200).json({
                status: "success",
                message: "Review deleted successfully."
            });

        } catch (error) {
            console.error("Error deleting review:", error);
            res.status(500).json({
                status: "failed",
                message: "An error occurred while deleting the review."
            });
        }
    }
}

export default ReviewController;