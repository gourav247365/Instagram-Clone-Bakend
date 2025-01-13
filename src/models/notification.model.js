import mongoose,{Schema} from 'mongoose'

const notificationSchema= new Schema({
  content:{
    type: String,
  },
  type:{
    type: String,
    enum: ['request','like','follow','comment']
  },
  from: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  to: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  post: {
    type: String,
  },
},{timestamps: true})

export const Notification= mongoose.model('Notification',notificationSchema)