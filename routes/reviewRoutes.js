import express from 'express';
import ReviewController from '../controllers/reviewController.js';
import authenticateToken from '../middlewares/authenticate_token_middleware.js'; // Middleware to validate JWT

const router = express.Router();

// Add review for a restaurant
router.post('/restaurants/:restaurantId/addReview', authenticateToken, ReviewController.addReview);

// Get all reviews for a restaurant
router.get('/restaurants/:restaurantId/getAllReviews', ReviewController.getAllReviews);

// Update review
router.put('/restaurants/:restaurantId/reviews/:reviewId', authenticateToken, ReviewController.updateReview);

// Delete review
router.delete('/restaurants/:restaurantId/reviews/:reviewId', authenticateToken, ReviewController.deleteReview);

export default router;