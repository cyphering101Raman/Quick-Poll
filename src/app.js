import dotenv from "dotenv"
dotenv.config();

import express from "express"
import cors from "cors"

const app = express()

app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}))

app.get("/", (req, res)=>{
  res.send("Home page.")
})
app.get("/user", (req, res)=>{
  res.send("User page.")
})


export {app}