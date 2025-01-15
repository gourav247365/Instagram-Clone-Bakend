import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { app,server } from './app.js'

dotenv.config({
  path: "./.env"
})

const port= process.env.PORT || 8000

const DB_NAME= 'IGC'

;(async()=>{
  try {
    await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
    server.on("error",(error)=>{
      console.log(error);
      throw error
    })
    
  }catch (error) {
    console.error(error);
    throw error
  }
})()