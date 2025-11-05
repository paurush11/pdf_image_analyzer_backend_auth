import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname);
    const uniqueName = file.fieldname + '-' + Date.now() + extension;
    cb(null, uniqueName);
  },
});

const fileFilter = (req: any, file: any, cb: any) => {
  const type = file.mimetype;
  const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif'];
  if (allowed.includes(type)) {
    return cb(null, true);
  }
  return cb(new Error('Invalid file type'), false);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});
