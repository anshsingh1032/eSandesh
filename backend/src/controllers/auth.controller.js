import dotenv from "dotenv"
import User from "../models/User.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import { sendWelcomeEmail } from "../emails/emailHandlers.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

dotenv.config()

const signup = asyncHandler(async (req, res) => {
  const { fullName, email, password } = req.body;

  if ([email, fullName, password].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "all fields are required");
  }
  if (password.length < 6) {
    throw new ApiError(400, "Password must be at least 6 characters");
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ApiError(400, "Invalid email format");
  }
  const existedUser = await User.findOne({ email });
  if (existedUser) {
    throw new ApiError(409, "user with this email already exists ");
  }
  const user = await User.create({
    fullName,
    email,
    password,
  });
  generateTokenAndSetCookie(res, user._id);
  await sendWelcomeEmail(user.email, user.fullName, process.env.CLIENT_URL);

  const createdUser = await User.findById(user._id).select("-password");
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "user registered successfully"));
});

const login = asyncHandler(async(req,res)=>{
    const{email,password}= req.body
    if(!email || !password){
        throw new ApiError(400,"password and email is required")
    }
    const user = await User.findOne({email})
    if(!user){
        throw new ApiError(404,"user does not exists")
    }
    const isPasswordValid = await user.isPasswordCorrect(password)
    if(!isPasswordValid){
        throw new ApiError(401,"Invalid user credentials")
    }
    generateTokenAndSetCookie(res,user._id)
    await user.save();

    const loggedInUser = await User.findById(user._id).select("-password")
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {
                user:loggedInUser
            },
            "User logged in successfully"
        )
    )
})
const logout = asyncHandler(async(req,res)=>{
    return res
    .status(200)
    .clearCookie("token")
    .json(new ApiResponse(200 , {} , "User logged Out"))
})

const updateProfile = asyncHandler(async(req,res)=>{
    const profilePicLocalPath = req.files?.profilePic[0]?.path

    if(!profilePicLocalPath){
        throw new ApiError(400,"Profile picture is required")
    }

    const profilePic = await uploadOnCloudinary(profilePicLocalPath)
    if (!profilePic) {
        throw new ApiError(400,"Profile picture is required 2")
    }
    const updatedUser = await User.findByIdAndUpdate(req.user._id,
        {profilePic:profilePic.url},
        {new:true}
    ).select("-password")
    return res.status(200).json(
        new ApiResponse(200,{updatedUser},"profile updated successfully")
    )
})

export {
    signup,
    login,
    logout,
    updateProfile
 };
