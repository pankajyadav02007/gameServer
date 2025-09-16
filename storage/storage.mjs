import dotenv from 'dotenv'
dotenv.config()

import {v2 as cloudinary} from 'cloudinary'
const cloudinary = cd.v2

cloudinary.config({
    secure:true
});

const imageUpload = async(fileName) => {
    await cloudinary.uploader.upload(fileName,{ access_mode: 'public', allowed_formats:"image"})
}

// console.log(cloudinary.config())