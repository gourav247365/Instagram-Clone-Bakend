import mongoose,{Schema} from 'mongoose'
import aggregatePaginate from 'mongoose-aggregate-paginate-v2'

const messageSchema= new Schema({
  text: {
    type: String,
  },
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  reciever: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  // seen: {
  //   type: Boolean,
  //   required: true,
  //   default: false
  // },
  media: {
    type: String,
  },
  chatId: {
    type: Schema.Types.ObjectId,
    ref: 'Chat'
  }
},{timestamps: true})

messageSchema.plugin(aggregatePaginate)

export const Message= mongoose.model('Message',messageSchema)