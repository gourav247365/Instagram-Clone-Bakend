import mongoose,{Schema} from 'mongoose'
import aggregatePaginate from 'mongoose-aggregate-paginate-v2'

const relationSchema= new Schema({
  follower: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  following: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['pending','accepted']
  }
},{timestamps: true})

relationSchema.plugin(aggregatePaginate)

export const Relation= mongoose.model('Relation', relationSchema)