import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'hackmatch-demo';
const apiKey = process.env.CLOUDINARY_API_KEY || '112233445566778';
const apiSecret = process.env.CLOUDINARY_API_SECRET || 'demo_cloudinary_secret_key_hackmatch';

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true,
});

/**
 * Generate signed upload parameters for secure frontend upload directly to Cloudinary.
 * The api_secret is NEVER returned to the client.
 */
export const generateAvatarUploadSignature = (userId) => {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const folder = 'hackmatch/avatars';
  const publicId = `user_${userId}_${timestamp}`;

  const paramsToSign = {
    folder,
    public_id: publicId,
    timestamp,
  };

  const signature = cloudinary.utils.api_sign_request(paramsToSign, apiSecret);

  return {
    signature,
    timestamp,
    apiKey,
    cloudName,
    folder,
    publicId,
  };
};

/**
 * Delete an asset from Cloudinary by public ID.
 */
export const deleteCloudinaryAsset = async (publicId) => {
  if (!publicId) return null;
  try {
    return await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.warn(`[Cloudinary] Asset deletion warning for ${publicId}:`, error.message);
    return null;
  }
};

export default cloudinary;
