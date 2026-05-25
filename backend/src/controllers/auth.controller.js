import User from "../models/User.model.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js"

const signup = asyncHandler(async(req, res)=>{
    const {fullName, email, password} = req.body

if ([email,fullName,password].some((field)=>field?.trim()==="")
    ) {
        throw new ApiError(400,"all fields are required")
    }
    if (password.length < 6) {
        throw new ApiError(400,"Password must be at least 6 characters")
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw new ApiError(400,"Invalid email format")
    }
    const existedUser = await User.findOne({email})
    if (existedUser) {
        throw new ApiError(409,"user with this email already exists ")
    }
    const user = await User.create({
        fullName,
        email,
        password,
    })
generateTokenAndSetCookie(res, user._id);
    const createdUser = await User.findById(user._id).select(
        "-password"
    )
    return res.status(201).json(
        new ApiResponse(200,createdUser,"user registered successfully")
    )
})
export {
    signup
}