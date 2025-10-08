import { v2 as cloudinary } from "cloudinary";

export const initCloudinary = () => {
  cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
};

export const generateSignature = () => {
  if (!process.env.CLOUDINARY_API_SECRET) {
    throw new Error('Cloudinary API secret missing');
  }
  const timestamp = Math.round(new Date().getTime() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder: 'rootrise_documents' },
    process.env.CLOUDINARY_API_SECRET,
  );
  return { signature, timestamp };
};