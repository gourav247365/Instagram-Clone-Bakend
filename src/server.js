import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { server as app } from './app.js'

dotenv.config({
  path: "./.env"
})

const port= process.env.PORT || 8000

const DB_NAME= 'IGC'

;(async()=>{
  try {
    await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
    app.on("error",(error)=>{
      console.log(error);
      throw error
    })
    app.listen(port,()=>{
      console.log(`app is listening on port ${port}`); 
    })
  }catch (error) {
    console.error(error);
    throw error
  }
})()