import connectDB from "./db/index.js"
import {app} from "./app.js"
import dotenv from "dotenv"
dotenv.config();

const PORT = process.env.PORT || 3000;

connectDB()
.then(()=>{
  app.listen(PORT, ()=>{
    console.log(`Server Up and Running @ ${PORT}`);
  })
})
.catch((error) =>{
    console.log(`MongoDB Connection Failed: ${error}`);
})
