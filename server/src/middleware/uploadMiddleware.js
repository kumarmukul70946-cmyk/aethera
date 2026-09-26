import multer from "multer";

// Maximum upload boundary: 50MB (governed by largest allowable 3D asset)
const maxUploadLimitBytes = (Number(process.env.MAX_MODEL_SIZE_MB) || 50) * 1024 * 1024;

const storage = multer.memoryStorage();

const multerUpload = multer({
  storage,
  limits: {
    fileSize: maxUploadLimitBytes,
    files: 1
  }
});

/**
 * Middleware handling single multipart file uploads with standardized error handling.
 */
export const uploadSingle = (fieldName = "file") => {
  const uploadHandler = multerUpload.single(fieldName);

  return (req, res, next) => {
    uploadHandler(req, res, (err) => {
      if (err) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({
            success: false,
            message: `Uploaded file exceeds maximum allowed size (${Math.round(maxUploadLimitBytes / (1024 * 1024))}MB).`
          });
        }
        return res.status(400).json({
          success: false,
          message: err.message || "File upload processing failed."
        });
      }
      next();
    });
  };
};

export default { uploadSingle };
