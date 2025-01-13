import mongoose,{Schema} from 'mongoose'

const chatSchema= new Schema({
  participants: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }]
})

export const Chat= mongoose.model('Chat',chatSchema)