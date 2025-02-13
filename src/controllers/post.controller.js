import mongoose from 'mongoose'
import { Post } from '../models/post.model.js'
import { Relation } from '../models/relation.model.js'
import { asyncHandler } from '../utilities/AsyncHandler.js'
import { ApiError } from '../utilities/ApiError.js'
import { ApiResponse } from '../utilities/ApiResponse.js'
import { uploadOnCloudinary, deleteFromCloudinary } from "../utilities/cloudinary.js"

const getExpolorePosts = asyncHandler(async (req, res) => {

  const { page = 1, limit = 10 } = req.query
  const agg = [
    {
      $match: { postedBy:{ $ne: new mongoose.Types.ObjectId(req.user._id) } }
    },
    {
      $project: {postFile: 1,postedBy: 1}
    },
    {
      $lookup: {
        from: 'users',
        localField: 'postedBy',
        foreignField: '_id',
        as: 'user',
        pipeline: [
          {
            $project: {
              isPrivate: 1 
            }
          }
        ]
      }
    },
    {
      $addFields: {
        isPrivate: {
          $first: '$user.isPrivate'
        }
      }
    },
    {
      $match: { isPrivate: false }
    },
    {
      $project: { 
        isPrivate: 0,
        user: 0
      }
    },
    {
      $sort: { createdAt: -1 } 
    }
  ]

  if (!agg) {
    throw new ApiError(401, 'Something Went Wrong While Fetching Explore Posts')
  }

  const options = {
    page,
    limit
  }

  const explorePosts = await Post.aggregatePaginate(Post.aggregate(agg), options)

  if (!explorePosts) {
    throw new Error('Error fetching paginated posts')
  }

  return res.status(200)
    .json(
      new ApiResponse(
        200,
        explorePosts,
        'Explore Posts Fetched Sucessfully'
      )
    )
})

const getCurrentUserPosts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 9 } = req.query
  const options = {
    page,
    limit
  }

  const currentUserPosts = await Post.aggregate ([
    {
      $match: { postedBy: new mongoose.Types.ObjectId(req.user?._id) }
    },
    {
      $project: {
        postFile: 1,
        createdAt: 1
      }
    },
    {
      $facet: {
        totalCount: [
          { $count: "count" } 
        ],
        posts: [
          { $sort: { createdAt: -1 } }, 
          { $limit: 9 } 
        ]
      }
    },
    {
      $project: {
        postsCount: { $arrayElemAt: ["$totalCount.count", 0] }, 
        posts: 1  
      }
    }
  ])

  return res.status(200)
    .json(
      new ApiResponse(
        200,
        currentUserPosts[0],
        'Current User Posts Fetched Successfully'
      )
    )
})

const publishPost = asyncHandler(async (req, res) => {
  const { caption, location } = req.body

  const postFileLocalPath = req.file?.path

  if (!postFileLocalPath) {
    throw new ApiError(401, 'PostFile File is Missing')
  }

  const postFile = await uploadOnCloudinary(postFileLocalPath)

  if (!postFile) {
    throw new ApiError(400, 'Error While Uploading PostFile')
  }

  const post = await Post.create(
    {
      postFile: postFile.url,
      caption,
      location,
      postedBy: req.user._id
    }
  )

  if (!post) {
    throw new ApiError(500, 'somthing went Wrong while Creating the Post')
  }

  return res.status(200)
    .json(
      new ApiResponse(
        200,
        post,
        'Post Created Suceesfully'
      )
    )
})

const getPostById = asyncHandler(async (req, res) => {
  const { postId } = req.params

  const post = await Post.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(postId)
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'postedBy',
        foreignField: '_id',
        as: 'userDetails',
        pipeline: [
          {
            $project: {
              username: 1,
              displayPicture: 1
            }
          }
        ]
      }
    },
    {
      $addFields: {
        username: {
          $first: '$userDetails.username',
        },
        displayPicture:
        {
          $first: '$userDetails.displayPicture'
        }
      }
    },
    {
      $project: {
        userDetails: 0
      }
    }
  ])

  if (!post.length) {
    throw new ApiError(404, 'Post Not Found')
  }


  return res.status(200)
    .json(
      new ApiResponse(
        200,
        post[0],
        'Post Fetched Successfully'
      )
    )
})

