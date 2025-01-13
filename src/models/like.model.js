import mongoose,{Schema} from 'mongoose'

const likeSchema= new Schema({
  post: {
    type: Schema.Types.ObjectId,
    ref: 'Post'
  },
  likedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
},{timestamps: true})

export const Like= mongoose.model('Like', likeSchema)