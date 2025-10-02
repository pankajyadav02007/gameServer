import { ServerError } from "../error.mjs";
import cloudinary from "./cloudinary.mjs";

const uploadImage = async (buffer, fileName, folderName, isPublic) => {
  try {
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          access_mode: isPublic ? "public" : "authenticated",
          folder: folderName,
          public_id: fileName, // include extension here, e.g., "myfile.png"
          overwrite: true,
          use_filename: true, // make sure filename is used as-is
          unique_filename: false, // avoid Cloudinary adding random strings
        },
        (error, uploadResult) => {
          if (error) {
            return reject(error);
          }
          return resolve(uploadResult);
        }
      );
      uploadStream.end(buffer);
    });
    console.log(result);
    return result;
  } catch (err) {
    throw new ServerError(400, err.message);
  }
};

const deleteImage = async () => {
  // TODO: implement delete image (homework)
};

export { uploadImage, deleteImage };
