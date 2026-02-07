import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { errorResponse } from '../utils/responseFormatter.js'

export const protect = async (req, res, next) => {
    let token

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
        token = req.headers.authorization.split(' ')[1]
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.user = await User.findById(decoded.id).select('-password')
        next()
        return
        } catch (error) {
        return errorResponse(res, 401, 'Not authorized, token failed')
        }
    }

    if (!token) {
        return errorResponse(res, 401, 'Not authorized, no token provided')
    }
}

export const admin = (req, res, next) => {
    if (req.user && req.user.isAdmin) {
        next()
    } else {
        return errorResponse(res, 403, 'Not authorized as an admin')
    }
}