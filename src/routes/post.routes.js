import { Router } from 'express';
import {
  getExpolorePosts,
  getPostById,
  deletePost,
  publishPost,
  getCurrentUserPosts,
  getCurrentUserFollowingPosts,
  updatePost,
  getPostsByUserId
} from "../controllers/post.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { upload } from "../middlewares/multer.middleware.js"

const router = Router();
router.use(verifyJWT) // Apply verifyJWT middleware to all routes in this file

router.route("/explore").get(getExpolorePosts)
router.route("/create").post(upload.single("postFile"),publishPost)
router.route("/p/:postId")
  .get(getPostById)
  .delete(deletePost)
  .patch(updatePost)
router.route('/current').get(getCurrentUserPosts)
router.route('/following').get(getCurrentUserFollowingPosts)
router.route('/:userId').get(getPostsByUserId)
// router.route("/toggle/publish/:PostId").patch(togglePublishStatus);

export default router