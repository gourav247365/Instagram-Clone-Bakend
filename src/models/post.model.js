import mongoose,{Schema} from "mongoose";
import aggregatePaginate from 'mongoose-aggregate-paginate-v2'
const postSchema= new Schema({
  postFile: {
    type: String,
    required: true
  },
  caption: {
    type: String
  },
  postedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  location: {
    type: String,
  },
},{timestamps: true})

postSchema.plugin(aggregatePaginate);

export const Post= mongoose.model('Post', postSchema)