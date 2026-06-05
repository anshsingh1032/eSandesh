import Message from "../models/Message.model.js";
import User from "../models/User.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

export const getAllContacts = asyncHandler(async(req,res)=>{
    const logedInUser = req.user._id;
    const filteredUsers = await User.find({_id:{$ne:logedInUser}}).select("-password")
    res.status(200).json(
        new ApiResponse(200,filteredUsers)
    )
})

export const getMessagesByUserId = asyncHandler(async(req,res)=>{
    const myId = req.user._id
    const{id:toChatId} = req.params

    const messages = await Message.find({
        $or:[
            {senderId:myId, receiverId:toChatId},
            {senderId:toChatId,receiverId:myId}
        ]
    })
    res.status(200).json(
        new ApiResponse(200,messages)
    )
})

export const sendMessage = asyncHandler(async(req,res)=>{
    // console.log("body:", req.body);
    // console.log("file:", req.file);
    // console.log("content-type:", req.headers["content-type"]);
    const {text}= req.body;
    const {id:receiverId} = req.params
    const senderId = req.user._id

    if (!text && !req.file) {
        throw new ApiError(400, "Message must contain text or an image");
    }
    if (senderId.equals(receiverId)) {
        throw new ApiError(400, "Cannot send messages to yourself.");
    }
    const receiverExists = await User.exists({ _id: receiverId });
    if (!receiverExists) {
      throw new ApiError(400, "Receiver not found." );
    }
    let imageUrl;
    if (req.file) {
        const uploadedImage = await uploadOnCloudinary(req.file.path);
        if (!uploadedImage) {
            throw new ApiError(400, "Image upload failed, please try again");
        }
        imageUrl = uploadedImage.url;
    }
    const newMessage = await Message.create({
        senderId,
        receiverId,
        text,
        image:imageUrl
    })
    return res.status(201).json(
        new ApiResponse(201, { newMessage }, "Message sent successfully")
    );
})

export const getChatPartners = asyncHandler(async(req,res)=>{
    const loggedInUser = req.user._id;
    const message = await Message.find({
        $or:[{senderId:loggedInUser},{receiverId:loggedInUser}]
    })

    const chatPartnerIds = [
        ...new Set(
            message.map((msg)=> msg.senderId.toString()===loggedInUser.toString()
             ? msg.receiverId.toString()
              : msg.senderId.toString()
            )
        )
    ]
    const chatPartners = await User.find({_id:{$in:chatPartnerIds}}).select("-password")
    return res.status(201).json(
        new ApiResponse(201, { chatPartners })
    );
})