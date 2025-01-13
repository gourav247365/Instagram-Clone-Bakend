import { Comment } from "../models/comment.model.js";
import { asyncHandler } from "../utilities/AsyncHandler.js"
import { ApiError } from "../utilities/ApiError.js"
import { ApiResponse } from "../utilities/ApiResponse.js"
import mongoose from "mongoose";

const addComment = asyncHandler(async (req, res) => {
  const { content, post } = req.body

  const comment = await Comment.create({
    content,
    commentedBy: req.user?._id,
    post,
  })

  if (!comment) {
    throw new ApiError(401, 'Something Went Wrong While Creating Comment')
  }

  return res.status(200)
    .json(
      new ApiResponse(
        200,
        comment,
        'Comment Added Successfully'
      )
    )

})

const getComments = asyncHandler(async (req, res) => {
  const { postId } = req.params

  const comments = await Comment.aggregate([
    {
      $match: { post: new mongoose.Types.ObjectId(postId) }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'commentedBy',
        foreignField: '_id',
        as: 'userDetails',
        pipeline: [
          {
            $project: {
              username: 1,
              displayPicture:1
            }
          }
        ]
      }
    },
    {
      $addFields: {
        username: {
          $first: '$userDetails.username'
        },
        displayPicture: {
          $first: '$userDetails.displayPicture'
        }
      }
    },
  ])

    if(!comments){
      throw new ApiError('Something Went Wrong While Fetching Comments')
    }

  return res.status(200)
    .json(
      new ApiResponse(
        200,
        comments,
        'Comments Fetched Successfully'
      )
    )
})

const deleteComment = asyncHandler(async(req,res) => {
  const {commentId} = req.params

  const comment= await Comment.findByIdAndDelete(commentId)

  if(!comment) {
    throw new ApiError(404, 'Comment Not Found')
  }

  return res.status(200)
  .json(
    new ApiResponse(
      200,
      comment,
      'Comment Deleted Successfully'
    )
  )
})

export {
  addComment,
  getComments,
  deleteComment
} 