const updatePost = asyncHandler(async (req, res) => {
  const { postId } = req.params
  const { caption, location } = req.body
  //TODO: update video details like title, description, thumbnail

  const updatedPost = await Post.findByIdAndUpdate(
    postId,
    {
      $set: {
        caption,
        location
      }
    },
    {
      new: true
    }
  )

  if (!updatePost) {
    throw new ApiError(401, 'Something Went Wrong While Updating the Post')
  }

  return res.status(200)
    .json(
      new ApiResponse(
        200,
        updatedPost,
        'Post Updated Successfully'
      )
    )
})

const deletePost = asyncHandler(async (req, res) => {
  const { postId } = req.params
  //TODO: delete post
  //also delete from cloudinary


  const deletedPost = await Post.findByIdAndDelete(postId)

  if (!deletedPost) {
    throw new ApiError(500, 'somthing went Wrong while Deleting the Post')
  }

  await deleteFromCloudinary(deletedPost.postFile)

  return res.status(200)
    .json(
      new ApiResponse(
        200,
        {},
        'Post Deleted Successfully'
      )
    )
})

const getCurrentUserFollowingPosts = asyncHandler(async (req, res) => {

  const { page = 1, limit = 10, lastSeen } = req.query // Pagination and lastSeen timestamp
  const userId = req.user?._id

  const LIMIT = parseInt(limit)

  const followedUsers = await Relation.find({ follower: userId }, { following: 1, _id: 0 })
  const followedIds = followedUsers.map(followed => followed.following)
  followedIds.push(userId)
  const query = {
    postedBy: { $in: followedIds },
  }

  if (lastSeen) {
    query.createdAt = { $lt: new Date(lastSeen) }
  }

  const posts = await Post.aggregate([
    { $match: query },
    { $sort: { createdAt: -1 } },
    {
      $lookup: {
        from: 'users', localField: 'postedBy', foreignField: '_id', as: 'userInfo', pipeline: [
          { $project: { username: 1, displayPicture: 1 } }
        ]
      }
    },
    {
      $addFields: {
        displayPicture: { $first: '$userInfo.displayPicture' },
        username: { $first: '$userInfo.username' }
      }
    },
    { $project: { username: 1, displayPicture: 1, postFile: 1, caption: 1, location: 1, createdAt: 1 } },
    { $limit: LIMIT }
  ])

  // if (!posts || posts.length === 0) {
  //   return res.status(200).json(
  //     new ApiResponse(200, [], 'No posts found for following users.')
  //   );
  // }

  // Check if there are more posts available for infinite scroll
  const nextLastSeen = posts[posts.length - 1]?.createdAt // Get the timestamp of the last post
  const hasMore = await Post.exists({
    postedBy: { $in: followedIds },
    createdAt: { $lt: nextLastSeen },
  })

  // Return the response
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        docs: posts,
        hasMore, // Indicates if there are more posts available
        nextLastSeen, // Use this in the next request to fetch subsequent posts
      },
      'Following posts fetched successfully.'
    )
  )
})

const getPostsByUserId = asyncHandler(async (req, res) => {
  const { userId } = req.params
  const { page = 1, limit = 9 } = req.query
  const options = {
    page,
    limit
  }
  const { lastSeen } = req.query
  const query = lastSeen
    ? { postedBy: new mongoose.Types.ObjectId(userId), createdAt: { $lt: new Date(lastSeen) } }
    : { postedBy: new mongoose.Types.ObjectId(userId) }

  const agg = [
    {
      $match: query
    },
    {
      $sort: { createdAt: -1 }
    }
  ]

  const userPosts = await Post.aggregatePaginate(Post.aggregate(agg), options)

  return res.status(200)
    .json(
      new ApiResponse(
        200,
        userPosts,
        'User Posts Fetched Successfully'
      )
    )
})

// const togglePublishStatus = asyncHandler(async (req, res) => {
//   const { videoId } = req.params
// })

export {
  getExpolorePosts,
  publishPost,
  getPostById,
  updatePost,
  deletePost,
  getCurrentUserPosts,
  getCurrentUserFollowingPosts,
  getPostsByUserId
}