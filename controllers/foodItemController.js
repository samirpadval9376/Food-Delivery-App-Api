import FoodItemModel from "../models/FoodItem.js";
import RestaurantModel from "../models/restaurant.js";

class FoodItemController {
    // Add a Food Item

    static addFoodItem = async (req, res) => {
        const { name, price, description, image, restaurantId } = req.body

        try {

            // Find the restaurant by restaurantId
            const restaurant = await RestaurantModel.findById(restaurantId)

            if (!restaurant) {
                return res.status(404).send({ status: 'failed', message: 'Restaurant not found' });
            }

            if (restaurant.adminId.toString() !== req.user._id.toString()) {
                return res.status(403).send({ status: 'failed', message: 'Forbidden: You are not the admin of this restaurant' });
            }

            // Create a New Food Item
            const foodItem = new FoodItemModel({
                name: name,
                price: price,
                description: description,
                image: image,
                restaurantId: restaurantId
            })

            await foodItem.save()

            res.status(201).send({ status: 'success', message: 'Food item added successfully', foodItem });
        } catch (error) {
            console.log(error)
            res.status(500).send({ status: 'failed', message: 'Server error, unable to add food item' });
        }
    }

    // Get all food items or search by name
    static getAllFoodItems = async (req, res) => {
        try {
            const { name } = req.query; // Get search query (optional)

            // If name is provided, search food items by name
            let query = {};
            if (name) {
                query.name = { $regex: name, $options: 'i' }; // Case-insensitive search
            }

            const foodItems = await FoodItemModel.find(query);

            if (foodItems.length === 0) {
                return res.status(404).send({ status: 'failed', message: 'No food items found' });
            }

            res.status(200).send({ status: 'success', data: foodItems });
        } catch (error) {
            console.error(error);
            res.status(500).send({ status: 'failed', message: 'An error occurred while fetching food items' });
        }
    }
}

export default FoodItemController