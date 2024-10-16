import jwt from 'jsonwebtoken'
import RestaurantModel from '../models/restaurant.js';
import UserModel from '../models/User.js';

const checkAdminRole = async (req, res, next) => {
    let token
    const authorization = req.headers['authorization'];

    if (!authorization || !authorization.startsWith('Bearer')) {
        return res.status(401).send({ status: 'failed', message: 'Access token is missing or invalid' });
    }

    try {

        token = authorization.split(' ')[1]
        const { userId } = jwt.verify(token, process.env.JWT_SECRET_KEY)
        const user = await UserModel.findById(userId)

        // Check if the user role is 'restaurant_admin'
        if (user.role === 'restaurant_admin') {
            req.user = user;
            next()
        } else {
            return res.status(403).send({ "status": "failed", "message": "Forbidden: You do not have permission" });
        }
    } catch (error) {
        console.log(error)
        return res.status(401).send({ "status": "failed", "message": "Unauthorized: Invalid token" });
    }
}

export default checkAdminRole