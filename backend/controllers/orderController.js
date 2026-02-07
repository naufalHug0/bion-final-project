import Order from '../models/Order.js'
import Product from '../models/Product.js'
import { successResponse, errorResponse } from '../utils/responseFormatter.js'

export const addOrderItems = async (req, res) => {
    const {
        orderItems,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
    } = req.body

    if (orderItems && orderItems.length === 0) {
        return errorResponse(res, 400, 'No order items')
    } else {
        try {
        const order = new Order({
            orderItems: orderItems.map((x) => ({
            ...x,
            product: x.product,
            _id: undefined,
            })),
            user: req.user._id,
            shippingAddress,
            isPaid: true,
            isDelivered: true,
            paymentMethod,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice,
        })

        for (const item of orderItems) {
            const product = await Product.findById(item.product)

            if (product) {
                product.countInStock = product.countInStock - item.qty
                
                await product.save()
            }
        }

        const createdOrder = await order.save()
        successResponse(res, 201, 'Order Created', createdOrder)
        } catch (error) {
            errorResponse(res, 500, error.message)
        }
    }
}

export const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('user', 'name email')

        if (order) {
        successResponse(res, 200, 'Order Details', order)
        } else {
        errorResponse(res, 404, 'Order not found')
        }
    } catch (error) {
        errorResponse(res, 500, error.message)
    }
}

export const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 })
        
        successResponse(res, 200, 'My Orders', orders)
    } catch (error) {
        errorResponse(res, 500, error.message)
    }
}