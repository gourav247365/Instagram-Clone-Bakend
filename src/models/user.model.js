import mongoose,{Schema} from 'mongoose'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

const userSchema= new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  fullname: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true
  },
  displayPicture: {
    type: String,
    default: 'https://res.cloudinary.com/dmxjulnzo/image/upload/v1730717700/User_naarwo.png'
  },
  bio: {
    type: String
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  password: {
    type: String,
    required: [true, 'Password is Required']
  },
  refreshToken: {
    type: String,
  }
},{timestamps: true})

userSchema.pre('save', async function (next) {
  if(!this.isModified('password')) return next();
  this.password= await bcrypt.hash(this.password,10)
  next()
})

userSchema.methods.isPasswordCorrect= async function (password) {
  return await bcrypt.compare(password,this.password)
}

userSchema.methods.generateAccessToken= function () {
  return jwt.sign(
    {
      _id: this._id,
      _email: this.email,
      username: this.username,
      fullname: this.fullname
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    }
  )
}

userSchema.methods.generateRefreshToken= function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    }
  )
}

export const User= mongoose.model('User', userSchema)