import mongoose,{Schema} from 'mongoose'

const commentSchema= new Schema({
  content: {
    type: String,
    required: true,
  },
  post: {
    type: Schema.Types.ObjectId,
    ref: 'Post'
  },
  commentedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
})

export const Comment= mongoose.model('Comment', commentSchema)