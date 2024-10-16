import jwt from 'jsonwebtoken'
import UserModel from '../models/User.js'
import tokenBlacklist from '../global_variable.js'

var checkUserAuth = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Extract token from header

    if (!token) {
        return res.status(401).send({ status: 'failed', message: 'Access denied: No token provided' });
    }

    // Check if the token is in the blacklist
    if (tokenBlacklist.includes(token)) {
        return res.status(403).send({ status: 'failed', message: 'Token is blacklisted, please login again' });
    }

    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
        if (err) {
            return res.status(403).send({ status: 'failed', message: 'Invalid token' });
        }
        req.user = user; // Attach user object to request
        next(); // Pass control to the next handler
    });
}
export default checkUserAuth