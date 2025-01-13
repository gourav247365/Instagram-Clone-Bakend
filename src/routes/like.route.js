import {Router} from 'express'
import{
  toggleLike,
  isLiked,
  getLikes
} from '../controllers/like.controller.js'
import {verifyJWT} from '../middlewares/auth.middleware.js'

const router= Router()
router.use(verifyJWT)

router.route('/:postId').get(getLikes)
router.route('/is-liked/:postId').get(isLiked)
router.route('/toggle-like/:postId').post(toggleLike)

export default router