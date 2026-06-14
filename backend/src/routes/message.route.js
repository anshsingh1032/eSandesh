import express from "express"
import { protectRoute } from "../middlewares/auth.middleware.js"
import { getAllContacts, getChatPartners, getMessagesByUserId , sendMessage} from "../controllers/message.controller.js"
import { upload } from "../middlewares/multer.middleware.js"
import { arcjetProtection } from "../middlewares/arcjet.middleware.js"

const router = express.Router()

router.use(arcjetProtection,protectRoute)

router.route("/contacts").get(getAllContacts)
router.route("/chats").get(getChatPartners)
router.route("/:id").get(getMessagesByUserId)
router.route("/send/:id").post(upload.single("image"),sendMessage)

export default router