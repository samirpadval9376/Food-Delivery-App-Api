import jwt from 'jsonwebtoken';
import tokenBlacklist from '../global_variable.js';

const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Assuming "Bearer TOKEN"

    if (!token) {
        return res.status(401).send({ status: 'failed', message: 'Access denied: No token provided' });
    }

    // Check if the token is in the blacklist
    if (tokenBlacklist.includes(token)) {
        return res.status(403).send({ status: 'failed', message: 'Token is blacklisted, please login again' });
    }


    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
        if (err) {
            return res.status(403).send({ status: 'failed', message: 'Invalid Token' });
        }
        req.user = user; // Attach user info to request object
        next();
    });
};

export default authenticateToken;