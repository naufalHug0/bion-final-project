import User from '../models/User.js'
import jwt from 'jsonwebtoken'
import { successResponse, errorResponse } from '../utils/responseFormatter.js'

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' })

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body
        const user = await User.findOne({ email })

        if (user && (await user.matchPassword(password))) {
        successResponse(res, 200, 'Login Successful', {
            _id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            isAdmin: user.isAdmin,
            token: generateToken(user._id),
        })
        } else {
            errorResponse(res, 401, 'Invalid email or password')
        }
    } catch (error) {
        errorResponse(res, 500, error.message)
    }
}

export const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body
        const userExists = await User.findOne({ email })

        if (userExists) return errorResponse(res, 400, 'User already exists')

        const user = await User.create({ name, email, password })

        if (user) {
        successResponse(res, 201, 'User registered successfully', {
            _id: user._id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id),
        })
        } else {
        errorResponse(res, 400, 'Invalid user data')
        }
    } catch (error) {
        errorResponse(res, 500, error.message)
    }
}

export const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)

        if (user) {
        user.name = req.body.name || user.name
        user.email = req.body.email || user.email
        if (req.body.password) user.password = req.body.password
        
        if (req.file) {
            user.avatar = req.file.path.replace(/\\/g, "/") 
        }

        const updatedUser = await user.save()
        successResponse(res, 200, 'Profile updated', {
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            avatar: updatedUser.avatar,
            token: generateToken(updatedUser._id),
        })
        } else {
        errorResponse(res, 404, 'User not found')
        }
    } catch (error) {
        errorResponse(res, 500, error.message)
    }
}

//  !FOR TESTING PURPOSES ONLY

export const deleteUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
        if (user) {
            await User.deleteOne({ _id: req.user._id })
            successResponse(res, 200, 'User deleted successfully', null)
        } else {
            errorResponse(res, 404, 'User not found')
        }
    } catch (error) {
        errorResponse(res, 500, error.message)
    }
}