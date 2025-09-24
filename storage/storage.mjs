import cloudinary from "./cloudinary.mjs";
import { Readable } from "node:stream";

function bufferToStream(buffer) {
  const readable = new Readable();
  readable.push(buffer);
  readable.push(null); // end of stream
  return readable;
}

const uploadImage = async (file, fileName, folderName, isPublic) => {
  const result = await new Promise((resolve, reject) => {
    try {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folderName,
          access_mode: isPublic ? "public" : "authenticated",
          public_id: fileName,
          overwrite: true,
          use_filename: true,
          unique_filename: false,
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );

      bufferToStream(file.buffer).pipe(uploadStream);
    } catch (err) {}
  });
  return result;
};

export { uploadImage };
