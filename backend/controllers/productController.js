import Order from '../models/Order.js'
import Product from '../models/Product.js'
import { successResponse, errorResponse } from '../utils/responseFormatter.js'

export const getProducts = async (req, res) => {
    try {
        const products = await Product.find({})
        successResponse(res, 200, 'Product List', products)
    } catch (error) {
        errorResponse(res, 500, error.message)
    }
}

export const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
        if (product) {
        successResponse(res, 200, 'Product Detail', product)
        } else {
        errorResponse(res, 404, 'Product not found')
        }
    } catch (error) {
        errorResponse(res, 500, error.message)
    }
}

export const createProduct = async (req, res) => {
    try {
        const { name, price, description, brand, category, countInStock } = req.body
        
        if(!req.file) return errorResponse(res, 400, 'Image is required')
        const imagePath = req.file.path.replace(/\\/g, "/")

        const product = new Product({
        name,
        price,
        user: req.user._id,
        image: imagePath,
        brand,
        category,
        countInStock,
        description,
        })

        const createdProduct = await product.save()
        successResponse(res, 201, 'Product Created', createdProduct)
    } catch (error) {
        errorResponse(res, 500, error.message)
    }
}

export const createProductReview = async (req, res) => {
    const { rating, comment, orderId } = req.body
    const productId = req.params.id

    const product = await Product.findById(productId)
    const order = await Order.findById(orderId)

    if (product && order) {
        const orderItem = order.orderItems.find(
            (item) => item.product.toString() === productId.toString()
        )

        if (!orderItem) {
            errorResponse(res, 400, 'Product not found in this order')
            return
        }
        if (orderItem.isRated) {
            errorResponse(res, 400, 'You have already rated this item for this order')
            return 
        }

        const review = {
            name: req.user.name,
            rating: Number(rating),
            comment,
            user: req.user._id,
        }

        if (!product.reviews) {
            product.reviews = []
        }

        product.reviews.push(review)
        product.numReviews = product.reviews.length
        
        product.rating =
            product.reviews.reduce((acc, item) => item.rating + acc, 0) /
            product.reviews.length

        await product.save()

        orderItem.isRated = true
        await order.save()

        successResponse(res, 201, 'Review Added')
    } else {
        errorResponse(res, 500, 'Product or Order not found')
    }
}

export const updateProduct = async (req, res) => {
    try {
        const { name, price, description, brand, category, countInStock } = req.body
        const product = await Product.findById(req.params.id)

        if (product) {
        product.name = name || product.name
        product.price = price || product.price
        product.description = description || product.description
        product.brand = brand || product.brand
        product.category = category || product.category
        product.countInStock = countInStock || product.countInStock
        
        if(req.file) {
            product.image = req.file.path.replace(/\\/g, "/")
        }

        const updatedProduct = await product.save()
        successResponse(res, 200, 'Product Updated', updatedProduct)
        } else {
        errorResponse(res, 404, 'Product not found')
        }
    } catch (error) {
        errorResponse(res, 500, error.message)
    }
}

export const deleteProduct = async (req, res) => {
        try {
        const product = await Product.findById(req.params.id)
        if (product) {
            await Product.deleteOne({ _id: req.params.id })
            successResponse(res, 200, 'Product Removed', null)
        } else {
            errorResponse(res, 404, 'Product not found')
        }
        } catch (error) {
        errorResponse(res, 500, error.message)
        }
}