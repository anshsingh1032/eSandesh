import User from "../models/User.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken"

export const protectRoute = asyncHandler(async(req,_,next)=>{
    try {
        const token = req.cookies?.token || req.header("Authorization")?.replace("Bearer ","")
        if(!token){
            throw new ApiError(401,"Unauthorized request")
        }
        const decodedToken = jwt.verify(token,process.env.TOKEN_SECRET)
        const user = await User.findById(decodedToken?.userId).select("-password")
        if (!user) {
            throw new ApiError(401,"Invalid Access Token")
        }
        req.user = user
        next()
    } catch (error) {
        throw new ApiError(401,error?.message || "Invalid Access Token")
    }
})