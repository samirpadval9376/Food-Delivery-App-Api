import express from 'express';
const router = express.Router();
import UserController from '../controllers/userController.js';
import checkUserAuth from '../middlewares/auth_middleware.js';
import authenticateToken from '../middlewares/authenticate_token_middleware.js';
import logoutToken from '../middlewares/authenticate_token.js'

// Route Level Middleware - To Protect Route
router.use('/changePassword', checkUserAuth)
router.use('/loggedUser', checkUserAuth)

// Public Routes

router.post('/register', UserController.userRegistration)
router.post('/login', UserController.userLogin)
router.post("/resetPassword", UserController.resetPassword)
router.post("/userPasswordReset/:id/:token", UserController.userPasswordReset)
router.put('/updateProfile', authenticateToken, UserController.updateProfile)
router.post('/logout', checkUserAuth, UserController.logout)

// Protected Routes

router.post('/changePassword', UserController.changeUserPassword)
router.get('/loggedUser', UserController.loggedUser)

export default router