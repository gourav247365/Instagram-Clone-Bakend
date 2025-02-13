import { Like } from '../models/like.model.js'
import { asyncHandler } from '../utilities/AsyncHandler.js'
import { ApiError } from '../utilities/ApiError.js'
import { ApiResponse } from '../utilities/ApiResponse.js'

const toggleLike= asyncHandler(async(req,res)=> {
  const {postId}= req.params

  const deletedLike= await Like.findOneAndDelete({post: postId, likedBy: req.user._id})
  
  if(!deletedLike) {
    const like= await Like.create(
      {
        post: postId,
        likedBy: req.user._id
      }
    )

    return res.status(200)
    .json(
      new ApiResponse(
        200,
        like,
        'Like Created Successfully'
      )
    )
  }

  return res.status(200)
  .json(
    new ApiResponse(
      200,
      deletedLike,
      'Like Removed Successfully'
    )
  )
})

const getLikes= asyncHandler(async(req,res)=> {
  const {postId}= req.params || req.body

  const likes= await Like.find({post: postId})

  if(!likes) {
    throw new ApiError(402, 'Something Went Wrong While Fetching Likes')
  }

  return res.status(200)
  .json(
    new ApiResponse(
      200,
      likes,
      "likes Fetched Successfully"
    )
  )
})

const isLiked= asyncHandler(async(req,res)=> {
  
  const {postId}= req.params 
  const like= await Like.findOne({post: postId, likedBy: req.user._id})  
  
  return res.status(200)
  .json(
    new ApiResponse(
      200,
      {isLiked: like ? true : false},
      'Like Status Fetched Successfully'
    )
  )
})

export {
  toggleLike,
  getLikes,
  isLiked
}