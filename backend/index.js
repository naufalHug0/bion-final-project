import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import path from 'path'
import mongoose from 'mongoose'
import { fileURLToPath } from 'url'

import authRoutes from './routes/authRoutes.js'
import productRoutes from './routes/productRoutes.js'
import orderRoutes from './routes/orderRoutes.js'

import { notFound, errorHandler } from './middleware/errorMiddleware.js'

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/orders', orderRoutes)

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

app.use('/uploads', express.static(path.join(__dirname, '/uploads')))

app.use(notFound)
app.use(errorHandler)

mongoose.connect(process.env.MONGODB_URI)
.then(() => {
    console.log('Connected to MongoDB')
    const PORT = process.env.PORT || 5001
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
})
.catch(err => console.error('Could not connect to MongoDB', err))