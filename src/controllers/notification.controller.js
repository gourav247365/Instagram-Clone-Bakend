import { Notification } from "../models/notification.model.js";
import { asyncHandler } from "../utilities/AsyncHandler.js"
import { ApiError } from "../utilities/ApiError.js"
import { ApiResponse } from "../utilities/ApiResponse.js"
import mongoose from "mongoose";

const createNotification = asyncHandler(async (req, res) => {
  const { content, to, post, type } = req.body

  const notification = await Notification.create({
    content,
    from: req.user?._id,
    to,
    post,
    type
  })

  if (!notification) {
    throw new ApiError(401, 'Something Went Wrong While Creating Notification')
  }

  return res.status(200)
    .json(
      new ApiResponse(
        200,
        notification,
        'Notification Created Successfully'
      )
    )

})

const deleteNotification= asyncHandler(async(req,res)=> {
  const {id}= req.params
  console.log(id);
  
  const notification= await Notification.findByIdAndDelete(id)

  if(!notification){
    throw new ApiError(401, 'Something Went Wrong While Deleting the Notification')
  }

  return res.status(200)
  .json(
    new ApiResponse(
      200,
      notification,
      'Notification Deleted Successfully'
    )
  )
})

const getCurrentUserNotifications = asyncHandler(async (req, res) => {

  const notification = await Notification.aggregate([
    {
      $match: {
        to: new mongoose.Types.ObjectId(req.user._id)
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'from',
        foreignField: '_id',
        as: 'userDetails',
        pipeline: [
          {
            $project: {
              username: 1,
              displayPicture: 1,
            }
          }
        ]
      }
    },
    {
      $addFields: {
        username: {
          $first: '$userDetails.username'
        } ,
        displayPicture: {
          $first: '$userDetails.displayPicture'
        }
      }
    },
    {
      $project: {
        userDetails: 0
      }
    },
    {
      $sort: {
        updatedAt: -1
      }
    }
  ])

  return res.status(200)
    .json(
      new ApiResponse(
        200,
        notification,
        'Current User Notifications Fetched Successfully'
      )
    )
})

const updateRequestNotification= asyncHandler(async(req,res)=> {
  const {id}= req.body

  const notification= await Notification.findByIdAndUpdate(id,{$set:{content: 'started following you', type: 'follow'}},{new: true})

  return res.status(200)
  .json(
    new ApiResponse(
      200,
      notification,
      'Notication Updated from Request to Follow'
    )
  )

})

const deleteRequestNotification= asyncHandler(async(req,res)=> {
  const {to,type}= req.query
  console.log(to);
  
  const notification= await Notification.findOneAndDelete({from: req.user._id,to,type })

  if(!notification) {
    throw new ApiError(404,'Notification Does Not Exist')
  }

  return res.status(200)
  .json(
    new ApiResponse(
      200,
      notification,
      'Notification Deleted Successfully'
    )
  )
})


export {
  createNotification,
  getCurrentUserNotifications,
  updateRequestNotification,
  deleteNotification,
  deleteRequestNotification
}