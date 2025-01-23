import { Chat } from "../models/chat.model.js";
import { asyncHandler } from "../utilities/AsyncHandler.js";
import { ApiError } from "../utilities/ApiError.js";
import { ApiResponse } from "../utilities/ApiResponse.js";
import mongoose from "mongoose";

const findOrCreateChat = asyncHandler(async (req, res) => {
  const user1 = req.user._id
  const { user2 } = req.params

  const chat = await Chat.findOne({
    participants: {
      $all: [user1, user2]
    }
  })

  if (!chat) {
    const newChat = await Chat.create({
      participants: [user1, user2]
    })

    return res.status(200)
      .json(
        new ApiResponse(
          200,
          newChat,
          'Chat created Successfully'
        )
      )
  }
  else

    return res.status(200)
      .json(
        new ApiResponse(
          200,
          chat,
          'Chat fetched Successfully'
        )
      )
})

const deleteChat = asyncHandler(async (req, res) => {

})

const getCurrentUserChats = asyncHandler(async (req, res) => {

  const chats = await Chat.aggregate([
    {
      $match: {
        participants: new mongoose.Types.ObjectId(req.user._id)
      }
    },
    {
      $lookup: {
        from: 'messages',
        localField: '_id',
        foreignField: 'chatId',
        as: 'msgs',
      }
    },
    {
      $addFields: {
        messages: '$msgs',
        lastMessage: { $last: '$msgs' }
      }
    },
    {
      $match: {
        messages: { $ne: [] }
      }
    },
    {
      $addFields: {
        otherUser: {
          $arrayElemAt: [
            "$participants",
            {
              $cond: {
                if: { $eq: [{ $arrayElemAt: ["$participants", 0] }, new mongoose.Types.ObjectId(req.user._id)] },
                then: 1, // If "CurrentUserId" is at index 0, pick index 1
                else: 0  // Otherwise, pick index 0
              }
            }
          ]
        }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'otherUser',
        foreignField: '_id',
        as: 'result',
      },
    },
    {
      $addFields: {
        username: {
          $first: '$result.username'
        },
        displayPicture: {
          $first: '$result.displayPicture'
        }
      }
    },
    {
      $project: {
        result: 0,
        participants: 0,
        msgs: 0
      }
    },
    {
      $sort: { lastMessage: -1 }
    }
  ])

  return res.status(200)
    .json(
      new ApiResponse(
        200,
        chats,
        'Current User Chats Fetched Successfully'
      )
    )
})

export {
  findOrCreateChat,
  deleteChat,
  getCurrentUserChats
}