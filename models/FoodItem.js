import mongoose from "mongoose";

// Food Item Schema
const foodItemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String },
    image: { type: String },
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'restaurants', required: true },
}, { timestamps: true })

// Model
const FoodItemModel = mongoose.model('foodItem', foodItemSchema)

export default FoodItemModel