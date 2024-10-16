import OrderModel from "../models/Order.js";

class OrderController {

    // Place Orders
    static placeOrder = async (req, res) => {
        const { customerId, restaurantId, deliveryBoyId, items, totalPrice } = req.body;

        // Basic validation
        if (!customerId || !restaurantId || !items || !totalPrice) {
            return res.status(400).json({ message: 'Customer ID, Restaurant ID, items, and total price are required.' });
        }

        try {
            // Create a new order
            const order = new OrderModel({
                customerId,
                restaurantId,
                items,
                totalPrice,
                ...(deliveryBoyId && { deliveryBoyId })
            });

            const savedOrder = await order.save();

            res.status(201).json({
                message: 'Order placed successfully.',
                order: savedOrder,  // Return populated order
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }

    // Get All Orders
    static getAllOrders = async (req, res) => {
        try {
            // Default pagination parameters
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;

            // Build the query object
            const query = {};

            // Optional filters
            console.log(req.query.status)
            if (req.query.status) {
                query.status = req.query.status;
            }
            if (req.query.customerId) {
                query.customerId = req.query.customerId;
            }
            if (req.query.restaurantId) {
                query.restaurantId = req.query.restaurantId;
            }
            if (req.query.deliveryBoyId) {
                query.deliveryBoyId = req.query.deliveryBoyId;
            }

            // Fetch total count for pagination
            const total = await OrderModel.countDocuments(query);

            // Fetch the orders with pagination and filtering
            const orders = await OrderModel.find(query)
                .skip(skip)
                .limit(limit)
                .exec();

            // Response with pagination
            res.status(200).json({
                status: "success",
                data: {
                    orders: orders,
                    pagination: {
                        total: total,
                        page: page,
                        limit: limit
                    }
                }
            });
        } catch (error) {
            console.error("Error retrieving orders:", error);
            res.status(500).json({
                status: "failed",
                error: {
                    code: "SERVER_ERROR",
                    message: "Unable to retrieve orders due to an internal error."
                }
            });
        }
    }

    static getOrdersByCustomerId = async (req, res) => {
        const customerId = req.params.customerId; // Extract customerId from the request parameters


        try {
            const orders = await OrderModel.findById(customerId)
            console.log(orders)

            res.status(200).json({
                status: "success",
                data: orders,
            });
        } catch (error) {
            console.error("Error retrieving orders by customer ID:", error);
            res.status(500).json({
                status: "failed",
                error: {
                    code: "SERVER_ERROR",
                    message: "Unable to retrieve orders due to an internal error.",
                },
            });
        }
    }

    static getOrdersByDeliveryBoyId = async (req, res) => {
        const deliveryBoyId = req.params.deliveryBoyId; // Extract deliveryBoyId from the request parameters

        try {
            const orders = await OrderModel.findById(deliveryBoyId)

            res.status(200).json({
                status: "success",
                data: orders,
            });
        } catch (error) {
            console.error("Error retrieving orders by delivery boy ID:", error);
            res.status(500).json({
                status: "failed",
                error: {
                    code: "SERVER_ERROR",
                    message: "Unable to retrieve orders due to an internal error.",
                },
            });
        }
    }

    static getOrdersByRestaurantId = async (req, res) => {
        const restaurantId = req.params.restaurantId; // Extract restaurantId from the request parameters

        try {
            const orders = await OrderModel.findById(restaurantId)

            res.status(200).json({
                status: "success",
                data: orders,
            });
        } catch (error) {
            console.error("Error retrieving orders by restaurant ID:", error);
            res.status(500).json({
                status: "failed",
                error: {
                    code: "SERVER_ERROR",
                    message: "Unable to retrieve orders due to an internal error.",
                },
            });
        }
    }

    // Cancel Order
    static async cancelOrder(req, res) {
        try {
            const orderId = req.params.orderId;
            const userId = req.user._id; // Assuming the authenticateToken middleware sets req.user
            const userRole = req.user.role; // Assuming the user's role is stored in the token

            // Fetch the order by ID
            const order = await OrderModel.findById(orderId);
            if (!order) {
                return res.status(404).json({
                    status: "failed",
                    message: "Order not found."
                });
            }

            // Check if the order is already completed or canceled
            if (order.status === 'completed' || order.status === 'cancelled') {
                return res.status(400).json({
                    status: "failed",
                    message: `Order is already ${order.status}.`
                });
            }

            // Check if the user is authorized to cancel the order
            // Customers can cancel their own orders; Restaurant admins can cancel any orders for their restaurant.
            if (userRole === 'customer' && order.customerId.toString() !== userId.toString()) {
                return res.status(403).json({
                    status: "failed",
                    message: "You are not authorized to cancel this order."
                });
            } else if (userRole === 'restaurant_admin' && order.restaurantId.toString() !== req.user.restaurantId.toString()) {
                return res.status(403).json({
                    status: "failed",
                    message: "You are not authorized to cancel this order."
                });
            }

            // Update the order status to 'cancelled'
            order.status = 'cancelled';
            await order.save();

            // Success response
            res.status(200).json({
                status: "success",
                message: "Order cancelled successfully."
            });

        } catch (error) {
            console.error("Error cancelling order:", error);
            res.status(500).json({
                status: "failed",
                message: "Unable to cancel the order due to an internal error."
            });
        }
    }
}

export default OrderController;