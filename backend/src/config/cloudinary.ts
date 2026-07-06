import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const assignmentStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'lms/assignments',
    allowed_formats: ['pdf', 'doc', 'docx', 'zip', 'jpg', 'jpeg', 'png'],
    resource_type: 'auto',
  } as any,
});

export const submissionStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'lms/submissions',
    allowed_formats: ['pdf', 'doc', 'docx', 'zip', 'jpg', 'jpeg', 'png'],
    resource_type: 'auto',
  } as any,
});

export const deleteFromCloudinary = async (publicId: string) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Cloudinary delete error:', error);
  }
};

export default cloudinary;
