import {v2 as cloudinary} from 'cloudinary'
import fs from 'fs'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

const uploadOnCloudinary= async (localFilePath) => {
  try {
    if(!localFilePath) return null;
    // upload the file on cloudinary
    const response= await cloudinary.uploader.upload(localFilePath, {
      resource_type: 'auto',   
    })
    // console.log(response)
    // file has been uploaded succesfully
    console.log('file is uploaded on cloudinary',response.url);
    fs.unlinkSync(localFilePath)
    return response;
  }catch (error) {
    console.log(error);
    fs.unlinkSync(localFilePath)
    return null;
  }
}

const deleteFromCloudinary= async(url)=> {
  const avatarOldPublicId= url.split('/')[7].split(".")[0]
  // console.log(avatarOldPublicId,typeof avatarOldPublicId);

  try {
    const result = await cloudinary.uploader.destroy(avatarOldPublicId);
    if (result.result === "ok") {
      console.log("File deleted successfully.");
    } else if (result.result === "not found") {
      console.log("File not found.");
    } 
  } catch (error) {
    console.error("Error deleting file:", error);
  } 
}

// const deleteFromCloudinary= (url)=> {
//   const avatarOldPublicId= url.split('/')[7].split(".")[0]
//   console.log(avatarOldPublicId,typeof avatarOldPublicId);

//   cloudinary.uploader.destroy(avatarOldPublicId)
//   .then((res)=>{
//     if(res.result=='ok') {
//       console.log("File Deleted Successfully");
//     }
//     else if(res.result=='not found') {
//       console.log("File Not Found");
//     }  
//   })
//   .catch((error)=>{
//     console.log("error Deleting file",error);
//   })
     
// }


export {uploadOnCloudinary,deleteFromCloudinary}