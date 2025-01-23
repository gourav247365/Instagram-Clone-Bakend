import mongoose from "mongoose"
import { User } from "../models/user.model.js"
import { Relation } from '../models/relation.model.js'
import { asyncHandler } from "../utilities/AsyncHandler.js"
import { ApiError } from "../utilities/ApiError.js"
import { ApiResponse } from "../utilities/ApiResponse.js"
import jwt from "jsonwebtoken"
import { uploadOnCloudinary, deleteFromCloudinary } from "../utilities/cloudinary.js"

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId)
    const accessToken = await user.generateAccessToken()
    const refreshToken = await user.generateRefreshToken()

    user.refreshToken = refreshToken
    await user.save({ validateBeforeSave: false })

    return { accessToken, refreshToken }

  } catch (error) {
    throw new ApiError(500, 'Something Went Wrong While Generating Access and Refresh tokens')
  }
}

const options = {
  httpOnly: true,
  secure: true
}

const registerUser = asyncHandler(async (req, res) => {

  const { email, fullname, username, password } = req.body

  if (!email.trim() || !fullname.trim() || !username.trim() || !password.trim()) {
    throw new ApiError(401, 'All Fields are Required !')
  }

  if (await User.findOne({ email })) {
    throw new ApiError(400, 'E-mail is Already Registered !')
  }

  if (await User.findOne({ username })) {
    throw new ApiError(400, 'Username not Availible !')
  }

  //   const displayPictureLocalPath= req.file?.path
  //   if(displayPictureLocalPath) {
  //     const displayPicture= uploadOnCloudinary(displayPictureLocalPath)
  //   }

  const user = await User.create({
    email,
    username: username.toLowerCase(),
    fullname,
    password
  })
  //
  const createdUser = await User.findById(user._id).select('-password -refreshToken')
  //
  return res.status(200)
    .json(
      new ApiResponse(
        200,
        createdUser,
        'User Registered Successfully'
      )
    )
})

const loginUser = asyncHandler(async (req, res) => {
  const { username, password } = req.body

  if (!username || !password) {
    throw new ApiError(401, 'Username or Password is Empty !')
  }

  const user = await User.findOne({ username })

  if (!user) {
    throw new ApiError(404, 'User with Given Username Not Found !')
  }

  const isPasswordValid = await user.isPasswordCorrect(password)

  if (!isPasswordValid) {
    throw new ApiError(400, 'Incorrect Login Credentials !')
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)

  const loggedInUser = await User.findById(user._id).select('-password -refreshToken')

  return res.status(200)
    .cookie('accessToken', accessToken, {...options,maxAge: 1*24*60*60*1000})
    .cookie('refreshToken', refreshToken, {...options,maxAge: 10*24*60*60*1000})
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          refreshToken
        },
        'User Logged In Successfully'
      )
    )
})

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1
      }
    },
    {
      new: true
    }
  )

  return res.status(200)
    .clearCookie('accessToken', options)
    .clearCookie('refreshToken', options)
    .json(
      new ApiResponse(
        200,
        {},
        'User Logged Out Successfully'
      )
    )
})

const updateDisplayPicture = asyncHandler(async (req, res) => {
  const displayPictureLocalPath = req.file?.path

  if (!displayPictureLocalPath) {
    throw new ApiError(401, 'display Picture File is Missing')
  }

  const displayPicture = await uploadOnCloudinary(displayPictureLocalPath)

  if (!displayPicture) {
    throw new ApiError(400, 'Error While Uploading displayPicture')
  }

  const oldDisplayPicture = req.user?.displayPicture

  const user = await User.findByIdAndUpdate(req.user?._id, {
    $set: {
      displayPicture: displayPicture.url
    }
  }, { new: true }).select('-password')

  if (oldDisplayPicture != "https://res.cloudinary.com/dmxjulnzo/image/upload/v1730717700/User_naarwo.png")

    deleteFromCloudinary(oldDisplayPicture)

  return res.status(200)
    .json(
      new ApiResponse(
        200,
        user,
        'Display Picture Updated Successfully'
      )
    )

})

const removeDisplayPicture= asyncHandler(async(req,res)=> {
  const user= await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        displayPicture: 1
      }
    },
    {
      new: true
    }
  ).select('-password -refreshToken')

  return res.status(200)
  .json(
    new ApiResponse(
      200,
      user,
      'Dp Removed Sucessfully'
    )
  )
})

