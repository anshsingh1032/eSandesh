import express from "express"
import dotenv from "dotenv"
import authRoutes from "./routes/auth.route.js"
import messageRoutes from "./routes/message.route.js"
import connectDB from "./db/index.js"

dotenv.config()

const app = express()
const PORT=process.env.PORT

app.use(express.json({
    limit:"16kb"
}))

app.use("/api/auth",authRoutes)
app.use("/api/messages",messageRoutes)

connectDB()
.then(()=>{
    app.listen(PORT || 8000 ,()=>{
        console.log(`server is listening on ${PORT}`)
    })
})
.catch((err)=>{
    console.log("MongoDB connection failed !!",err);
    
})