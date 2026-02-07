import express from 'express'
import { addOrderItems, getMyOrders, getOrderById } from '../controllers/orderController.js'
import { protect } from '../middleware/authMiddleware.js'
import { createProductReview } from '../controllers/productController.js'

const router = express.Router()

router.route('/').post(protect, addOrderItems)
router.route('/history').get(protect, getMyOrders)
router.route('/:id/reviews').post(protect, createProductReview)
router.route('/:id').get(protect, getOrderById)

export default router