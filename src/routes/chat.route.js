import { Router } from "express";
import { findOrCreateChat,getCurrentUserChats } from "../controllers/chat.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router= Router()
router.use(verifyJWT)

router.route('/:user2').post(findOrCreateChat)
router.route('/current-user').get(getCurrentUserChats)

export default router