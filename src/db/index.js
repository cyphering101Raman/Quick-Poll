import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

// one way of doing it
const connectDB = async () =>{
  try {
    const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);

    console.log(`✅ MongoDB Connected.`);
    console.log(`DB HOST: ${connectionInstance.connection.host}`);

  } catch (error) {
    console.log(`MongoDB Connection Failed: ${error}`);
  }
}

export default connectDB;


// ✅ 2nd way of connecting to MongoDB (Quick Style)

/*
import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
  .then((conn) => {
    console.log("✅ MongoDB connected!");
    console.log("MongoDB Host:", conn.connection.host);
  })
  .catch((err) => {
    console.log("❌ MongoDB connection error:", err);
  });
*/


// 📦 Then in src/index.js → just import this file to trigger DB connect:
// import './db/index.js'


// ⚠️ BUT THE CATCH IS:
// - This method doesn't **block** app.listen()
// - So whether DB connects or fails, server will still start listening

// ❌ That means:
// - Routes that rely on DB (like register, login, savePoll) will crash
// - Your app "looks alive" but can't actually talk to MongoDB
// - You’ll face errors like `MongoNotConnectedError`, or silent 500s

// 🧠 So yeah, it connects — but you better know what you're doing.
// ✅ Use only when DB isn't *critical*, or wrap it properly if it is.
