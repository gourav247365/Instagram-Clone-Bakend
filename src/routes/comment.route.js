import { addComment,deleteComment,getComments } from "../controllers/comment.controller.js";
import {Router} from "express"
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router= Router()
router.use(verifyJWT)

router.route('/add').post(addComment)
router.route('/get-comments/:postId').get(getComments)
router.route('/delete/:commentId').delete(deleteComment)

export default router