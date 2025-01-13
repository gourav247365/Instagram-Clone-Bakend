import { Router } from 'express'
import { 
  getCurrentUser,
  loginUser,
  logoutUser, 
  registerUser, 
  getUserByUsername,
  // isUserLoggedIn,
  refreshAccessToken,
  updateDisplayPicture,
  removeDisplayPicture,
  getCurrentUserRealtedAccountsCount
} from '../controllers/user.controller.js'
import { verifyJWT } from '../middlewares/auth.middleware.js'
import { upload } from '../middlewares/multer.middleware.js'

const router = Router()

router.route('/register').post(registerUser)
router.route('/login').post(loginUser)
router.route('/current-user').get(verifyJWT,getCurrentUser)
router.route('/current-user-related-accounts-count').get(verifyJWT,getCurrentUserRealtedAccountsCount)
router.route('/logout').post(verifyJWT,logoutUser)
// router.route('/login-status').get(verifyJWT,isUserLoggedIn)
router.route('/user/:username').get(verifyJWT,getUserByUsername)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/update-dp").patch(verifyJWT,upload.single("displayPicture"),updateDisplayPicture)
router.route('/remove-dp').patch(verifyJWT,removeDisplayPicture)

export default router