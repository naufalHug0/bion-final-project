import express from 'express'
import { getProducts, getProductById, createProduct, updateProduct, deleteProduct } from '../controllers/productController.js'
import { protect, admin } from '../middleware/authMiddleware.js'
import { uploadProduct } from '../middleware/uploadMiddleware.js'

const router = express.Router()

router.route('/')
    .get(getProducts)
    .post(protect, uploadProduct.single('image'), createProduct)

router.route('/:id')
    .get(getProductById)
    .put(protect, uploadProduct.single('image'), updateProduct)
    .delete(protect, deleteProduct)

export default router