const editProfile = asyncHandler(async (req, res) => {

})

const getCurrentUser = asyncHandler(async (req, res) => {

  const user = req.user

  if (!user) {
    throw new ApiError(404, 'User Not Found')
  }

  return res.status(200)
    .json(
      new ApiResponse(
        200,
        user,
        'Current User Fetched successfully'
      )
    )
})

const getCurrentUserRealtedAccountsCount= asyncHandler(async(req,res)=> {
  
  try {
    const followersCount= await Relation.find({following: req.user._id}).countDocuments()
    const followingsCount= await Relation.find({follower: req.user._id}).countDocuments()
    
    return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {
          followersCount,
          followingsCount
        },
        'Current User Followers and Followings'
      )
    )

  } catch (error) {
    throw new Error(401, error.message || 'Something Went Wrong while Fetching Current User Followers and Followings')
  }  
})

const getUserByUsername = asyncHandler(async (req, res) => {
  const { username } = req.params

  const tmp = await User.findOne({ username }).select('-password -refreshToken')

  if (!tmp) {
    throw new ApiError(404, 'User Not Found')
  }

  if (tmp.isPrivate) {

    const relation = await Relation.findOne({ follower: req.user._id, following: tmp._id })

    if (!relation || relation.status==='pending') {
      return res.status(200)
        .json(
          new ApiResponse(
            200,
            tmp,
            'User Fetched Successfully'
          )
        )
    } 
  }

  const user = await User.aggregate([
    {
      $match: {
        username: username
      }
    },
    {
      $lookup: {
        from: 'posts',
        localField: '_id',
        foreignField: 'postedBy',
        as: 'userPosts',
        pipeline: [
          {
            $sort: {
              createdAt: -1
            }
          }
        ]
      }
    },
    {
      $addFields: {
        postsCount: {$size: '$userPosts'},
      }
    },
    {
      $lookup: {
        from: 'relations',
        localField: '_id',
        foreignField: 'following',
        as: 'followers'
      }
    },
    {
      $addFields: {
        followersCount: {$size: '$followers'}
      }
    },
    {
      $lookup: {
        from: 'relations',
        localField: '_id',
        foreignField: 'follower',
        as: 'followings'
      }
    },
    {
      $addFields: {
        followingsCount: { $size: '$followings'} 
      }
    },
    {
      $project: {
        username: 1,
        email: 1,
        fullname: 1,
        postsCount: 1,
        displayPicture: 1,
        followersCount: 1,
        followingsCount: 1,
        isPrivate: 1,
      }
    }
  ])

  if (!user) {
    throw new ApiError(404, 'User Not Found')
  }

  return res.status(200)
    .json(
      new ApiResponse(
        200,
        user[0],
        'User Fetched Successfully'
      )
    )
})

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized Request")
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    )

    const user = await User.findById(decodedToken?._id)

    if (!user) {
      throw new ApiError(401, "Invalid refresh token")
    }

    if (incomingRefreshToken !== user.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)

    return res
      .status(200)
      .cookie("accessToken", accessToken, {...options,maxAge: 1*24*60*60*1000})
      .cookie("refreshToken", refreshToken, {...options,maxAge: 10*24*60*60*1000})
      .json(
        new ApiResponse(
          200,
          {
            accessToken,
            refreshToken
          },
          "Access token refreshed"
        ) 
      )
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token")
  }

})

const searchUsers= asyncHandler(async(req,res)=> {

  const {value}= req.query

  let searchResult

  if(!value) {
    searchResult= []
  }
  else {
    searchResult= await User.find({ username: { $regex: value} }).select('-password -email -isPrivate -refreshToken -createdAt -updatedAt')
  }

  console.log(searchResult);
  
  return res.status(200)
  .json(
    new ApiResponse(
      200,
      searchResult,
      'Search Result Fetched Successfully'
    )
  )
})

export {
  registerUser,
  loginUser,
  getCurrentUser,
  getCurrentUserRealtedAccountsCount,
  editProfile,
  updateDisplayPicture,
  logoutUser,
  getUserByUsername,
  refreshAccessToken,
  removeDisplayPicture,
  searchUsers
}