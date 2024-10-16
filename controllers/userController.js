import UserModel from "../models/User.js"
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import transporter from "../config/emailConfig.js"
import tokenBlacklist from "../global_variable.js"

class UserController {
    static userRegistration = async (req, res) => {
        const { name, email, password, password_confirmation, tc, role } = req.body

        // Ensure the role is provided and valid
        const validRoles = ['customer', 'delivery_boy', 'restaurant_admin'];

        if (!validRoles.includes(role)) {
            return res.status(400).send({ "status": "failed", "message": "Invalid role" });
        }

        const user = await UserModel.findOne({ email: email })
        if (user) {
            res.send({ "status": "failed", "message": "Email already exists" })
        }
        else {
            if (name && email && password && password_confirmation && tc && role) {
                if (password === password_confirmation) {
                    try {
                        const salt = await bcrypt.genSalt(10)
                        const hashPassword = await bcrypt.hash(password, salt)
                        const doc = new UserModel({
                            name: name,
                            email: email,
                            password: hashPassword,
                            tc: tc,
                            role: role
                        })
                        await doc.save()
                        const saved_user = await UserModel.findOne({ email: email })

                        // Generate jwt token
                        const token = jwt.sign({ userId: saved_user._id }, process.env.JWT_SECRET_KEY, { expiresIn: '5d' })
                        res.status(201).send({ "status": "success", "message": "Registration Success", "token": token })
                    } catch (error) {
                        console.log(error)
                        res.send({ "status": "failed", "message": "Unable to Register" })
                    }
                } else {
                    res.send({ "status": "failed", "message": "Password & confirm password doesn't match" })
                }
            } else {
                res.send({ "status": "failed", "message": "All fields are required" })
            }
        }
    }

