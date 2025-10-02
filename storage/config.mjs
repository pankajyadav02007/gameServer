import multer from "multer";
import { ServerError } from "../error.mjs";

// Memory storage (keeps files in RAM as Buffer)
const storage = multer.memoryStorage();

// File filter for images only
const fileFilter = (req, file, callback) => {
  if (file.mimetype.startsWith("image/")) {
    callback(null, true);
  } else {
    callback(new Error("Only image files are allowed"), false);
  }
};

const uploadConfig = {
  storage,
  dest: "./uploads/",
  limits: {
    fileSize: 0.5 * 1024 * 1024,
    files: 1,
  },
  fileFilter,
};

const upload = multer(uploadConfig);

const singleImageUploadMiddleware = (fieldName = "image") => {
  return async (req, res, next) => {
    const singleUpload = upload.single(fieldName);

    singleUpload(req, res, (error) => {
      if (error) {
        // Handle different types of multer errors
        if (error instanceof multer.MulterError) {
          switch (error.code) {
            case "LIMIT_FILE_SIZE":
              return next(
                new ServerError(
                  400,
                  `File size must be less than ${
                    uploadConfig.limits.fileSize / 1024
                  }KB`
                )
              );

            case "LIMIT_FILE_COUNT":
              return next(new ServerError(400, `Only one file is allowed`));

            case "LIMIT_UNEXPECTED_FILE":
              return next(
                new ServerError(400, `Expected field name: ${fieldName}`)
              );

            default:
              console.log(error);
              return next(new ServerError(400, error.message));
          }
        }
        // Handle other errors
        return next(new ServerError(400, error.message));
      }

      // Check if file was uploaded
      if (!req.file) {
        return next(new ServerError(400, "Please select a file to upload"));
      }

      next();
    });
  };
};

export { singleImageUploadMiddleware };
