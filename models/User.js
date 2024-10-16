import mongoose from "mongoose";

// Define schema
const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: false },
    email: { type: String, required: true, trim: false },
    password: { type: String, required: true, trim: false },
    role: { type: String, required: true, enum: ['customer', 'delivery_boy', 'restaurant_admin'], default: 'customer' },
    tc: { type: Boolean, required: true }
})

// Model
const UserModel = mongoose.model("user", userSchema)

export default UserModel