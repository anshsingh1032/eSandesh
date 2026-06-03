import express from "express"
import { signup,login,logout,updateProfile } from "../controllers/auth.controller.js"
import { protectRoute } from "../middlewares/auth.middleware.js"
import { upload } from "../middlewares/multer.middleware.js"
import { arcjetProtection } from "../middlewares/arcjet.middleware.js"

const router = express.Router()

router.use(arcjetProtection)

router.route("/signup").post(signup)
router.route("/login").post(login)
router.route("/logout").post(logout)

router.route("/update-profile").put(protectRoute,
    upload.fields([{
        name:"profilePic",
        maxCount:1
    }])
    ,updateProfile)

router.route("/check").get(protectRoute,(req,res)=>res.status(200).json(req.user))

export default router