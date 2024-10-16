import mongoose from 'mongoose'

// Order Schema
const orderSchema = new mongoose.Schema({
    restaurantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'restaurant',
        required: true
    },
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',  // Assuming User model exists for customers
        required: true
    },
    deliveryBoyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'  // Assuming User model exists for delivery persons
    },
    items: [{
        foodItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'foodItem', required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true }
    }],
    totalPrice: { type: Number, required: true },
    status: {
        type: String,
        enum: ['pending', 'completed', 'cancelled'],
        default: 'pending'
    },
    orderTime: { type: Date, default: Date.now },
    deliveryTime: { type: Date },
    deliveryAddress: { type: String }, // Optional: Add delivery address if needed
    specialInstructions: { type: String } // Optional: Special instructions for the order
}, { timestamps: true });

const OrderModel = mongoose.model('order', orderSchema);

export default OrderModel