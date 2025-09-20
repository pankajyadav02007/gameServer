import cloudinary from "./cloudinary.mjs";
import { Readable } from "node:stream";

function bufferToStream(buffer) {
  const readable = new Readable();
  readable.push(buffer);
  readable.push(null); // end of stream
  return readable;
}

const uploadImage = async (file, folderName, isPublic) => {
  const result = await new Promise((resolve, reject) => {
    try {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folderName,
          access_mode: isPublic ? "public" : "authenticated",
        },
        (error, result) => {
          if (error) return reject(error);
          console.log("------------------------------");
          console.log(result);
          console.log("------------------------------");
          resolve(result);
        }
      );

      bufferToStream(file.buffer).pipe(uploadStream);
    } catch (err) {}
  });
  return result;
};

export { uploadImage };
