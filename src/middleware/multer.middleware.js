import multer from "multer";
import path from "path";

// this storage configuration tells multur, where to store and what file name it  should be
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.resolve("public/uploads")); // Save to /uploads directory
  },
  // if we preserve file extension then only can be served and viewd
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname); // preserves file extension
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

export const upload = multer({ storage });