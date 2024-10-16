import jwt from 'jsonwebtoken'
import UserModel from '../models/User.js';
import tokenBlacklist from '../global_variable.js';

class CheckUserRole {
    static authenticateAndAuthorizeRestaurantAdmin = async (req, res, next) => {
        // Extract token from the Authorization header (Assumes Bearer token format)
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({ message: 'Unauthorized: No token provided.' });
        }

        // Check if the token is blacklisted
        if (tokenBlacklist.includes(token)) {
            return res.status(403).json({ message: 'Token is blacklisted. Please login again.' });
        }

        try {
            // Verify the token
            const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

            // Check token expiration manually
            if (Date.now() >= decoded.exp * 1000) {
                return res.status(401).json({ message: 'Unauthorized: Token has expired.' });
            }

            // Fetch the user from the database using the token's user ID
            const user = await UserModel.findById(decoded.userId).select('role');

            if (!user) {
                return res.status(404).json({ message: 'User not found.' });
            }

            // Check if the user's role is 'restaurant_admin'
            if (user.role !== 'restaurant_admin') {
                return res.status(403).json({ message: 'Forbidden: Only restaurant admins can access this resource.' });
            }

            // Check if the restaurantId from the URL matches the user ID in the token
            if (req.params.restaurantId !== String(user._id)) {
                return res.status(403).json({ message: 'Forbidden: You do not have access to this restaurant\'s data.' });
            }

            // Attach user info to the request object for further use
            req.user = user;

            // Proceed to the next middleware or route handler
            next();
        } catch (error) {
            console.error("Authentication error:", error);
            res.status(500).json({
                message: "Server error during authentication.",
                error: error.message,
            });
        }
    }

    static authenticateAndAuthorizeCustomer = async (req, res, next) => {

        // Extract token from the Authorization header (Assumes Bearer token format)
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({ message: 'Unauthorized: No token provided.' });
        }

        // Check if the token is blacklisted
        if (tokenBlacklist.includes(token)) {
            return res.status(403).json({ message: 'Token is blacklisted. Please login again.' });
        }

        try {
            // Verify the token
            const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

            // Check token expiration manually (if needed)
            if (Date.now() >= decoded.exp * 1000) {
                return res.status(401).json({ message: 'Unauthorized: Token has expired.' });
            }

            // Get the customerId from the URL parameter and the userId from the token
            const { customerId } = req.params;
            const userIdFromToken = decoded.id || decoded.userId; // Assuming token contains 'id' or 'userId'

            console.log("Customer ID from request:", customerId);
            console.log("User ID from token:", userIdFromToken);

            // Fetch the user from the database using the token's user ID
            const user = await UserModel.findById(userIdFromToken).select('role'); // Assuming 'id' is the user ID in the token

            if (!user) {
                return res.status(404).json({ message: 'User not found.' });
            }


            // Check if the user's role is 'customer'
            if (user.role !== 'customer') {
                return res.status(403).json({ message: 'Forbidden: Only customers can access this resource.' });
            }

            // Check if the customerId from the URL matches the user ID in the token
            if (req.params.customerId !== String(user._id)) {
                return res.status(403).json({ message: 'Forbidden: You do not have access to this customer\'s data.' });
            }

            // Attach user info to the request object for further use
            req.user = user;

            // Proceed to the next middleware or route handler
            next();
        } catch (error) {
            console.error("Authentication error:", error);
            res.status(500).json({
                message: "Server error during authentication.",
                error: error.message,
            });
        }

    }

    static authenticateAndAuthorizeDeliveryBoy = async (req, res, next) => {
        // Extract token from the Authorization header (Assumes Bearer token format)
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({ message: 'Unauthorized: No token provided.' });
        }

        // Check if the token is blacklisted
        if (tokenBlacklist.includes(token)) {
            return res.status(403).json({ message: 'Token is blacklisted. Please login again.' });
        }

        try {
            // Verify the token
            const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

            // Check token expiration manually
            if (Date.now() >= decoded.exp * 1000) {
                return res.status(401).json({ message: 'Unauthorized: Token has expired.' });
            }

            // Fetch the user from the database using the token's user ID
            const user = await UserModel.findById(decoded.userId).select('role');

            if (!user) {
                return res.status(404).json({ message: 'User not found.' });
            }

            // Check if the user's role is 'delivery boy'
            if (user.role !== 'delivery_boy') {
                return res.status(403).json({ message: 'Forbidden: Only delivery boys can access this resource.' });
            }

            // Attach user info to the request object for further use
            req.user = user;

            // Proceed to the next middleware or route handler
            next();
        } catch (error) {
            console.error("Authentication error:", error);
            res.status(500).json({
                message: "Server error during authentication.",
                error: error.message,
            });
        }
    }
}

export default CheckUserRole