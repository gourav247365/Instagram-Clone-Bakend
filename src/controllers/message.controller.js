import { Message } from "../models/message.model.js"; 
import { asyncHandler } from "../utilities/AsyncHandler.js";
import { ApiError } from "../utilities/ApiError.js";
import { ApiResponse } from "../utilities/ApiResponse.js";
import mongoose from "mongoose";

const getMessagesByChatId= asyncHandler(async(req,res)=> {

  const {chatId}= req.params
  console.log(chatId);
  
  const {page=1, limit=20}= req.query

  const options= {
    limit: parseInt(limit),
    page: parseInt(page)
  }

  const pipeline= [
    {
      $match: { chatId: new mongoose.Types.ObjectId(chatId) }
    },
    {
      $sort: { createdAt: -1 } 
    },
  ]
  
  const messages= await Message.aggregatePaginate(Message.aggregate(pipeline),options)

  return res.status(200)
  .json(
    new ApiResponse(
      200,
      messages,
      'Current Chat Messages Fetched Successfully'
    )
  )

})


const sendMessage= asyncHandler(async(req,res)=> {
  const {reciever,text,chatId}= req.body

  const message= await Message.create({
    sender: req.user._id,
    reciever,
    text,
    chatId
  })

  if(!message) {
    throw new ApiError(401, 'Something went Wrong While Sending Message')
  }

  return res.status(200)
  .json(
    new ApiResponse(
      200,
      message,
      'Message Sent Successfully'
    )
  )
})

const unsendMessage= asyncHandler(async(req,res)=> {
  const {messageId}= req.params

  const deletedMessage= await Message.findByIdAndDelete(messageId)

  if(!deletedMessage) {
    throw new ApiError('Message Not Found')
  }

  return res.status(200)
  .json(
    new ApiResponse(
      200,
      deletedMessage,
      'Message Unsent Sucessfully'
    )
  )
})

export {
  sendMessage,
  unsendMessage,
  getMessagesByChatId
}