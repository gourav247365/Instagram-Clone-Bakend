import { Router } from 'express';
import { 
  findReation,
  toggleRelation, 
  getCurrentUserFollowers, 
  getCurrentUserFollowings,
  acceptFollowRequest,
  deleteRequest,
  deleteRelation
} from '../controllers/relation.controller.js'
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router= Router()
router.use(verifyJWT)

router.route('/toggle/:username').post(toggleRelation)
router.route('/user/:username').get(findReation) 
router.route('/followers').get(getCurrentUserFollowers)
router.route('/followings').get(getCurrentUserFollowings)
router.route('/accept').patch(acceptFollowRequest)
router.route('/delete').patch(deleteRequest)
router.route('/delete-relation').delete(deleteRelation)


export default router