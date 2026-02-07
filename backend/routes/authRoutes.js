import express from 'express'
import { registerUser, loginUser, updateUserProfile, deleteUserProfile } from '../controllers/authController.js'
import { protect } from '../middleware/authMiddleware.js'
import { uploadUser } from '../middleware/uploadMiddleware.js'

const router = express.Router()

router.post('/register', registerUser)
router.post('/login', loginUser)
router.put('/profile', protect, uploadUser.single('avatar'), updateUserProfile)
router.delete('/profile', protect, deleteUserProfile) // FOR TESTING PURPOSES ONLY

export default router