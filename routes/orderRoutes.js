import express from 'express';
import OrderController from '../controllers/orderController.js';
import authenticateToken from '../middlewares/authenticate_token_middleware.js';
import CheckUserRole from '../middlewares/restaurant_admin_middleware.js';


const router = express.Router();

// Place Oreders
router.post('/placeOrder', authenticateToken, OrderController.placeOrder)

// Get all orders
router.get('/getAllOrders', authenticateToken, OrderController.getAllOrders);

// Get Oreders By Customer
router.get('/customer/:customerId', CheckUserRole.authenticateAndAuthorizeCustomer, OrderController.getOrdersByCustomerId)

// Get Orders By Delivery Boy
router.get('/deliveryBoy/:deliveryBoyId', CheckUserRole.authenticateAndAuthorizeDeliveryBoy, OrderController.getOrdersByDeliveryBoyId)

// Get Orders By Restaurant
router.get('/restaurant/:restaurantId', CheckUserRole.authenticateAndAuthorizeRestaurantAdmin, OrderController.getOrdersByRestaurantId)

// Cancel an order
router.patch('/:orderId/cancel', authenticateToken, OrderController.cancelOrder);

export default router