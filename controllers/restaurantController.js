import RestaurantModel from "../models/restaurant.js";
import FoodItemModel from "../models/FoodItem.js";
import ReviewModel from "../models/Review.js";

class RestaurantController {
    // Add a new restaurant
    static addRestaurant = async (req, res) => {
        const { name, address, cuisine, phone, email, owner, tc, adminId, reviewId } = req.body

        // Get the userId from the JWT token (assuming authenticateToken has set req.user)
        const userId = req.user._id.toString();
        console.log("Admin Id", adminId)
        console.log("User Id", userId)

        // Check if adminId matches the userId from the JWT token
        if (adminId !== userId) {
            return res.status(403).send({ status: "failed", message: "Unauthorized: Admin ID mismatch" });
        }

        // Check if the adminId already has a restaurant
        const existingRestaurant = await RestaurantModel.findOne({ adminId: userId });

        console.log(existingRestaurant)
        if (existingRestaurant) {
            res.status(400).send({ status: "failed", message: "Restaurant with this email already exists" });

        }
        // Check if the email is already associated with a restaurant
        const emailExists = await RestaurantModel.findOne({ email: email });

        if (emailExists) {
            return res.status(400).send({ status: "failed", message: "Email is already associated with a restaurant" });
        }
        // Check if all fields are provided
        if (name && address && cuisine && phone && email && owner && adminId && reviewId) {
            try {
                const newRestaurant = new RestaurantModel({
                    name: name,
                    address: address,
                    cuisine: cuisine,
                    phone: phone,
                    email: email,
                    owner: owner,
                    adminId: adminId,
                    reviewId: reviewId,
                    tc: tc
                })
                await newRestaurant.save()
                res.status(201).send({ status: "failed", message: "Restaurant added successfully" });

            } catch (error) {
                console.log(error)
                res.status(500).send({ status: "failed", message: "Unable to add restaurant" });
            }
        } else {
            res.status(400).send({ status: "failed", message: "All fields are required" });
        }
    }

    // Get All Restaurants with Search by Name functionality
    static async getAllRestaurants(req, res) {
        try {
            // Default pagination parameters
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;

            // Initialize the query object
            const query = {};

            // Filter by cuisine if provided
            if (req.query.cuisine) {
                query.cuisine = { $regex: req.query.cuisine, $options: 'i' }; // Case-insensitive cuisine search
            }

            // Filter by location if provided
            if (req.query.location) {
                query["address.city"] = { $regex: req.query.location, $options: 'i' }; // Case-insensitive city search
            }

            // Filter by name if provided (search by name)
            if (req.query.name) {
                query.name = { $regex: req.query.name, $options: 'i' }; // Case-insensitive name search
            }

            // Fetch total count for pagination
            const total = await RestaurantModel.countDocuments(query);

            // Fetch the restaurants with pagination and filtering
            const restaurants = await RestaurantModel.find(query)
                .skip(skip)
                .limit(limit)
                .select('name address cuisine phone email owner rating reviewsCount') // Select fields to include in the response
                .exec();

            // Response with pagination
            res.status(200).json({
                status: "success",
                data: {
                    restaurants: restaurants,
                    pagination: {
                        total: total,
                        page: page,
                        limit: limit
                    }
                }
            });
        } catch (error) {
            console.error("Error retrieving restaurants:", error);
            res.status(500).json({
                status: "failed",
                error: {
                    code: "SERVER_ERROR",
                    message: "Unable to retrieve restaurants due to an internal error."
                }
            });
        }
    }

    static getRestaurantById = async (req, res) => {
        const restaurantId = req.params.id;

        try {
            const restaurant = await RestaurantModel.findById(restaurantId);

            if (!restaurant) {
                return res.status(404).json({ message: 'Restaurant not found' });
            }

            res.status(200).json(restaurant);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error', error });
        }
    }



    static getFoodItemsByRestaurant = async (req, res) => {
        const restaurantId = req.params.id;

        try {
            // Fetch food items where restaurantId matches the given ID
            const foodItems = await FoodItemModel.find({ restaurantId });

            // If no food items found, return 404
            if (!foodItems || foodItems.length === 0) {
                return res.status(404).json({ message: 'No food items found for this restaurant' });
            }

            // Return the list of food items
            res.status(200).json(foodItems);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    }

    static getRestaurantReviews = async (req, res) => {

        try {
            const { restaurantId } = req.params;

            // Check if restaurant exists
            const restaurant = await RestaurantModel.findById(restaurantId);
            if (!restaurant) {
                return res.status(404).json({ message: 'Restaurant not found' });
            }

            // Fetch reviews for the restaurant
            const reviews = await ReviewModel.find({ restaurantId })
                .populate('customerId', 'name') // Populate customer name
                .sort({ createdAt: -1 }); // Sort by newest reviews

            if (!reviews || reviews.length === 0) {
                return res.status(200).json({ message: 'No reviews found for this restaurant.' });
            }

            // Send response
            res.status(200).json({
                message: 'Reviews retrieved successfully',
                reviews
            });
        } catch (error) {
            console.error('Error retrieving restaurant reviews:', error);
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }
}

export default RestaurantController