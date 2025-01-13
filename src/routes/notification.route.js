import {Router} from 'express'
import {
  createNotification,
  deleteNotification,
  getCurrentUserNotifications,
  updateRequestNotification,
  deleteRequestNotification
} from '../controllers/notification.controller.js'
import { verifyJWT } from '../middlewares/auth.middleware.js'

const router= Router()
router.use(verifyJWT)

router.route('/create').post(createNotification)
router.route('/current-user').get(getCurrentUserNotifications)
router.route('/accept').patch(updateRequestNotification)
router.route('/delete/:id').delete(deleteNotification)
router.route('/delete-request-notification').delete(deleteRequestNotification)

export default router