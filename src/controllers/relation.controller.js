import mongoose from "mongoose";
import { Relation } from "../models/relation.model.js";
import { asyncHandler } from "../utilities/AsyncHandler.js";
import { ApiError } from "../utilities/ApiError.js";
import { ApiResponse } from "../utilities/ApiResponse.js";
import { User } from "../models/user.model.js";
import { updateDisplayPicture } from "./user.controller.js";

const toggleRelation= asyncHandler((async(req,res)=> {

  const {userId,isPrivate}= req.body

  const deleted= await Relation.findOneAndDelete({follower: req.user._id,following: userId})

  let relation;

  if(!deleted) {
    relation= await Relation.create({
      follower: req.user._id,
      following: userId,
      status: isPrivate? 'pending': 'accepted'
    })
  }

  return res.status(200)
  .json(
    new ApiResponse(
      200,
      {status: deleted?  'none' : relation.status},
      'Realtion updated Successfully'
    )
  )

}))

const findReation= asyncHandler(async(req,res)=> {
  const {username}= req.params
  const user= await User.findOne({username})

  const relation= await Relation.findOne({follower: req.user._id,following: user._id})

  return res.status(200)
  .json(
    new ApiResponse(
      200,
      {status: relation?.status || 'none'},
      'Relation Fetched Successfully'
    )
  )
})

const acceptFollowRequest= asyncHandler(async(req,res)=> {
  const {user}= req.body

  const relation= await Relation.findOneAndUpdate({follower: user,following: req.user._id},{ status: 'accepted' },{new: true})

  return res.status(200)
  .json(
    new ApiResponse(
      200,
      relation,
      'Relation Updated Successfully'
    )
  )
})

const getCurrentUserFollowers= asyncHandler(async(req,res)=> {
  const followers= await Relation.aggregate([
    {
      $match: {
        following: new mongoose.Types.ObjectId(req.user?._id)
      }
    },
    {
      $lookup: {
        from: "users",
        localField: 'follower' ,
        foreignField: '_id',
        as: 'followers',
        pipeline: [
          {
            $project: {
              username: 1,
              fullname: 1,
              displayPicture: 1
            }
          }
        ]
      }
    },
    {
      $addFields: {
        username: {
          $first: '$followers.username'
        },
        fullname: {
          $first: '$followers.fullname'
        },
        displayPicture: {
          $first: '$followers.displayPicture'
        }
      }
    },
    {
      $project: {
        username: 1,
        fullname: 1,
        displayPicture: 1
      }
    }
  ])

  if(!followers) {
    throw new ApiError(401, 'Something Went Wrong While Fetching Current User Followers')
  }

  return res.status(200)
  .json(
    new ApiResponse(
      200,
      followers,
      'Current User Followers Fetched Successfully'
    )
  )
})

const getCurrentUserFollowings= asyncHandler(async(req,res)=> {
  const followings= await Relation.aggregate([
    {
      $match: {
        follower: new mongoose.Types.ObjectId(req.user?._id)
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'following' ,
        foreignField: '_id',
        as: 'followings',
        pipeline: [
          {
            $project: {
              username: 1,
              fullname: 1,
              displayPicture: 1
            }
          }
        ]
      }
    },
    {
      $addFields: {
        username: {
          $first: '$followings.username'
        },
        fullname: {
          $first: '$followings.fullname'
        },
        displayPicture: {
          $first: '$followings.displayPicture'
        },
      }
    },
    {
      $project: {
        username: 1,
        fullname: 1,
        displayPicture: 1 
      }
    }
  ])

  if(!followings) {
    throw new ApiError(401, 'Something Went Wrong While Fetching Current User Followings')
  }
    
  return res.status(200)
  .json(
    new ApiResponse(
      200,  
      followings,
      'Current User Followings Fetched Successfully'
    )
  )
})

const deleteRequest= asyncHandler(async(req,res)=> {
  const {follower}= req.body
  const deletedRelation= Relation.findByIdAndDelete({follower,following: req.user._id})

  return res.status(200)
  .json(
    200,
    deletedRelation,
    'Follow Request Deleted Successfully'
  )
})

const deleteRelation= asyncHandler(async(req,res)=>{

  const {following}= req.body
  
  const relation = await Relation.findOneAndDelete({follower: req.user._id,following})
  
  if(!relation) {
    throw new ApiError(401, 'Relation does Not Exist')
  }

  return res.status(200)
  .json(
    new ApiResponse(
      200,
      relation,
      'Relation Deleted Successfully',
    )
  )
})

export {
  toggleRelation,
  findReation,
  getCurrentUserFollowers,
  getCurrentUserFollowings,
  acceptFollowRequest,
  deleteRequest,
  deleteRelation
}