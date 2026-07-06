import multer from 'multer';
import { assignmentStorage, submissionStorage } from '../config/cloudinary';

const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/zip',
  'application/x-zip-compressed',
  'image/jpeg',
  'image/png',
];

const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Allowed: PDF, DOC, DOCX, ZIP, JPG, PNG'));
  }
};

export const uploadAssignment = multer({
  storage: assignmentStorage,
  fileFilter,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
});

export const uploadSubmission = multer({
  storage: submissionStorage,
  fileFilter,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
});
