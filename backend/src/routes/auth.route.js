import express from "express"
import { signup,login,logout,updateProfile } from "../controllers/auth.controller.js"
import { protectRoute } from "../middlewares/auth.middleware.js"
import { upload } from "../middlewares/multer.middleware.js"

const router = express.Router()

router.route("/signup").post(signup)
router.route("/login").post(login)
router.route("/logout").post(logout)

router.route("/update-profile").put(protectRoute,
    upload.fields([{
        name:"profilePic",
        maxCount:1
    }])
    ,updateProfile)

export default router