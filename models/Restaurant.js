import mongoose, { Schema } from "mongoose";


// Define Schema    
const restaurantSchema = new mongoose.Schema({
    name: { type: String, required: true },
    address: { type: String, required: true },
    cuisine: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    owner: { type: String, required: true },
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    reviewId: { type: mongoose.Schema.Types.ObjectId, ref: 'review' },
    tc: { type: Boolean, required: true }
})

// Model
const RestaurantModel = mongoose.model('restaurant', restaurantSchema);

export default RestaurantModel