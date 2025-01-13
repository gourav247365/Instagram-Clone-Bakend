import { Router } from "express";
import { sendMessage,unsendMessage,getMessagesByChatId } from "../controllers/message.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router= Router()
router.use(verifyJWT)

router.route('/send').post(sendMessage)
router.route('/unsend/:messageId').delete(unsendMessage)
router.route('/:chatId').get(getMessagesByChatId)

export default router