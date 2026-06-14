import express from "express"
import dotenv from "dotenv"
import authRoutes from "./routes/auth.route.js"
import messageRoutes from "./routes/message.route.js"
import connectDB from "./db/index.js"
import cookieParser from "cookie-parser";
import cors from "cors"

dotenv.config()

const app = express()
const PORT=process.env.PORT

app.use(express.json({
    limit:"16kb"
}))
app.use(cors({origin:process.env.CLIENT_URL, credentials:true}))
app.use(cookieParser())
app.use("/api/auth",authRoutes)
app.use("/api/messages",messageRoutes)
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  return res.status(statusCode).json({
    success: false,
    message,
  });
});
connectDB()
.then(()=>{
    app.listen(PORT || 8000 ,()=>{
        console.log(`server is listening on ${PORT}`)
    })
})
.catch((err)=>{
    console.log("MongoDB connection failed !!",err);
    
})