    static userLogin = async (req, res) => {
        try {
            const { email, password } = req.body
            if (email && password) {
                const user = await UserModel.findOne({ email: email })

                if (user != null) {
                    const isPasswordMatch = await bcrypt.compare(password, user.password)

                    if ((user.email === email) && isPasswordMatch) {
                        const existingToken = user.token; // You could also have a way to track user's last token

                        // If there's an existing token, blacklist it
                        if (existingToken) {
                            tokenBlacklist.push(existingToken); // Blacklist the old token
                        }

                        // Generate a new JWT token
                        const newToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: '5d' });

                        // Update user document with the new token if you have a field for that
                        user.token = newToken; // Optionally save the new token in the user model
                        await user.save(); // Save the user document with the new token

                        res.send({ status: "success", message: "Login successfully", token: newToken });
                    } else {
                        res.send({ status: "failed", message: "Email or password is invalid" });
                    }

                } else {
                    res.send({ "status": "failed", "message": "Email is not registered" })
                }

            } else {
                res.send({ "status": "failed", "message": "All fields are required" })
            }
        } catch (error) {
            console.log(error)
            res.send({ "status": "failed", "message": "Unable to Login" })
        }
    }

    static changeUserPassword = async (req, res) => {
        const { password, password_confirmation } = req.body
        if (password && password_confirmation) {
            if (password === password_confirmation) {
                const salt = await bcrypt.genSalt(10)
                const newHashPassword = await bcrypt.hash(password, salt)
                await UserModel.findByIdAndUpdate(req.user._id, { $set: { password: newHashPassword } })

                res.status(201).send({ "status": "success", "messsage": "Password changed successfully" })
            } else {
                res.send({ "status": "failed", "message": "New Password and Confirm New Password doesn't match" })
            }
        } else {
            res.send({ "status": "failed", "message": "All fields are required" })
        }
    }

    static loggedUser = async (req, res) => {
        res.send({ "user": req.user })
    }

    static resetPassword = async (req, res) => {
        const { email } = req.body
        if (email) {
            const user = await UserModel.findOne({ email: email })
            if (user) {
                const secret = user._id + process.env.JWT_SECRET_KEY
                const token = jwt.sign({ userId: user._id }, secret, { expiresIn: '15m' })
                const link = `http://127.0.0.1:3000/api/user/reset/${user._id}/${token}`
                console.log(link)

                // Send Email
                let info = await transporter.sendMail({
                    from: process.env.EMAIL_FROM,
                    to: user.email,
                    subject: "Sizzling - Password Reset Link",
                    html: `<a href=${link}>Click Here</a> to Reset Your Password`
                })

                res.status(201).send({ "status": "success", "messsage": "Password Reset Email Sent... Please Check Your Email", "Info": info })
            }
            else {

                res.status(404).send({ "status": "failed", "messsage": "Email does not exists" })
            }
        } else {

            res.status(404).send({ "status": "failed", "messsage": "Email is required" })
        }
    }

    static userPasswordReset = async (req, res) => {
        const { password, password_confirmation } = req.body
        const { id, token } = req.params
        const user = await UserModel.findById(id)
        const new_secret = user._id + process.env.JWT_SECRET_KEY
        try {
            jwt.verify(token, new_secret)
            if (password && password_confirmation) {
                if (password === password_confirmation) {
                    const salt = await bcrypt.genSalt(10)
                    const newHashPassword = await bcrypt.hash(password, salt)
                    await UserModel.findByIdAndUpdate(user._id, { $set: { password: newHashPassword } })

                    res.status(201).send({ "status": "success", "messsage": "Password Reset Successfully" })

                } else {

                    res.status(404).send({ "status": "failed", "messsage": "New Password and New Confirm Password doesn't match" })
                }
            } else {

                res.status(404).send({ "status": "failed", "messsage": "All fields are required" })
            }
        } catch (error) {
            console.log(error)

            res.status(401).send({ "status": "failed", "messsage": "Invalid Token" })
        }
    }

    static updateProfile = async (req, res) => {
        const userId = req.user.userId; // Get the authenticated user's ID from the token
        console.log(userId)

        try {
            // Extract fields from request body
            const { name, email } = req.body;

            // Create an object that holds the fields to update
            let updateData = {};

            // Only add the fields that are present in the request body and are not undefined or null
            if (name !== undefined) updateData.name = name;
            if (email !== undefined) updateData.email = email;

            // Check if there's any field to update
            if (Object.keys(updateData).length === 0) {
                return res.status(400).send({ status: 'failed', message: 'No fields provided to update' });
            }

            // Update the user in the database, using Mongoose validation (runValidators: true)
            const updatedUser = await UserModel.findByIdAndUpdate(
                userId,                 // The ID of the user to update
                { $set: updateData },    // The fields to update
                { new: true, runValidators: true }   // Return the updated user data and run validation
            );

            // If the user is not found (unlikely, but possible)
            if (!updatedUser) {
                return res.status(404).send({ status: 'failed', message: 'User not found' });
            }

            // Send success response with the updated user data
            res.status(200).send({
                status: 'success',
                message: 'Profile updated successfully',
                user: updatedUser
            });

        } catch (error) {
            console.log(error);
            res.status(500).send({ status: 'failed', message: 'An error occurred while updating the profile' });
        }
    }



    static logout = async (req, res) => {
        try {
            const authHeader = req.headers['authorization'];

            // Ensure that the Authorization header is present
            if (!authHeader) {
                return res.status(400).send({ status: 'failed', message: 'Authorization header is required' });
            }

            // Split to get the token from the "Bearer <token>" string
            const token = authHeader.split(' ')[1];

            // Check if the token is provided
            if (!token) {
                return res.status(400).send({ status: 'failed', message: 'Token not provided' });
            }

            // Push the token to the blacklist
            tokenBlacklist.push(token);
            console.log(token)

            res.status(200).send({ status: 'success', message: 'Logout successful, token blacklisted' });
        } catch (error) {
            console.error(error);
            res.status(500).send({ status: 'failed', message: 'An error occurred during logout' });
        }
    }


}

export default UserController