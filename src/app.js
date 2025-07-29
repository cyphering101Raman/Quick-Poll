import dotenv from "dotenv"
dotenv.config();

import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import userRoutes from "./routes/user.routes.js"
import pollRoutes from "./routes/poll.routes.js"

const app = express()

app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}))

app.use(express.json())
app.use(cookieParser())

app.use("/api/v1/users", userRoutes)
app.use("/api/v1/", pollRoutes)

export {app}