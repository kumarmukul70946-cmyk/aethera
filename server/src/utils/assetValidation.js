import path from "path";

export const ALLOWED_IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "avif"];
export const ALLOWED_3D_EXTENSIONS = ["glb", "gltf"];

export const ALLOWED_IMAGE_MIMES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif"
];

export const ALLOWED_3D_MIMES = [
  "model/gltf-binary",
  "model/gltf+json",
  "application/octet-stream",
  "application/json"
];

export const VALID_ASSET_TYPES = [
  "PRODUCT_IMAGE",
  "PRODUCT_GALLERY",
  "PRODUCT_THUMBNAIL",
  "MODEL_3D"
];

/**
 * Validates binary buffer headers / magic bytes against declared file format.
 * Prevents executable disguise attacks (e.g. malware.exe renamed to model.glb).
 *
 * @param {Buffer} buffer - File buffer
 * @param {string} format - Lowercase file extension without dot
 * @returns {boolean} True if magic bytes match format
 */
export function verifyMagicBytes(buffer, format) {
  if (!buffer || buffer.length < 4) {
    return false;
  }

  // Common executable headers (Windows MZ, ELF, Mach-O) - immediately reject
  if (buffer[0] === 0x4d && buffer[1] === 0x5a) {
    // Windows PE / EXE
    return false;
  }
  if (buffer[0] === 0x7f && buffer[1] === 0x45 && buffer[2] === 0x4c && buffer[3] === 0x46) {
    // Linux ELF
    return false;
  }

  switch (format) {
    case "jpg":
    case "jpeg": {
      // JPEG magic: FF D8 FF
      return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
    }

    case "png": {
      // PNG magic: 89 50 4E 47 0D 0A 1A 0A
      return (
        buffer.length >= 8 &&
        buffer[0] === 0x89 &&
        buffer[1] === 0x50 &&
        buffer[2] === 0x4e &&
        buffer[3] === 0x47 &&
        buffer[4] === 0x0d &&
        buffer[5] === 0x0a &&
        buffer[6] === 0x1a &&
        buffer[7] === 0x0a
      );
    }

    case "webp": {
      // WebP magic: 'RIFF' .... 'WEBP'
      if (buffer.length < 12) return false;
      const riff = buffer.subarray(0, 4).toString("ascii");
      const webp = buffer.subarray(8, 12).toString("ascii");
      return riff === "RIFF" && webp === "WEBP";
    }

    case "avif": {
      // AVIF: ISO Base Media File Format box 'ftyp' followed by 'avif' or 'avis'
      if (buffer.length < 12) return false;
      const ftyp = buffer.subarray(4, 8).toString("ascii");
      const brand = buffer.subarray(8, 12).toString("ascii");
      return ftyp === "ftyp" && (brand.includes("avi") || brand.includes("mif"));
    }

    case "glb": {
      // GLB Binary glTF magic header: 0x46546C67 ('glTF' in ASCII: 0x67 0x6C 0x54 0x46)
      if (buffer.length < 12) return false;
      return (
        buffer[0] === 0x67 &&
        buffer[1] === 0x6c &&
        buffer[2] === 0x54 &&
        buffer[3] === 0x46
      );
    }

    case "gltf": {
      // glTF JSON: Must be valid JSON containing an 'asset' object with a 'version' property
      try {
        const text = buffer.toString("utf8");
        const json = JSON.parse(text);
        return Boolean(json && typeof json === "object" && json.asset && json.asset.version);
      } catch {
        return false;
      }
    }

    default:
      return false;
  }
}

/**
 * Validates uploaded file and metadata against strict security policies.
 *
 * @param {Object} file - Multer file object
 * @param {string} assetType - Requested asset type
 * @returns {{ isValid: boolean, error?: string, format?: string, resourceType?: "image" | "raw" }}
 */
export function validateUploadedFile(file, assetType) {
  if (!file || !file.buffer) {
    return { isValid: false, error: "No file content received." };
  }

  if (!assetType || !VALID_ASSET_TYPES.includes(assetType)) {
    return {
      isValid: false,
      error: `Invalid assetType '${assetType}'. Allowed: ${VALID_ASSET_TYPES.join(", ")}.`
    };
  }

  const rawExt = path.extname(file.originalname || "").toLowerCase().replace(/^\./, "");
  if (!rawExt) {
    return { isValid: false, error: "File must have an explicit extension." };
  }

  const is3D = assetType === "MODEL_3D";
  const isImage = !is3D;

  const maxImageMB = Number(process.env.MAX_IMAGE_SIZE_MB) || 5;
  const maxModelMB = Number(process.env.MAX_MODEL_SIZE_MB) || 50;

  // 1. Validate extension against asset category
  if (isImage) {
    if (!ALLOWED_IMAGE_EXTENSIONS.includes(rawExt)) {
      return {
        isValid: false,
        error: `Unsupported image format '.${rawExt}'. Allowed: ${ALLOWED_IMAGE_EXTENSIONS.join(", ")}.`
      };
    }
    if (!ALLOWED_IMAGE_MIMES.includes(file.mimetype)) {
      return {
        isValid: false,
        error: `Unsupported MIME type '${file.mimetype}' for image assets.`
      };
    }
    if (file.size > maxImageMB * 1024 * 1024) {
      return {
        isValid: false,
        error: `Image file exceeds maximum limit of ${maxImageMB}MB.`
      };
    }
  } else {
    if (!ALLOWED_3D_EXTENSIONS.includes(rawExt)) {
      return {
        isValid: false,
        error: `Unsupported 3D model format '.${rawExt}'. Allowed: ${ALLOWED_3D_EXTENSIONS.join(", ")}.`
      };
    }
    if (!ALLOWED_3D_MIMES.includes(file.mimetype)) {
      return {
        isValid: false,
        error: `Unsupported MIME type '${file.mimetype}' for 3D model assets.`
      };
    }
    if (file.size > maxModelMB * 1024 * 1024) {
      return {
        isValid: false,
        error: `3D model file exceeds maximum limit of ${maxModelMB}MB.`
      };
    }
  }

  // 2. Validate magic bytes / file signature
  const isSignatureValid = verifyMagicBytes(file.buffer, rawExt);
  if (!isSignatureValid) {
    return {
      isValid: false,
      error: `File signature mismatch: the binary content does not match the '.${rawExt}' format.`
    };
  }

  return {
    isValid: true,
    format: rawExt,
    resourceType: is3D ? "raw" : "image"
  };
}

export default {
  ALLOWED_IMAGE_EXTENSIONS,
  ALLOWED_3D_EXTENSIONS,
  ALLOWED_IMAGE_MIMES,
  ALLOWED_3D_MIMES,
  VALID_ASSET_TYPES,
  verifyMagicBytes,
  validateUploadedFile
};
