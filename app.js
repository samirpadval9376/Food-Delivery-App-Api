import dotenv from 'dotenv'
dotenv.config()
import express from 'express'
import cors from 'cors';
import connectDb from './config/connectdb.js'
import userRouts from './routes/userRoutes.js'
import restaurantRoutes from './routes/restaurantRoutes.js'
import OrderRoutes from './routes/orderRoutes.js'
import reviewRoutes from './routes/reviewRoutes.js'



const app = express()
const port = process.env.PORT
const DATABASE_URL = process.env.DATABASE_URL

// CORS Policy
app.use(cors())

// Database Connection
connectDb(DATABASE_URL)

// JSON
app.use(express.json())
app.use(cors({ origin: true }));

//Load Routes
app.use("/api/user", userRouts)
app.use("/api/restaurant", restaurantRoutes)
app.use("/api/order", OrderRoutes)
app.use("/api/review", reviewRoutes)

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`)
})