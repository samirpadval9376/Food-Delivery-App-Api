import express from 'express';
import RestaurantController from '../controllers/restaurantController.js';
import checkAdminRole from '../middlewares/restaurant_middleware.js';
import FoodItemController from '../controllers/foodItemController.js';

const router = express.Router();

// Route to add a restaurant, only accessible by restaurant admins
router.post('/addRestaurant', checkAdminRole, RestaurantController.addRestaurant)
router.post('/addFoodItem', checkAdminRole, FoodItemController.addFoodItem)
router.get('/:restaurantId/getFoodItems', RestaurantController.getFoodItemsByRestaurant)
router.get('/getAllFoodItems', FoodItemController.getAllFoodItems)
router.get('/getAllRestaurants', RestaurantController.getAllRestaurants)
router.get('/:id', RestaurantController.getRestaurantById)
router.get('/:restaurantId/reviews', RestaurantController.getRestaurantReviews)

export default router